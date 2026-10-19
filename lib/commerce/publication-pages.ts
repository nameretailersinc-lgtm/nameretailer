import type { PublicProduct } from "./types";

/** Single publication completeness policy used by robots, reports and sitemap. */
export const PROFILE_RULE = {
  minPriceCents: 1,
  minDr: 0,
  minDa: 0,
  minTraffic: 0,
  excludedCategories: ["", "General", "All Niches", "Other"],
  requireTrafficOrGuidelines: true,
} as const;

type ProfileCandidate = Pick<PublicProduct, "domain" | "category" | "metrics"> &
  Partial<
    Pick<
      PublicProduct,
      | "country"
      | "language"
      | "priceCents"
      | "requirements"
      | "publicationContent"
    >
  >;

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
  const { traffic, dr, da } = product.metrics || {};
  const score = (value: number | null | undefined, minimum: number) =>
    typeof value === "number" && Number.isFinite(value) && value >= minimum;
  const guidelines = [
    product.requirements,
    product.publicationContent?.editorialGuidelines,
    product.publicationContent?.contentRequirements,
  ].some((value) => !!value?.trim());
  return (
    publicationHost(product.domain) !== null &&
    Number.isSafeInteger(product.priceCents) &&
    (product.priceCents || 0) >= PROFILE_RULE.minPriceCents &&
    !(PROFILE_RULE.excludedCategories as readonly string[]).includes(
      product.category?.trim() || "",
    ) &&
    score(dr, PROFILE_RULE.minDr) &&
    score(da, PROFILE_RULE.minDa) &&
    (!PROFILE_RULE.requireTrafficOrGuidelines ||
      score(traffic, PROFILE_RULE.minTraffic) ||
      guidelines)
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
