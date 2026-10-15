import { expect, it } from "vitest";
import { blogRouteMetadata, blogSitemapEntry } from "@/lib/blog/seo";
import type { CmsRecord } from "@/lib/cms/types";
const record: CmsRecord = {
  id: "test",
  collection: "content",
  status: "published",
  slug: "blog/example",
  title: "Example",
  data: { type: "post", body: "<p>A real article.</p>" },
  ownerId: "test",
  version: 1,
  createdAt: "2026-10-01",
  updatedAt: "2026-10-15",
};
it("honors a custom canonical in metadata and excludes the alternate from the sitemap", () => {
  const alternate = {
    ...record,
    data: { ...record.data, canonical: "/blog/replacement/" },
  };
  expect(blogRouteMetadata(alternate, {}).alternates.canonical).toBe(
    "https://nameretailer.com/blog/replacement/",
  );
  expect(blogSitemapEntry(alternate)).toBeNull();
  expect(
    blogRouteMetadata(alternate, { utm_source: "test" }).robots.index,
  ).toBe(false);
});
it("preserves owner approval but rejects inaccessible, unpublished and empty sitemap records", () => {
  expect(
    blogSitemapEntry({
      ...record,
      data: { ...record.data, robotsIndex: false },
    }),
  ).not.toBeNull();
  expect(blogSitemapEntry({ ...record, status: "draft" })).toBeNull();
  expect(blogSitemapEntry({ ...record, slug: "blog/nested/path" })).toBeNull();
  expect(
    blogSitemapEntry({
      ...record,
      data: { ...record.data, body: "<script>bad()</script>" },
    }),
  ).toBeNull();
  expect(
    blogSitemapEntry({ ...record, updatedAt: "invalid" }),
  ).not.toHaveProperty("lastModified");
});
it("keeps robots follow preferences on parameter variants", () => {
  expect(
    blogRouteMetadata(
      { ...record, data: { ...record.data, robotsFollow: false } },
      { page: "2" },
    ).robots,
  ).toEqual({ index: false, follow: false });
});
