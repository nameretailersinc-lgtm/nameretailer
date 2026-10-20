import { summarizePrices, listingDate, type SeoListing } from "./seo-catalogue";
import { cachedAsync } from "../cache/ttl";
import { productStore } from "./products";
import { REVIEW_DOMAIN_PATTERN, TRAFFIC_SENTINEL } from "./listing-hygiene";
import type { BSONTypeAlias, Document } from "mongodb";

export type PriceRow = {
  label: string;
  count: number;
  medianCents: number;
  lowCents: number;
  highCents: number;
};
export type PriceBreakdown = {
  asOf?: string;
  total: number;
  withTraffic: number;
  medianCents: number | null;
  minCents: number | null;
  maxCents: number | null;
  overall: PriceRow[];
  byDa: PriceRow[];
  byDr: PriceRow[];
  byCountry: PriceRow[];
  byTopic: PriceRow[];
  hygiene: { hiddenTraffic: number; excludedDirectoryRows: number };
};
export function priceRow(
  label: string,
  rows: Array<Pick<SeoListing, "priceCents">>,
  minimum = 15,
): PriceRow[] {
  const stats = summarizePrices(rows);
  return stats.count < minimum ||
    stats.medianCents === null ||
    stats.lowCents === null ||
    stats.highCents === null
    ? []
    : [
        {
          label,
          count: stats.count,
          medianCents: stats.medianCents,
          lowCents: stats.lowCents,
          highCents: stats.highCents,
        },
      ];
}
export function groupedPrices(rows: SeoListing[], key: "country" | "category") {
  const groups = new Map<string, SeoListing[]>();
  for (const row of rows) {
    const label = row[key]?.trim();
    if (
      !label ||
      (key === "category" &&
        ["general", "all niches", "other"].includes(label.toLowerCase()))
    )
      continue;
    const group = groups.get(label) || [];
    group.push(row);
    groups.set(label, group);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .flatMap(([label, group]) => priceRow(label, group))
    .slice(0, 10);
}
export const drPriceBands = [
  [0, 20, "DR 0–19"],
  [20, 50, "DR 20–49"],
  [50, 70, "DR 50–69"],
  [70, 90, "DR 70–89"],
  [90, 101, "DR 90+"],
] as const;

/** Exact existing median and array-index quartiles; MongoDB 5.2+ ($sortArray). */
export function priceSummaryStages(): Document[] {
  const middle = { $floor: { $divide: ["$count", 2] } };
  return [
    {
      $set: {
        values: { $sortArray: { input: "$values", sortBy: 1 } },
        count: { $size: "$values" },
      },
    },
    {
      $project: {
        _id: 1,
        count: 1,
        updatedAt: 1,
        withTraffic: 1,
        hiddenTraffic: 1,
        excludedDirectoryRows: 1,
        minCents: { $arrayElemAt: ["$values", 0] },
        maxCents: { $arrayElemAt: ["$values", -1] },
        lowCents: {
          $arrayElemAt: [
            "$values",
            { $floor: { $multiply: ["$count", 0.25] } },
          ],
        },
        highCents: {
          $arrayElemAt: [
            "$values",
            { $floor: { $multiply: ["$count", 0.75] } },
          ],
        },
        medianCents: {
          $cond: [
            { $eq: [{ $mod: ["$count", 2] }, 1] },
            { $arrayElemAt: ["$values", middle] },
            {
              $avg: [
                { $arrayElemAt: ["$values", { $subtract: [middle, 1] }] },
                { $arrayElemAt: ["$values", middle] },
              ],
            },
          ],
        },
      },
    },
  ];
}
export async function priceBreakdown(): Promise<PriceBreakdown> {
  return cachedAsync(
    "price-breakdown",
    {
      ttlMs: 60_000,
      staleOnErrorMs: 60 * 60_000,
      timeoutMs: 12_000,
      staleWhileRevalidate: true,
    },
    async () => {
      const { products, imports } = await productStore();
      const committed = await imports
        .find({ status: "committed" }, { projection: { _id: 1 } })
        .maxTimeMS(10000)
        .toArray();
      const group = { $group: { _id: null, values: { $push: "$priceCents" } } };
      const dimension = (key: string): Document[] => [
        { $match: { [key]: { $type: "string", $ne: "" } } },
        {
          $group: {
            _id: { $trim: { input: `$${key}` } },
            values: { $push: "$priceCents" },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            _id: { $ne: "" },
            count: { $gte: 15 },
            ...(key === "category"
              ? {
                  $expr: {
                    $not: [
                      {
                        $in: [
                          { $toLower: "$_id" },
                          ["general", "all niches", "other"],
                        ],
                      },
                    ],
                  },
                }
              : {}),
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 10 },
        ...priceSummaryStages(),
      ];
      const validTraffic = {
        $and: [
          { $isNumber: "$metrics.traffic" },
          { $gte: ["$metrics.traffic", 0] },
          { $lt: ["$metrics.traffic", TRAFFIC_SENTINEL] },
        ],
      };
      type Values = {
        _id: string | number;
        count: number;
        minCents: number;
        maxCents: number;
        medianCents: number;
        lowCents: number;
        highCents: number;
        updatedAt?: string;
        withTraffic?: number;
        hiddenTraffic?: number;
        excludedDirectoryRows?: number;
      };
      const [result] = await products
        .aggregate<Record<string, Values[]>>(
          [
            {
              $match: {
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
            },
            {
              $match: {
                $expr: { $eq: ["$priceCents", { $trunc: "$priceCents" }] },
              },
            },
            {
              $facet: {
                overall: [
                  {
                    $group: {
                      ...group.$group,
                      updatedAt: { $max: "$updatedAt" },
                      withTraffic: { $sum: { $cond: [validTraffic, 1, 0] } },
                      hiddenTraffic: {
                        $sum: {
                          $cond: [
                            {
                              $and: [
                                {
                                  $ne: [
                                    { $ifNull: ["$metrics.traffic", null] },
                                    null,
                                  ],
                                },
                                { $not: [validTraffic] },
                              ],
                            },
                            1,
                            0,
                          ],
                        },
                      },
                      excludedDirectoryRows: {
                        $sum: {
                          $cond: [
                            {
                              $or: [
                                { $eq: ["$needsReview", true] },
                                {
                                  $regexMatch: {
                                    input: "$domain",
                                    regex: REVIEW_DOMAIN_PATTERN,
                                  },
                                },
                              ],
                            },
                            1,
                            0,
                          ],
                        },
                      },
                    },
                  },
                  ...priceSummaryStages(),
                ],
                byDa: [
                  { $match: { "metrics.da": { $gte: 0, $lte: 100 } } },
                  {
                    $group: {
                      ...group.$group,
                      _id: {
                        $min: [
                          90,
                          {
                            $multiply: [
                              10,
                              { $floor: { $divide: ["$metrics.da", 10] } },
                            ],
                          },
                        ],
                      },
                    },
                  },
                  ...priceSummaryStages(),
                ],
                byDr: [
                  { $match: { "metrics.dr": { $gte: 0, $lte: 100 } } },
                  {
                    $group: {
                      ...group.$group,
                      _id: {
                        $switch: {
                          branches: [20, 50, 70, 90].map((high, index) => ({
                            case: { $lt: ["$metrics.dr", high] },
                            then: index,
                          })),
                          default: 4,
                        },
                      },
                    },
                  },
                  ...priceSummaryStages(),
                ],
                byCountry: dimension("country"),
                byTopic: dimension("category"),
              },
            },
          ],
          { maxTimeMS: 10000 },
        )
        .toArray();
      const summaryRow = (label: string, value?: Values): PriceRow[] =>
        !value || value.count < 15
          ? []
          : [
              {
                label,
                count: value.count,
                medianCents: value.medianCents,
                lowCents: value.lowCents,
                highCents: value.highCents,
              },
            ];
      const overall = result?.overall[0];
      return {
        asOf: listingDate(overall?.updatedAt),
        total: overall?.count || 0,
        withTraffic: overall?.withTraffic || 0,
        medianCents: overall?.medianCents ?? null,
        minCents: overall?.minCents ?? null,
        maxCents: overall?.maxCents ?? null,
        overall: summaryRow("All supplied USD listings", overall),
        byDa: (result?.byDa || [])
          .sort((a, b) => Number(a._id) - Number(b._id))
          .flatMap((row) =>
            summaryRow(
              `DA ${row._id}–${Number(row._id) === 90 ? 100 : Number(row._id) + 9}`,
              row,
            ),
          ),
        byDr: (result?.byDr || [])
          .sort((a, b) => Number(a._id) - Number(b._id))
          .flatMap((row) => summaryRow(drPriceBands[Number(row._id)][2], row)),
        byCountry: (result?.byCountry || []).flatMap((row) =>
          summaryRow(String(row._id), row),
        ),
        byTopic: (result?.byTopic || []).flatMap((row) =>
          summaryRow(String(row._id), row),
        ),
        hygiene: {
          hiddenTraffic: overall?.hiddenTraffic || 0,
          excludedDirectoryRows: overall?.excludedDirectoryRows || 0,
        },
      };
    },
  );
}
export const priceReportReady = (data: PriceBreakdown | null | undefined) =>
  !!data?.asOf &&
  Number.isFinite(Date.parse(data.asOf)) &&
  data.overall.length > 0 &&
  data.byDr.length > 0 &&
  data.byTopic.length > 0 &&
  data.byCountry.length > 0;
export function priceCsv(data: PriceBreakdown) {
  const cell = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  return (
    [
      [
        "data_as_of",
        "basis",
        "dimension",
        "group",
        "count",
        "median_usd",
        "p25_usd",
        "p75_usd",
      ],
      ...(
        [
          ["overall", data.overall],
          ["DR", data.byDr],
          ["niche", data.byTopic],
          ["country", data.byCountry],
        ] as const
      ).flatMap(([dimension, rows]) =>
        rows.map((row) => [
          data.asOf || "",
          "asking prices from supplied listings, not transaction prices",
          dimension,
          row.label,
          row.count,
          (row.medianCents / 100).toFixed(2),
          (row.lowCents / 100).toFixed(2),
          (row.highCents / 100).toFixed(2),
        ]),
      ),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n") + "\r\n"
  );
}
