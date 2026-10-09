import { z } from "zod";
import type { Collection, CmsRecord, RecordInput } from "./types";
import { bodyText, isSafeUrl, sanitizeBody, wordCount } from "./content";
import {
  isProtectedRedirectPath,
  normalizeRedirectPath,
  redirectTargetPath,
  validateRedirects,
} from "./redirects";

const statuses = [
  "draft",
  "published",
  "scheduled",
  "archived",
  "pending",
  "approved",
  "rejected",
  "new",
  "read",
  "subscribed",
  "unsubscribed",
  "active",
] as const;
const text = (max = 2000) => z.string().trim().max(max);
const id = text(128).min(1);
const optionalText = (max = 2000) => text(max).optional();
const bool = z.boolean();
const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => v === "" || isSafeUrl(v),
    "Use a safe HTTP(S) URL or an absolute local path.",
  );
const externalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => v === "" || isSafeUrl(v, false),
    "Use a safe absolute HTTP(S) URL.",
  );
const datetime = z
  .string()
  .datetime({ offset: true })
  .refine(
    (v) => Number.isFinite(Date.parse(v)),
    "Use a real ISO date and time.",
  );
const nullableDate = datetime.nullable().optional();
const ids = z.array(id).max(200).default([]);

export const recordInputSchema = z.object({
  title: text(300).min(1, "Title is required."),
  slug: text(240).default(""),
  status: z.enum(statuses).default("draft"),
  data: z.record(z.string(), z.unknown()).default({}),
  version: z.number().int().positive().optional(),
});

export const userInputSchema = z
  .object({
    name: text(160).min(1),
    email: z.string().trim().toLowerCase().email().max(254),
    role: z.enum(["admin", "editor", "author", "customer"]),
    password: z.string().min(12, "Use at least 12 characters.").max(128),
    active: bool.default(true),
  })
  .strict();

export const settingsSchema = z
  .object({
    brandName: text(160).min(1),
    contactEmail: z.string().trim().email().max(254),
    address: text(1000),
    logo: safeUrl.default(""),
    socialLinks: z.array(externalUrl).max(20).default([]),
    ga4Id: text(40)
      .refine(
        (v) => !v || /^G-[A-Z0-9]+$/.test(v),
        "Invalid GA4 measurement ID.",
      )
      .default(""),
    gtmId: text(40)
      .refine((v) => !v || /^GTM-[A-Z0-9]+$/.test(v), "Invalid GTM ID.")
      .default(""),
    googleVerification: text(500)
      .refine((v) => !/[<>\r\n]/.test(v), "Enter the verification token only.")
      .default(""),
    metaPixelId: text(40)
      .refine((v) => !v || /^\d+$/.test(v), "Invalid pixel ID.")
      .default(""),
    robotsText: z.string().max(50000).default(""),
    llmsText: z.string().max(100000).default(""),
    llmsFullText: z.string().max(500000).default(""),
    sitemapEnabled: bool.default(true),
  })
  .strict();

const contentData = z.object({
  type: z.enum(["post", "page"]).default("page"),
  body: z.string().max(250000).default(""),
  excerpt: optionalText(5000),
  authorId: id.nullable().optional(),
  reviewerId: id.nullable().optional(),
  categoryIds: ids,
  tagIds: ids,
  relatedIds: ids,
  publishedAt: nullableDate,
  scheduledAt: nullableDate,
  lastReviewedAt: nullableDate,
  seoTitle: optionalText(300),
  metaDescription: optionalText(2000),
  canonical: safeUrl.optional(),
  robotsIndex: bool.default(true),
  robotsFollow: bool.default(true),
  ogImage: safeUrl.optional(),
  focusKeyword: optionalText(200),
  schemaType: z
    .enum([
      "WebPage",
      "Article",
      "BlogPosting",
      "FAQPage",
      "HowTo",
      "ItemList",
      "Service",
    ])
    .default("WebPage"),
  faq: z
    .array(
      z
        .object({ question: text(500).min(1), answer: text(10000).min(1) })
        .strict(),
    )
    .max(100)
    .default([]),
  sources: z
    .array(
      z.object({
        label: text(300).min(1),
        url: externalUrl.refine(Boolean, "Source URL is required."),
      }),
    )
    .max(100)
    .default([]),
});
const taxonomyData = z.object({
  description: optionalText(10000),
  parentId: id.nullable().optional(),
});
const authorData = z.object({
  entityType: z.enum(["Person", "Organization"]).default("Person"),
  name: text(160).min(1),
  bio: text(10000).default(""),
  credentials: text(4000).default(""),
  url: externalUrl.default(""),
  sameAs: z.array(externalUrl.refine(Boolean)).max(20).default([]),
  verified: bool.default(false),
});
const mediaData = z.object({
  alt: text(2000).default(""),
  decorative: bool.default(false),
  folder: text(200).default(""),
  url: safeUrl.refine(Boolean),
  avifUrl: safeUrl.optional(),
  width: z.number().int().positive().max(40000),
  height: z.number().int().positive().max(40000),
  mime: z.enum([
    "image/webp",
    "image/avif",
    "image/jpeg",
    "image/png",
    "image/gif",
  ]),
  size: z.number().int().nonnegative(),
});
type MenuItem = { label: string; url: string; children?: MenuItem[] };
const menuItem: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    label: text(160).min(1),
    url: safeUrl.refine(Boolean),
    children: z.array(menuItem).max(30).optional(),
  }),
);
const schemas = {
  content: contentData,
  categories: taxonomyData,
  tags: taxonomyData,
  authors: authorData,
  media: mediaData,
  redirects: z.object({
    source: text(2048).min(1),
    target: text(2048).min(1),
    statusCode: z.union([z.literal(301), z.literal(302)]),
    enabled: bool.default(false),
  }),
  notFound: z.object({
    path: text(2048).min(1),
    count: z.number().int().nonnegative().default(1),
    lastSeenAt: datetime,
  }),
  menus: z.object({
    location: text(100).min(1),
    items: z.array(menuItem).max(100).default([]),
  }),
  sections: z.object({
    position: z.number().int().nonnegative().default(0),
    type: text(100).min(1),
    body: z.string().max(250000).default(""),
    enabled: bool.default(false),
  }),
  widgets: z.object({
    location: text(100).min(1),
    body: z.string().max(250000).default(""),
    enabled: bool.default(false),
  }),
  leads: z.object({
    email: z.string().trim().email().max(254),
    message: text(20000).min(1),
    consent: bool.default(false),
  }),
  subscribers: z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    consent: bool,
    consentedAt: nullableDate,
  }),
} satisfies Record<Collection, z.ZodType>;

