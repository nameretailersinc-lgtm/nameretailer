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

it("keeps incomplete listings available internally while excluding them from indexing", () => {
  expect(hasPublicationProfile(strong)).toBe(false);
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

it("provides internal detail paths independently of indexing eligibility", () => {
  expect(publicationPath({ domain: "https://0000yic.com" })).toBe(
    "/publication/0000yic-com/",
  );
  expect(publicationPath({ ...strong, category: "General" })).toBe(
    "/publication/example-com/",
  );
  expect(
    publicationPath({ ...strong, metrics: { ...metrics, traffic: null } }),
  ).toBe("/publication/example-com/");
  expect(publicationPath({ domain: "https://artnews.com/" })).toBe(
    "/publication/artnews-com/",
  );
  expect(publicationPath({ domain: "javascript:alert(1)" })).toBeNull();
  expect(publicationPath({ domain: "invalid" })).toBeNull();
});

it("keeps section listings distinct from the host's root listing", () => {
  const section = {
    ...strong,
    id: "aabbccdd-1111-2222-3333-444444444444",
    domain: "https://example.com/blog/",
  };
  expect(publicationPath(section)).toBe(
    "/publication/example-com/aabbccdd-1111-2222-3333-444444444444/",
  );
  expect(publicationHost(section.domain, false)).toBe("example.com");
  expect(hasPublicationProfile(section)).toBe(false);
  expect(publicationPath({ domain: section.domain })).toBeNull();
});

const stats = {
  total: 40,
  updatedAt: "2026-10-09",
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
  const range = marketplaceRangeBySlug("da-30-to-39")!;
  const copy = rangeCopy(range, stats, { ...stats, medianPriceCents: 10000 });
  expect(copy.indexable).toBe(true);
  expect(copy.paragraphs[0]).toContain("50% above the catalogue-wide median");
  expect(rangeCopy(range, { ...stats, total: 14 }, null).indexable).toBe(false);
  expect(rangeCopy(range, null, null).indexable).toBe(false);
  expect(
    rangeCopy(range, { ...stats, updatedAt: undefined }, null).indexable,
  ).toBe(false);
});

it("requires substantial distinct content and all audience fields for indexing", () => {
  const sentence =
    "Explain audience research editorial expectations technical examples content guidelines citation sources reporting process software evidence industry specialist readers publication topics market geography language budget pricing placement disclosure sponsored qualification accessibility photographs graphics ownership permissions factual accuracy useful descriptions practical recommendations current details product comparisons original manuscripts review scope delivery timing publisher contacts organisation quality standards questions answers implementation results measurements context relevance considerations.";
  const complete = {
    ...strong,
    country: "United States",
    language: "English",
    priceCents: 9000,
    requirements: sentence + " " + sentence,
  };
  expect(hasPublicationProfile(complete)).toBe(true);
  expect(hasPublicationProfile({ ...complete, country: "" })).toBe(false);
  expect(hasPublicationProfile({ ...complete, language: "" })).toBe(false);
  expect(hasPublicationProfile({ ...complete, priceCents: 0 })).toBe(false);
  expect(
    hasPublicationProfile({ ...complete, requirements: "Repeat ".repeat(100) }),
  ).toBe(false);
  expect(
    hasPublicationProfile({
      ...complete,
      requirements: "A short requirement.",
    }),
  ).toBe(false);
});
