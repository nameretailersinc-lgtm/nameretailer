import { cache } from "react";
import { cachedAsync } from "../cache/ttl";
import type { BSONTypeAlias, Document } from "mongodb";
import { productStore } from "./products";
import {
  cleanDirectoryFilter,
  cleanListing,
  cleanTraffic,
} from "./listing-hygiene";
import { priceMedian } from "./catalogue-statistics";
import type { Product } from "./types";
import type { Directory, DirectoryFilter } from "../site/directories";

export type SeoListing = Pick<
  Product,
  | "id"
  | "domain"
  | "category"
  | "country"
  | "currency"
  | "priceCents"
  | "metrics"
  | "updatedAt"
  | "turnaround"
  | "needsReview"
>;
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
export const count = (value: number) => value.toLocaleString("en-US");
export function listingDate(value: unknown): string | undefined {
  if (!(typeof value === "string" || value instanceof Date)) return;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
}
export function latestListingDate(rows: SeoListing[]) {
  return rows
    .map((row) => listingDate(row.updatedAt))
    .filter((date): date is string => !!date)
    .sort()
    .at(-1);
}
export function matchesDirectory(row: SeoListing, scope: DirectoryFilter = {}) {
  return (
    (!scope.categories?.length || scope.categories.includes(row.category)) &&
    (!scope.country || row.country === scope.country) &&
    (scope.maxPriceCents === undefined ||
      row.priceCents <= scope.maxPriceCents) &&
    (!scope.cleanListings || cleanListing(row))
  );
}
export function summarizePrices(rows: Array<Pick<SeoListing, "priceCents">>) {
  const sorted = rows.map((row) => row.priceCents).sort((a, b) => a - b);
  return {
    count: sorted.length,
    medianCents: priceMedian(sorted),
    minCents: sorted[0] ?? null,
    maxCents: sorted.at(-1) ?? null,
    lowCents:
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.25))] ??
      null,
    highCents:
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75))] ??
      null,
  };
}
// Share short-lived live reads and bound the entire load, including connection/SRV lookup.
export const seoCatalogue = cache(() =>
  cachedAsync(
    "seo-catalogue",
    {
      ttlMs: 60_000,
      staleOnErrorMs: 60 * 60_000,
      timeoutMs: 12_000,
    },
    async () => {
      const { products, imports } = await productStore();
      const committed = await imports
        .find({ status: "committed" }, { projection: { _id: 1 } })
        .maxTimeMS(10000)
        .toArray();
      const rows = await products
        .find(
          {
            status: "active",
            currency: "USD",
            priceCents: {
              $type: "number" as unknown as BSONTypeAlias,
              $gte: 0,
              $lte: Number.MAX_SAFE_INTEGER,
            },
            $or: [
              { importId: { $exists: false } },
              { importId: { $in: committed.map((batch) => batch._id) } },
            ],
          },
          {
            batchSize: 5000,
            projection: {
              _id: 0,
              id: 1,
              domain: 1,
              category: 1,
              country: 1,
              currency: 1,
              priceCents: 1,
              metrics: 1,
              updatedAt: 1,
              turnaround: 1,
              needsReview: 1,
            },
          },
        )
        .maxTimeMS(10000)
        .toArray();
      const priced = rows.filter((row) => Number.isSafeInteger(row.priceCents));
      return {
        rows: priced.map((row) => ({
          ...row,
          metrics: {
            ...row.metrics,
            traffic: cleanTraffic(row.metrics?.traffic),
          },
        })),
        asOf: latestListingDate(priced),
        hygiene: {
          hiddenTraffic: priced.filter(
            (row) =>
              row.metrics?.traffic != null &&
              cleanTraffic(row.metrics.traffic) === null,
          ).length,
          excludedDirectoryRows: priced.filter((row) => !cleanListing(row))
            .length,
        },
      };
    },
  ),
);
export const browseBands = [
  {
    label: "DR 20–49",
    href: "/dr-20-to-49/",
    test: (r: SeoListing) =>
      r.metrics?.dr != null && r.metrics.dr >= 20 && r.metrics.dr < 50,
  },
  {
    label: "DR 50–69",
    href: "/dr-50-to-69/",
    test: (r: SeoListing) =>
      r.metrics?.dr != null && r.metrics.dr >= 50 && r.metrics.dr < 70,
  },
  {
    label: "DR 70+",
    href: "/dr-70-plus/",
    test: (r: SeoListing) =>
      r.metrics?.dr != null && r.metrics.dr >= 70 && r.metrics.dr <= 100,
  },
  {
    label: "Under $100",
    href: "/guest-posting-sites-under-100/",
    test: (r: SeoListing) => r.priceCents < 10000,
  },
  {
    label: "$100–$300",
    href: "/price-100-to-300/",
    test: (r: SeoListing) => r.priceCents >= 10000 && r.priceCents < 30000,
  },
  {
    label: "$300+",
    href: "/price-300-plus/",
    test: (r: SeoListing) => r.priceCents >= 30000,
  },
];
export const techSubtopics = [
  {
    label: "Cybersecurity",
    categories: ["Cybersecurity", "Cyber Security", "Security"],
    query: "Cybersecurity",
    description:
      "Check that security articles explain a threat model, defensive scope and tested environment. A category match does not establish security expertise; ask who reviews commands and claims.",
  },
  {
    label: "Web hosting",
    categories: ["Web hosting", "Web Hosting", "Hosting"],
    query: "Hosting",
    description:
      "Look for deployment guides and hosting comparisons that disclose test conditions. Confirm whether readers manage shared hosting, cloud infrastructure or client websites before proposing an angle.",
  },
  {
    label: "Gadgets and reviews",
    categories: ["Gadgets"],
    query: "Gadgets",
    description:
      "Read reviews for evidence of hands-on use, image rights and clear sponsorship labels. Supply the device version and testing limitations rather than repeating a manufacturer's specifications.",
  },
  {
    label: "AI and software",
    categories: [
      "AI",
      "Artificial Intelligence",
      "Software development",
      "Programming",
    ],
    query: "Software development",
    description:
      "Explain the model or software version, inputs, evaluation method and failure cases. A tutorial should help a reader complete a task without requiring an unsupported product endorsement.",
  },
  {
    label: "Mobile",
    categories: ["Mobile"],
    query: "Mobile",
    description:
      "Separate mobile development from consumer phone coverage. Ask whether the publication needs application code, accessibility checks, device screenshots or a practical buying guide.",
  },
];

