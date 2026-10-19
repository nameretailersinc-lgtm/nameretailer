import { seoCatalogue, summarizePrices, type SeoListing } from "./seo-catalogue";

export type PriceRow = { label: string; count: number; medianCents: number; lowCents: number; highCents: number };
export type PriceBreakdown = { asOf?: string; total: number; withTraffic: number; medianCents: number | null; minCents: number | null; maxCents: number | null; overall: PriceRow[]; byDa: PriceRow[]; byDr: PriceRow[]; byCountry: PriceRow[]; byTopic: PriceRow[]; hygiene: { hiddenTraffic: number; excludedDirectoryRows: number } };
export function priceRow(label: string, rows: SeoListing[], minimum = 15): PriceRow[] {
  const stats = summarizePrices(rows);
  return stats.count < minimum || stats.medianCents === null || stats.lowCents === null || stats.highCents === null ? [] : [{ label, count: stats.count, medianCents: stats.medianCents, lowCents: stats.lowCents, highCents: stats.highCents }];
}
export function groupedPrices(rows: SeoListing[], key: "country" | "category") {
  const groups = new Map<string, SeoListing[]>();
  for (const row of rows) {
    const label = row[key]?.trim();
    if (!label || (key === "category" && ["general", "all niches", "other"].includes(label.toLowerCase()))) continue;
    const group = groups.get(label) || []; group.push(row); groups.set(label, group);
  }
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).flatMap(([label, group]) => priceRow(label, group)).slice(0, 10);
}
export const drPriceBands = [[0, 20, "DR 0–19"], [20, 50, "DR 20–49"], [50, 70, "DR 50–69"], [70, 90, "DR 70–89"], [90, 101, "DR 90+"]] as const;
export async function priceBreakdown(): Promise<PriceBreakdown> {
  const { rows, asOf, hygiene } = await seoCatalogue();
  const stats = summarizePrices(rows);
  return { asOf, total: rows.length, withTraffic: rows.filter(r => r.metrics?.traffic != null).length, medianCents: stats.medianCents, minCents: stats.minCents, maxCents: stats.maxCents, overall: priceRow("All supplied USD listings", rows),
    byDa: Array.from({ length: 10 }, (_, n) => n * 10).flatMap(low => priceRow(`DA ${low}–${low === 90 ? 100 : low + 9}`, rows.filter(r => r.metrics?.da != null && r.metrics.da >= low && r.metrics.da < (low === 90 ? 101 : low + 10)))),
    byDr: drPriceBands.flatMap(([low, high, label]) => priceRow(label, rows.filter(r => r.metrics?.dr != null && r.metrics.dr >= low && r.metrics.dr < high))),
    byCountry: groupedPrices(rows, "country"), byTopic: groupedPrices(rows, "category"), hygiene };
}
export const priceReportReady = (data: PriceBreakdown | null | undefined) => !!data?.asOf && Number.isFinite(Date.parse(data.asOf)) && data.overall.length > 0 && data.byDr.length > 0 && data.byTopic.length > 0 && data.byCountry.length > 0;
export function priceCsv(data: PriceBreakdown) {
  const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [["data_as_of", "basis", "dimension", "group", "count", "median_usd", "p25_usd", "p75_usd"], ...([ ["overall", data.overall], ["DR", data.byDr], ["niche", data.byTopic], ["country", data.byCountry] ] as const).flatMap(([dimension, rows]) => rows.map(row => [data.asOf || "", "asking prices from supplied listings, not transaction prices", dimension, row.label, row.count, (row.medianCents / 100).toFixed(2), (row.lowCents / 100).toFixed(2), (row.highCents / 100).toFixed(2)]))].map(row => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
