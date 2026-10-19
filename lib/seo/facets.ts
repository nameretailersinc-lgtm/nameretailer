import type { Metadata } from "next";
import { canonicalOrigin } from "./metadata";
import type { SearchParams } from "../commerce/marketplace-query";

/** Only clean, nonempty pagination with a fixed default size is indexable. */
export function facetMetadata(
  path: string,
  params: SearchParams,
  hasUniquePage = false,
): Pick<Metadata, "alternates" | "robots"> {
  void hasUniquePage;
  const keys = Object.keys(params);
  const page =
    typeof params.page === "string" && /^[1-9]\d*$/.test(params.page)
      ? Number(params.page)
      : 1;
  const facets =
    keys.some((key) => key !== "page") ||
    (keys.includes("page") && !/^[1-9]\d*$/.test(String(params.page)));
  return {
    alternates: {
      canonical:
        canonicalOrigin + path,
    },
    robots: { index: !facets && page === 1, follow: true },
  };
}
