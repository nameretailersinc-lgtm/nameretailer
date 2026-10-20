import { cachedAsync } from "../cache/ttl";
import { cache } from "react";
import type { Filter } from "mongodb";
import { productStore } from "./products";
import {
  PROFILE_RULE,
  hasPublicationProfile,
  publicationHost,
  publicationPath,
  publicationSlug,
  slugDomainPattern,
  validPublicationSlug,
  validPublicationListingId,
} from "./publication-pages";
import type { Product, PublicProduct } from "./types";
import { publicProduct } from "./public-product";
import { placementOptions } from "./pricing";
import { publicPublicationContent } from "./publication-content";

const publicFields = {
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
} as const;

const detailFields = {
  ...publicFields,
  metricsUpdatedAt: 1,
  publicationContent: 1,
  "source.Article_Price": 1,
  "source.Article_Price_2": 1,
  "source.Article_Price_3": 1,
} as const;

function publicProfile(product: Product): PublicProduct {
  const safe = publicProduct(product);
  // Only normalized writing prices leave the server; raw source copy stays private.
  try {
    const options = placementOptions(product).writingOptions;
    return { ...safe, ...(options.length ? { writingOptions: options } : {}) };
  } catch {
    return safe;
  }
}

/** Detail pages use the same active/committed visibility as the marketplace. */
export async function activePublicationFilter(): Promise<Filter<Product>> {
  const { imports } = await productStore();
  const committed = await imports
    .find({ status: "committed" }, { projection: { _id: 1 } })
    .toArray();
  return {
    status: "active",
    $or: [
      { importId: { $exists: false } },
      { importId: { $in: committed.map((batch) => batch._id) } },
    ],
  };
}

/** Mongo form of hasPublicationProfile(); the predicate re-checks each result. */
async function profileFilter(): Promise<Filter<Product>> {
  return {
    ...(await activePublicationFilter()),
    category: { $nin: [...PROFILE_RULE.excludedCategories] },
    domain: { $not: /^https?:\/\/[^/]+\/./ },
    "metrics.dr": { $gte: PROFILE_RULE.minDr },
    "metrics.da": { $gte: PROFILE_RULE.minDa },
    priceCents: { $gte: PROFILE_RULE.minPriceCents },
    ...(PROFILE_RULE.requireTrafficOrGuidelines
      ? {
          $and: [
            {
              $or: [
                { "metrics.traffic": { $gte: PROFILE_RULE.minTraffic } },
                { requirements: { $regex: /\S/ } },
                {
                  "publicationContent.state": "reviewed",
                  "publicationContent.editorialGuidelines": { $regex: /\S/ },
                },
                {
                  "publicationContent.state": "reviewed",
                  "publicationContent.contentRequirements": { $regex: /\S/ },
                },
              ],
            },
          ],
        }
      : {}),
  };
}

/** Resolves a profile slug; a "-" in the slug may stand for "." or "-" in the host. */
export const publicationProfile = cache(
  async (slug: string, listingId?: string): Promise<PublicProduct | null> => {
    if (!validPublicationSlug(slug)) return null;
    if (listingId !== undefined && !validPublicationListingId(listingId))
      return null;
    const { products } = await productStore();
    if (listingId !== undefined) {
      const product = await products.findOne(
        { ...(await activePublicationFilter()), id: listingId },
        { projection: detailFields },
      );
      return product &&
        publicationPath(product) === `/publication/${slug}/${listingId}/`
        ? publicProfile(product)
        : null;
    }
    const candidates = await products
      .find(
        {
          $and: [
            await activePublicationFilter(),
            { domain: { $regex: slugDomainPattern(slug) } },
          ],
        },
        { projection: detailFields },
      )
      .sort({ domain: 1, id: 1 })
      .toArray();
    const product = candidates.find(
      (product) =>
        publicationHost(product.domain) !== null &&
        publicationSlug(publicationHost(product.domain) || "") === slug,
    );
    return product ? publicProfile(product) : null;
  },
);

