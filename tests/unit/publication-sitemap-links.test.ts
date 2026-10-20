import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ aggregate: vi.fn() }));
vi.mock("@/lib/commerce/products", () => ({
  productStore: async () => ({
    imports: { find: () => ({ toArray: async () => [] }) },
    products: { aggregate: mocks.aggregate },
  }),
}));
import { publicationSitemapLinks } from "@/lib/commerce/publication-profiles";
import { clearTtlCache } from "@/lib/cache/ttl";
beforeEach(() => {
  clearTtlCache();
  vi.clearAllMocks();
});
it("preserves eligibility and canonical deduplication using a lean URL projection", async () => {
  const base = {
    id: "one",
    domain: "https://example.com",
    category: "Technology",
    priceCents: 1000,
    metrics: { dr: 40, da: 30, traffic: null },
    hasRequirements: true,
    updatedAt: "2026-10-06",
  };
  mocks.aggregate.mockReturnValue({
    toArray: async () => [
      base,
      { ...base, id: "duplicate" },
      { ...base, domain: "https://missing.com", hasRequirements: false },
      {
        ...base,
        domain: "https://invalid.com",
        metrics: { ...base.metrics, dr: null },
      },
      { ...base, domain: "https://example.com/section" },
    ],
  });
  expect(await publicationSitemapLinks()).toEqual([
    { id: "one", domain: base.domain, updatedAt: base.updatedAt },
  ]);
  const [pipeline, options] = mocks.aggregate.mock.calls[0];
  expect(options.batchSize).toBe(5000);
  expect(pipeline[2].$project).toHaveProperty("hasRequirements.$regexMatch");
  expect(pipeline[2].$project).not.toHaveProperty("requirements");
  await publicationSitemapLinks();
  expect(mocks.aggregate).toHaveBeenCalledTimes(1);
});
