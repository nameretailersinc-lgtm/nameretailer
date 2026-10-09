// Keep in step with MIN_INDEXABLE_LISTINGS in lib/site/range-copy.ts.
export const MIN_DIRECTORY_LISTINGS = 15;
export type CatalogueStatistics = {
  total: number;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  medianPriceCents: number | null;
  topCountries: Array<{ name: string; count: number }>;
  topTopics: Array<{ name: string; count: number }>;
  updatedAt?: string;
};
export function priceMedian(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}
export const directoryIndexable = (total: number) =>
  total >= MIN_DIRECTORY_LISTINGS;
