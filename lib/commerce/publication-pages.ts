import type { PublicProduct } from "./types";

/**
 * Data-completeness rule for indexable publication profiles (owner-approved
 * 2026-10-09: a gated subset, not one page per listing). Meeting it means the
 * listing has strong, complete supplied metrics, not that Name Retailer has
 * editorially vetted the publication. Keep in sync with profileFilter().
 * At the 2026-10-09 catalogue snapshot this selects 569 of 56,005 listings.
 */
export const PROFILE_RULE = {
  minTraffic: 500_000,
  minDr: 60,
  minDa: 50,
  maxSpamScore: 10,
  excludedCategories: ["", "General", "All Niches", "Other"],
} as const;

type ProfileCandidate = Pick<PublicProduct, "domain" | "category" | "metrics">;

/** Root domains qualify for indexing; section listings also have detail pages. */
export function publicationHost(
  domain: string,
  rootOnly = true,
): string | null {
  try {
    const url = new URL(domain);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.search ||
      url.hash ||
      url.username ||
      url.password ||
      url.port ||
      (rootOnly && url.pathname !== "/")
    )
      return null;
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function hasPublicationProfile(product: ProfileCandidate): boolean {
  const { traffic, dr, da, spamScore } = product.metrics || {};
  return (
    publicationHost(product.domain) !== null &&
    !(PROFILE_RULE.excludedCategories as readonly string[]).includes(
      product.category || "",
    ) &&
    typeof traffic === "number" &&
    traffic >= PROFILE_RULE.minTraffic &&
    typeof dr === "number" &&
    dr >= PROFILE_RULE.minDr &&
    typeof da === "number" &&
    da >= PROFILE_RULE.minDa &&
    typeof spamScore === "number" &&
    spamScore <= PROFILE_RULE.maxSpamScore
  );
}

/**
 * URL slug for a host: dots become hyphens. A final segment with a dot is
 * treated as a file by the router and loses its trailing slash.
 */
export const publicationSlug = (host: string) => host.replaceAll(".", "-");

/** Detail-page availability is independent of the indexing criteria above. */
export function publicationPath(
  product: Pick<PublicProduct, "domain"> &
    Partial<Pick<PublicProduct, "id" | "category" | "metrics">>,
): string | null {
  const host = publicationHost(product.domain, false);
  if (!host) return null;
  const slug = publicationSlug(host);
  if (!validPublicationSlug(slug)) return null;
  const path = `/publication/${slug}/`;
  if (publicationHost(product.domain)) return path;
  // Preserve section identity when several listings share the same host.
  return product.id && validPublicationListingId(product.id)
    ? `${path}${product.id}/`
    : null;
}

export const validPublicationListingId = (value: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);

export const validPublicationSlug = (value: string) =>
  value.length <= 253 &&
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value) &&
  value.includes("-");

/** Matches every domain whose slug could be this one ("-" may have been "."). */
export const slugDomainPattern = (slug: string) =>
  new RegExp(`^https?://(?:www\\.)?${slug.replaceAll("-", "[.-]")}/?$`);