const allowedStatus: Record<Collection, readonly string[]> = {
  content: ["draft", "scheduled", "published", "archived"],
  categories: ["draft", "active", "published", "archived"],
  tags: ["draft", "active", "published", "archived"],
  authors: ["draft", "active", "archived"],
  media: ["draft", "active", "published", "archived"],
  redirects: ["draft", "active", "archived"],
  notFound: ["new", "read", "archived"],
  menus: ["draft", "active", "published", "archived"],
  sections: ["draft", "active", "published", "archived"],
  widgets: ["draft", "active", "published", "archived"],
  leads: ["new", "read", "archived"],
  subscribers: ["pending", "subscribed", "unsubscribed", "archived"],
};

function assertJson(value: unknown, depth = 0): void {
  if (depth > 12) throw new Error("Record data is nested too deeply.");
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (Array.isArray(value)) {
    if (value.length > 1000) throw new Error("Record contains too many items.");
    value.forEach((v) => assertJson(v, depth + 1));
    return;
  }
  if (
    typeof value === "object" &&
    value &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    for (const [key, item] of Object.entries(value)) {
      if (["__proto__", "constructor", "prototype"].includes(key))
        throw new Error("Reserved data key.");
      assertJson(item, depth + 1);
    }
    return;
  }
  throw new Error("Record data must contain JSON values only.");
}

export function normalizeSlug(value: string, title: string): string {
  const raw =
    value ||
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const slug = raw.toLowerCase().replace(/^\/+|\/+$/g, "");
  if (
    !slug ||
    !/^[a-z0-9]+(?:[a-z0-9/_-]*[a-z0-9])?$/.test(slug) ||
    slug.includes("//") ||
    slug.split("/").some((p) => p === "." || p === "..")
  )
    throw new Error(
      "Slug must be a lowercase path using letters, numbers, hyphens or underscores.",
    );
  if (
    /^(admin|api|cart|checkout|my-account|media|custom-login|link-details|product|design-system)(\/|$)/.test(
      slug,
    )
  )
    throw new Error("This slug is reserved for application routes.");
  return slug;
}

function validatePublication(
  data: Record<string, unknown>,
  records: readonly CmsRecord[],
  status: string,
): void {
  const body = String(data.body ?? "");
  if (wordCount(body) < 30)
    throw new Error(
      "Publishing requires at least 30 words of meaningful body content. This minimum does not establish originality or SEO quality.",
    );
  if (data.type === "post") {
    const author = records.find(
      (r) => r.id === data.authorId && r.collection === "authors",
    );
    if (!author || author.status !== "active" || author.data.verified !== true)
      throw new Error(
        "Posts require a verified active author record before publishing or scheduling.",
      );
  }
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)];
  for (const [img] of imgs)
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(img))
      throw new Error(
        'Every body image needs alt text, or explicit alt="" when decorative.',
      );
  const review =
    typeof data.lastReviewedAt === "string"
      ? Date.parse(data.lastReviewedAt)
      : null;
  const now = Date.now();
  if (review !== null && review > now)
    throw new Error("Last reviewed date cannot be in the future.");
  if (status === "scheduled") {
    if (
      typeof data.scheduledAt !== "string" ||
      Date.parse(data.scheduledAt) <= now
    )
      throw new Error("Scheduled content needs a future scheduledAt date.");
  } else if (
    typeof data.publishedAt === "string" &&
    Date.parse(data.publishedAt) > now
  )
    throw new Error(
      "Published content cannot have a future publication date; schedule it instead.",
    );
}

