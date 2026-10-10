import { priceBreakdown } from "@/lib/commerce/price-breakdown";
import { buyerGuides } from "@/lib/site/buyer-guides";
import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import type { CmsRecord } from "@/lib/cms/types";
import { marketplaceRanges } from "@/lib/commerce/marketplace-ranges";
import { tools } from "@/lib/tools/catalog";
import { directories } from "@/lib/site/directories";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { blogCategories, categorySlug } from "@/lib/blog/categories";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { directoryIndexable } from "@/lib/commerce/catalogue-statistics";
import { marketplaceRangeBySlug } from "@/lib/commerce/marketplace-ranges";
import { rangeCopy } from "@/lib/site/range-copy";
import { profileSitemapEntries } from "@/lib/commerce/publication-profiles";
import { publicationPath } from "@/lib/commerce/publication-pages";

const staticPaths = [
  "/",
  "/guest-posting-sites/",
  "/guest-post-marketplace/",
  "/guest-post-by-dr/",
  "/services/",
  "/how-it-works/",
  "/how-to-buy-links/",
  "/seo-tools/",
  "/guides/",
  "/blog/",
  "/about/",
  "/methodology/",
  "/contact/",
    "/policies/",
  "/faq/",
  "/help-center/",
  "/refund-policy/",
  "/privacy/",
  "/cookies/",
];

export async function allSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...staticPaths,
    ...tools.map((tool) => `/${tool.slug}/`),
  ].map((path) => ({ url: canonicalOrigin + path }));
  const prices = await priceBreakdown().catch(() => null);
  if (prices?.asOf)
    entries.push({
      url: canonicalOrigin + "/guest-post-prices/",
      lastModified: prices.asOf,
    });
  for (const guide of buyerGuides)
    if (guide.approved)
      entries.push({
        url: `${canonicalOrigin}/guides/${guide.slug}/`,
        lastModified: guide.updatedAt,
      });
  const segments = [
    ...directories.map((directory) => ({
      slug: directory.slug,
      query: "",
      directory: directory.slug,
    })),
    ...marketplaceRanges.map((range) => ({
      slug: range.slug,
      query: new URLSearchParams(range.bounds).toString(),
      directory: "",
    })),
  ];
  const [stats, catalogue] = await Promise.all([
    Promise.all(
      segments.map((segment) =>
        catalogueSummary(segment.query, segment.directory).catch(() => null),
      ),
    ),
    catalogueSummary("").catch(() => null),
  ]);
  segments.forEach((segment, index) => {
    const summary = stats[index];
    const range = segment.directory
      ? undefined
      : marketplaceRangeBySlug(segment.slug);
    const indexable = range
      ? rangeCopy(range, summary, catalogue).indexable
      : !!summary && directoryIndexable(summary.total);
    if (summary && indexable)
      entries.push({
        url: `${canonicalOrigin}/${segment.slug}/`,
        ...(summary.updatedAt ? { lastModified: summary.updatedAt } : {}),
      });
  });
  try {
    for (const profile of await profileSitemapEntries()) {
      const path = publicationPath(profile);
      if (path)
        entries.push({
          url: canonicalOrigin + path,
          lastModified: new Date(profile.updatedAt),
        });
    }
  } catch {
    // Database unavailable: profiles are omitted until it returns.
  }
  try {
    for (const category of await blogCategories())
      entries.push({
        url: `${canonicalOrigin}/blog/category/${categorySlug(category)}/`,
      });
    const posts = await (
      await getDb()
    )
      .collection<CmsRecord>("cms_records")
      .find(
        {
          collection: "content",
          status: "published",
          "data.type": "post",
          slug: { $regex: "^blog/" },
        },
        { projection: { _id: 0, slug: 1, updatedAt: 1 } },
      )
      .toArray();
    for (const post of posts) {
      const lastModified = Date.parse(post.updatedAt);
      entries.push({
        url: `${canonicalOrigin}/${post.slug.replace(/^\/+|\/+$/g, "")}/`,
        ...(Number.isFinite(lastModified)
          ? { lastModified: new Date(lastModified) }
          : {}),
      });
    }
  } catch {
    // Database unavailable: still serve the static public routes.
  }
  return entries;
}
