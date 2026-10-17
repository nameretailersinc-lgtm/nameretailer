import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  marketplaceBasePath,
  marketplaceHref,
  marketplaceLocationQuery,
  marketplacePaginationFiltered,
} from "@/lib/commerce/marketplace-url";
import robots from "@/app/robots";

vi.mock("@/lib/blog/categories", () => ({
  findBlogCategory: vi.fn(),
  categorySlug: vi.fn(),
}));
import { proxy } from "@/proxy";

describe("marketplace URLs", () => {
  it("removes defaults and gives homepage pagination a clean path", () => {
    expect(marketplaceHref("/", "sort=domain&page=2&pageSize=20")).toBe(
      "/page/2/",
    );
    expect(marketplaceHref("/", "sort=domain&page=1&pageSize=20")).toBe("/");
    expect(marketplaceHref("/page/2/", "page=3")).toBe("/page/3/");
    expect(marketplaceBasePath("/page/2/")).toBe("/");
    expect(marketplaceBasePath("/guest-post-by-dr/")).toBe(
      "/guest-post-by-dr/",
    );
  });

  it("restores the page on refresh and preserves nondefault options", () => {
    const query = marketplaceLocationQuery(
      "/page/2/",
      "page=9&sort=priceAsc&pageSize=50&country=United+States",
    );
    expect(new URLSearchParams(query).get("page")).toBe("2");
    expect(marketplaceHref("/page/2/", query)).toBe(
      "/page/2/?country=United+States&pageSize=50&sort=priceAsc",
    );
    expect(
      marketplaceHref(
        "/da-30-to-39/",
        "minDa=30&maxDa=39&sort=domain&page=2&pageSize=20",
      ),
    ).toBe("/da-30-to-39/?page=2");
  });

  it("follows clean curated pagination without expanding transient filter combinations", () => {
    expect(
      marketplacePaginationFiltered("/", "page=2&sort=domain&pageSize=20"),
    ).toBe(false);
    expect(
      marketplacePaginationFiltered(
        "/da-30-to-39/",
        "minDa=30&maxDa=39&page=2",
      ),
    ).toBe(false);
    expect(
      marketplacePaginationFiltered(
        "/da-30-to-39/",
        "minDa=30&maxDa=39&country=United+States&page=2",
      ),
    ).toBe(true);
    expect(
      marketplaceHref(
        "/da-30-to-39/",
        "minDa=0&maxDa=100&country=United+States&page=2",
      ),
    ).toBe("/da-30-to-39/?country=United+States&page=2");
    for (const query of [
      "category=Technology",
      "sort=priceAsc",
      "pageSize=50",
      "country=US&language=English&minPrice=10",
    ])
      expect(marketplacePaginationFiltered("/", query)).toBe(true);
  });

  it("normalizes malformed controls and preserves tracking parameters", () => {
    expect(
      marketplaceHref(
        "/",
        "sort=invalid&page=-2&pageSize=999&utm_source=campaign",
      ),
    ).toBe("/?utm_source=campaign");
  });

  it("redirects old homepage URLs once and leaves the destination stable", async () => {
    for (const [source, target] of [
      ["/?sort=domain&page=2&pageSize=20", "/page/2/"],
      ["/?page=2", "/page/2/"],
      ["/page/1/", "/"],
      ["/page/02/", "/page/2/"],
      ["/page/2/?page=9&sort=domain", "/page/2/"],
      [
        "/?sort=priceAsc&page=2&pageSize=50",
        "/page/2/?pageSize=50&sort=priceAsc",
      ],
    ]) {
      const response = await proxy(
        new NextRequest("https://nameretailer.com" + source),
      );
      expect(response.status, source).toBe(301);
      expect(response.headers.get("location")).toBe(
        "https://nameretailer.com" + target,
      );
      const final = await proxy(
        new NextRequest("https://nameretailer.com" + target),
      );
      expect(final.headers.get("location"), target).toBeNull();
    }
  });

  it("lets crawlers see public filter noindex directives and canonical redirects", () => {
    const rules = robots().rules;
    for (const rule of Array.isArray(rules) ? rules : [rules]) {
      for (const key of [
        "q",
        "category",
        "country",
        "language",
        "minDa",
        "maxDa",
        "minDr",
        "maxDr",
        "minTraffic",
        "maxTraffic",
        "minPrice",
        "maxPrice",
        "sort",
        "pageSize",
      ])
        expect(rule.disallow).not.toContain(`/*?*${key}=`);
      expect(rule.disallow).toContain("/admin/");
      expect(rule.disallow).toContain("/api/");
    }
  });
});
