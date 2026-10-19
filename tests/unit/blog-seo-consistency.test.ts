import { expect, it } from "vitest";
import { blogRouteMetadata, blogSitemapEntry } from "@/lib/blog/seo";
import type { CmsRecord } from "@/lib/cms/types";
const record: CmsRecord = {
  id: "test", collection: "content", status: "published", slug: "blog/a-practical-guest-post-budget-worksheet", title: "Budget worksheet",
  data: { type: "post", body: "<p>Previous CMS copy.</p>" }, ownerId: "test", version: 1, createdAt: "2026-10-01", updatedAt: "2026-10-15",
};
it("uses the rewritten article's self canonical and real content-change date", () => {
  const alternate = { ...record, data: { ...record.data, canonical: "/blog/replacement/" } };
  const canonical = "https://nameretailer.com/blog/a-practical-guest-post-budget-worksheet/";
  expect(blogRouteMetadata(alternate, {}).alternates.canonical).toBe(canonical);
  expect(blogSitemapEntry(alternate)).toEqual({ url: canonical, lastModified: new Date("2026-10-19") });
  expect(blogRouteMetadata(alternate, { sort: "title" }).robots.index).toBe(false);
});
it("excludes drafts, off-topic content and explicit noindex records from the sitemap", () => {
  expect(blogSitemapEntry(record)).not.toBeNull();
  expect(blogSitemapEntry({ ...record, status: "draft" })).toBeNull();
  expect(blogSitemapEntry({ ...record, data: { ...record.data, robotsIndex: false } })).toBeNull();
  expect(blogSitemapEntry({ ...record, slug: "blog/a-responsive-article-page-qa-checklist" })).toBeNull();
  expect(blogSitemapEntry({ ...record, slug: "blog/nested/path" })).toBeNull();
  expect(blogSitemapEntry({ ...record, slug: "blog/unknown-article" })).toBeNull();
});
it("keeps off-topic pages followable and query variants noindex", () => {
  expect(blogRouteMetadata({ ...record, slug: "blog/off-topic", data: { ...record.data, robotsFollow: false } }, {}).robots).toEqual({ index: false, follow: true });
  expect(blogRouteMetadata({ ...record, data: { ...record.data, robotsFollow: false } }, { page: "2" }).robots).toEqual({ index: false, follow: false });
});
