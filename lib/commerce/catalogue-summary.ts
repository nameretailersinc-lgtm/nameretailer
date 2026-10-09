import { cache } from "react";
import { cachedAsync } from "../cache/ttl";
import { publicProductStatistics } from "./products";
import { directoryBySlug } from "../site/directories";

// Aggregates scan every matching listing, so share one result across requests.
const statisticsCache = {
  ttlMs: 15 * 60_000,
  staleOnErrorMs: 24 * 60 * 60_000,
};

export const catalogueSummary = cache((query: string, directorySlug = "") =>
  cachedAsync(`stats:${directorySlug}:${query}`, statisticsCache, () =>
    publicProductStatistics(
      new URLSearchParams(query),
      directoryBySlug(directorySlug)?.filter,
    ),
  ),
);
