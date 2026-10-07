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
      "da1toda10",
      "da10toda20",
      "da20toda30",
      "da30toda40",
      "da40toda50",
      "da50toda60-sites",
      "da60toda70",
      "da70toda80",
      "da80toda90",
      "da90toda100",
      "zero-to-50k-traffic",
      "50k-to-500k",
      "100k-to-500k",
      "above-500k",
      "dr-0-to-20",
      "dr-20-to-50",
      "dr-50-above",
      "price-0-to-50",
      "price-50-to-100",
      "price-100-to-150",
      "price-150-to-200",
      "price-200-above",
    ];
    expect(marketplaceRanges).toHaveLength(26);
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
          marketplaceRangeBySlug("price-200-above")!.bounds,
        ).toString(),
      ).priceCents,
    ).toEqual({ $type: "number", $gte: 20001 });
  });
  it("keeps the legacy traffic slug's actual 50k–100k meaning", () => {
    expect(marketplaceRangeBySlug("50k-to-500k")!.bounds).toEqual({
      minTraffic: "50000",
      maxTraffic: "100000",
    });
  });
  it.each([
    ["500k-to-1m-traffic", 500000, 1000000],
    ["1m-to-5m-traffic", 1000000, 5000000],
    ["5m-to-10m-traffic", 5000000, 10000000],
    ["10m-plus-traffic", 10000000, undefined],
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
    expect(marketplaceRangeBySlug("above-500k")?.bounds).toEqual({
      minTraffic: "500001",
    });
  });
  it("locks route bounds against query overrides while retaining sort, pagination and audience", () => {
    const query = rangeQuery(
      "minDa=0&maxDa=100&page=2&sort=priceAsc&country=US",
      marketplaceRangeBySlug("da1toda10"),
    );
    expect(query.get("minDa")).toBe("1");
    expect(query.get("maxDa")).toBe("10");
    expect(query.get("page")).toBe("2");
    expect(query.get("sort")).toBe("priceAsc");
    expect(query.get("country")).toBe("US");
    expect(rangeQuery("", marketplaceRangeBySlug("da1toda10")).toString()).toBe(
      "minDa=1&maxDa=10",
    );
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
