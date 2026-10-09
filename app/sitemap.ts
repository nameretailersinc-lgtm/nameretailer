import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import type { CmsRecord } from "@/lib/cms/types";
import { marketplaceRanges } from "@/lib/commerce/marketplace-ranges";
import { tools } from "@/lib/tools/catalog";
import { directories } from "@/lib/site/directories";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { blogCategories, categorySlug } from "@/lib/blog/categories";

export const dynamic = "force-dynamic";

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
  "/contact/",
  "/faq/",
  "/help-center/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...staticPaths,
    ...directories.map((directory) => `/${directory.slug}/`),
    ...marketplaceRanges.map((range) => `/${range.slug}/`),
    ...tools.map((tool) => `/${tool.slug}/`),
  ].map((path) => ({ url: canonicalOrigin + path }));
  try {
    for (const category of await blogCategories()) entries.push({url: `${canonicalOrigin}/blog/category/${categorySlug(category)}/`});
    const posts = await (
      await getDb()
    )
      .collection<CmsRecord>("cms_records")
      .find(
        {
          collection: "content",
          status: "published",
          "data.type": "post",
          "data.robotsIndex": { $ne: false },
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
