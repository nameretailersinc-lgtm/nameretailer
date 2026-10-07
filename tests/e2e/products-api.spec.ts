import { createHash } from "node:crypto";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { PRODUCT_CSV_HEADERS } from "../../lib/commerce/csv";
import type { Product, ProductInput } from "../../lib/commerce/types";
import { actor, fixtures, key, mutation, origin } from "./helpers";

export function productInput(
  domain = `${key("publication")}.com`,
  changes: Partial<ProductInput> = {},
): ProductInput {
  return {
    externalId: null,
    domain,
    language: "English",
    country: "QA country",
    category: "QA topic",
    priceCents: 12345,
    currency: "USD",
    status: "draft",
    metrics: {
      da: null,
      dr: null,
      tf: null,
      ur: null,
      traffic: null,
      referringDomains: null,
      backlinks: null,
      spamScore: null,
    },
    linkType: "",
    turnaround: "",
    requirements: "Synthetic isolated QA listing; not genuine inventory.",
    ...changes,
  };
}

export function productCsv(rows: Array<Record<string, string>>) {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [
    PRODUCT_CSV_HEADERS.join(","),
    ...rows.map((row) =>
      PRODUCT_CSV_HEADERS.map((header) => quote(row[header] ?? "")).join(","),
    ),
  ].join("\r\n");
}
export function csvRow(
  domain = `${key("csv")}.com`,
  changes: Record<string, string> = {},
) {
  return {
    id: BigInt(
      `0x${createHash("sha256").update(key("legacy")).digest("hex")}`,
    ).toString(),
    domain,
    language: "English",
    Price: "123.45",
    Country: "QA import country",
    Category: "QA import topic",
    da: "0",
    dr: "42",
    tf: "0",
    ur: "0",
    traffic: "1500",
    referring_domains: "0",
    backlinks: "0",
    SpamScore: "0",
    date_added: "0000-00-00 00:00:00",
    Article_Price: "private-article-price",
    Article_Price_2: "private-package-2",
    Article_Price_3: "private-package-3",
    Description: "PRIVATE_QA_SOURCE_NOT_PUBLIC",
    ...changes,
  };
}
export async function createProduct(
  api: APIRequestContext,
  input: ProductInput,
) {
  const response = await mutation(api, "post", "/api/admin/products", input);
  expect(response.status()).toBe(201);
  return (await response.json()).data as Product;
}
export async function uploadCsv(
  api: APIRequestContext,
  csv: string,
  action = "preview",
  extra: Record<string, string> = {},
) {
  const response = await api.get("/api/admin/csrf");
  expect(response.status()).toBe(200);
  const {
    data: { token },
  } = await response.json();
  return api.post("/api/admin/products/import", {
    headers: { Origin: origin, "x-csrf-token": token },
    multipart: {
      file: {
        name: "synthetic-qa.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(csv),
      },
      action,
      ...extra,
    },
  });
}
async function admin() {
  return actor((await fixtures()).admin);
}

