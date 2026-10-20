import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { productStore, directoryListings } = vi.hoisted(() => ({
  productStore: vi.fn(),
  directoryListings: vi.fn(),
}));

vi.mock("@/lib/commerce/products", () => ({ productStore, directoryListings }));

import { clearTtlCache } from "@/lib/cache/ttl";
import { publicHubListings } from "@/lib/commerce/public-directory";
import { seoDirectoryData } from "@/lib/commerce/seo-catalogue";
import { directoryBySlug } from "@/lib/site/directories";

const usa = directoryBySlug("guest-posting-sites-usa")!;

beforeEach(() => {
  clearTtlCache();
  vi.clearAllMocks();
  vi.stubEnv("PUBLIC_CACHE_DISABLED", "0");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

it("bounds the USA directory load even when the database connection never settles", async () => {
  vi.useFakeTimers();
  productStore.mockReturnValue(new Promise(() => {}));
  const rejected = expect(seoDirectoryData(usa)).rejects.toThrow(/Timed out/);
  await vi.advanceTimersByTimeAsync(12_000);
  await rejected;
});

it("bounds the hub listings load even when the database connection never settles", async () => {
  vi.useFakeTimers();
  directoryListings.mockReturnValue(new Promise(() => {}));
  const rejected = expect(publicHubListings()).rejects.toThrow(/Timed out/);
  await vi.advanceTimersByTimeAsync(12_000);
  await rejected;
});

it("shares a hub query across requests and retries after a failed load", async () => {
  directoryListings.mockRejectedValueOnce(new Error("connection lost"));
  await expect(publicHubListings()).rejects.toThrow("connection lost");
  const listings = { data: [], total: 0, lowestPriceCents: null };
  directoryListings.mockResolvedValue(listings);
  expect(await Promise.all([publicHubListings(), publicHubListings()])).toEqual(
    [listings, listings],
  );
  expect(directoryListings).toHaveBeenCalledTimes(2);
  expect(directoryListings).toHaveBeenLastCalledWith({}, 12);
});

it("keeps real USA listings available from cache during a connection outage", async () => {
  vi.useFakeTimers();
  const row = {
    id: "usa-publication",
    domain: "https://example.com",
    country: "United States",
    category: "Business",
    currency: "USD",
    priceCents: 5000,
    metrics: { dr: 50, traffic: 1000 },
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
  const cursor = (rows: unknown[]) => ({
    maxTimeMS: () => ({ toArray: async () => rows }),
  });
  productStore.mockResolvedValue({
    imports: { find: () => cursor([{ _id: "committed-import" }]) },
    products: {
      aggregate: () => ({
        toArray: async () => [
          {
            listings: [row],
            prices: [{ values: [5000], updatedAt: row.updatedAt }],
          },
        ],
      }),
    },
  });
  const loaded = await seoDirectoryData(usa);
  expect(loaded.rows).toEqual([row]);
  expect(loaded.summary.count).toBe(1);
  await vi.advanceTimersByTimeAsync(60_001);
  productStore.mockReturnValue(new Promise(() => {}));
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const refresh = seoDirectoryData(usa);
    await vi.advanceTimersByTimeAsync(12_000);
    expect(await refresh).toEqual(loaded);
  } finally {
    warning.mockRestore();
  }
});

it("calculates USA counts and price bands from all matches while returning only 25 listings", async () => {
  const prices = Array.from({ length: 30 }, (_, index) => index * 5000);
  const listings = Array.from({ length: 25 }, (_, index) => ({
    id: `publication-${index}`,
    metrics: { traffic: null },
  }));
  productStore.mockResolvedValue({
    imports: {
      find: () => ({ maxTimeMS: () => ({ toArray: async () => [] }) }),
    },
    products: {
      aggregate: () => ({
        toArray: async () => [
          {
            listings,
            prices: [{ values: prices, updatedAt: "2026-10-01T00:00:00.000Z" }],
          },
        ],
      }),
    },
  });
  const data = await seoDirectoryData(usa);
  expect(data.rows).toHaveLength(25);
  expect(data.summary).toMatchObject({
    count: 30,
    minCents: 0,
    maxCents: 145000,
    medianCents: 72500,
  });
  expect(data.priceBands?.map((band) => band.count)).toEqual([1, 1, 3, 5, 20]);
  expect(data.asOf).toBe("2026-10-01T00:00:00.000Z");
});
