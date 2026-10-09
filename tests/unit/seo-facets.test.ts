import { describe, expect, it } from "vitest";
import { facetMetadata } from "@/lib/seo/facets";
import { marketplaceQuery } from "@/lib/commerce/marketplace-query";
describe("public URL indexing", () => {
  it("canonicalizes page one and all facets to the clean URL", () => {
    expect(facetMetadata("/", {page: "1"}).alternates).toEqual({canonical: "https://nameretailer.com/"});
    for (const params of [{q: "news"}, {sort: "priceAsc"}, {pageSize: "50"}, {category: "news"}]) expect(facetMetadata("/", params).robots).toEqual({index: false, follow: true});
  });
  it("indexes only nonempty unique pagination and keeps page canonicals", () => {
    expect(facetMetadata("/", {page: "2"}, true)).toEqual({alternates: {canonical: "https://nameretailer.com/?page=2"}, robots: {index: true, follow: true}});
    expect(facetMetadata("/", {page: "200"}).robots).toEqual({index: false, follow: true});
  });
  it("uses twenty initial results and preserves fixed range bounds", () => {
    expect(marketplaceQuery("").get("pageSize")).toBe("20");
    expect(marketplaceQuery("minDa=0", {slug: "test", title: "test", label: "test", bounds: {minDa: "50"}}).get("minDa")).toBe("50");
  });
});
