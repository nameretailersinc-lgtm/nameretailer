import type { Metadata } from "next";
import type { CmsRecord } from "../cms/types";
import { bodyText, isSafeUrl } from "../cms/content";

export interface SeoSettings {
  brandName?: string;
  logo?: string;
  contactEmail?: string;
  address?: string;
  socialLinks?: string[];
}
import { canonicalOrigin } from "./origin";
export { canonicalOrigin } from "./origin";

export function canonicalUrl(record: Pick<CmsRecord, "slug" | "data">): string {
  const fallback = record.slug
    ? `${canonicalOrigin}/${record.slug.replace(/^\/+|\/+$/g, "")}/`
    : canonicalOrigin + "/";
  if (
    typeof record.data.canonical === "string" &&
    isSafeUrl(record.data.canonical)
  ) {
    const url = new URL(record.data.canonical, canonicalOrigin);
    if (url.origin === canonicalOrigin && !url.search && !url.hash)
      return url.href;
  }
  return fallback;
}

/** Prepared builder only: public route activation and privacy defaults belong to Phase 4. */
export function buildSeoMetadata(
  record: CmsRecord,
  settings: SeoSettings = {},
): Metadata {
  const brand = settings.brandName || "Name Retailer";
  const title = String(record.data.seoTitle || record.title);
  const description = bodyText(
    String(record.data.metaDescription || record.data.excerpt || ""),
  ).slice(0, 155);
  const canonical = canonicalUrl(record);
  const image =
    typeof record.data.ogImage === "string" && isSafeUrl(record.data.ogImage)
      ? new URL(record.data.ogImage, canonicalOrigin).href
      : undefined;
  const index =
    record.status === "published" && record.data.robotsIndex !== false;
  return {
    title,
    description: description || undefined,
    alternates: { canonical },
    robots: {
      index,
      follow:
        record.status === "published" && record.data.robotsFollow !== false,
    },
    openGraph: {
      title,
      description: description || undefined,
      url: canonical,
      siteName: brand,
      type: record.data.type === "post" ? "article" : "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: description || undefined,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function sitemapEntries(
  records: readonly CmsRecord[],
): { url: string; lastModified?: string }[] {
  return records
    .filter(
      (r) =>
        r.collection === "content" &&
        r.status === "published" &&
        r.data.robotsIndex !== false &&
        canonicalUrl(r) === `${canonicalOrigin}/${r.slug}/`,
    )
    .map((r) => ({
      url: canonicalUrl(r),
      ...(Number.isFinite(Date.parse(r.updatedAt))
        ? { lastModified: r.updatedAt }
        : {}),
    }));
}
