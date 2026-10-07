import { describe, it, expect } from "vitest";
import {
  promotedUrlSchema,
  placementBriefSchema,
  briefIssue,
} from "@/lib/commerce/brief-validation";
import { cartPutSchema } from "@/lib/commerce/cart-validation";
import {
  billingSchema,
  checkoutPutSchema,
  checkoutIssues,
} from "@/lib/commerce/checkout-validation";
import {
  validateArticleFile,
  ARTICLE_FILE_LIMIT,
} from "@/lib/commerce/article-file-validation";
import type { CartView } from "@/lib/commerce/cart-types";
const id = "e67939ad-8f50-41d7-912b-62928b8a1775";
const brief = {
  promotedUrl: "https://example.com/landing/?campaign=brief",
  keyword: "A useful phrase",
  articleText: "A draft article for a synthetic placement.",
  specialRequirements: "Use a clear structure.",
  fileId: null,
};
const billing = {
  email: " Buyer@example.com ",
  firstName: "Test",
  lastName: "Buyer",
  country: "PK",
  street: "Synthetic address",
  city: "Test city",
};
const cart: CartView = {
  version: 1,
  currency: "USD",
  checkoutAvailable: false,
  totalCents: 12345,
  items: [
    {
      productId: id,
      productVersion: 2,
      writingWords: 0,
      brief,
      domain: "https://example.com",
      placementCents: 12345,
      writingCents: 0,
      totalCents: 12345,
      status: "ready",
      options: null,
      file: null,
    },
  ],
};
describe("placement briefs and checkout draft boundaries", () => {
  it("normalizes a complete URL while retaining intended destination queries", () => {
    expect(
      promotedUrlSchema.parse(" https://EXAMPLE.com/path?q=a#section "),
    ).toBe("https://example.com/path?q=a#section");
  });
  it.each([
    "javascript:alert(1)",
    "https://user:pass@example.com/",
    "https://localhost/",
    "http://127.0.0.1/",
    "http://2130706433/",
    "https://[::1]/",
    "https://private.local/",
    "//example.com/",
    "https://example.com:3000/",
    "https://example.com\\evil/",
  ])("rejects unsafe promoted URL %s", (value) => {
    expect(promotedUrlSchema.safeParse(value).success).toBe(false);
  });
  it("rejects HTML, unsafe file IDs and client prices while retaining legacy cart shapes", () => {
    expect(placementBriefSchema.safeParse(brief).success).toBe(true);
    expect(
      placementBriefSchema.safeParse({
        ...brief,
        articleText: "<script>alert(1)</script>",
      }).success,
    ).toBe(false);
    expect(
      placementBriefSchema.safeParse({ ...brief, keyword: "\0" }).success,
    ).toBe(false);
    expect(
      placementBriefSchema.safeParse({ ...brief, fileId: "other-file" })
        .success,
    ).toBe(false);
    const item = { productId: id, productVersion: 2, writingWords: 500 };
    expect(cartPutSchema.safeParse({ version: 0, item }).success).toBe(true);
    expect(
      cartPutSchema.safeParse({
        version: 0,
        item: { ...item, brief, totalCents: 1 },
      }).success,
    ).toBe(false);
  });
  it("requires a brief and customer content or an available file before checkout", () => {
    expect(
      briefIssue({ productId: id, productVersion: 2, writingWords: 0 }, false),
    ).toMatch(/destination/);
    const item = { ...cart.items[0], brief: { ...brief, articleText: "" } };
    expect(briefIssue(item, false)).toMatch(/Supply your article/);
    expect(briefIssue(item, true)).toBeNull();
    expect(briefIssue({ ...item, writingWords: 500 }, true)).toMatch(
      /article brief/,
    );
    expect(
      briefIssue({ ...item, brief: { ...brief, fileId: id } }, false),
    ).toMatch(/expired/);
    expect(briefIssue(cart.items[0], false)).toBeNull();
  });
  it("blocks empty, changed and incomplete cart drafts", () => {
    expect(checkoutIssues(cart)).toEqual([]);
    expect(checkoutIssues({ ...cart, items: [] })).toContain(
      "Add a publication to your cart first.",
    );
    expect(checkoutIssues({ ...cart, totalCents: null })).toContain(
      "Review changed or unavailable listings in your cart.",
    );
    expect(
      checkoutIssues({
        ...cart,
        items: [{ ...cart.items[0], brief: undefined }],
      })[0],
    ).toMatch(/destination/);
  });
  it("validates international billing without imposing a US state or ZIP on every country", () => {
    expect(billingSchema.parse(billing)).toMatchObject({
      email: "buyer@example.com",
      region: "",
      postalCode: "",
    });
    expect(billingSchema.safeParse({ ...billing, country: "AA" }).success).toBe(
      false,
    );
    expect(
      billingSchema.safeParse({ ...billing, street: "<img>" }).success,
    ).toBe(false);
  });
  it("accepts Stripe or PayPal preference but never client payment state or amounts", () => {
    const input = {
      version: 0,
      cartVersion: 1,
      billing,
      notes: "Test notes",
      paymentPreference: "stripe",
    };
    expect(checkoutPutSchema.safeParse(input).success).toBe(true);
    expect(
      checkoutPutSchema.safeParse({ ...input, paymentPreference: "paypal" })
        .success,
    ).toBe(true);
    for (const extra of [
      { ownerId: id },
      { totalCents: 1 },
      { paid: true },
      { termsAccepted: true },
    ])
      expect(checkoutPutSchema.safeParse({ ...input, ...extra }).success).toBe(
        false,
      );
    expect(checkoutPutSchema.safeParse({ ...input, version: -1 }).success).toBe(
      false,
    );
  });
});
describe("private draft article format checks, not malware certification", () => {
  it("accepts UTF-8 article text and PDF/Office signatures without using MIME claims", () => {
    expect(() =>
      validateArticleFile(
        "article.txt",
        Buffer.from("An original draft article.\nAnother paragraph."),
      ),
    ).not.toThrow();
    expect(() =>
      validateArticleFile(
        "article.pdf",
        Buffer.from("%PDF-1.4\nSynthetic test only"),
      ),
    ).not.toThrow();
    expect(() =>
      validateArticleFile(
        "article.doc",
        Buffer.from("d0cf11e0a1b11ae100000000", "hex"),
      ),
    ).not.toThrow();
  });
  it.each([
    "article.html",
    "../../article.pdf",
    "article.svg",
    "article.exe.pdf",
    "article\r\n.pdf",
  ])("rejects unsafe/mismatched filename %s", (name) => {
    expect(() =>
      validateArticleFile(name, Buffer.from("No PDF signature here")),
    ).toThrow();
  });
  it("rejects empty, oversized, invalid UTF-8, HTML, disguised ZIPs and short DOCX", () => {
    expect(() => validateArticleFile("article.txt", Buffer.alloc(0))).toThrow();
    expect(() =>
      validateArticleFile("article.txt", Buffer.alloc(ARTICLE_FILE_LIMIT + 1)),
    ).toThrow();
    expect(() =>
      validateArticleFile("article.txt", Buffer.from([255, 0])),
    ).toThrow();
    expect(() =>
      validateArticleFile(
        "article.txt",
        Buffer.from("<html><script>run()</script></html>"),
      ),
    ).toThrow();
    expect(() =>
      validateArticleFile("article.docx", Buffer.from([1])),
    ).toThrow();
    expect(() =>
      validateArticleFile(
        "article.docx",
        Buffer.from("PK\x03\x04not an Office document"),
      ),
    ).toThrow();
  });
});