test.describe("first-slice product API", () => {
  test("admin-only inventory and import deny every other role and anonymous callers", async ({
    request,
  }) => {
    await fixtures();
    expect((await request.get("/api/admin/products")).status()).toBe(401);
    expect((await request.post("/api/admin/products/import")).status()).toBe(
      401,
    );
    const accounts = await fixtures();
    const primary = await admin();
    const item = await createProduct(primary, productInput());
    for (const role of ["author", "editor", "customer"] as const) {
      const api = await actor(accounts[role]);
      expect((await api.get("/api/admin/products")).status()).toBe(403);
      expect(
        (
          await api.post("/api/admin/products", {
            data: productInput(),
            headers: { Origin: origin },
          })
        ).status(),
      ).toBe(403);
      expect(
        (
          await api.patch(`/api/admin/products/${item.id}`, {
            data: { ...productInput(item.domain), version: item.version },
            headers: { Origin: origin },
          })
        ).status(),
      ).toBe(403);
      expect(
        (
          await api.post("/api/admin/products/import", {
            headers: { Origin: origin },
          })
        ).status(),
      ).toBe(403);
      await api.dispose();
    }
    await primary.dispose();
  });

  test("product mutations require per-actor CSRF and same origin", async () => {
    const api = await admin();
    expect(
      (
        await api.post("/api/admin/products", {
          data: productInput(),
          headers: { Origin: origin },
        })
      ).status(),
    ).toBe(403);
    const csrf = (await (await api.get("/api/admin/csrf")).json()).data.token;
    expect(
      (
        await api.post("/api/admin/products", {
          data: productInput(),
          headers: { Origin: "https://foreign.example", "x-csrf-token": csrf },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await api.post("/api/admin/products/import", {
          headers: { Origin: origin },
        })
      ).status(),
    ).toBe(403);
    await api.dispose();
  });

  test("CRUD preserves exact cents, canonical path identity, uniqueness and optimistic versions", async () => {
    const api = await admin();
    const host = `${key("identity")}.com`;
    const input = productInput(
      `HTTP://WWW.${host.toUpperCase()}/MeaningfulPath`,
      { priceCents: 10001, externalId: key("external") },
    );
    const item = await createProduct(api, input);
    expect(item.domain).toBe(`https://${host}/MeaningfulPath`);
    expect(item.priceCents).toBe(10001);
    expect(
      (
        await mutation(
          api,
          "post",
          "/api/admin/products",
          productInput(item.domain),
        )
      ).status(),
    ).toBe(409);
    expect(
      (
        await mutation(
          api,
          "post",
          "/api/admin/products",
          productInput(undefined, { externalId: item.externalId }),
        )
      ).status(),
    ).toBe(409);
    const path = await createProduct(
      api,
      productInput(`https://${host}/DifferentPath`),
    );
    expect(path.id).not.toBe(item.id);
    const next = await mutation(
      api,
      "patch",
      `/api/admin/products/${item.id}`,
      { ...input, priceCents: 19999, version: item.version, status: "active" },
    );
    expect(next.status()).toBe(200);
    expect((await next.json()).data).toMatchObject({
      priceCents: 19999,
      version: 2,
      status: "active",
    });
    expect(
      (
        await mutation(api, "patch", `/api/admin/products/${item.id}`, {
          ...input,
          version: item.version,
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await mutation(
          api,
          "post",
          "/api/admin/products",
          productInput(undefined, { priceCents: 1.5 }),
        )
      ).status(),
    ).toBe(422);
    expect(
      (
        await mutation(api, "patch", `/api/admin/products/${item.id}`, {
          ...input,
          version: 2,
          status: "archived",
        })
      ).status(),
    ).toBe(200);
    await api.dispose();
  });

  test("public visibility, active-only facets, filters, stable sorting and pagination use real products", async ({
    request,
  }) => {
    const api = await admin();
    const group = key("filters");
    const category = key("active-topic"),
      hiddenTopic = key("private-topic");
    for (let index = 0; index < 5; index++)
      await createProduct(
        api,
        productInput(`${group}-${index}.com`, {
          status: "active",
          category,
          country: group,
          priceCents: 10001 + index * 100,
          metrics: {
            ...productInput().metrics,
            dr: 40 + index,
            da: 50 + index,
            traffic: index * 1000,
          },
        }),
      );
    await createProduct(
      api,
      productInput(`${group}-draft.com`, {
        category: hiddenTopic,
        country: hiddenTopic,
      }),
    );
    await createProduct(
      api,
      productInput(`${group}-archived.com`, {
        status: "archived",
        category: hiddenTopic,
      }),
    );
    const result = await request.get(
      `/api/products?q=${group}&sort=priceDesc&pageSize=2&page=2`,
    );
    expect(result.status()).toBe(200);
    const body = await result.json();
    expect(body).toMatchObject({ total: 5, page: 2, pageSize: 2 });
    expect(body.data.map((item: Product) => item.priceCents)).toEqual([
      10201, 10101,
    ]);
    for (const product of body.data) {
      expect(product.status).toBe("active");
      expect(Object.keys(product)).not.toEqual(
        expect.arrayContaining(["source"]),
      );
      expect(product).not.toHaveProperty("importId");
      expect(product).not.toHaveProperty("externalId");
    }
    const filtered = await (
      await request.get(
        `/api/products?q=${group}&country=${group}&language=English&category=${category}&minDr=42&minDa=52&maxPrice=103.01&sort=drDesc`,
      )
    ).json();
    expect(filtered.total).toBe(2);
    expect(filtered.data.map((item: Product) => item.metrics.dr)).toEqual([
      43, 42,
    ]);
    const facets = (await (await request.get("/api/products/facets")).json())
      .data;
    expect(facets.categories).toContain(category);
    expect(facets.categories).not.toContain(hiddenTopic);
    expect(facets.countries).not.toContain(hiddenTopic);
    expect((await request.get("/api/products?minDr=101")).status()).toBe(422);
    expect((await request.get("/api/products?pageSize=51")).status()).toBe(422);
    expect((await request.get(`/api/products?q=${group}%5B.*`)).status()).toBe(
      200,
    );
    await api.dispose();
  });

  test("CSV preview is hash-bound and commit defaults drafts with private normalized source", async ({
    request,
  }) => {
    const api = await admin();
    const host = `${key("import")}.com`;
    const csv = productCsv([csvRow(host)]);
    const preview = await uploadCsv(api, csv);
    expect(preview.status()).toBe(200);
    const summary = (await preview.json()).data;
    expect(summary).toMatchObject({
      rows: 1,
      valid: 1,
      errors: 0,
      fatal: false,
      sha256: createHash("sha256").update(csv).digest("hex"),
    });
    expect(summary.sample[0]).toMatchObject({
      priceCents: 12345,
      status: "draft",
      metrics: { da: null, dr: 42, traffic: 1500 },
    });
    expect(summary.sample[0]).not.toHaveProperty("source");
    expect(
      (
        await uploadCsv(api, csv, "commit", { sha256: "0".repeat(64) })
      ).status(),
    ).toBe(409);
    const committed = await uploadCsv(api, csv, "commit", {
      sha256: summary.sha256,
    });
    expect(committed.status()).toBe(201);
    expect((await committed.json()).data).toMatchObject({
      inserted: 1,
      excluded: 0,
      status: "draft",
    });
    expect(
      (await (await request.get(`/api/products?q=${host}`)).json()).total,
    ).toBe(0);
    const record = (
      await (await api.get(`/api/admin/products?q=${host}`)).json()
    ).data[0] as Product;
    expect(record).not.toHaveProperty("source");
    expect(record).toMatchObject({ status: "draft", priceCents: 12345 });
    const {
      id,
      version,
      createdAt: _created,
      updatedAt: _updated,
      importId: _import,
      ...input
    } = record;
    void _created;
    void _updated;
    void _import;
    expect(
      (
        await mutation(api, "patch", `/api/admin/products/${id}`, {
          ...input,
          status: "active",
          version,
        })
      ).status(),
    ).toBe(200);
    const publicRecord = (
      await (await request.get(`/api/products?q=${host}`)).json()
    ).data[0];
    expect(publicRecord).not.toHaveProperty("source");
    expect(publicRecord).not.toHaveProperty("importId");
    expect(publicRecord).not.toHaveProperty("externalId");
    expect(JSON.stringify(publicRecord)).not.toContain("PRIVATE_QA_SOURCE");
    expect((await request.get(`/products/${id}`)).status()).toBe(404);
    expect(
      (
        await uploadCsv(api, csv, "commit", { sha256: summary.sha256 })
      ).status(),
    ).toBe(409);
    await api.dispose();
  });

  test("invalid CSV rows require explicit quarantine and structural errors remain fatal", async () => {
    const api = await admin();
    const host = `${key("quarantine")}.com`;
    const csv = productCsv([
      csvRow(host),
      csvRow(`${key("badprice")}.com`, { Price: "0.00" }),
    ]);
    const preview = (await (await uploadCsv(api, csv)).json()).data;
    expect(preview).toMatchObject({ rows: 2, valid: 1, fatal: false });
    expect(preview.errors).toBeGreaterThan(0);
    expect(
      (
        await uploadCsv(api, csv, "commit", { sha256: preview.sha256 })
      ).status(),
    ).toBe(422);
    const result = await uploadCsv(api, csv, "commit", {
      sha256: preview.sha256,
      acceptValidRows: "true",
    });
    expect(result.status()).toBe(201);
    expect((await result.json()).data).toMatchObject({
      inserted: 1,
      excluded: 1,
      status: "draft",
    });
    const broken = `${productCsv([csvRow(`${key("structural")}.com`)])}\r\ninvalid,short,row`;
    const fatal = (await (await uploadCsv(api, broken)).json()).data;
    expect(fatal.fatal).toBe(true);
    expect(
      (
        await uploadCsv(api, broken, "commit", {
          sha256: fatal.sha256,
          acceptValidRows: "true",
        })
      ).status(),
    ).toBe(422);
    await api.dispose();
  });

  test("CSV collision rolls back the whole visible batch and never overwrites manual inventory", async () => {
    const api = await admin();
    const old = await createProduct(api, productInput());
    const fresh = `${key("rollback")}.com`;
    const csv = productCsv([
      csvRow(fresh),
      csvRow(old.domain, { Price: "999.99" }),
    ]);
    const summary = (await (await uploadCsv(api, csv)).json()).data;
    expect(summary.valid).toBe(2);
    expect(
      (
        await uploadCsv(api, csv, "commit", { sha256: summary.sha256 })
      ).status(),
    ).toBe(409);
    expect(
      (await (await api.get(`/api/admin/products?q=${fresh}`)).json()).total,
    ).toBe(0);
    const preserved = (
      await (
        await api.get(`/api/admin/products?q=${new URL(old.domain).hostname}`)
      ).json()
    ).data[0];
    expect(preserved).toMatchObject({
      id: old.id,
      priceCents: old.priceCents,
      version: old.version,
    });
    await api.dispose();
  });
});
