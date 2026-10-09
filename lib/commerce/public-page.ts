import { cache } from "react";
import { cachedAsync } from "../cache/ttl";
import { listProducts } from "./products";

// Public listing pages tolerate a minute of staleness; a failed refresh may reuse the last page.
export const publicProductPage = cache((query: string) =>
  cachedAsync(
    `page:${query}`,
    { ttlMs: 60_000, staleOnErrorMs: 60 * 60_000, timeoutMs: 12_000 },
    () => listProducts(new URLSearchParams(query)),
  ),
);
