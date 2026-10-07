import { describe, it, expect } from "vitest";
import { tools } from "@/lib/tools/catalog";
import {
  transformText,
  convertNumber,
  parseCsv,
  analyzeBacklinks,
  keywordIdeas,
  sharingMarkup,
  validateSchema,
  outreachBrief,
  httpUrl,
} from "@/lib/tools/core";
import { blogLibrary, blogClusters, validateLibrary } from "@/lib/blog/library";
import { sanitizeBody } from "@/lib/cms/content";
import { validateRecord } from "@/lib/cms/validation";
import { articleSchema } from "@/lib/seo/structured-data";
import type { CmsRecord } from "@/lib/cms/types";
describe("professional tool calculations", () => {
  it("has 28 distinct named tools with honest modes", () => {
    expect(tools).toHaveLength(28);
    expect(new Set(tools.map((tool) => tool.slug)).size).toBe(28);
    expect(tools.find((tool) => tool.kind === "rating")?.mode).toBe(
      "Catalog lookup",
    );
  });
  it.each([
    ["upper", "HELLO. WORLD!"],
    ["lower", "hello. world!"],
    ["title", "Hello. World!"],
    ["sentence", "Hello. World!"],
  ])("converts %s case", (mode, expected) =>
    expect(transformText("text-case-converter", "HELLO. WORLD!", mode)).toBe(
      expected,
    ),
  );
  it("reverses graphemes without splitting combining accents and joined emoji", () => {
    expect(transformText("reverse-text", "A👩‍💻é", "graphemes")).toBe("é👩‍💻A");
    expect(transformText("reverse-text", "one two", "words")).toBe("two one");
    expect(transformText("reverse-text", "one\ntwo", "lines")).toBe("two\none");
  });
  it("round-trips UTF-8 Base64 and rejects malformed/non-UTF8 input", () => {
    const text = "مرحبا 👋";
    expect(
      transformText(
        "base64-encode-decode",
        transformText("base64-encode-decode", text, "encode"),
        "decode",
      ),
    ).toBe(text);
    expect(() =>
      transformText("base64-encode-decode", "%%%", "decode"),
    ).toThrow();
    expect(() =>
      transformText("base64-encode-decode", "/w==", "decode"),
    ).toThrow();
  });
  it("measures token frequency and counts overlapping phrases explicitly", () => {
    expect(
      transformText("keyword-density-checker", "cat CAT dog", "", ""),
    ).toContain("cat\t2\t66.67%");
    expect(
      transformText("keyword-density-checker", "a a a", "", "a a"),
    ).toContain("Occurrences: 2");
    expect(() =>
      transformText("keyword-density-checker", "!!!", "", ""),
    ).toThrow();
  });
  it.each([
    ["#abc", "rgb(170, 187, 204)"],
    ["#abcd", "rgba(170, 187, 204, 0.8667)"],
    ["14735b", "rgb(20, 115, 91)"],
    ["00000000", "rgba(0, 0, 0, 0)"],
  ])("converts %s", (hex, result) =>
    expect(convertNumber("hex-to-rgb", hex, "", "")).toBe(result),
  );
  it("uses configurable root font sizes in both directions", () => {
    expect(convertNumber("px-to-rem", "24", "px", "", "12")).toBe("2 rem");
    expect(convertNumber("px-to-rem", "2", "rem", "", "18")).toBe("36 px");
    expect(() => convertNumber("px-to-rem", "1", "px", "", "0")).toThrow();
  });
  it("converts exact length and decimal/binary size units", () => {
    expect(convertNumber("length-converter", "1", "in", "mm")).toBe("25.4 mm");
    expect(convertNumber("file-size-converter", "1", "MB", "KiB")).toBe(
      "976.5625 KiB",
    );
    expect(() =>
      convertNumber("file-size-converter", "-1", "B", "KiB"),
    ).toThrow();
  });
  it("validates absolute zero and finite values", () => {
    expect(convertNumber("temperature-converter", "32", "F", "C")).toBe("0 C");
    expect(convertNumber("temperature-converter", "0", "K", "C")).toBe(
      "-273.15 C",
    );
    expect(() =>
      convertNumber("temperature-converter", "-274", "C", "K"),
    ).toThrow();
    expect(() =>
      convertNumber("length-converter", "1e999", "m", "cm"),
    ).toThrow();
    expect(() => convertNumber("length-converter", "", "m", "cm")).toThrow();
  });
  it("parses CSV with quoted commas, CRLF and escaped quotes", () => {
    expect(parseCsv('a,b\r\n"hello, there","say ""yes"""')).toEqual([
      ["a", "b"],
      ["hello, there", 'say "yes"'],
    ]);
    expect(() => parseCsv('a\n"bad')).toThrow();
  });
  it("keeps report rows, unique URLs and referring domains distinct", () => {
    const result = analyzeBacklinks(
      "source_url,rel\nhttps://one.com/a,nofollow\nhttps://one.com/a,sponsored\nhttps://two.com/b,follow\nbad,follow",
    );
    expect(result).toContain("Report rows: 4");
    expect(result).toContain("Distinct source URLs: 2");
    expect(result).toContain("Referring domains: 2");
    expect(result).toContain("Invalid URL rows: 1");
    expect(() => analyzeBacklinks("domain,count\nsite.com,1")).toThrow();
  });
  it("labels brainstorming, not fabricated measurement", () => {
    const result = keywordIdeas("guest posts", "small teams");
    expect(result).toContain("guest posts for small teams");
    expect(result).toContain("No search volume");
  });
  const fields = {
    title: 'A "real" title <script>',
    description: "Useful & honest",
    url: "https://example.com/page/",
    image: "https://example.com/image.png",
    imageAlt: "A diagram",
    type: "Article",
    name: "Example Organization",
  };
  it("escapes sharing tags and refuses unsafe URLs", () => {
    const result = sharingMarkup("open-graph-generator", fields);
    expect(result).toContain("&lt;script&gt;");
    expect(result).toContain("&quot;");
    expect(() =>
      sharingMarkup("open-graph-generator", {
        ...fields,
        url: "javascript:alert(1)",
      }),
    ).toThrow();
    expect(() => httpUrl("https://user:password@example.com")).toThrow();
    expect(() =>
      sharingMarkup("twitter-card-generator", { ...fields, imageAlt: "" }),
    ).toThrow();
  });
  it.each(["Organization", "Article", "FAQPage", "BreadcrumbList"])(
    "generates valid %s JSON-LD with legitimate attribution",
    (type) => {
      const result = sharingMarkup("schema-generator", { ...fields, type });
      expect(JSON.parse(result)["@type"]).toBe(type);
      expect(result).not.toContain("<script>");
      expect(validateSchema(result)).toContain(
        "Basic structural checks passed",
      );
    },
  );
  it("checks graph contexts, fields and syntax without claiming rich-results certification", () => {
    expect(
      validateSchema(
        '{"@context":"https://schema.org","@graph":[{"@type":"Organization"}]}',
      ),
    ).toContain("missing name");
    expect(validateSchema('{"@type":"Thing"}')).toContain("Schema.org context");
    expect(() => validateSchema("not JSON")).toThrow();
  });
  it("prepares outreach without sending or creating external links", () => {
    expect(
      outreachBrief("repair guides", "https://example.com/", "Example editor"),
    ).toContain('rel="sponsored"');
    expect(
      outreachBrief("repair guides", "https://example.com/", "Example editor"),
    ).toContain("does not send emails");
  });
});
describe("60 original organizational guides", () => {
  it("has six balanced clusters and distinct useful article bodies", () => {
    expect(validateLibrary()).toMatchObject({ articles: 60, clusters: 6 });
    for (const cluster of blogClusters)
      expect(
        blogLibrary.filter((article) => article.cluster === cluster),
      ).toHaveLength(10);
    expect(new Set(blogLibrary.map((article) => article.answer)).size).toBe(60);
    expect(new Set(blogLibrary.map((article) => article.example)).size).toBe(
      60,
    );
  });
  for (const article of blogLibrary)
    it(`validates ${article.slug}`, () => {
      expect(article.words).toBeGreaterThanOrEqual(180);
      expect(sanitizeBody(article.body)).toBe(article.body);
      expect(article.body.match(/<h2>/g)).toHaveLength(5);
      expect(article.body).not.toMatch(/<h1|<script|onerror=/i);
      expect(article.metaDescription.length).toBeLessThanOrEqual(160);
    });
  it("supports organization authors without fabricating a person", () => {
    const author: CmsRecord = {
      id: "brand",
      collection: "authors",
      title: "Name Retailer",
      slug: "brand",
      status: "active",
      ownerId: "owner",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        entityType: "Organization",
        name: "Name Retailer",
        bio: "Actual publication marketplace brand.",
        verified: true,
        url: "https://nameretailer.com/about/",
      },
    };
    const validated = validateRecord("authors", author);
    expect(validated.data.entityType).toBe("Organization");
    const record: CmsRecord = {
      ...author,
      collection: "content",
      id: "post",
      slug: "blog/post",
      status: "published",
      data: { type: "post", authorId: "brand", body: blogLibrary[0].body },
    };
    expect(articleSchema(record, author)).toMatchObject({
      author: {
        "@type": "Organization",
        name: "Name Retailer",
        url: "https://nameretailer.com/about/",
      },
    });
  });
});
