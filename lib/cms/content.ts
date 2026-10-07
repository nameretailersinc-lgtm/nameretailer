import sanitizeHtml from "sanitize-html";
import type { CmsRecord, SeoWarning } from "./types";

/** A link validator, not a network fetcher. Relative links must stay on this origin. */
export function isSafeUrl(value: string, allowRelative = true): boolean {
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (allowRelative && value.startsWith("/") && !value.startsWith("//")) {
    try {
      let decoded = value;
      for (let step = 0; step < 4; step++) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      }
      return (
        !/%|[\u0000-\u0020\u007f\\]/.test(decoded) && !decoded.startsWith("//")
      );
    } catch {
      return false;
    }
  }
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !!url.hostname
    );
  } catch {
    return false;
  }
}

const embedHosts = new Set(["www.youtube-nocookie.com", "player.vimeo.com"]);
export function isSafeEmbed(value: string): boolean {
  if (!isSafeUrl(value, false)) return false;
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    embedHosts.has(url.hostname) &&
    (url.hostname === "www.youtube-nocookie.com"
      ? /^\/embed\/[A-Za-z0-9_-]+$/.test(url.pathname)
      : /^\/video\/\d+$/.test(url.pathname))
  );
}

/** Sanitizes persisted HTML; scripts, SVG, style, arbitrary iframes and event handlers cannot survive. */
export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "s",
      "u",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "code",
      "div",
      "span",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
      iframe: [
        "src",
        "title",
        "width",
        "height",
        "loading",
        "sandbox",
        "referrerpolicy",
        "allowfullscreen",
      ],
    },
    allowedSchemes: ["https", "http"],
    allowProtocolRelative: false,
    nonTextTags: ["script", "style", "textarea", "option", "svg", "math"],
    transformTags: {
      a: (_tag, attrs) => {
        const rel = new Set(
          (attrs.rel ?? "")
            .toLowerCase()
            .split(/\s+/)
            .filter((token) =>
              [
                "nofollow",
                "sponsored",
                "ugc",
                "noopener",
                "noreferrer",
              ].includes(token),
            ),
        );
        if (attrs.target === "_blank") {
          rel.add("noopener");
          rel.add("noreferrer");
        }
        return {
          tagName: "a",
          attribs: {
            ...(attrs.href &&
            (isSafeUrl(attrs.href) || /^#[A-Za-z][\w-]*$/.test(attrs.href))
              ? { href: attrs.href }
              : {}),
            ...(attrs.title ? { title: attrs.title } : {}),
            ...(attrs.target === "_blank" ? { target: "_blank" } : {}),
            ...(rel.size ? { rel: [...rel].join(" ") } : {}),
          },
        };
      },
      img: (_tag, attrs) => ({
        tagName: "img",
        attribs: {
          ...(attrs.src && isSafeUrl(attrs.src) ? { src: attrs.src } : {}),
          ...(Object.hasOwn(attrs, "alt") ? { alt: attrs.alt } : {}),
          ...(/^[1-9]\d{0,4}$/.test(attrs.width ?? "")
            ? { width: attrs.width }
            : {}),
          ...(/^[1-9]\d{0,4}$/.test(attrs.height ?? "")
            ? { height: attrs.height }
            : {}),
          loading: "lazy",
        },
      }),
      iframe: (_tag, attrs): sanitizeHtml.Tag => ({
        tagName: "iframe",
        attribs: isSafeEmbed(attrs.src ?? "")
          ? {
              src: attrs.src,
              title: (attrs.title ?? "").trim(),
              width: "560",
              height: "315",
              loading: "lazy",
              sandbox: "allow-scripts allow-same-origin allow-presentation",
              referrerpolicy: "strict-origin-when-cross-origin",
              allowfullscreen: "",
            }
          : {},
      }),
    },
    exclusiveFilter: (frame) =>
      (frame.tag === "iframe" &&
        (!frame.attribs.src || !frame.attribs.title)) ||
      (frame.tag === "img" && !frame.attribs.src),
  });
}

