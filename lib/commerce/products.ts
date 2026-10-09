import { randomUUID } from "node:crypto";
import type { Filter, ClientSession } from "mongodb";
import { getDb, userTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { validateProduct } from "./validation";
import { ProductError } from "./errors";
import { applyProductRanges } from "./product-ranges";
import type { Product, ProductImportAnalysis, ProductStatus } from "./types";
import { priceMedian, type CatalogueStatistics } from "./catalogue-statistics";
import type { DirectoryFilter } from "@/lib/site/directories";

interface ImportBatch {
  _id: string;
  sha256: string;
  status: "staging" | "committed" | "failed";
  actorId: string;
  count: number;
  excluded: number;
  createdAt: string;
  committedAt?: string;
}
export async function productStore() {
  const db = await getDb();
  return {
    products: db.collection<Product>("commerce_products"),
    imports: db.collection<ImportBatch>("commerce_imports"),
  };
}
// A single active listing lookup; uncommitted imports remain invisible to options/cart.
export async function availableProduct(
  id: string,
  session?: ClientSession,
): Promise<Product | null> {
  const { products, imports } = await productStore();
  const product = await products.findOne(
    { id, status: "active" },
    { session, projection: { _id: 0 } },
  );
  if (!product) return null;
  if (
    product.importId &&
    !(await imports.findOne(
      { _id: product.importId, status: "committed" },
      { session, projection: { _id: 1 } },
    ))
  )
    return null;
  return product;
}
let indexes: Promise<unknown> | undefined;
export async function setupProducts() {
  if (!indexes) {
    indexes = (async () => {
      const { products, imports } = await productStore();
      await Promise.all([
        products.createIndex({ id: 1 }, { unique: true }),
        products.createIndex({ domain: 1 }, { unique: true }),
        products.createIndex(
          { externalId: 1 },
          {
            unique: true,
            partialFilterExpression: { externalId: { $type: "string" } },
          },
        ),
        products.createIndex({ status: 1, domain: 1, id: 1 }),
        products.createIndex({ status: 1, priceCents: 1, id: 1 }),
        products.createIndex({ status: 1, "metrics.dr": -1, id: 1 }),
        products.createIndex({ status: 1, "metrics.traffic": -1, id: 1 }),
        products.createIndex({ importId: 1 }),
        imports.createIndex(
          { sha256: 1 },
          {
            unique: true,
            partialFilterExpression: { status: "committed" },
          },
        ),
        imports.createIndex({ status: 1 }),
      ]);
    })();
    indexes.catch(() => {
      indexes = undefined;
    });
  }
  await indexes;
}
async function visibleFilter(): Promise<Filter<Product>> {
  const { imports } = await productStore();
  const batches = await imports
    .find({ status: "committed" }, { projection: { _id: 1 } })
    .toArray();
  return {
    $or: [
      { importId: { $exists: false } },
      { importId: { $in: batches.map((batch) => batch._id) } },
    ],
  };
}
function numberParam(
  params: URLSearchParams,
  name: string,
  fallback: number,
  max: number,
) {
  const value = params.get(name);
  if (value === null || value === "") return fallback;
  if (
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) > max
  )
    throw new ProductError(422, `Invalid ${name} filter.`);
  return Number(value);
}
function query(params: URLSearchParams, admin: boolean) {
  const filter: Filter<Product> = { status: "active" };
  if (admin) {
    delete filter.status;
    const importId = params.get("importId");
    if (importId) {
      if (
        !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
          importId,
        )
      )
        throw new ProductError(422, "Invalid import filter.");
      filter.importId = importId;
    }
    const status = params.get("status");
    if (status) {
      if (!["draft", "active", "archived"].includes(status))
        throw new ProductError(422, "Invalid product status.");
      filter.status = status as ProductStatus;
    }
  }
  const search = (params.get("q") || "").trim().slice(0, 150);
  if (search) {
    const literal = {
      $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
    filter.$or = [{ domain: literal }, { category: literal }];
  }
  for (const key of ["country", "language", "category"] as const) {
    const value = params.get(key);
    if (value) filter[key] = value.slice(0, 200);
  }
  applyProductRanges(filter, params);
  const sorts = {
    domain: { domain: 1, id: 1 },
    priceAsc: { priceCents: 1, id: 1 },
    priceDesc: { priceCents: -1, id: 1 },
    drDesc: { "metrics.dr": -1, id: 1 },
    trafficDesc: { "metrics.traffic": -1, id: 1 },
  } as const;
  const sort = params.get("sort") || "domain";
  if (!(sort in sorts)) throw new ProductError(422, "Invalid product sort.");
  return {
    filter,
    sort: sorts[sort as keyof typeof sorts],
    page: Math.max(1, numberParam(params, "page", 1, 10000)),
    pageSize: Math.max(1, numberParam(params, "pageSize", 20, 50)),
  };
}
export async function listProducts(params: URLSearchParams, admin = false) {
  const { products } = await productStore();
  const options = query(params, admin);
  const filter = { $and: [options.filter, await visibleFilter()] };
  const projection = admin
    ? { _id: 0, source: 0 }
    : {
        _id: 0,
        id: 1,
        domain: 1,
        language: 1,
        country: 1,
        category: 1,
        priceCents: 1,
        currency: 1,
        status: 1,
        metrics: 1,
        linkType: 1,
        turnaround: 1,
        requirements: 1,
        version: 1,
        createdAt: 1,
        updatedAt: 1,
      };
  const [data, total] = await Promise.all([
    products
      .find(filter, { projection })
      .sort(options.sort)
      .skip((options.page - 1) * options.pageSize)
      .limit(options.pageSize)
      .toArray(),
    products.countDocuments(filter),
  ]);
  return { data, total, page: options.page, pageSize: options.pageSize };
}
/** Server-rendered listings for a niche directory page, strongest DR first. */
export async function directoryListings(
  options: {
    categories?: string[];
    country?: string;
    maxPriceCents?: number;
  },
  limit = 25,
) {
  const { products } = await productStore();
  const scope: Filter<Product> = { status: "active" };
  if (options.categories?.length) scope.category = { $in: options.categories };
  if (options.country) scope.country = options.country;
  if (options.maxPriceCents !== undefined)
    scope.priceCents = { $lte: options.maxPriceCents };
  const filter = { $and: [scope, await visibleFilter()] };
  // Mongo treats limit(0) as "no limit"; a zero limit here means count only.
  const [data, total, cheapest] = await Promise.all([
    limit < 1
      ? Promise.resolve([])
      : products
          .find(filter, {
            projection: {
              _id: 0,
              id: 1,
              domain: 1,
              country: 1,
              category: 1,
              language: 1,
              priceCents: 1,
              metrics: 1,
            },
          })
          .sort({ "metrics.dr": -1, id: 1 })
          .limit(limit)
          .toArray(),
    products.countDocuments(filter),
    products
      .find(filter, { projection: { _id: 0, priceCents: 1 } })
      .sort({ priceCents: 1 })
      .limit(1)
      .toArray(),
  ]);
  return { data, total, lowestPriceCents: cheapest[0]?.priceCents ?? null };
}
export async function productFacets() {
  const { products } = await productStore();
  const filter = {
    $and: [{ status: "active" as const }, await visibleFilter()],
  };
  const [countries, languages, categories] = await Promise.all([
    products.distinct("country", filter),
    products.distinct("language", filter),
    products.distinct("category", filter),
  ]);
  const clean = (values: string[]) =>
    values.filter(Boolean).sort((a, b) => a.localeCompare(b));
  return {
    countries: clean(countries),
    languages: clean(languages),
    categories: clean(categories),
  };
}
/** Statistics over all visible matching products, never just the first page. */
export async function publicProductStatistics(params: URLSearchParams, directory: DirectoryFilter = {}): Promise<CatalogueStatistics> {
  const {products} = await productStore();
  const scope = query(params, false).filter;
  if (directory.categories?.length) scope.category = {$in: directory.categories};
  if (directory.country) scope.country = directory.country;
  if (directory.maxPriceCents !== undefined) scope.priceCents = {$lte: directory.maxPriceCents};
  const filter = {$and: [scope, await visibleFilter()]};
  const rows = await products.aggregate<{
    summary: Array<{total:number; min:number; max:number; updatedAt?:string}>;
    prices: Array<{values:number[]}>;
    countries: Array<{_id:string; count:number}>;
    topics: Array<{_id:string; count:number}>;
  }>([
    {$match: filter},
    {$facet: {
      summary: [{$group: {_id:null, total:{$sum:1}, min:{$min:"$priceCents"}, max:{$max:"$priceCents"}, updatedAt:{$max:"$updatedAt"}}}],
      prices: [{$group: {_id:null, values:{$push:"$priceCents"}}}],
      countries: [{$match:{country:{$nin:["",null]}}}, {$group:{_id:"$country", count:{$sum:1}}}, {$sort:{count:-1,_id:1}}, {$limit:3}],
      topics: [{$match:{category:{$nin:["",null]}}}, {$group:{_id:"$category", count:{$sum:1}}}, {$sort:{count:-1,_id:1}}, {$limit:3}],
    }},
  ]).toArray();
  const result = rows[0];
  const summary = result?.summary[0];
  const updatedAt = summary?.updatedAt;
  return {total: summary?.total ?? 0, minPriceCents: summary?.min ?? null, maxPriceCents: summary?.max ?? null, medianPriceCents: priceMedian(result?.prices[0]?.values || []), topCountries: (result?.countries || []).map(row=>({name:row._id,count:row.count})), topTopics: (result?.topics || []).map(row=>({name:row._id,count:row.count})), ...(updatedAt && Number.isFinite(Date.parse(updatedAt)) ? {updatedAt} : {})};
}
function validated(input: unknown) {
  try {
    return validateProduct(input);
  } catch (error) {
    if (error instanceof Error && error.name !== "ZodError")
      throw new ProductError(422, error.message);
    throw error;
  }
}
async function requireAdmin(
  actorId: string,
  session: import("mongodb").ClientSession,
) {
  const user = await (
    await getDb()
  )
    .collection("cms_users")
    .findOne({ id: actorId, role: "admin", active: true }, { session });
  if (!user)
    throw new ProductError(
      403,
      "Only an active administrator can manage products.",
    );
}
function withoutSource(record: Product) {
  const { source: _source, ...safe } = record;
  void _source;
  return safe;
}
export async function createProduct(raw: unknown, actorId: string) {
  const input = validated(raw);
  await setupProducts();
  return userTransaction(async (session) => {
    await requireAdmin(actorId, session);
    const now = new Date().toISOString();
    const product: Product = {
      ...input,
      id: randomUUID(),
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await (
      await productStore()
    ).products.insertOne({ ...product }, { session });
    await logAudit(
      actorId,
      "product.create",
      "products",
      product.id,
      "",
      session,
    );
    return product;
  });
}
export async function updateProduct(id: string, raw: unknown, actorId: string) {
  const version =
    raw && typeof raw === "object" && "version" in raw
      ? raw.version
      : undefined;
  if (!Number.isSafeInteger(version) || Number(version) < 1)
    throw new ProductError(422, "A saved product version is required.");
  const input = validated(
    Object.fromEntries(
      Object.entries(raw as Record<string, unknown>).filter(
        ([key]) => key !== "version",
      ),
    ),
  );
  const visibility = await visibleFilter();
  return userTransaction(async (session) => {
    await requireAdmin(actorId, session);
    const { products } = await productStore();
    const old = await products.findOne(
      { $and: [{ id }, visibility] },
      { session, projection: { _id: 0 } },
    );
    if (!old) throw new ProductError(404, "Product not found.");
    if (old.version !== version)
      throw new ProductError(
        409,
        "This product changed. Reload before saving.",
      );
    const next: Product = {
      ...old,
      ...input,
      version: old.version + 1,
      updatedAt: new Date().toISOString(),
    };
    const result = await products.replaceOne(
      { id, version: old.version },
      next,
      { session },
    );
    if (!result.modifiedCount)
      throw new ProductError(
        409,
        "This product changed. Reload before saving.",
      );
    await logAudit(
      actorId,
      "product.update",
      "products",
      id,
      `Status: ${next.status}`,
      session,
    );
    return withoutSource(next);
  });
}
export async function importProducts(
  analysis: ProductImportAnalysis,
  actorId: string,
  options: { acceptValidRows?: boolean; cli?: boolean } = {},
) {
  if (analysis.fatal)
    throw new ProductError(
      422,
      "The CSV has structural errors. Correct its format before importing any rows.",
    );
  if (analysis.errors && !options.acceptValidRows)
    throw new ProductError(
      422,
      "Resolve the flagged rows or explicitly choose to import only valid rows.",
    );
  if (!analysis.products.length)
    throw new ProductError(422, "No valid products to import.");
  await setupProducts();
  const { products, imports } = await productStore();
  if (await imports.findOne({ sha256: analysis.sha256, status: "committed" }))
    throw new ProductError(
      409,
      "This exact file was already imported. Existing products have not been overwritten.",
    );
  const importId = randomUUID();
  const now = new Date().toISOString();
  const excluded = analysis.rows - analysis.products.length;
  await imports.insertOne({
    _id: importId,
    sha256: analysis.sha256,
    status: "staging",
    actorId,
    count: analysis.products.length,
    excluded,
    createdAt: now,
  });
  try {
    for (let start = 0; start < analysis.products.length; start += 500) {
      const records = analysis.products
        .slice(start, start + 500)
        .map((input) => ({
          ...input,
          status: "draft" as const,
          id: randomUUID(),
          importId,
          version: 1,
          createdAt: now,
          updatedAt: now,
        }));
      await products.insertMany(records, { ordered: true });
    }
    await userTransaction(async (session) => {
      if (!options.cli) await requireAdmin(actorId, session);
      await imports.updateOne(
        { _id: importId, status: "staging" },
        {
          $set: { status: "committed", committedAt: new Date().toISOString() },
        },
        { session },
      );
      await logAudit(
        actorId,
        "products.import.draft",
        "products",
        importId,
        `${analysis.products.length} drafts imported; ${excluded} source rows excluded.`,
        session,
      );
    });
    return {
      importId,
      inserted: analysis.products.length,
      excluded,
      status: "draft" as const,
    };
  } catch (error) {
    // A lost commit acknowledgement must not delete a batch that became visible.
    if (await imports.findOne({ _id: importId, status: "committed" }))
      return {
        importId,
        inserted: analysis.products.length,
        excluded,
        status: "draft" as const,
      };
    // Remove only newly staged rows in this exact server-generated failed batch.
    // Existing products are never modified. Uncommitted batches remain invisible.
    await products.deleteMany({ importId });
    await imports.updateOne({ _id: importId }, { $set: { status: "failed" } });
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    )
      throw new ProductError(
        409,
        "A publisher URL or export ID already exists. This batch was not imported; existing records are unchanged.",
      );
    throw error;
  }
}
