import { describe, expect, it } from "vitest";
import type { Filter } from "mongodb";
import type { Product } from "@/lib/commerce/types";
import { applyProductRanges } from "@/lib/commerce/product-ranges";
import {
  marketplaceRanges,
  marketplaceRangeBySlug,
  rangeQuery,
} from "@/lib/commerce/marketplace-ranges";

function filters(query: string) {
  const value: Filter<Product> = { status: "active" };
  applyProductRanges(value, new URLSearchParams(query));
  return value;
}
describe("bounded marketplace views", () => {
  it("preserves all 22 recorded legacy range routes without collisions", () => {
    const legacySlugs = [
      "da-1-to-9",
      "da-10-to-19",
      "da-20-to-29",
      "da-30-to-39",
      "da-40-to-49",
      "da-50-to-59",
      "da-60-to-69",
      "da-70-to-79",
      "da-80-to-89",
      "da-90-to-100",
      "traffic-0-to-49999",
      "traffic-50000-to-99999",
      "traffic-100000-to-499999",
      "500k-plus-traffic",
      "dr-0-to-19",
      "dr-20-to-49",
      "dr-50-plus",
      "price-50-01-to-100",
      "price-100-01-to-150",
      "price-150-01-to-200",
      "price-200-plus",
    ];
    expect(marketplaceRanges).toHaveLength(25);
    expect(new Set(marketplaceRanges.map((range) => range.slug)).size).toBe(
      marketplaceRanges.length,
    );
    for (const slug of legacySlugs)
      expect(marketplaceRangeBySlug(slug), slug).toBeDefined();
    expect(marketplaceRangeBySlug("unknown")).toBeUndefined();
  });
  it.each(marketplaceRanges)("validates the $slug bounds", (range) => {
    expect(() =>
      filters(new URLSearchParams(range.bounds).toString()),
    ).not.toThrow();
  });
  it("uses both DA bounds and excludes missing metrics explicitly", () => {
    expect(filters("minDa=1&maxDa=10")).toEqual({
      status: "active",
      "metrics.da": { $type: "number", $gte: 1, $lte: 10 },
    });
    expect(filters("maxDr=20")["metrics.dr"]).toEqual({
      $type: "number",
      $lte: 20,
    });
    expect(filters("minTraffic=0&maxTraffic=50000")["metrics.traffic"]).toEqual(
      { $type: "number", $gte: 0, $lte: 50000 },
    );
  });
  it("converts USD bounds to exact integer cents, including above $200", () => {
    expect(filters("minPrice=50.01&maxPrice=100.10").priceCents).toEqual({
      $type: "number",
      $gte: 5001,
      $lte: 10010,
    });
    expect(filters("minPrice=0&maxPrice=0").priceCents).toEqual({
      $type: "number",
      $gte: 0,
      $lte: 0,
    });
    expect(
      filters(
        new URLSearchParams(
          marketplaceRangeBySlug("price-200-plus")!.bounds,
        ).toString(),
      ).priceCents,
    ).toEqual({ $type: "number", $gte: 20001 });
  });
  it("keeps the legacy traffic slug's actual 50k–100k meaning", () => {
    expect(marketplaceRangeBySlug("traffic-50000-to-99999")!.bounds).toEqual({
      minTraffic: "50000",
      maxTraffic: "99999",
    });
  });
  it.each([
    ["traffic-500000-to-999999", 500000, 999999],
    ["traffic-1000000-to-4999999", 1000000, 4999999],
    ["traffic-5000000-to-9999999", 5000000, 9999999],
    ["traffic-10000000-plus", 10000000, undefined],
  ] as const)(
    "the %s view applies its actual traffic bounds",
    (slug, min, max) => {
      const selected = marketplaceRangeBySlug(slug)!;
      expect(
        filters(new URLSearchParams(selected.bounds).toString())[
          "metrics.traffic"
        ],
      ).toEqual({
        $type: "number",
        $gte: min,
        ...(max === undefined ? {} : { $lte: max }),
      });
    },
  );
  it("retains the original broad traffic route", () => {
    expect(marketplaceRangeBySlug("500k-plus-traffic")?.bounds).toEqual({
      minTraffic: "500001",
    });
  });
  it("locks route bounds against query overrides while retaining sort, pagination and audience", () => {
    const query = rangeQuery(
      "minDa=0&maxDa=100&page=2&sort=priceAsc&country=US",
      marketplaceRangeBySlug("da-1-to-9"),
    );
    expect(query.get("minDa")).toBe("1");
    expect(query.get("maxDa")).toBe("9");
    expect(query.get("page")).toBe("2");
    expect(query.get("sort")).toBe("priceAsc");
    expect(query.get("country")).toBe("US");
    expect(
      rangeQuery("", marketplaceRangeBySlug("da-1-to-9")).toString(),
    ).toBe("minDa=1&maxDa=9");
  });
  it.each([
    "minDa=11&maxDa=10",
    "minDr=101",
    "maxDa=-1",
    "maxDa=1.5",
    "maxDa=NaN",
    "maxDa=1e2",
    "minTraffic=5&maxTraffic=4",
    "maxTraffic=9007199254740992",
    "minPrice=10&maxPrice=9.99",
    "maxPrice=0.001",
    "maxPrice=-1",
    "minPrice=Infinity",
  ])("rejects invalid bounds %s", (query) => {
    expect(() => filters(query)).toThrow();
  });
});
