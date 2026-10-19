import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  total: 15,
  available: true,
  updatedAt: "2026-10-06",
}));
vi.mock("@/lib/commerce/catalogue-summary", () => ({
  catalogueSummary: async () =>
    state.available ? { total: state.total, updatedAt: state.updatedAt } : null,
}));
vi.mock("@/lib/commerce/price-breakdown", () => ({
  priceBreakdown: async () => null,
  priceReportReady: () => false,
}));
vi.mock("@/lib/site/buyer-guides", () => ({ buyerGuides: [] }));
vi.mock("@/lib/commerce/publication-profiles", () => ({
  profileSitemapEntries: async () => [],
}));
vi.mock("@/lib/blog/categories", () => ({
  blogCategories: async () => [],
  categorySlug: () => "",
}));
vi.mock("@/lib/site/range-copy", () => ({
  rangeCopy: () => ({ indexable: false }),
}));
vi.mock("@/lib/db", () => ({
  getDb: async () => ({
    collection: () => ({ find: () => ({ toArray: async () => [] }) }),
  }),
}));

import { allSitemapEntries } from "@/lib/seo/sitemap-entries";
import { specialistDirectories } from "@/lib/site/specialist-directories";

const urls = specialistDirectories.map(
  ({ slug }) => `https://nameretailer.com/${slug}/`,
);
beforeEach(() => {
  state.total = 15;
  state.available = true;
  state.updatedAt = "2026-10-06";
});

it("omits new directories below the live inventory threshold or without statistics", async () => {
  state.total = 14;
  expect(
    (await allSitemapEntries()).filter(({ url }) => urls.includes(url)),
  ).toEqual([]);
  state.total = 15;
  state.available = false;
  expect(
    (await allSitemapEntries()).filter(({ url }) => urls.includes(url)),
  ).toEqual([]);
});

it("includes eligible directories with their actual editorial date instead of an older inventory date", async () => {
  const entries = (await allSitemapEntries()).filter(({ url }) =>
    urls.includes(url),
  );
  expect(entries).toHaveLength(3);
  expect(
    entries.every(
      ({ lastModified }) =>
        Date.parse(String(lastModified)) === Date.parse("2026-10-18"),
    ),
  ).toBe(true);
});

it("retains a newer real catalogue update when calculating directory lastmod", async () => {
  state.updatedAt = "2026-10-19";
  const entries = (await allSitemapEntries()).filter(({ url }) =>
    urls.includes(url),
  );
  expect(entries).toHaveLength(3);
  expect(
    entries.every(
      ({ lastModified }) =>
        Date.parse(String(lastModified)) === Date.parse("2026-10-19"),
    ),
  ).toBe(true);
});
