import { expect, it } from "vitest";
import { blogArticleIndexable, technicalArticleSlugs } from "@/lib/blog/indexing-policy";
import { buyerExpansions } from "@/lib/blog/buyer-expansions";
it("indexes curated buyer articles and excludes off-topic or explicitly restricted records", () => {
  for (const slug of technicalArticleSlugs) expect(blogArticleIndexable({ slug, data: {} })).toBe(false);
  for (const slug of Object.keys(buyerExpansions)) {
    expect(blogArticleIndexable({ slug: `blog/${slug}`, data: {} })).toBe(true);
    expect(blogArticleIndexable({ slug: `blog/${slug}`, data: { robotsIndex: false } })).toBe(false);
  }
  expect(blogArticleIndexable({ slug: "blog/unknown-article", data: {} })).toBe(false);
  expect(blogArticleIndexable({ slug: "private/record", data: {} })).toBe(false);
});