export function validateRecord(
  collection: Collection,
  input: unknown,
  existingRecords: readonly CmsRecord[] = [],
  excludeId?: string,
): RecordInput {
  const parsed = recordInputSchema.parse(input);
  assertJson(parsed.data);
  if (JSON.stringify(parsed.data).length > 600000)
    throw new Error("Record data is too large.");
  if (!allowedStatus[collection].includes(parsed.status))
    throw new Error("Status is not valid for this collection.");
  const slug = normalizeSlug(parsed.slug, parsed.title);
  if (
    existingRecords.some(
      (r) =>
        r.collection === collection &&
        r.id !== excludeId &&
        r.slug === slug &&
        r.status !== "archived",
    )
  )
    throw new Error("This slug is already in use.");
  const data = schemas[collection].parse(parsed.data) as Record<
    string,
    unknown
  >;
  // Persist one UTC representation so MongoDB's indexed ISO-string scheduling order is chronological.
  for (const key of [
    "publishedAt",
    "scheduledAt",
    "lastReviewedAt",
    "lastSeenAt",
    "consentedAt",
  ]) {
    if (typeof data[key] === "string")
      data[key] = new Date(data[key] as string).toISOString();
  }
  if (collection === "content") {
    data.body = sanitizeBody(String(data.body));
    if (data.excerpt) data.excerpt = bodyText(String(data.excerpt));
    data.faq = (data.faq as { question: string; answer: string }[]).map(
      (item) => ({
        question: bodyText(item.question),
        answer: bodyText(item.answer),
      }),
    );
    if (
      (data.faq as { question: string; answer: string }[]).some(
        (item) => !item.question || !item.answer,
      )
    )
      throw new Error(
        "FAQ questions and answers must contain readable text after sanitization.",
      );
    if (
      typeof data.lastReviewedAt === "string" &&
      Date.parse(data.lastReviewedAt) > Date.now()
    )
      throw new Error("Last reviewed date cannot be in the future.");
    if (data.canonical) {
      const url = new URL(String(data.canonical), "https://nameretailer.com");
      if (url.origin !== "https://nameretailer.com" || url.search || url.hash)
        throw new Error(
          "Canonical must use the canonical site origin without query or fragment.",
        );
      if (isProtectedRedirectPath(url.pathname))
        throw new Error(
          "Canonical must identify an equivalent public content route, not a private, utility or discovery endpoint.",
        );
      url.pathname = normalizeRedirectPath(url.pathname);
      data.canonical = url.href;
    }
    if (["published", "scheduled"].includes(parsed.status))
      validatePublication(data, existingRecords, parsed.status);
  }
  if (collection === "authors") {
    data.bio = sanitizeBody(String(data.bio));
    if (data.verified === true && !bodyText(String(data.bio)).trim())
      throw new Error("Verified authors need an actual biography.");
    if (
      excludeId &&
      (parsed.status !== "active" || data.verified !== true) &&
      existingRecords.some(
        (r) =>
          r.collection === "content" &&
          ["published", "scheduled"].includes(r.status) &&
          r.data.type === "post" &&
          r.data.authorId === excludeId,
      )
    )
      throw new Error(
        "This author is referenced by published or scheduled posts. Reassign or unpublish them before removing verified active authorship.",
      );
  }
  if (collection === "media" && !data.alt && data.decorative !== true)
    throw new Error(
      "Informative media requires alt text, or mark it decorative explicitly.",
    );
  if (collection === "sections" || collection === "widgets")
    data.body = sanitizeBody(String(data.body));
  if (collection === "subscribers" && parsed.status === "subscribed") {
    if (!data.consent || !data.consentedAt)
      throw new Error(
        "Subscribed records require consent and its actual timestamp.",
      );
    if (Date.parse(String(data.consentedAt)) > Date.now())
      throw new Error(
        "Consent must record its actual timestamp, not a future date.",
      );
  }
  if (collection === "redirects") {
    data.source = normalizeRedirectPath(String(data.source));
    data.target = redirectTargetPath(String(data.target));
    if (data.enabled === true)
      throw new Error(
        "Redirect activation is a Phase 4 operation; Phase 3 saves disabled configuration only.",
      );
    validateRedirects([
      ...existingRecords.filter((r) => r.id !== excludeId),
      { ...parsed, slug, data },
    ]);
  }
  return { ...parsed, slug, data };
}
