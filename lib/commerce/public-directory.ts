import { cache } from "react";
import { cachedAsync } from "@/lib/cache/ttl";
import type { Directory } from "@/lib/site/directories";
import { directoryListings } from "./products";

export const publicDirectoryListings = cache((directory: Directory) =>
  cachedAsync(
    `directory:${directory.slug}`,
    { ttlMs: 60_000, staleOnErrorMs: 60 * 60_000, timeoutMs: 12_000 },
    () => directoryListings(directory.filter),
  ),
);
