import { expect, it } from "vitest";
import {
  hasPublicationProfile,
  publicationHost,
  publicationPath,
  slugDomainPattern,
  validPublicationSlug,
} from "@/lib/commerce/publication-pages";
import { marketplaceRangeBySlug } from "@/lib/commerce/marketplace-ranges";
import { rangeCopy } from "@/lib/site/range-copy";

const metrics = {
  da: 60,
  dr: 70,
  tf: null,
  ur: null,
  traffic: 600_000,
  referringDomains: null,
  backlinks: null,
  spamScore: 3,
};
const strong = {
  domain: "https://www.example.com",
  category: "Business",
  metrics,
};

it("profiles only complete, strong root-domain listings", () => {
  expect(publicationPath(strong)).toBe("/publication/example-com/");
  expect(hasPublicationProfile({ ...strong, category: "General" })).toBe(false);
  expect(
    hasPublicationProfile({
      ...strong,
      metrics: { ...metrics, traffic: null },
    }),
  ).toBe(false);
  expect(
    hasPublicationProfile({
      ...strong,
      metrics: { ...metrics, spamScore: 11 },
    }),
  ).toBe(false);
  expect(publicationHost("https://example.com/blog/")).toBeNull();
  expect(validPublicationSlug("example-com")).toBe(true);
  expect(validPublicationSlug("example.com")).toBe(false);
  expect(validPublicationSlug("..-etc")).toBe(false);
  expect(slugDomainPattern("my-site-com").test("https://my-site.com")).toBe(
    true,
  );
  expect(slugDomainPattern("my-site-com").test("https://www.my.site.com")).toBe(
    true,
  );
  expect(
    slugDomainPattern("my-site-com").test("https://evil.com/my-site-com"),
  ).toBe(false);
});

const stats = {
  total: 40,
  minPriceCents: 1000,
  maxPriceCents: 90000,
  medianPriceCents: 15000,
  topCountries: [{ name: "United States", count: 30 }],
  topTopics: [
    { name: "Business", count: 20 },
    { name: "Health", count: 10 },
  ],
};

it("indexes range pages only with enough listings and unique copy", () => {
  const range = marketplaceRangeBySlug("da-30-to-40")!;
  const copy = rangeCopy(range, stats, { ...stats, medianPriceCents: 10000 });
  expect(copy.indexable).toBe(true);
  expect(copy.paragraphs[0]).toContain("50% above the catalogue-wide median");
  expect(rangeCopy(range, { ...stats, total: 14 }, null).indexable).toBe(false);
  expect(rangeCopy(range, null, null).indexable).toBe(false);
});
