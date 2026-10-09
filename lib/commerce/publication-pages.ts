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

/** Root-domain listings only; a URL with a path is a section, not a publication. */
export function publicationHost(domain: string): string | null {
  try {
    const url = new URL(domain);
    if (url.pathname !== "/" || url.search || url.hash) return null;
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

/** Internal profile path, or null when the listing has no profile page. */
export function publicationPath(product: ProfileCandidate): string | null {
  if (!hasPublicationProfile(product)) return null;
  return `/publication/${publicationSlug(publicationHost(product.domain)!)}/`;
}

export const validPublicationSlug = (value: string) =>
  value.length <= 253 &&
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value) &&
  value.includes("-");

/** Matches every domain whose slug could be this one ("-" may have been "."). */
export const slugDomainPattern = (slug: string) =>
  new RegExp(`^https?://(?:www\\.)?${slug.replaceAll("-", "[.-]")}$`);
