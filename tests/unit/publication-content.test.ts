import { expect, it } from "vitest";
import { publicationContentInput, publicPublicationContent, publicationContentEligible, type PublicationContent } from "@/lib/commerce/publication-content";
import { publicProduct } from "@/lib/commerce/public-product";
import { publicationPresentation, publicationPriceComparison } from "@/lib/commerce/publication-presentation";
import { normalizeProductDomain } from "@/lib/commerce/validation";
import type { Product } from "@/lib/commerce/types";

const { version: _version, ...input } = publicationContentInput.parse({ version: 1, state: "reviewed", description: "Synthetic QA publisher description, not real publication evidence.", editorialGuidelines: "Synthetic QA guidelines for a fictional publisher.", sourceUrl: "https://example.com/editorial", checkedAt: "2026-01-01" });
void _version;
const content: PublicationContent = { ...input, domain: "https://example.com", reviewedBy: "private-account-id", reviewedAt: "2026-01-02T00:00:00.000Z" };
const product: Product = {
  id: "aabbccdd-1111-2222-3333-444444444444", domain: content.domain, category: "Business", country: "United States", language: "English",
  priceCents: 15000, currency: "USD", status: "active", externalId: "private-export-id", importId: "private-import-id", source: { Description: "PRIVATE LEGACY TEXT", Article_Price: "20.00" },
  version: 1, createdAt: "2026-01-01", updatedAt: "2026-01-02", requirements: "", linkType: "", turnaround: "",
  metrics: { da: 60, dr: 70, traffic: null, spamScore: 2, tf: null, ur: null, backlinks: null, referringDomains: null },
};

it("publishes only valid reviewed content for the exact current listing, with reviewer IDs removed", () => {
  expect(publicPublicationContent(content, product.domain)).toMatchObject({ description: input.description, checkedAt: "2026-01-01" });
  expect(publicPublicationContent(content, product.domain)).not.toHaveProperty("reviewedBy");
  for (const value of [{ ...content, state: "draft" as const }, { ...content, reviewedBy: undefined }, { ...content, reviewedAt: "invalid" }, { ...content, reviewedAt: "2999-01-01" }, { ...content, description: "<script>bad</script>" }])
    expect(publicPublicationContent(value, product.domain)).toBeUndefined();
  expect(publicPublicationContent(content, "https://example.com/section/")).toBeUndefined();
  expect(publicationContentEligible({ ...content, reviewedBy: undefined }, product.domain)).toBe(false);
});

it("rejects false source dates, unsafe evidence links, HTML and client-supplied review identities", () => {
  const base = { version: 1, ...input };
  for (const sourceUrl of ["http://example.com", "https://u:p@example.com", "https://127.0.0.1/editorial", "https://host.local/editorial", "javascript:alert(1)"])
    expect(publicationContentInput.safeParse({ ...base, sourceUrl }).success).toBe(false);
  for (const checkedAt of ["2026-02-30", "2999-01-01", "not-a-date"])
    expect(publicationContentInput.safeParse({ ...base, checkedAt }).success).toBe(false);
  expect(publicationContentInput.safeParse({ ...base, description: "<b>HTML</b>" }).success).toBe(false);
  expect(publicationContentInput.safeParse({ ...base, reviewedBy: "forged" }).success).toBe(false);
  expect(publicationContentInput.safeParse({ ...base, description: "" }).success).toBe(false);
  expect(publicationContentInput.safeParse({ version: 1, state: "draft" }).success).toBe(true);
});

it("allows only public listing fields and reviewed editorial text into public products", () => {
  const safe = publicProduct({ ...product, publicationContent: content, internalNote: "PRIVATE" } as Product);
  for (const key of ["source", "externalId", "importId", "internalNote"]) expect(safe).not.toHaveProperty(key);
  expect(JSON.stringify(safe)).not.toContain("private-account-id");
  expect(publicProduct({ ...product, publicationContent: { ...content, state: "draft" } })).not.toHaveProperty("publicationContent");
});

it("uses supplied facts without inventing traffic periods, audiences or publisher biography", () => {
  const view = publicationPresentation(publicProduct(product));
  expect(view.summary).toContain("listing country: United States");
  expect(view.summary).not.toMatch(/monthly|publisher supplied|audience is|PRIVATE LEGACY/);
  expect(view.description).toContain("$150.00");
  expect(view.missing).toContain("A traffic estimate for the relevant domain or section");
  expect(view.questions.some(([question]) => question.includes("audience"))).toBe(false);
  expect(view.description.length).toBeLessThanOrEqual(155);
});

it("distinguishes sections and root listings in titles, metadata and scope answers", () => {
  const root = publicationPresentation(publicProduct(product));
  const section = publicationPresentation(publicProduct({ ...product, domain: normalizeProductDomain("example.com/business/") }));
  expect(section.title).not.toBe(root.title);
  expect(section.description).not.toBe(root.description);
  expect(section.identity).toBe("example.com/business/");
  expect(section.questions.some(([question]) => question.includes("all of example.com"))).toBe(true);
});

it("uses actual sourced content and writing prices in the relevant answers", () => {
  const safe = { ...publicProduct({ ...product, publicationContent: content }), writingOptions: [{ words: 500 as const, priceCents: 2000 }] };
  expect(publicationPresentation(safe).description).toContain("Synthetic QA publisher");
  expect(publicationPresentation(safe).questions[0][1]).toContain("500 words at $20.00");
  expect(publicationPriceComparison(15000, 10000)).toBe("50% above the median");
  expect(publicationPriceComparison(5000, 10000)).toBe("50% below the median");
  expect(publicationPriceComparison(10000, 10000)).toBe("at the median");
  expect(publicationPriceComparison(10000, null)).toBeNull();
});
