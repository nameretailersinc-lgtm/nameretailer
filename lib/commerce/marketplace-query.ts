import { rangeQuery, type MarketplaceRange } from "./marketplace-ranges";
export const marketplaceFilters = [
  "q",
  "country",
  "language",
  "category",
  "minDr",
  "maxDr",
  "minDa",
  "maxDa",
  "minTraffic",
  "maxTraffic",
  "minPrice",
  "maxPrice",
] as const;
export const marketplaceSorts = [
  "domain",
  "priceAsc",
  "priceDesc",
  "drDesc",
  "trafficDesc",
];
export type SearchParams = Record<string, string | string[] | undefined>;
export function searchQuery(params: SearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (typeof value === "string") query.set(key, value);
  return query.toString();
}
/** Shared by server and browser so hydration starts with the same rows. */
export function marketplaceQuery(query: string, range?: MarketplaceRange) {
  const params = rangeQuery(query, range);
  const normalized = new URLSearchParams();
  for (const key of marketplaceFilters) {
    const value = params.get(key);
    if (value) normalized.set(key, value.slice(0, 150));
  }
  normalized.set(
    "sort",
    marketplaceSorts.includes(params.get("sort") || "")
      ? params.get("sort")!
      : "domain",
  );
  normalized.set(
    "page",
    String(
      Math.max(1, Math.min(10000, Math.floor(Number(params.get("page")) || 1))),
    ),
  );
  normalized.set(
    "pageSize",
    String(
      [10, 20, 50].includes(Number(params.get("pageSize")))
        ? Number(params.get("pageSize"))
        : 20,
    ),
  );
  return normalized;
}