// Transfer only price inputs and visible rows, never the complete catalogue.
async function scopedDirectoryData(directory: Directory) {
  const { products, imports } = await productStore();
  const committed = await imports
    .find({ status: "committed" }, { projection: { _id: 1 } })
    .maxTimeMS(10000)
    .toArray();
  const [result] = await products
    .aggregate<
      {
        listings: SeoListing[];
        prices: Array<{ values: number[]; updatedAt?: string }>;
        drValues?: Array<{ _id: number; values: number[] }>;
      } & Record<`topicRows${number}`, SeoListing[]> &
        Record<`topicCount${number}`, Array<{ total: number }>>
    >(
      [
        {
          $match: {
            $and: [
              {
                status: "active",
                ...(directory.filter.country
                  ? { country: directory.filter.country }
                  : {}),
                ...(directory.filter.categories?.length
                  ? { category: { $in: directory.filter.categories } }
                  : {}),
                ...(directory.filter.maxPriceCents === undefined
                  ? {}
                  : { priceCents: { $lte: directory.filter.maxPriceCents } }),
              },
              cleanDirectoryFilter(),
              {
                $or: [
                  { importId: { $exists: false } },
                  { importId: { $in: committed.map((batch) => batch._id) } },
                ],
              },
            ],
          },
        },
        {
          $match: {
            $expr: { $eq: ["$priceCents", { $trunc: "$priceCents" }] },
          },
        },
        {
          $facet: {
            listings: [
              { $sort: { "metrics.dr": -1, id: 1 } },
              { $limit: 25 },
              {
                $project: {
                  _id: 0,
                  id: 1,
                  domain: 1,
                  category: 1,
                  country: 1,
                  currency: 1,
                  priceCents: 1,
                  metrics: 1,
                  updatedAt: 1,
                  turnaround: 1,
                  needsReview: 1,
                },
              },
            ],
            prices: [
              {
                $group: {
                  _id: null,
                  values: { $push: "$priceCents" },
                  updatedAt: { $max: "$updatedAt" },
                },
              },
            ],
            ...(directory.slug === "technology-guest-posting-sites"
              ? {
                  drValues: [
                    {
                      $group: {
                        _id: "$metrics.dr",
                        values: { $push: "$priceCents" },
                      },
                    },
                  ],
                  ...(Object.fromEntries(
                    techSubtopics.flatMap((topic, index) => [
                      [
                        `topicRows${index}`,
                        [
                          { $match: { category: { $in: topic.categories } } },
                          { $sort: { "metrics.dr": -1, id: 1 } },
                          { $limit: 25 },
                          {
                            $project: {
                              _id: 0,
                              id: 1,
                              domain: 1,
                              category: 1,
                              country: 1,
                              currency: 1,
                              priceCents: 1,
                              metrics: 1,
                              updatedAt: 1,
                              turnaround: 1,
                              needsReview: 1,
                            },
                          },
                        ],
                      ],
                      [
                        `topicCount${index}`,
                        [
                          { $match: { category: { $in: topic.categories } } },
                          { $count: "total" },
                        ],
                      ],
                    ]),
                  ) as Record<string, Document[]>),
                }
              : {}),
          },
        },
      ],
      { maxTimeMS: 10000 },
    )
    .toArray();
  const prices = (result?.prices[0]?.values || []).map((priceCents) => ({
    priceCents,
  }));
  const priceBands = (
    [
      [0, 5000, "Under $50"],
      [5000, 10000, "$50–under $100"],
      [10000, 25000, "$100–under $250"],
      [25000, 50000, "$250–under $500"],
      [50000, Infinity, "$500+"],
    ] as const
  ).flatMap(([low, high, label]) => {
    const summary = summarizePrices(
      prices.filter((row) => row.priceCents >= low && row.priceCents < high),
    );
    return summary.count &&
      summary.medianCents !== null &&
      summary.lowCents !== null &&
      summary.highCents !== null
      ? [
          {
            label,
            count: summary.count,
            medianCents: summary.medianCents,
            lowCents: summary.lowCents,
            highCents: summary.highCents,
          },
        ]
      : [];
  });
  return {
    rows: (result?.listings || []).map((row) => ({
      ...row,
      metrics: { ...row.metrics, traffic: cleanTraffic(row.metrics?.traffic) },
    })),
    summary: summarizePrices(prices),
    asOf: listingDate(result?.prices[0]?.updatedAt),
    priceBands,
    drBands: (
      [
        [20, 50, "DR 20–49"],
        [50, 70, "DR 50–69"],
        [70, 90, "DR 70–89"],
        [90, 101, "DR 90+"],
      ] as const
    ).flatMap(([low, high, label]) => {
      const values = (result?.drValues || [])
        .filter(
          (row) =>
            typeof row._id === "number" && row._id >= low && row._id < high,
        )
        .flatMap((row) => row.values.map((priceCents) => ({ priceCents })));
      const summary = summarizePrices(values);
      return summary.count >= 15 &&
        summary.medianCents !== null &&
        summary.lowCents !== null &&
        summary.highCents !== null
        ? [
            {
              label,
              count: summary.count,
              medianCents: summary.medianCents,
              lowCents: summary.lowCents,
              highCents: summary.highCents,
            },
          ]
        : [];
    }),
    subtopics: techSubtopics.map((topic, index) => ({
      label: topic.label,
      count: result?.[`topicCount${index}`]?.[0]?.total || 0,
      rows: (result?.[`topicRows${index}`] || []).map((row) => ({
        ...row,
        metrics: {
          ...row.metrics,
          traffic: cleanTraffic(row.metrics?.traffic),
        },
      })),
    })),
  };
}

