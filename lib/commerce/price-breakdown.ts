import { cachedAsync } from "../cache/ttl";
import { productStore } from "./products";
import { priceMedian } from "./catalogue-statistics";

export type PriceRow = {
  label: string;
  count: number;
  medianCents: number;
  lowCents: number;
  highCents: number;
};
export type PriceBreakdown = {
  asOf?:string;
  total:number;
  withTraffic:number;
  medianCents:number|null;
  byDa: PriceRow[];
  byDr: PriceRow[];
  byCountry: PriceRow[];
  byTopic: PriceRow[];
};

type Snapshot={updatedAt?:string,total:number,withTraffic:number,prices:number[]};
type Group = { _id: string | number | null; prices: number[] };

/** 25th and 75th percentiles bound the typical price better than min/max. */
function percentile(sorted: number[], p: number) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}
function rows(groups: Group[], label: (id: Group["_id"]) => string | null) {
  return groups.flatMap((group) => {
    const name = label(group._id);
    if (!name || group.prices.length < 15) return [];
    const sorted = [...group.prices].sort((a, b) => a - b);
    return [
      {
        label: name,
        count: sorted.length,
        medianCents: priceMedian(sorted) ?? 0,
        lowCents: percentile(sorted, 0.25),
        highCents: percentile(sorted, 0.75),
      },
    ];
  });
}

const band = (field: string, edges: number[]) => ({
  $switch: {
    branches: edges.map((edge, index) => ({
      case: { $lt: [field, edges[index + 1] ?? Infinity] },
      then: edge,
    })),
    default: edges[edges.length - 1],
  },
});

/** Placement price distribution across the active, committed catalogue. */
export function priceBreakdown(): Promise<PriceBreakdown> {
  return cachedAsync(
    "price-breakdown",
    { ttlMs: 15 * 60_000, staleOnErrorMs: 24 * 60 * 60_000, timeoutMs: 12000 },
    async () => {
      const { products, imports } = await productStore();
      const committed = await imports
        .find({ status: "committed" }, { projection: { _id: 1 } })
        .toArray();
      const [result] = await products
        .aggregate<{byDa:Group[],byDr:Group[],byCountry:Group[],byTopic:Group[],snapshot:Snapshot[]}>([
          {
            $match: {
              status: "active",
              currency:"USD",priceCents:{$type:"number",$gte:0},
              $or: [
                { importId: { $exists: false } },
                { importId: { $in: committed.map((batch) => batch._id) } },
              ],
            },
          },
          {
            $facet: {
              snapshot:[{$group:{_id:null,total:{$sum:1},withTraffic:{$sum:{$cond:[{$and:[{$isNumber:"$metrics.traffic"},{$gte:["$metrics.traffic",0]}]},1,0]}},updatedAt:{$max:"$updatedAt"},prices:{$push:"$priceCents"}}}],
              byDa: [
                { $match: { "metrics.da": { $type: "number",$gte:1,$lte:100 } } },
                {
                  $group: {
                    _id: band(
                      "$metrics.da",
                      [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
                    ),
                    prices: { $push: "$priceCents" },
                  },
                },
                { $sort: { _id: 1 } },
              ],
              byDr: [
                { $match: { "metrics.dr": { $type: "number",$gte:0,$lte:100 } } },
                {
                  $group: {
                    _id: band("$metrics.dr", [0, 20, 50, 70]),
                    prices: { $push: "$priceCents" },
                  },
                },
                { $sort: { _id: 1 } },
              ],
              byCountry: [
                { $match: { country: { $nin: ["", null] } } },
                {
                  $group: { _id: "$country", prices: { $push: "$priceCents" } },
                },
                { $addFields: { n: { $size: "$prices" } } },
                { $sort: { n: -1, _id: 1 } },
              ],
              byTopic: [
                {
                  $match: {
                    category: {
                      $nin: ["", null, "General", "All Niches", "Other"],
                    },
                  },
                },
                {
                  $group: {
                    _id: "$category",
                    prices: { $push: "$priceCents" },
                  },
                },
                { $addFields: { n: { $size: "$prices" } } },
                { $sort: { n: -1, _id: 1 } },
              ],
            },
          },
        ],{maxTimeMS:10000})
        .toArray();
      const daLabel = (id: Group["_id"]) =>
        typeof id === "number"
          ? `DA ${id || 1}–${id === 90 ? 100 : id + 9}`
          : null;
      const drLabels: Record<number, string> = {
        0: "DR 0–19",
        20: "DR 20–49",
        50: "DR 50–69",
        70: "DR 70+",
      };
      const snapshot=result?.snapshot?.[0];
      return {
        asOf:snapshot?.updatedAt && Number.isFinite(Date.parse(snapshot.updatedAt)) ? snapshot.updatedAt : undefined,
        total:snapshot?.total || 0,withTraffic:snapshot?.withTraffic || 0,medianCents:priceMedian(snapshot?.prices || []),
        byDa: rows(result?.byDa || [], daLabel),
        byDr: rows(result?.byDr || [], (id) =>
          typeof id === "number" ? drLabels[id] || null : null,
        ),
        byCountry: rows(result?.byCountry || [], (id) =>
          typeof id === "string" ? id : null,
        ),
        byTopic: rows(result?.byTopic || [], (id) =>
          typeof id === "string" ? id : null,
        ),
      };
    },
  );
}
