import { expect, it, vi } from "vitest";
import {
  articleIndexOptions,
  articleIndexHref,
} from "@/lib/blog/index-options";
const mocks = vi.hoisted(() => ({ find: vi.fn(), count: vi.fn() }));
vi.mock("@/lib/db", () => ({
  getDb: async () => ({
    collection: () => ({ find: mocks.find, countDocuments: mocks.count }),
  }),
}));
import { blogIndex } from "@/lib/blog/queries";

it("defaults Guides to 24 and supports explicit 12/24/60 sizes", () => {
  expect(articleIndexOptions({})).toEqual({
    q: "",
    category: "",
    page: 1,
    pageSize: 24,
  });
  expect(articleIndexOptions({}, 12).pageSize).toBe(12);
  for (const size of [12, 24, 60])
    expect(articleIndexOptions({ pageSize: String(size) }).pageSize).toBe(size);
  for (const size of ["0", "-1", "999999", "NaN", "25"])
    expect(articleIndexOptions({ pageSize: size }).pageSize).toBe(24);
});
it("bounds search/page parameters and ignores repeated or invalid parameters", () => {
  expect(articleIndexOptions({ q: "  SEO  ", page: "0" }).q).toBe("SEO");
  expect(articleIndexOptions({ q: "a".repeat(200) }).q).toHaveLength(100);
  expect(articleIndexOptions({ page: "99999999999999999999999999" }).page).toBe(
    10000,
  );
  expect(
    articleIndexOptions({
      page: "-2",
      q: ["secret"],
      category: "../x",
      pageSize: ["60"],
    }),
  ).toEqual({ page: 1, q: "", category: "", pageSize: 24 });
});
it("keeps pagination/filter links on the current route with encoded values", () => {
  const options = articleIndexOptions({
    q: "schema & answers",
    category: "journal-aeo",
    pageSize: "60",
  });
  expect(articleIndexHref("/guides/", options, 2)).toBe(
    "/guides/?q=schema+%26+answers&category=journal-aeo&pageSize=60&page=2",
  );
  expect(articleIndexHref("/blog/", options, 3)).toContain("/blog/?");
});
function cursor(data: unknown[]) {
  return {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue(data),
  };
}
it("counts published records, clamps stale pages and reads only the selected page size", async () => {
  const categories = cursor([]),
    articles = cursor([]);
  mocks.find
    .mockReset()
    .mockReturnValueOnce(categories)
    .mockReturnValueOnce(articles);
  mocks.count.mockResolvedValue(60);
  const result = await blogIndex("[literal]", "topic", 999, 24);
  expect(result).toMatchObject({ total: 60, page: 3, pages: 3, pageSize: 24 });
  expect(articles.skip).toHaveBeenCalledWith(48);
  expect(articles.limit).toHaveBeenCalledWith(24);
  expect(mocks.count).toHaveBeenCalledWith(
    expect.objectContaining({
      status: "published",
      collection: "content",
      "data.type": "post",
      "data.categoryIds": "topic",
      title: { $regex: "\\[literal\\]", $options: "i" },
    }),
  );
  expect(mocks.find.mock.calls[1][1]).toEqual({
    projection: { _id: 0, "data.body": 0 },
  });
  expect(articles.sort).toHaveBeenCalledWith({
    "data.publishedAt": -1,
    title: 1,
    id: 1,
  });
});
it("handles empty results and rejects arbitrary page sizes at the query layer", async () => {
  const categories = cursor([]),
    articles = cursor([]);
  mocks.find
    .mockReset()
    .mockReturnValueOnce(categories)
    .mockReturnValueOnce(articles);
  mocks.count.mockResolvedValue(0);
  expect(await blogIndex("", "", 2, 100000)).toMatchObject({
    total: 0,
    pages: 1,
    page: 1,
    pageSize: 12,
  });
  expect(articles.limit).toHaveBeenCalledWith(12);
});
