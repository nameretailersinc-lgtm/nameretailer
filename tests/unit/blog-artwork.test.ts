import { expect, it } from "vitest";
import { existsSync } from "node:fs";
import { articleArtwork, articleWithArtwork } from "@/lib/blog/artwork";
import { blogLibrary } from "@/lib/blog/library";
import type { CmsRecord } from "@/lib/cms/types";

it("uses existing, square artwork for every guide independently of sorting and pagination", () => {
  const images = blogLibrary.map((article) => articleArtwork(article));
  for (const image of images) {
    expect(image.src).toMatch(/^\/blogs\/guide_image_\d{2}\.png$/);
    expect(existsSync("public" + image.src)).toBe(true);
    expect(image).toMatchObject({ width: 256, height: 256 });
    expect(image.alt).toMatch(/^Illustration of /);
  }
  expect(new Set(images.map((image) => image.src)).size).toBeGreaterThanOrEqual(
    10,
  );
  expect(
    [...blogLibrary].reverse().map((article) => articleArtwork(article)),
  ).toEqual([...images].reverse());
  expect(images.some((image) => /_(02|05|08|13)\.png$/.test(image.src))).toBe(
    false,
  );
});
it.each([
  ["A guest-post budget worksheet", "20"],
  ["An answer-quality review sheet", "21"],
  ["An evidence inventory before writing claims", "23"],
  ["A responsive article-page QA checklist", "07"],
  ["Noindex and robots.txt", "24"],
  ["A traffic measurement report", "19"],
  ["An internal links guide", "04"],
])("matches %s to its illustration", (title, number) => {
  expect(articleArtwork({ title, slug: "blog/example" }).src).toBe(
    `/blogs/guide_image_${number}.png`,
  );
});
it("adds metadata imagery without mutating records or overriding valid editor images", () => {
  const record: CmsRecord = {
    id: "synthetic-artwork-fixture",
    collection: "content",
    status: "published",
    ownerId: "synthetic-test-only",
    version: 1,
    createdAt: "2026-10-07T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    title: "A budget worksheet",
    slug: "blog/a-budget-worksheet",
    data: { type: "post" },
  };
  const copy = articleWithArtwork(record);
  expect(copy.data.ogImage).toBe("/blogs/guide_image_20.png");
  expect(record.data).toEqual({ type: "post" });
  expect(
    articleWithArtwork({
      ...record,
      data: { ...record.data, ogImage: "/editor-image.png" },
    }).data.ogImage,
  ).toBe("/editor-image.png");
  expect(
    articleWithArtwork({
      ...record,
      data: { ...record.data, ogImage: "javascript:bad" },
    }).data.ogImage,
  ).toBe(copy.data.ogImage);
});
