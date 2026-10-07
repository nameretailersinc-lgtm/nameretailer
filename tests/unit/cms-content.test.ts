import { describe, it, expect } from "vitest";
import {
  bodyText,
  editorialScore,
  isSafeEmbed,
  isSafeUrl,
  sanitizeBody,
  seoHealth,
  suggestInternalLinks,
  wordCount,
} from "@/lib/cms/content";
import type { CmsRecord } from "@/lib/cms/types";

const record = (id: string, changes: Partial<CmsRecord> = {}): CmsRecord => ({
  id,
  collection: "content",
  title: "Guest posting guide",
  slug: id,
  status: "published",
  ownerId: "test-owner",
  data: {},
  version: 1,
  createdAt: "2026-10-05T00:00:00.000Z",
  updatedAt: "2026-10-05T00:00:00.000Z",
  ...changes,
});

describe("CMS HTML and editorial helpers", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,malice",
    "//attacker.invalid/a",
    "/\\attacker.invalid",
    "/%2f%2fattacker.invalid",
    "/%252f%252fattacker.invalid",
    "/%00secret",
    "https://name:password@example.invalid/",
    "/broken%zz",
  ])("rejects unsafe URL %s", (url) => expect(isSafeUrl(url)).toBe(false));
  it("allows intended local and ordinary web links", () => {
    expect(isSafeUrl("/guides/")).toBe(true);
    expect(isSafeUrl("https://example.invalid/source?q=one")).toBe(true);
    expect(isSafeUrl("/guides/", false)).toBe(false);
  });
  it("limits embeds to HTTPS YouTube privacy and Vimeo player URLs", () => {
    expect(isSafeEmbed("https://www.youtube-nocookie.com/embed/abc_123")).toBe(
      true,
    );
    expect(isSafeEmbed("https://player.vimeo.com/video/1234")).toBe(true);
    expect(
      isSafeEmbed(
        "https://www.youtube-nocookie.com.attacker.invalid/embed/abc",
      ),
    ).toBe(false);
    expect(isSafeEmbed("https://www.youtube-nocookie.com/redirect")).toBe(
      false,
    );
    expect(isSafeEmbed("http://player.vimeo.com/video/123")).toBe(false);
  });
  it("removes scripts, event handlers, styling, unsafe images and arbitrary frames", () => {
    const html = sanitizeBody(
      '<h1>Heading</h1><script>alert(1)</script><svg onload="alert(2)">bad</svg><p style="color:red" onclick="bad()">Safe</p><img src="javascript:alert(3)" onerror="bad()"><iframe src="https://attacker.invalid/" title="Unsafe"></iframe>',
    );
    expect(html).toContain("<p>Safe</p>");
    expect(html).not.toMatch(
      /<h1|script|svg|onclick|style=|onerror|<img|iframe|alert/,
    );
  });
  it("retains accessible images and hardened named embeds", () => {
    const html = sanitizeBody(
      '<img src="/media/photo.webp" alt="Informative photo" width="400" height="200"><iframe src="https://player.vimeo.com/video/123" title="Demonstration" onload="bad()"></iframe>',
    );
    expect(html).toContain('alt="Informative photo"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain(
      'sandbox="allow-scripts allow-same-origin allow-presentation"',
    );
    expect(html).toContain('referrerpolicy="strict-origin-when-cross-origin"');
    expect(html).not.toContain("onload");
    expect(
      sanitizeBody(
        '<iframe src="https://player.vimeo.com/video/123"></iframe>',
      ),
    ).toBe("");
  });
  it("preserves external-link isolation and permits local heading anchors", () => {
    const html = sanitizeBody(
      '<a href="https://example.invalid/" target="_blank" rel="opener">Source</a><a href="#evidence">Evidence</a><a href="javascript:alert(1)">Bad</a>',
    );
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="#evidence"');
    expect(html).not.toContain("javascript:");
  });
  it("preserves paid-link/user-content qualifications without unsafe rel tokens", () => {
    const html = sanitizeBody(
      '<a href="https://example.invalid/paid/" target="_blank" rel="sponsored nofollow opener">Placement</a><a href="https://example.invalid/comment/" rel="ugc">Comment</a>',
    );
    expect(html).toContain('rel="sponsored nofollow noopener noreferrer"');
    expect(html).toContain('rel="ugc"');
    expect(html).not.toContain('rel="opener');
  });
  it("drops a trusted-host iframe if its accessible title is whitespace only", () => {
    expect(
      sanitizeBody(
        '<iframe src="https://player.vimeo.com/video/123" title="   "></iframe>',
      ),
    ).toBe("");
  });
  it("counts readable blocks, Unicode and decoded entities without executable text", () => {
    expect(
      bodyText(
        "<p>One &amp; two</p><p>Caf&eacute; &#128512; &lt;three&gt;</p><script>not counted</script>",
      ),
    ).toBe("One & two Café 😀 <three>");
    expect(wordCount("<p>First paragraph</p><p>Second paragraph</p>")).toBe(4);
    expect(wordCount("")).toBe(0);
  });
  it("labels a focus-phrase score as editorial checks, without a ranking promise", () => {
    const result = editorialScore("Guest posting guide", {
      body: "<p>" + Array(30).fill("evidence").join(" ") + "</p>",
      seoTitle: "Guest posting guide",
      metaDescription: "A practical guide",
      sources: [{ label: "Evidence", url: "https://example.invalid/" }],
      focusKeyword: "guest posting",
    });
    expect(result.score).toBe(100);
    expect(result.suggestions).toEqual([]);
    expect(editorialScore("", {}).score).toBe(0);
  });
  it("suggests only relevant published indexable content", () => {
    const source = record("source");
    const related = record("related", { title: "Guest posting evidence" });
    const draft = record("draft", { status: "draft" });
    const privateRecord = record("hidden", { data: { robotsIndex: false } });
    expect(
      suggestInternalLinks(source, [
        source,
        related,
        draft,
        privateRecord,
        record("unrelated", { title: "Image resizing" }),
      ]),
    ).toEqual([related]);
  });
  it("reports metadata, duplicate title, alt and possible-orphan warnings accurately", () => {
    const one = record("one");
    const two = record("two", {
      data: { body: '<a href="/one/">Context</a>' },
    });
    const image = record("image", { collection: "media", data: { alt: "" } });
    const decorative = record("decorative", {
      collection: "media",
      data: { alt: "", decorative: true },
    });
    const warnings = seoHealth([one, two, image, decorative]);
    expect(
      warnings.some(
        (w) => w.code === "duplicate-title" && w.recordId === "one",
      ),
    ).toBe(true);
    expect(
      warnings.some(
        (w) => w.code === "possible-orphan" && w.recordId === "one",
      ),
    ).toBe(false);
    expect(
      warnings.some(
        (w) => w.code === "possible-orphan" && w.recordId === "two",
      ),
    ).toBe(true);
    expect(
      warnings.filter((w) => w.code === "missing-alt").map((w) => w.recordId),
    ).toEqual(["image"]);
  });
});
