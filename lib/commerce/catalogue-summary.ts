import { cache } from "react";
import { cachedAsync } from "../cache/ttl";
import {
  publicDirectorySummaries,
  publicProductStatistics,
  publicTopicPrices,
} from "./products";
import { directories, directoryBySlug } from "../site/directories";

// Aggregates scan every matching listing, so share one result across requests.
const statisticsCache = {
  ttlMs: 15 * 60_000,
  staleOnErrorMs: 24 * 60 * 60_000,
  timeoutMs: 12_000,
  staleWhileRevalidate: true,
};

export const catalogueSummary = cache((query: string, directorySlug = "") =>
  cachedAsync(`stats:${directorySlug}:${query}`, statisticsCache, () =>
    publicProductStatistics(
      new URLSearchParams(query),
      directoryBySlug(directorySlug)?.filter,
    ),
  ),
);

export const directorySummaries = cache(() =>
  cachedAsync("directory-card-summaries", statisticsCache, () =>
    publicDirectorySummaries(directories.map((directory) => directory.filter)),
  ),
);

export const hubPriceSummary = cache(() =>
  cachedAsync("hub-topic-prices", statisticsCache, publicTopicPrices),
);