export const seoDirectoryData = cache(async (directory: Directory) => {
  return cachedAsync(
    `seo-directory:${directory.slug}`,
    {
      ttlMs: 60_000,
      staleOnErrorMs: 60 * 60_000,
      timeoutMs: 12_000,
      staleWhileRevalidate: true,
    },
    () => scopedDirectoryData(directory),
  );
});
export function seoDirectoryMetadata(
  directory: Directory,
  data: Awaited<ReturnType<typeof seoDirectoryData>> | null,
) {
  const n = data ? count(data.summary.count) : null;
  const median = data?.summary.medianCents;
  if (directory.slug === "technology-guest-posting-sites")
    return {
      title: n
        ? `Technology Guest Posting Sites: ${n} Tech Publishers`
        : "Technology Guest Posting Sites: Compare Publisher Prices",
      description:
        median != null
          ? `Compare ${n} technology guest posting listings by DR, DA and traffic. Median ${money(median)}. Supplied asking prices; confirm scope and availability.`
          : "Compare technology guest posting sites by DR, DA, traffic and price. Review technical audiences, writing scope and sponsorship before requesting a quote.",
    };
  if (directory.slug === "saas-guest-posting-sites")
    return {
      title: n
        ? `SaaS Guest Posting Sites: ${n} Software Publishers & Prices`
        : "SaaS Guest Posting Sites: Software Publishers & Prices",
      description:
        median != null
          ? `Compare ${n} SaaS and software guest posting listings by DR, traffic and price. Median asking price ${money(median)}; confirm audience, writing and scope.`
          : "Find SaaS guest posting opportunities across software, development and startup sites. Compare supplied DR, traffic, audience categories and placement prices.",
    };
  if (directory.slug === "guest-posting-sites-usa")
    return {
      title: "Guest Posting Sites in the USA: Topics, Metrics & Prices",
      description:
        median != null
          ? `Compare US guest posting sites by topic, DR, traffic and USD price. Median asking price ${money(median)}. Listing country does not verify US readership.`
          : "Compare US guest posting sites by topic, DR, traffic and USD placement price. The supplied listing country does not independently verify a US reader audience.",
    };
  return { title: directory.metaTitle, description: directory.metaDescription };
}