/** Same topic; prefer supplied language/country matches, then nearby prices. */
export async function relatedProfiles(
  product: Pick<
    PublicProduct,
    "id" | "category" | "priceCents" | "language" | "country"
  >,
  limit = 6,
): Promise<PublicProduct[]> {
  const { products } = await productStore();
  if (!product.category) return [];
  const rows = await products
    .aggregate<Product>(
      [
        {
          $match: {
            $and: [
              await activePublicationFilter(),
              {
                category: product.category,
                id: { $ne: product.id },
                priceCents: { $gt: 0 },
              },
            ],
          },
        },
        { $project: publicFields },
        {
          $addFields: {
            priceDistance: {
              $abs: { $subtract: ["$priceCents", product.priceCents] },
            },
            languageMatch: {
              $cond: [
                {
                  $and: [
                    { $ne: [product.language, ""] },
                    { $eq: ["$language", product.language] },
                  ],
                },
                1,
                0,
              ],
            },
            countryMatch: {
              $cond: [
                {
                  $and: [
                    { $ne: [product.country, ""] },
                    { $eq: ["$country", product.country] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
        {
          $sort: {
            languageMatch: -1,
            countryMatch: -1,
            priceDistance: 1,
            domain: 1,
            id: 1,
          },
        },
        { $limit: Math.max(1, Math.min(6, limit)) },
      ],
      { maxTimeMS: 8000 },
    )
    .toArray();
  return rows.filter((row) => !!publicationPath(row)).map(publicProduct);
}

export function profileSitemapEntries(): Promise<PublicProduct[]> {
  return cachedAsync(
    "indexable-publication-profiles",
    { ttlMs: 15 * 60_000, staleOnErrorMs: 0, timeoutMs: 60000 },
    async () => {
      const { products } = await productStore();
      const rows = await products
        .find(await profileFilter(), {
          projection: {
            _id: 0,
            id: 1,
            domain: 1,
            updatedAt: 1,
            category: 1,
            priceCents: 1,
            "metrics.dr": 1,
            "metrics.da": 1,
            "metrics.traffic": 1,
            requirements: 1,
            publicationContent: 1,
          },
        })
        .sort({ domain: 1, id: 1 })
        .maxTimeMS(30000)
        .toArray();
      const paths = new Set<string>();
      return rows.map(publicProduct).filter((row) => {
        const path = publicationPath(row);
        if (!path || paths.has(path) || !hasPublicationProfile(row))
          return false;
        paths.add(path);
        return true;
      });
    },
  );
}

/** Discovery only: don't transfer long editorial requirements to build URL lists. */
export function publicationSitemapLinks(): Promise<
  Array<{ id: string; domain: string; updatedAt: string }>
> {
  return cachedAsync(
    "indexable-publication-links",
    { ttlMs: 15 * 60_000, staleOnErrorMs: 0, timeoutMs: 60000 },
    async () => {
      const { products } = await productStore();
      const rows = await products
        .aggregate<
          Pick<
            Product,
            | "id"
            | "domain"
            | "category"
            | "priceCents"
            | "metrics"
            | "updatedAt"
            | "publicationContent"
          > & { hasRequirements: boolean }
        >(
          [
            { $match: await profileFilter() },
            { $sort: { domain: 1, id: 1 } },
            {
              $project: {
                _id: 0,
                id: 1,
                domain: 1,
                updatedAt: 1,
                category: 1,
                priceCents: 1,
                "metrics.dr": 1,
                "metrics.da": 1,
                "metrics.traffic": 1,
                hasRequirements: {
                  $regexMatch: {
                    input: { $ifNull: ["$requirements", ""] },
                    regex: /\S/,
                  },
                },
                publicationContent: {
                  $cond: [
                    { $eq: ["$publicationContent.state", "reviewed"] },
                    "$publicationContent",
                    "$$REMOVE",
                  ],
                },
              },
            },
          ],
          { maxTimeMS: 30000, batchSize: 5000 },
        )
        .toArray();
      const paths = new Set<string>();
      return rows
        .filter((row) => {
          const candidate = {
            ...row,
            publicationContent: publicPublicationContent(
              row.publicationContent,
              row.domain,
            ),
          };
          const path = publicationPath(candidate);
          if (
            !path ||
            paths.has(path) ||
            !hasPublicationProfile(candidate, row.hasRequirements)
          )
            return false;
          paths.add(path);
          return true;
        })
        .map(({ id, domain, updatedAt }) => ({ id, domain, updatedAt }));
    },
  );
}
export async function publicationIndexable(product: PublicProduct) {
  // The canonical page loader already resolves active/committed visibility.
  return hasPublicationProfile(product);
}
