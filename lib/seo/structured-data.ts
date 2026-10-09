export { serializeJsonLd, breadcrumbSchema, toolBreadcrumbs } from "./json-ld";
import type { WithContext, Thing } from "schema-dts";
import type { CmsRecord } from "../cms/types";
import { bodyText, isSafeUrl } from "../cms/content";
import { canonicalOrigin, canonicalUrl, type SeoSettings } from "./metadata";

export function organizationSchema(settings: SeoSettings): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": canonicalOrigin + "/#organization",
    name: settings.brandName || "Name Retailer",
    url: canonicalOrigin + "/",
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(settings.address ? { address: settings.address } : {}),
    ...(settings.logo && isSafeUrl(settings.logo)
      ? { logo: new URL(settings.logo, canonicalOrigin).href }
      : {}),
    ...(settings.socialLinks?.length
      ? { sameAs: settings.socialLinks.filter((url) => isSafeUrl(url, false)) }
      : {}),
  };
}

const oneOrMany = <T>(items: T[]): T | T[] =>
  items.length === 1 ? items[0] : items;

function authorNames(author: CmsRecord): string[] {
  const name = String(author.data.name || author.title);
  return author.data.entityType === "Organization"
    ? [name]
    : name
        .split(/\s+and\s+|\s*&\s*|\s*,\s*/)
        .map((part) => part.trim())
        .filter(Boolean);
}

export function articleSchema(
  record: CmsRecord,
  author: CmsRecord | undefined,
): WithContext<Thing> | null {
  if (
    record.collection !== "content" ||
    record.status !== "published" ||
    record.data.type !== "post" ||
    !author ||
    author.id !== record.data.authorId ||
    author.collection !== "authors" ||
    author.status !== "active" ||
    author.data.verified !== true
  )
    return null;
  return {
    "@context": "https://schema.org",
    "@type": record.data.schemaType === "Article" ? "Article" : "BlogPosting",
    "@id": canonicalUrl(record) + "#article",
    headline: record.title,
    mainEntityOfPage: canonicalUrl(record),
    author: oneOrMany(
      authorNames(author).map((name) => ({
        "@type":
          author.data.entityType === "Organization" ? "Organization" : "Person",
        name,
        url:
          typeof author.data.url === "string" &&
          isSafeUrl(author.data.url, false)
            ? author.data.url
            : `${canonicalOrigin}/about/`,
      })),
    ),
    publisher: { "@id": `${canonicalOrigin}/#organization` },
    ...(typeof record.data.publishedAt === "string" &&
    Number.isFinite(Date.parse(record.data.publishedAt))
      ? { datePublished: record.data.publishedAt }
      : {}),
    ...(Number.isFinite(Date.parse(record.updatedAt))
      ? { dateModified: record.updatedAt }
      : {}),
    ...(typeof record.data.ogImage === "string" &&
    isSafeUrl(record.data.ogImage)
      ? { image: new URL(record.data.ogImage, canonicalOrigin).href }
      : {}),
  };
}

/** Public Article markup needs real attribution, dates and an image. */
export function completeArticleSchema(
  record: CmsRecord,
  author: CmsRecord | undefined,
) {
  if (
    typeof record.data.publishedAt !== "string" ||
    !Number.isFinite(Date.parse(record.data.publishedAt)) ||
    !Number.isFinite(Date.parse(record.updatedAt)) ||
    typeof record.data.ogImage !== "string" ||
    !isSafeUrl(record.data.ogImage)
  )
    return null;
  return articleSchema(record, author);
}

/** General Schema.org semantics only. Google restricts FAQ rich results; this supports machine readability, not a ranking promise. */
export function faqSchema(record: CmsRecord): WithContext<Thing> | null {
  if (
    record.status !== "published" ||
    !Array.isArray(record.data.faq) ||
    !record.data.faq.length
  )
    return null;
  const items = record.data.faq
    .filter(
      (item): item is { question: string; answer: string } =>
        !!item &&
        typeof item === "object" &&
        typeof item.question === "string" &&
        typeof item.answer === "string",
    )
    .map((item) => ({
      question: bodyText(item.question),
      answer: bodyText(item.answer),
    }))
    .filter((item) => item.question && item.answer);
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: bodyText(item.question),
      acceptedAnswer: { "@type": "Answer", text: bodyText(item.answer) },
    })),
  };
}
export function jsonLdGraph(...nodes: Array<Record<string, unknown> | null>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter((node): node is Record<string, unknown> => !!node),
  };
}

// Google restricts FAQ rich results; exact visible Q&As only, with no ranking promise.
export function faqPageNode(items: ReadonlyArray<readonly [string, string]>) {
  if (!items.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: items.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function webApplicationNode(tool: {
  slug: string;
  title: string;
  description: string;
}) {
  return {
    "@type": "WebApplication",
    "@id": `${canonicalOrigin}/${tool.slug}/#tool`,
    name: tool.title,
    description: tool.description,
    url: `${canonicalOrigin}/${tool.slug}/`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${canonicalOrigin}/#organization` },
  };
}
