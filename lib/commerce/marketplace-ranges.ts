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
    title: "By Domain Authority (DA)",
    description: "Compare Domain Authority. Page Authority is not available.",
    ranges: Array.from({ length: 10 }, (_, index) => {
      const min = index === 0 ? 1 : index * 10;
      const max = index === 9 ? 100 : index * 10 + 9;
      return range(`da-${min}-to-${max}`, `DA ${min}–${max}`, {
        minDa: String(min),
        maxDa: String(max),
      });
    }),
  },
  {
    title: "Guest Posts By Traffic",
    description: "Compare sites based on estimated monthly traffic.",
    ranges: [
      range("traffic-0-to-49999", "Traffic 0–49,999", {
        minTraffic: "0",
        maxTraffic: "49999",
      }),
      range("traffic-50000-to-99999", "Traffic 50,000–99,999", {
        minTraffic: "50000",
        maxTraffic: "99999",
      }),
      range("traffic-100000-to-499999", "Traffic 100,000–499,999", {
        minTraffic: "100000",
        maxTraffic: "499999",
      }),
      range("traffic-500000-to-999999", "Traffic 500,000–999,999", {
        minTraffic: "500000",
        maxTraffic: "999999",
      }),
      range("traffic-1000000-to-4999999", "Traffic 1,000,000–4,999,999", {
        minTraffic: "1000000",
        maxTraffic: "4999999",
      }),
      range("traffic-5000000-to-9999999", "Traffic 5,000,000–9,999,999", {
        minTraffic: "5000000",
        maxTraffic: "9999999",
      }),
      range("traffic-10000000-plus", "Traffic 10M+", { minTraffic: "10000000" }),
    ],
  },
  {
    title: "Guest Posts By DR",
    description: "Discover sites by Domain Rating to plan your next backlink.",
    ranges: [
      range("dr-0-to-19", "DR 0–19", { minDr: "0", maxDr: "19" }),
      range("dr-20-to-49", "DR 20–49", { minDr: "20", maxDr: "49" }),
      range("dr-50-plus", "DR 50–100", { minDr: "50", maxDr: "100" }),
    ],
  },
  {
    title: "Guest Posts By Price",
    description: "Find the best opportunities within your placement budget.",
    ranges: [
      range("guest-posting-sites-under-50", "$0–$50 USD", { minPrice: "0", maxPrice: "50" }),
      range("price-50-01-to-100", "$50.01–$100 USD", {
        minPrice: "50.01",
        maxPrice: "100",
      }),
      range("price-100-01-to-150", "$100.01–$150 USD", {
        minPrice: "100.01",
        maxPrice: "150",
      }),
      range("price-150-01-to-200", "$150.01–$200 USD", {
        minPrice: "150.01",
        maxPrice: "200",
      }),
      range("price-200-plus", "Above $200 USD", { minPrice: "200.01" }),
    ],
  },
];
export const marketplaceRanges = [
  ...marketplaceGroups.flatMap((group) => group.ranges).filter(r => r.slug !== "guest-posting-sites-under-50"),
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
