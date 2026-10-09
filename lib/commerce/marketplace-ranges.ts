export interface MarketplaceRange {
  slug: string;
  label: string;
  title: string;
  bounds: Record<string, string>;
}
const range = (
  slug: string,
  label: string,
  bounds: Record<string, string>,
): MarketplaceRange => ({
  slug,
  label,
  title: `Guest post sites: ${label}`,
  bounds,
});
// Canonical range names; old WordPress spellings redirect in lib/seo/redirect-map.ts.
export const marketplaceGroups = [
  {
    title: "Guest Posts By DA PA",
    description: "Compare Domain Authority. Page Authority is not available.",
    ranges: Array.from({ length: 10 }, (_, index) => {
      const min = index === 0 ? 1 : index * 10;
      const max = (index + 1) * 10;
      return range(
        `da-${min}-to-${max}`,
        `DA ${min}–${max}`,
        { minDa: String(min), maxDa: String(max) },
      );
    }),
  },
  {
    title: "Guest Posts By Traffic",
    description: "Compare sites based on estimated monthly traffic.",
    ranges: [
      range("0-to-50k-traffic", "Traffic 0–50,000", {
        minTraffic: "0",
        maxTraffic: "50000",
      }),
      range("50k-to-100k-traffic", "Traffic 50,000–100,000", {
        minTraffic: "50000",
        maxTraffic: "100000",
      }),
      range("100k-to-500k-traffic", "Traffic 100,000–500,000", {
        minTraffic: "100000",
        maxTraffic: "500000",
      }),
      range("500k-to-1m-traffic", "Traffic 500,000–1M", {
        minTraffic: "500000",
        maxTraffic: "1000000",
      }),
      range("1m-to-5m-traffic", "Traffic 1M–5M", {
        minTraffic: "1000000",
        maxTraffic: "5000000",
      }),
      range("5m-to-10m-traffic", "Traffic 5M–10M", {
        minTraffic: "5000000",
        maxTraffic: "10000000",
      }),
      range("10m-plus-traffic", "Traffic 10M+", { minTraffic: "10000000" }),
    ],
  },
  {
    title: "Guest Posts By DR",
    description: "Discover sites by Domain Rating to plan your next backlink.",
    ranges: [
      range("dr-0-to-20", "DR 0–20", { minDr: "0", maxDr: "20" }),
      range("dr-20-to-50", "DR 20–50", { minDr: "20", maxDr: "50" }),
      range("dr-50-plus", "DR above 50", { minDr: "51" }),
    ],
  },
  {
    title: "Guest Posts By Price",
    description: "Find the best opportunities within your placement budget.",
    ranges: [
      range("price-0-to-50", "$0–$50 USD", { minPrice: "0", maxPrice: "50" }),
      range("price-50-to-100", "$50–$100 USD", {
        minPrice: "50",
        maxPrice: "100",
      }),
      range("price-100-to-150", "$100–$150 USD", {
        minPrice: "100",
        maxPrice: "150",
      }),
      range("price-150-to-200", "$150–$200 USD", {
        minPrice: "150",
        maxPrice: "200",
      }),
      range("price-200-plus", "Above $200 USD", { minPrice: "200.01" }),
    ],
  },
];
export const marketplaceRanges = [
  ...marketplaceGroups.flatMap((group) => group.ranges),
  // Keep the original broad traffic view available at its published URL.
  range("500k-plus-traffic", "Traffic above 500,000", { minTraffic: "500001" }),
];
export function marketplaceRangeBySlug(slug: string) {
  return marketplaceRanges.find((item) => item.slug === slug);
}
export function rangeQuery(query: string, selected?: MarketplaceRange) {
  const params = new URLSearchParams(query);
  for (const [key, value] of Object.entries(selected?.bounds || {}))
    params.set(key, value);
  return params;
}