export function bodyText(html: string): string {
  // Preserve block boundaries before stripping markup; adjacent paragraphs are not one word.
  const separated = html.replace(
    /<\/?(?:p|h[1-6]|br|hr|div|li|ul|ol|blockquote|pre|table|thead|tbody|tr|th|td|figure|figcaption)\b[^>]*>/gi,
    " ",
  );
  return sanitizeHtml(separated, {
    allowedTags: [],
    allowedAttributes: {},
    nonTextTags: ["script", "style", "svg", "math"],
  })
    .replace(
      /&(lt|gt|amp);/g,
      (_match, entity: string) => ({ lt: "<", gt: ">", amp: "&" })[entity]!,
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: string): number {
  return bodyText(html).split(/\s+/).filter(Boolean).length;
}

export function editorialScore(title: string, data: Record<string, unknown>) {
  const body = typeof data.body === "string" ? data.body : "";
  const keyword =
    typeof data.focusKeyword === "string"
      ? data.focusKeyword.trim().toLowerCase()
      : "";
  const checks = [
    {
      code: "title",
      label: "Descriptive title",
      passed: title.trim().length > 0,
    },
    {
      code: "seo-title",
      label: "SEO title supplied",
      passed: typeof data.seoTitle === "string" && !!data.seoTitle.trim(),
    },
    {
      code: "description",
      label: "Description supplied",
      passed:
        typeof data.metaDescription === "string" &&
        !!data.metaDescription.trim(),
    },
    { code: "body", label: "Substantive draft", passed: wordCount(body) >= 30 },
    {
      code: "sources",
      label: "Sources supplied",
      passed: Array.isArray(data.sources) && data.sources.length > 0,
    },
    {
      code: "keyword",
      label: "Focus phrase addressed",
      passed:
        !!keyword &&
        (title.toLowerCase() + " " + bodyText(body).toLowerCase()).includes(
          keyword,
        ),
    },
  ];
  return {
    score: Math.round(
      (checks.filter((c) => c.passed).length / checks.length) * 100,
    ),
    checks,
    suggestions: checks
      .filter((c) => !c.passed)
      .map((c) => c.label + " needs editorial review."),
  };
}

export function suggestInternalLinks(
  record: CmsRecord,
  records: CmsRecord[],
): CmsRecord[] {
  const terms = new Set(
    (record.title + " " + String(record.data.focusKeyword ?? ""))
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3),
  );
  return records
    .filter(
      (r) =>
        r.id !== record.id &&
        r.collection === "content" &&
        r.status === "published" &&
        r.data.robotsIndex !== false,
    )
    .map((r) => ({
      record: r,
      score: r.title
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => terms.has(w)).length,
    }))
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.record.title.localeCompare(b.record.title),
    )
    .slice(0, 5)
    .map((r) => r.record);
}

export function seoHealth(records: CmsRecord[]): SeoWarning[] {
  const warnings: SeoWarning[] = [];
  const content = records.filter(
    (r) => r.collection === "content" && r.status !== "archived",
  );
  const titles = new Map<string, CmsRecord[]>();
  for (const record of content) {
    const title = String(record.data.seoTitle ?? record.title)
      .trim()
      .toLowerCase();
    titles.set(title, [...(titles.get(title) ?? []), record]);
    const warn = (code: string, message: string) =>
      warnings.push({
        code,
        message,
        recordId: record.id,
        severity: "warning",
      });
    if (!record.data.seoTitle)
      warn(
        "missing-seo-title",
        "Add a descriptive SEO title; the content title is the fallback.",
      );
    if (!record.data.metaDescription)
      warn("missing-description", "Add a unique description.");
    if (!record.data.ogImage)
      warn("missing-og-image", "Choose a real social sharing image.");
    if (!record.data.lastReviewedAt)
      warn(
        "missing-review-date",
        "Review accuracy before recording a review date.",
      );
    if (record.status === "published" && record.data.robotsIndex !== false) {
      const target = "/" + record.slug.replace(/^\/+|\/+$/g, "") + "/";
      const inbound = content.some(
        (other) =>
          other.id !== record.id &&
          other.status === "published" &&
          other.data.robotsIndex !== false &&
          ((Array.isArray(other.data.relatedIds) &&
            other.data.relatedIds.includes(record.id)) ||
            String(other.data.body ?? "")
              .match(/href\s*=\s*["']([^"']+)["']/gi)
              ?.some((href) => {
                const value = href.replace(/^href\s*=\s*["']|["']$/g, "");
                try {
                  return (
                    new URL(value, "https://nameretailer.com").origin ===
                      "https://nameretailer.com" &&
                    new URL(value, "https://nameretailer.com").pathname ===
                      target
                  );
                } catch {
                  return false;
                }
              })),
      );
      if (!inbound)
        warn(
          "possible-orphan",
          "No contextual inbound link found in published CMS records; public templates may add links in Phase 4.",
        );
    }
  }
  for (const duplicates of titles.values())
    if (duplicates.length > 1)
      for (const record of duplicates)
        warnings.push({
          code: "duplicate-title",
          message: "Another content record uses this SEO title.",
          recordId: record.id,
          severity: "warning",
        });
  for (const media of records.filter(
    (r) => r.collection === "media" && r.status !== "archived",
  ))
    if (!media.data.alt && media.data.decorative !== true)
      warnings.push({
        code: "missing-alt",
        message:
          "Record informative alt text or explicitly mark this image decorative.",
        recordId: media.id,
        severity: "warning",
      });
  return warnings;
}
