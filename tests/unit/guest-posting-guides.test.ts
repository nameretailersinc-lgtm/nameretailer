import { expect, it } from "vitest";
import { guestPostingGuides } from "@/lib/site/guest-posting-guides";
import { buyerGuides } from "@/lib/site/buyer-guides";
import { buyerGuideArticleNode } from "@/lib/seo/json-ld";
import { directories } from "@/lib/site/directories";
import { unfinishedCopy } from "@/lib/site/public-copy";
import {
  blogContentUpdatedAt,
  budgetWorksheetEditorial,
} from "@/lib/blog/editorial";

it("integrates distinct, complete guides without inventing authorship or future coverage", () => {
  expect(guestPostingGuides).toHaveLength(16);
  expect(new Set(buyerGuides.map((guide) => guide.slug)).size).toBe(
    buyerGuides.length,
  );
  expect(
    new Set(guestPostingGuides.map((guide) => guide.description)).size,
  ).toBe(16);
  for (const guide of guestPostingGuides) {
    expect(buyerGuides.find((item) => item.slug === guide.slug)).toMatchObject({ slug: guide.slug, author: "Fahad Shaikh", approved: true });
    expect(guide.questions.length, guide.slug).toBeGreaterThanOrEqual(3);
    expect(guide.faq?.length, guide.slug).toBeGreaterThanOrEqual(2);
    expect(guide.related?.length, guide.slug).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(guide), guide.slug).not.toMatch(unfinishedCopy);
    expect(guide.author).toBeUndefined();
    expect(guide.publishedAt).toBeUndefined();
    expect(guide.reviewer).toBeUndefined();
    expect(
      buyerGuideArticleNode({ ...guide, image: "/og/guide.png" }),
    ).toBeNull();
  }
  expect(buyerGuides.some((guide) => guide.slug.includes("2027"))).toBe(false);
});

it("keeps new guide links within implemented resources", () => {
  const implemented = new Set([
    ...buyerGuides.map((guide) => `/guides/${guide.slug}/`),
    ...directories.map((directory) => `/${directory.slug}/`),
    "/guest-posting-sites/",
    "/how-to-buy-links/",
    "/guest-post-prices/",
    "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
    "/blog/a-practical-guest-post-budget-worksheet/",
  ]);
  for (const guide of guestPostingGuides)
    for (const [, path] of guide.related || [])
      expect(implemented.has(path), `${guide.slug} -> ${path}`).toBe(true);
  for (const directory of directories)
    for (const [, path] of directory.resources || [])
      expect(implemented.has(path), `${directory.slug} -> ${path}`).toBe(true);
});

it("dates the rendered budget addition while retaining newer CMS edits and unrelated dates", () => {
  expect(
    blogContentUpdatedAt({
      slug: budgetWorksheetEditorial.slug,
      updatedAt: "2026-07-02",
    }),
  ).toBe("2026-10-19");
  expect(
    blogContentUpdatedAt({
      slug: budgetWorksheetEditorial.slug,
      updatedAt: "2026-10-19",
    }),
  ).toBe("2026-10-19");
  expect(
    blogContentUpdatedAt({
      slug: "blog/another-article",
      updatedAt: "2026-07-02",
    }),
  ).toBe("2026-07-02");
});
