import { cachedAsync } from "../cache/ttl";
import { productStore } from "./products";
import { activePublicationFilter } from "./publication-profiles";
import type { PublicProduct } from "./types";

export type PublicationInsights = {
  /** Active listings in the same topic / in the whole catalogue. */
  topicTotal: number;
  catalogueTotal: number;
  /** 1-based rank by estimated traffic (1 = most traffic). */
  topicTrafficRank: number;
  catalogueTrafficRank: number;
  /** Share of topic listings with a lower Domain Rating, 0-100. */
  topicDrPercentile: number;
  /** Share of topic listings priced above this one, 0-100. */
  topicCheaperThanPercent: number;
  /** Placement price per 100,000 estimated monthly visits, in cents. */
  centsPer100kVisits: number;
  topicMedianCentsPer100kVisits: number | null;
  /** Median turnaround days among topic listings, null if not parseable. */
  topicMedianTurnaroundDays: number | null;
  /** Listings in the topic within 5 DR points, nearest price first. */
  peers: Array<
    Pick<PublicProduct, "id" | "domain" | "priceCents" | "metrics" | "category">
  >;
};

const days = (value: string) => {
  const match = /(\d+)/.exec(value || "");
  return match ? Number(match[1]) : null;
};
const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const percent = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/** Real per-listing comparisons computed from the catalogue, never invented text. */
export function publicationInsights(
  product: PublicProduct,
): Promise<PublicationInsights | null> {
  const { traffic, dr } = product.metrics;
  if (traffic === null || dr === null || !product.category) {
    return Promise.resolve(null);
  }
  return cachedAsync(
    `publication-insights:${product.id}:${product.version}`,
    { ttlMs: 15 * 60_000, staleOnErrorMs: 60 * 60_000, timeoutMs: 12000 },
    async () => {
      const { products } = await productStore();
      const active = await activePublicationFilter();
      const topic = { ...active, category: product.category };
      const opts = { maxTimeMS: 8000 };
      const [
        topicTotal,
        catalogueTotal,
        topicAhead,
        catalogueAhead,
        topicLowerDr,
        topicPricier,
        topicRows,
      ] = await Promise.all([
        products.countDocuments(topic, opts),
        products.countDocuments(active, opts),
        products.countDocuments(
          { ...topic, "metrics.traffic": { $gt: traffic } },
          opts,
        ),
        products.countDocuments(
          { ...active, "metrics.traffic": { $gt: traffic } },
          opts,
        ),
        products.countDocuments({ ...topic, "metrics.dr": { $lt: dr } }, opts),
        products.countDocuments(
          { ...topic, priceCents: { $gt: product.priceCents } },
          opts,
        ),
        products
          .find(
            {
              ...topic,
              "metrics.traffic": { $gt: 0 },
              priceCents: { $gt: 0 },
            },
            {
              projection: {
                _id: 0,
                id: 1,
                domain: 1,
                priceCents: 1,
                turnaround: 1,
                category: 1,
                metrics: 1,
              },
              maxTimeMS: 8000,
            },
          )
          .limit(3000)
          .toArray(),
      ]);
      const per100k = (row: { priceCents: number; metrics: { traffic: number | null } }) =>
        row.metrics.traffic
          ? (row.priceCents / row.metrics.traffic) * 100_000
          : null;
      const peers = topicRows
        .filter(
          (row) =>
            row.id !== product.id &&
            row.metrics.dr !== null &&
            Math.abs(row.metrics.dr - dr) <= 5,
        )
        .sort(
          (a, b) =>
            Math.abs(a.priceCents - product.priceCents) -
            Math.abs(b.priceCents - product.priceCents),
        )
        .slice(0, 5)
        .map(({ id, domain, priceCents, metrics, category }) => ({
          id,
          domain,
          priceCents,
          metrics,
          category,
        }));
      return {
        topicTotal,
        catalogueTotal,
        topicTrafficRank: topicAhead + 1,
        catalogueTrafficRank: catalogueAhead + 1,
        topicDrPercentile: percent(topicLowerDr, topicTotal),
        topicCheaperThanPercent: percent(topicPricier, topicTotal),
        centsPer100kVisits: (product.priceCents / traffic) * 100_000,
        topicMedianCentsPer100kVisits: median(
          topicRows.map(per100k).filter((v): v is number => v !== null),
        ),
        topicMedianTurnaroundDays: median(
          topicRows
            .map((row) => days((row as { turnaround?: string }).turnaround || ""))
            .filter((v): v is number => v !== null),
        ),
        peers,
      } satisfies PublicationInsights;
    },
  );
}
