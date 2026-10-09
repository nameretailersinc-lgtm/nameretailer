import { describe, it, expect } from "vitest";
import {
  buildSeoMetadata,
  canonicalUrl,
  sitemapEntries,
} from "@/lib/seo/metadata";
import {
  articleSchema,
  completeArticleSchema,
  faqSchema,
  organizationSchema,
  serializeJsonLd,
} from "@/lib/seo/structured-data";
import type { CmsRecord } from "@/lib/cms/types";
const record: CmsRecord = {
  id: "test-post",
  collection: "content",
  title: "Test-only guide",
  slug: "test-guide",
  status: "published",
  ownerId: "test",
  data: {
    type: "post",
    authorId: "test-author",
    publishedAt: "2026-10-01T10:00:00.000Z",
    seoTitle: "Editorial guide",
    metaDescription: "<p>Practical &amp; verified.</p>",
    ogImage: "/media/test.webp",
  },
  version: 1,
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-02T10:00:00.000Z",
};
const author: CmsRecord = {
  ...record,
  id: "test-author",
  collection: "authors",
  title: "Fixture author, not public identity",
  slug: "fixture-author",
  status: "active",
  data: { name: "Test-only author", verified: true },
};
describe("prepared SEO builders", () => {
  it("omits public article markup when publication dates or images are missing", () => {
    expect(completeArticleSchema(record, author)).toMatchObject({
      datePublished: record.data.publishedAt,
      dateModified: record.updatedAt,
      image: "https://nameretailer.com/media/test.webp",
    });
    expect(
      completeArticleSchema(
        { ...record, data: { ...record.data, publishedAt: undefined } },
        author,
      ),
    ).toBeNull();
    expect(
      completeArticleSchema(
        { ...record, data: { ...record.data, ogImage: undefined } },
        author,
      ),
    ).toBeNull();
    expect(
      completeArticleSchema({ ...record, updatedAt: "unknown" }, author),
    ).toBeNull();
  });
  it("builds absolute self canonicals and sharing metadata without HTML markup", () => {
    const output = buildSeoMetadata(record);
    expect(output.title).toBe("Editorial guide");
    expect(output.description).toBe("Practical & verified.");
    expect(output.alternates?.canonical).toBe(
      "https://nameretailer.com/test-guide/",
    );
    expect(output.openGraph).toMatchObject({
      url: "https://nameretailer.com/test-guide/",
      type: "article",
      images: [{ url: "https://nameretailer.com/media/test.webp" }],
    });
    expect(output.twitter).toMatchObject({ card: "summary_large_image" });
  });
  it("falls back safely for external canonicals and unsafe OG URLs", () => {
    const changed = {
      ...record,
      data: {
        canonical: "https://attacker.invalid/",
        ogImage: "javascript:bad()",
      },
    };
    expect(canonicalUrl(changed)).toBe("https://nameretailer.com/test-guide/");
    expect(buildSeoMetadata(changed).openGraph).not.toHaveProperty("images");
    expect(
      buildSeoMetadata({ ...record, slug: "", data: {} }).alternates?.canonical,
    ).toBe("https://nameretailer.com/");
  });
  it("marks unpublished content noindex,nofollow and honors published robots choices", () => {
    expect(buildSeoMetadata({ ...record, status: "draft" }).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(buildSeoMetadata({ ...record, status: "scheduled" }).robots).toEqual(
      { index: false, follow: false },
    );
    expect(
      buildSeoMetadata({
        ...record,
        data: { robotsIndex: false, robotsFollow: true },
      }).robots,
    ).toEqual({ index: false, follow: true });
  });
  it("prepares sitemap entries only for published indexable self-canonical content with actual lastmod", () => {
    const entries = sitemapEntries([
      record,
      { ...record, id: "draft", status: "draft" },
      { ...record, id: "hidden", data: { robotsIndex: false } },
      { ...record, id: "equivalent", data: { canonical: "/other/" } },
      author,
    ]);
    expect(entries).toEqual([
      {
        url: "https://nameretailer.com/test-guide/",
        lastModified: record.updatedAt,
      },
    ]);
    expect(
      sitemapEntries([{ ...record, updatedAt: "not a date" }])[0],
    ).not.toHaveProperty("lastModified");
  });
  it("serializes JSON-LD safely inside script raw text while preserving exact JSON round-trip", () => {
    const input = {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "</script><script>bad()</script> & \u2028 \u2029",
    };
    const output = serializeJsonLd(input);
    expect(output).not.toContain("<");
    expect(output).not.toContain("&");
    expect(output).not.toContain("\u2028");
    expect(JSON.parse(output)).toEqual(input);
  });
  it("does not fabricate organization profiles, ratings, phone or legal name", () => {
    const schema = organizationSchema({
      brandName: "Name Retailer",
      contactEmail: "info@nameretailer.com",
      socialLinks: [
        "javascript:bad()",
        "https://example.invalid/confirmed-profile/",
      ],
    });
    expect(schema).toMatchObject({
      "@type": "Organization",
      sameAs: ["https://example.invalid/confirmed-profile/"],
    });
    expect(schema).not.toHaveProperty("telephone");
    expect(schema).not.toHaveProperty("legalName");
    expect(schema).not.toHaveProperty("aggregateRating");
  });
  it("requires actual matching verified authorship for published article markup", () => {
    expect(articleSchema(record, undefined)).toBeNull();
    expect(articleSchema(record, { ...author, id: "unrelated" })).toBeNull();
    expect(articleSchema(record, { ...author, status: "archived" })).toBeNull();
    expect(articleSchema({ ...record, status: "draft" }, author)).toBeNull();
    expect(articleSchema(record, author)).toMatchObject({
      "@type": "BlogPosting",
      datePublished: record.data.publishedAt,
      author: { "@type": "Person", name: "Test-only author" },
    });
    expect(
      articleSchema(
        {
          ...record,
          data: {
            ...record.data,
            schemaType: "Article",
            publishedAt: "invalid",
          },
        },
        author,
      ),
    ).toMatchObject({ "@type": "Article" });
    expect(
      articleSchema(
        { ...record, data: { ...record.data, publishedAt: "invalid" } },
        author,
      ),
    ).not.toHaveProperty("datePublished");
  });
  it("builds FAQs from readable visible answers only; does not imply rich-result eligibility", () => {
    const published = {
      ...record,
      data: {
        faq: [
          {
            question: "<strong>How?</strong>",
            answer: "<p>With evidence.</p>",
          },
          { question: "Empty?", answer: "<script>bad()</script>" },
        ],
      },
    };
    expect(faqSchema(published)).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How?",
          acceptedAnswer: { "@type": "Answer", text: "With evidence." },
        },
      ],
    });
    expect(faqSchema({ ...published, status: "draft" })).toBeNull();
    expect(faqSchema({ ...record, data: { faq: [] } })).toBeNull();
  });
});
