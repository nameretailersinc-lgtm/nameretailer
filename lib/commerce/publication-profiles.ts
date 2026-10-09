import { cache } from "react";
import type { Filter } from "mongodb";
import { productStore } from "./products";
import {
  PROFILE_RULE,
  hasPublicationProfile,
  publicationHost,
  publicationSlug,
  slugDomainPattern,
} from "./publication-pages";
import type { Product, PublicProduct } from "./types";

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

/** Mongo form of hasPublicationProfile(); the predicate re-checks each result. */
async function profileFilter(): Promise<Filter<Product>> {
  const { imports } = await productStore();
  const committed = await imports
    .find({ status: "committed" }, { projection: { _id: 1 } })
    .toArray();
  return {
    status: "active",
    category: { $nin: [...PROFILE_RULE.excludedCategories] },
    domain: { $not: /^https?:\/\/[^/]+\/./ },
    "metrics.traffic": { $gte: PROFILE_RULE.minTraffic },
    "metrics.dr": { $gte: PROFILE_RULE.minDr },
    "metrics.da": { $gte: PROFILE_RULE.minDa },
    "metrics.spamScore": { $lte: PROFILE_RULE.maxSpamScore },
    $or: [
      { importId: { $exists: false } },
      { importId: { $in: committed.map((batch) => batch._id) } },
    ],
  };
}

/** Resolves a profile slug; a "-" in the slug may stand for "." or "-" in the host. */
export const publicationProfile = cache(
  async (slug: string): Promise<PublicProduct | null> => {
    const { products } = await productStore();
    const candidates = await products
      .find(
        {
          $and: [
            await profileFilter(),
            { domain: { $regex: slugDomainPattern(slug) } },
          ],
        },
        { projection: publicFields },
      )
      .sort({ domain: 1 })
      .limit(5)
      .toArray();
    return (
      candidates.find(
        (product) =>
          hasPublicationProfile(product) &&
          publicationSlug(publicationHost(product.domain) || "") === slug,
      ) || null
    );
  },
);

/** Other profiled publications in the same topic, highest traffic first. */
export async function relatedProfiles(
  product: Pick<PublicProduct, "id" | "category">,
  limit = 6,
): Promise<PublicProduct[]> {
  const { products } = await productStore();
  const rows = await products
    .find(
      {
        $and: [
          await profileFilter(),
          { category: product.category, id: { $ne: product.id } },
        ],
      },
      { projection: publicFields },
    )
    .sort({ "metrics.traffic": -1, id: 1 })
    .limit(limit)
    .toArray();
  return rows.filter(hasPublicationProfile);
}

export async function profileSitemapEntries(): Promise<
  Array<Pick<PublicProduct, "domain" | "category" | "metrics" | "updatedAt">>
> {
  const { products } = await productStore();
  const rows = await products
    .find(await profileFilter(), {
      projection: {
        _id: 0,
        domain: 1,
        category: 1,
        metrics: 1,
        updatedAt: 1,
      },
    })
    .sort({ domain: 1 })
    .toArray();
  return rows.filter(hasPublicationProfile);
}
