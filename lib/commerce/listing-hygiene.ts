import type { Filter } from "mongodb";
import type { Product } from "./types";

// Require evidence of an actual placement offer before promoting these identities.
export const REVIEW_HOSTS = ["python.org", "yahoo.com", "msn.com", "medium.com"] as const;
export const REVIEW_DOMAIN_PATTERN = /^(?:https?:\/\/)?(?:[^/]+\.)?(?:python\.org|yahoo\.com|msn\.com|medium\.com)(?:[/:?#]|$)/i;
// Known import sentinel, not measured readership.
export const TRAFFIC_SENTINEL = 2_147_483_647;
export function cleanTraffic(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value < TRAFFIC_SENTINEL ? value : null;
}
export function cleanDirectoryFilter(): Filter<Product> {
  return { domain: { $not: REVIEW_DOMAIN_PATTERN }, needsReview: { $ne: true }, currency: "USD", priceCents: { $type: "number", $gte: 0, $lte: Number.MAX_SAFE_INTEGER } };
}
export function cleanListing(row: Pick<Product, "domain" | "priceCents" | "currency" | "needsReview">) {
  return !REVIEW_DOMAIN_PATTERN.test(row.domain) && row.needsReview !== true && row.currency === "USD" && Number.isSafeInteger(row.priceCents) && row.priceCents >= 0;
}
