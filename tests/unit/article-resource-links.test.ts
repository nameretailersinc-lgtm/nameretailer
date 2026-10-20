import { expect, it } from "vitest";
import { blogLibrary } from "@/lib/blog/library";
import { buyerGuides } from "@/lib/site/buyer-guides";
import { tools } from "@/lib/tools/catalog";
import { directories } from "@/lib/site/directories";
import { marketplaceRanges } from "@/lib/commerce/marketplace-ranges";

it("resolves every article resource link to an existing public route", () => {
  const routes = new Set([
    "/", "/seo-tools/", "/guides/", "/blog/", "/methodology/", "/guest-posting-sites/", "/guest-post-prices/", "/how-to-buy-links/",
    ...blogLibrary.map(article => `/blog/${article.slug}/`),
    ...buyerGuides.map(guide => `/guides/${guide.slug}/`),
    ...tools.map(tool => `/${tool.slug}/`),
    ...directories.map(directory => `/${directory.slug}/`),
    ...marketplaceRanges.map(range => `/${range.slug}/`),
  ]);
  const broken: string[] = [];
  for (const article of blogLibrary)
    for (const [, href] of article.relatedLinks || [])
      if (href.startsWith("/") && !routes.has(href.split("?")[0])) broken.push(`${article.slug}: ${href}`);
  expect(broken).toEqual([]);
});
