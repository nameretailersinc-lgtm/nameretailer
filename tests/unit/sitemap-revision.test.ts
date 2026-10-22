import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ version: 1, reads: 0, fail: false }));
vi.mock("@/lib/db", () => ({
  getDb: async () => ({
    collection: () => ({ findOne: async () => ({ version: state.version }) }),
  }),
}));
vi.mock("@/lib/seo/sitemap-entries", () => ({
  allSitemapEntries: async () => {
    state.reads++;
    if (state.fail) throw new Error('db down');
    return [
      { url: `https://nameretailer.com/blog/revision-${state.version}/` },
    ];
  },
}));
import { sitemapFiles } from "@/lib/seo/sitemap-files";
import { clearTtlCache } from "@/lib/cache/ttl";
beforeEach(() => {
  clearTtlCache();
  state.version = 1;
  state.reads = 0;
});
it("refreshes when another instance commits a CMS transaction without local invalidation", async () => {
  await sitemapFiles();
  await sitemapFiles();
  expect(state.reads).toBe(1);
  state.version = 2;
  const files = await sitemapFiles();
  expect(files["content-0.xml"][0].url).toContain("revision-2");
  expect(state.reads).toBe(2);
});

it("serves the last complete snapshot when a refresh fails, and fails when none exists", async () => {
  const { clearLastGoodSitemap } = await import("@/lib/seo/sitemap-files");
  clearLastGoodSitemap();
  const first = await sitemapFiles();
  state.version = 2;
  state.fail = true;
  expect(await sitemapFiles()).toEqual(first);
  clearLastGoodSitemap();
  clearTtlCache();
  await expect(sitemapFiles()).rejects.toThrow();
  state.fail = false;
});
