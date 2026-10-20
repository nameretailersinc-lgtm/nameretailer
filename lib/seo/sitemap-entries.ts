import { authors, authorPath } from "../site/authors";
import {
  priceBreakdown,
  priceReportReady,
} from "@/lib/commerce/price-breakdown";
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
import { seoDirectoryData } from "@/lib/commerce/seo-catalogue";
import { marketplaceRangeBySlug } from "@/lib/commerce/marketplace-ranges";
import { rangeCopy } from "@/lib/site/range-copy";
import { publicationSitemapLinks } from "@/lib/commerce/publication-profiles";
import { publicationPath } from "@/lib/commerce/publication-pages";
import { blogSitemapEntry } from "@/lib/blog/seo";
import {
  priceGuideEditorial,
  guestPostingHubUpdatedAt,
} from "@/lib/site/editorial";

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
  "/domain-names/",
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
  "/terms/",
  "/site-map/",
];

async function boundedReads<T, R>(items: T[], read: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  // Mongo's pool has ten connections. Starting every expensive summary at once
  // spends the read deadline waiting in that pool and can omit valid ranges.
  await Promise.all(
    Array.from({ length: Math.min(4, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await read(items[index]);
      }
    }),
  );
  return results;
}

export async function allSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...staticPaths,
    ...authors.filter((author) => author.bio).map(authorPath),
    ...tools.map((tool) => `/${tool.slug}/`),
  ].map((path) => ({
    url: canonicalOrigin + path,
    ...(path === "/guest-posting-sites/"
      ? { lastModified: guestPostingHubUpdatedAt }
      : {}),
  }));
  const prices = await priceBreakdown();
  if (priceReportReady(prices) && prices?.asOf)
    entries.push({
      url: canonicalOrigin + "/guest-post-prices/",
      lastModified: new Date(
        Math.max(
          Date.parse(prices.asOf),
          Date.parse(priceGuideEditorial.updatedAt),
        ),
      ),
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
    boundedReads(segments, async (segment) => {
      const directory = directories.find(
        (item) => item.slug === segment.directory,
      );
      // Use the exact same data and completeness threshold as the page metadata.
      if (
        directory &&
        ([
          "technology-guest-posting-sites",
          "saas-guest-posting-sites",
          "guest-posting-sites-usa",
        ].includes(directory.slug) ||
          directory.minIndexableListings === 25)
      ) {
        const data = await seoDirectoryData(directory);
        return data
          ? {
              total: data.summary.count,
              updatedAt: data.asOf,
              minPriceCents: data.summary.minCents,
              maxPriceCents: data.summary.maxCents,
              medianPriceCents: data.summary.medianCents,
              topCountries: [],
              topTopics: [],
            }
          : null;
      }
      return catalogueSummary(segment.query, segment.directory);
    }),
    catalogueSummary(""),
  ]);
  segments.forEach((segment, index) => {
    const summary = stats[index];
    const range = segment.directory
      ? undefined
      : marketplaceRangeBySlug(segment.slug);
    const indexable = range
      ? rangeCopy(range, summary, catalogue).indexable
      : !!summary &&
        summary.total >=
          (directories.find((directory) => directory.slug === segment.slug)
            ?.minIndexableListings ?? 15);
    const lastModified = [
      summary?.updatedAt,
      directories.find((directory) => directory.slug === segment.slug)
        ?.editorialUpdatedAt,
    ]
      .filter(
        (date): date is string => !!date && Number.isFinite(Date.parse(date)),
      )
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
    if (summary && indexable)
      entries.push({
        url: `${canonicalOrigin}/${segment.slug}/`,
        ...(lastModified ? { lastModified } : {}),
      });
  });
  try {
    for (const profile of await publicationSitemapLinks()) {
      const path = publicationPath(profile);
      if (path)
        entries.push({
          url: canonicalOrigin + path,
          lastModified: new Date(profile.updatedAt),
        });
    }
  } catch {
    // An incomplete snapshot must not be cached as a successful sitemap.
    throw new Error("Publication sitemap data temporarily unavailable");
  }
  try {
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
        { projection: { _id: 0 } },
      )
      .toArray();
    const eligibleCategoryIds = new Set<string>();
    for (const post of posts) {
      const entry = blogSitemapEntry(post);
      if (entry) {
        entries.push(entry);
        if (Array.isArray(post.data.categoryIds))
          for (const id of post.data.categoryIds)
            if (typeof id === "string") eligibleCategoryIds.add(id);
      }
    }
    for (const category of await blogCategories())
      if (
        eligibleCategoryIds.has(category.id) &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categorySlug(category))
      )
        entries.push({
          url: `${canonicalOrigin}/blog/category/${categorySlug(category)}/`,
        });
  } catch {
    throw new Error("Article sitemap data temporarily unavailable");
  }
  return entries;
}
