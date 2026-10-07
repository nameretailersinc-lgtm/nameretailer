import { describe, it, expect } from "vitest";
import {
  normalizeSlug,
  settingsSchema,
  userInputSchema,
  validateRecord,
} from "@/lib/cms/validation";
import type { CmsRecord } from "@/lib/cms/types";
const body =
  "<p>" + Array(35).fill("Test-only editorial evidence").join(" ") + "</p>";
const date = "2026-10-05T00:00:00.000Z";
const author: CmsRecord = {
  id: "real-author",
  collection: "authors",
  title: "Test fixture, not public attribution",
  slug: "fixture-author",
  status: "active",
  ownerId: "test",
  data: {
    name: "Test fixture",
    bio: "Verified test biography only",
    verified: true,
  },
  version: 1,
  createdAt: date,
  updatedAt: date,
};
const post = (changes: Record<string, unknown> = {}) => ({
  title: "Test-only post",
  slug: "test-only-post",
  status: "published",
  data: { type: "post", body, authorId: author.id, ...changes },
});
describe("CMS record validation", () => {
  it("normalizes generated slugs and reserves private/system routes", () => {
    expect(normalizeSlug("", "Café content")).toBe("cafe-content");
    expect(normalizeSlug("/Guides/Example/", "")).toBe("guides/example");
    for (const slug of [
      "admin/users",
      "api/test",
      "checkout",
      "media/test",
      "../unsafe",
      "hello//world",
      "?query",
      "design-system",
    ])
      expect(() => normalizeSlug(slug, "")).toThrow();
  });
  it("strips server-managed fields and unknown content data", () => {
    const output = validateRecord("content", {
      title: "Draft",
      slug: "draft",
      ownerId: "attacker",
      version: 1,
      createdAt: date,
      data: {
        body: "<script>bad()</script><p>safe</p>",
        passwordHash: "secret",
        type: "page",
      },
    });
    expect(output).not.toHaveProperty("ownerId");
    expect(output).not.toHaveProperty("createdAt");
    expect(output.data).not.toHaveProperty("passwordHash");
    expect(output.data.body).toBe("<p>safe</p>");
  });
  it("requires 30 readable words and a verified active real author for posts", () => {
    expect(() =>
      validateRecord("content", post({ body: "<p>Thin text</p>" }), [author]),
    ).toThrow(/30 words/);
    expect(() => validateRecord("content", post(), [])).toThrow(
      /verified active author/,
    );
    expect(() =>
      validateRecord("content", post(), [{ ...author, status: "archived" }]),
    ).toThrow();
    expect(() =>
      validateRecord("content", post(), [
        { ...author, data: { ...author.data, verified: false } },
      ]),
    ).toThrow();
    expect(validateRecord("content", post(), [author]).status).toBe(
      "published",
    );
  });
  it("permits draft placeholders without inventing an author", () => {
    const output = validateRecord("content", {
      title: "Draft",
      status: "draft",
      data: { type: "post" },
    });
    expect(output.data.authorId).toBeUndefined();
    expect(output.data.body).toBe("");
  });
  it("enforces real scheduling, publication and review dates", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(
      validateRecord(
        "content",
        {
          ...post(),
          status: "scheduled",
          data: { ...post().data, scheduledAt: future },
        },
        [author],
      ).status,
    ).toBe("scheduled");
    expect(() =>
      validateRecord("content", { ...post(), status: "scheduled" }, [author]),
    ).toThrow(/scheduledAt/);
    expect(() =>
      validateRecord("content", post({ publishedAt: future }), [author]),
    ).toThrow(/future publication/);
    expect(() =>
      validateRecord("content", post({ lastReviewedAt: future }), [author]),
    ).toThrow(/future/);
    expect(() =>
      validateRecord("content", post({ scheduledAt: "not a date" }), [author]),
    ).toThrow();
  });
  it("normalizes accepted time-zone offsets to UTC for indexed schedule ordering", () => {
    const output = validateRecord("content", {
      title: "UTC draft",
      data: {
        publishedAt: "2026-10-01T10:00:00+05:00",
        scheduledAt: "2027-01-01T12:00:00-04:00",
        lastReviewedAt: "2026-10-01T09:00:00+02:00",
      },
    });
    expect(output.data.publishedAt).toBe("2026-10-01T05:00:00.000Z");
    expect(output.data.scheduledAt).toBe("2027-01-01T16:00:00.000Z");
    expect(output.data.lastReviewedAt).toBe("2026-10-01T07:00:00.000Z");
    expect(
      validateRecord("notFound", {
        title: "404",
        status: "new",
        data: { path: "/missing/", lastSeenAt: "2026-10-01T10:00:00+05:00" },
      }).data.lastSeenAt,
    ).toBe("2026-10-01T05:00:00.000Z");
    expect(
      validateRecord("subscribers", {
        title: "Subscriber",
        status: "pending",
        data: {
          email: "test@example.invalid",
          consent: true,
          consentedAt: "2026-10-01T10:00:00+05:00",
        },
      }).data.consentedAt,
    ).toBe("2026-10-01T05:00:00.000Z");
  });
  it("requires image alt decisions when publishing and uploads allow explicit decorative images", () => {
    expect(() =>
      validateRecord(
        "content",
        post({ body: body + '<img src="/media/test.webp">' }),
        [author],
      ),
    ).toThrow(/alt/);
    expect(
      validateRecord(
        "content",
        post({ body: body + '<img src="/media/test.webp" alt="">' }),
        [author],
      ).data.body,
    ).toContain('alt=""');
    const media = {
      title: "Test media",
      status: "active",
      data: {
        url: "/media/test.webp",
        width: 100,
        height: 100,
        mime: "image/webp",
        size: 100,
        alt: "",
      },
    };
    expect(() => validateRecord("media", media)).toThrow(/alt/);
    expect(
      validateRecord("media", {
        ...media,
        data: { ...media.data, decorative: true },
      }).data.decorative,
    ).toBe(true);
  });
  it("prevents archiving or unverifying an author referenced by published/scheduled posts", () => {
    const published: CmsRecord = {
      ...author,
      id: "post",
      collection: "content",
      slug: "post",
      status: "published",
      data: post().data,
    };
    const input = {
      title: author.title,
      slug: author.slug,
      status: "archived",
      data: author.data,
    };
    expect(() =>
      validateRecord("authors", input, [author, published], author.id),
    ).toThrow(/Reassign or unpublish/);
    expect(() =>
      validateRecord(
        "authors",
        {
          ...input,
          status: "active",
          data: { ...author.data, verified: false },
        },
        [author, published],
        author.id,
      ),
    ).toThrow();
    expect(
      validateRecord(
        "authors",
        input,
        [author, { ...published, status: "draft" }],
        author.id,
      ).status,
    ).toBe("archived");
  });
  it("requires a biography to mark an author verified", () => {
    expect(() =>
      validateRecord("authors", {
        title: "Author",
        status: "active",
        data: {
          name: "Test only",
          verified: true,
          bio: "<script>bad()</script>",
        },
      }),
    ).toThrow(/biography/);
  });
  it("sanitizes FAQ text and rejects empty-after-sanitization answers", () => {
    const output = validateRecord(
      "content",
      post({
        faq: [
          {
            question: "<strong>How?</strong>",
            answer: "<p>With evidence.</p>",
          },
        ],
      }),
      [author],
    );
    expect(output.data.faq).toEqual([
      { question: "How?", answer: "With evidence." },
    ]);
    expect(() =>
      validateRecord(
        "content",
        post({ faq: [{ question: "How?", answer: "<script>bad()</script>" }] }),
        [author],
      ),
    ).toThrow(/readable text/);
  });
  it("limits canonicals to query-free canonical origin and rejects duplicate live slugs", () => {
    expect(
      validateRecord("content", post({ canonical: "/equivalent/" }), [author])
        .data.canonical,
    ).toBe("https://nameretailer.com/equivalent/");
    for (const canonical of [
      "https://attacker.invalid/",
      "/equivalent/?q=1",
      "/equivalent/#fragment",
      "javascript:bad()",
    ])
      expect(() =>
        validateRecord("content", post({ canonical }), [author]),
      ).toThrow();
    const existing: CmsRecord = {
      ...author,
      id: "existing",
      collection: "content",
      slug: "test-only-post",
    };
    expect(() => validateRecord("content", post(), [author, existing])).toThrow(
      /slug/,
    );
    expect(
      validateRecord("content", post(), [author, existing], "existing").slug,
    ).toBe("test-only-post");
  });
  it("normalizes public canonical slash/case and rejects private/discovery destinations", () => {
    expect(
      validateRecord("content", post({ canonical: "/Equivalent" }), [author])
        .data.canonical,
    ).toBe("https://nameretailer.com/equivalent/");
    for (const canonical of [
      "/admin/login/",
      "/api/auth/",
      "/media/private.webp",
      "/robots.txt",
      "/sitemap.xml",
      "/design-system/",
    ])
      expect(() =>
        validateRecord("content", post({ canonical }), [author]),
      ).toThrow(/public content route/);
  });
  it("rejects non-JSON values, dangerous keys, invalid statuses and excess nesting", () => {
    expect(() =>
      validateRecord("content", {
        title: "Invalid",
        data: { bad: new Date() },
      }),
    ).toThrow(/JSON/);
    expect(() =>
      validateRecord("content", {
        title: "Invalid",
        data: JSON.parse('{"constructor":"bad"}'),
      }),
    ).toThrow(/Reserved/);
    expect(() =>
      validateRecord("content", {
        title: "Invalid",
        status: "active",
        data: {},
      }),
    ).toThrow(/Status/);
    let nested: unknown = "deep";
    for (let i = 0; i < 14; i++) nested = { nested };
    expect(() =>
      validateRecord("content", { title: "Invalid", data: { nested } }),
    ).toThrow(/deeply/);
  });
  it("records consent only when true and actually timestamped", () => {
    const input = {
      title: "Test subscriber",
      status: "subscribed",
      data: { email: "test@example.invalid", consent: true, consentedAt: date },
    };
    expect(validateRecord("subscribers", input).data.email).toBe(
      "test@example.invalid",
    );
    expect(() =>
      validateRecord("subscribers", {
        ...input,
        data: { ...input.data, consent: false },
      }),
    ).toThrow(/consent/);
    expect(() =>
      validateRecord("subscribers", {
        ...input,
        data: {
          ...input.data,
          consentedAt: new Date(Date.now() + 60_000).toISOString(),
        },
      }),
    ).toThrow(/future/);
  });
  it("validates user and site settings without accepting secrets/arbitrary scripts", () => {
    expect(
      userInputSchema.parse({
        name: "Test admin",
        email: "TEST@EXAMPLE.INVALID",
        role: "admin",
        password: "A long test-only password",
      }).email,
    ).toBe("test@example.invalid");
    expect(() =>
      userInputSchema.parse({
        name: "Test",
        email: "bad",
        role: "owner",
        password: "short",
      }),
    ).toThrow();
    const settings = {
      brandName: "Name Retailer",
      contactEmail: "info@nameretailer.com",
      address: "Owner-confirmed address",
      ga4Id: "G-TEST123",
      gtmId: "GTM-TEST",
      metaPixelId: "123",
      logo: "/media/logo.webp",
    };
    expect(settingsSchema.parse(settings).sitemapEnabled).toBe(true);
    expect(() =>
      settingsSchema.parse({
        ...settings,
        googleVerification: "<script>bad</script>",
      }),
    ).toThrow();
    expect(() =>
      settingsSchema.parse({ ...settings, apiKey: "secret" }),
    ).toThrow();
    expect(() =>
      settingsSchema.parse({ ...settings, logo: "javascript:bad()" }),
    ).toThrow();
  });
});
