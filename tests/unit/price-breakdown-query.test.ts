import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ aggregate: vi.fn(), productStore: vi.fn() }));
vi.mock("@/lib/commerce/products", () => ({
  productStore: mocks.productStore,
}));
import { clearTtlCache } from "@/lib/cache/ttl";
import { priceBreakdown } from "@/lib/commerce/price-breakdown";

beforeEach(() => {
  clearTtlCache();
  vi.clearAllMocks();
});

it("builds complete price distributions from grouped inputs without fetching publication documents", async () => {
  const summary = { count: 20, minCents: 0, maxCents: 1900, medianCents: 950, lowCents: 500, highCents: 1500 };
  mocks.productStore.mockResolvedValue({
    imports: {
      find: () => ({
        maxTimeMS: () => ({ toArray: async () => [{ _id: "committed" }] }),
      }),
    },
    products: { aggregate: mocks.aggregate },
  });
  mocks.aggregate.mockReturnValue({
    toArray: async () => [
      {
        overall: [
          {
            ...summary,
            updatedAt: "2026-10-06",
            withTraffic: 18,
            hiddenTraffic: 1,
            excludedDirectoryRows: 2,
          },
        ],
        byDa: [{ _id: 90, ...summary }],
        byDr: [{ _id: 4, ...summary }],
        byCountry: [{ _id: "United States", ...summary }],
        byTopic: [{ _id: "Technology", ...summary }],
      },
    ],
  });
  const result = await priceBreakdown();
  expect(result).toMatchObject({
    total: 20,
    medianCents: 950,
    minCents: 0,
    maxCents: 1900,
    withTraffic: 18,
    asOf: "2026-10-06T00:00:00.000Z",
    hygiene: { hiddenTraffic: 1, excludedDirectoryRows: 2 },
  });
  expect(result.byDa[0]).toMatchObject({
    label: "DA 90–100",
    count: 20,
    medianCents: 950,
  });
  expect(result.byDr[0].label).toBe("DR 90+");
  const pipeline = mocks.aggregate.mock.calls[0][0];
  expect(pipeline[0]).toMatchObject({
    $match: {
      status: "active",
      currency: "USD",
      $or: [
        { importId: { $exists: false } },
        { importId: { $in: ["committed"] } },
      ],
    },
  });
  expect(pipeline[2].$facet.byCountry).toContainEqual({ $limit: 10 });
  expect(pipeline[2].$facet.overall.at(-1).$project).not.toHaveProperty("values");
  await priceBreakdown();
  expect(mocks.aggregate).toHaveBeenCalledTimes(1);
});
