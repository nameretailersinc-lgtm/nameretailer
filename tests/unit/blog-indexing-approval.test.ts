import { expect, it } from "vitest";
import {
  blogArticleIndexable,
  technicalArticleSlugs,
} from "@/lib/blog/indexing-policy";
it("honors owner approval for all published blog articles, including historical exclusions", () => {
  for (const slug of technicalArticleSlugs)
    expect(blogArticleIndexable({ slug, data: { robotsIndex: false } })).toBe(
      true,
    );
  expect(
    blogArticleIndexable({
      slug: "blog/a-published-guide",
      data: { robotsIndex: false },
    }),
  ).toBe(true);
  expect(blogArticleIndexable({ slug: "private/record", data: {} })).toBe(
    false,
  );
});
