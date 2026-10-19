import { z } from "zod";

const text = (max: number) => z.string().trim().max(max).refine(
  (value) => !/<\/?[a-z!][^>]*>/i.test(value) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value),
  "Use plain text without HTML or control characters.",
);
const source = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      !/[\s\\\u0000-\u001f\u007f]/u.test(value) &&
      url.hostname.includes(".") && !/^[\d.]+$/.test(url.hostname) &&
      !/\.(localhost|local|internal|invalid|test|example)$/i.test(url.hostname) &&
      url.hostname.split(".").every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
  } catch { return false; }
}, "Use a public HTTPS evidence URL without credentials.");
const checkedDate = z.string().refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v && v <= new Date().toISOString().slice(0, 10), "Use a real source-check date, not a future date.");
export const publicationContentInput = z.object({
  version: z.number().int().positive(),
  state: z.enum(["draft", "reviewed"]),
  publisherName: text(160).default(""),
  description: text(3000).default(""),
  editorialGuidelines: text(5000).default(""),
  audienceDetails: text(3000).default(""),
  contentRequirements: text(5000).default(""),
  priceIncludes: text(2000).default(""),
  priceExcludes: text(2000).default(""),
  secondaryNiches: text(1000).default(""),
  contentCategories: text(1500).default(""),
  acceptedTopics: text(2000).default(""),
  restrictedTopics: text(2000).default(""),
  wordCountRequirements: text(1000).default(""),
  imageRequirements: text(1500).default(""),
  editorialProcess: text(2500).default(""),
  linkPolicy: text(2000).default(""),
  uniqueDifferentiators: text(2500).default(""),
  editorialNotes: text(2500).default(""),
  metricsSource: text(1500).default(""),
  metricsMeasuredAt: checkedDate.default(""),
  faqs: z.array(z.object({ question: text(200).min(1), answer: text(1800).min(1) }).strict()).max(6).default([]),
  sourceUrl: source.default(""),
  checkedAt: checkedDate.default(""),
}).strict().superRefine((value, context) => {
  if (value.state === "reviewed" && (!value.sourceUrl || !value.checkedAt || !value.description))
    context.addIssue({ code: "custom", path: ["state"], message: "Reviewed content needs a description, evidence URL and actual source-check date." });
  if (new Set(value.faqs.map(faq => faq.question.toLowerCase())).size !== value.faqs.length)
    context.addIssue({ code: "custom", path: ["faqs"], message: "Remove duplicate profile questions." });
});
export type PublicationContentInput = z.infer<typeof publicationContentInput>;
export type PublicationContent = Omit<PublicationContentInput, "version"> & {
  domain: string;
  reviewedBy?: string;
  reviewedAt?: string;
};
export type PublicPublicationContent = Omit<PublicationContent, "reviewedBy">;

export function publicPublicationContent(content: PublicationContent | undefined, domain: string): PublicPublicationContent | undefined {
  if (!content || content.domain !== domain || content.state !== "reviewed" || !content.reviewedBy || !content.reviewedAt) return undefined;
  if (!Number.isFinite(Date.parse(content.reviewedAt)) || Date.parse(content.reviewedAt) > Date.now()) return undefined;
  const { domain: _domain, reviewedBy: _reviewer, reviewedAt: _reviewedAt, ...input } = content;
  void _domain; void _reviewer; void _reviewedAt;
  const parsed = publicationContentInput.safeParse({ ...input, version: 1 });
  if (!parsed.success) return undefined;
  const { version: _version, ...safe } = parsed.data;
  void _version;
  return { ...safe, domain, reviewedAt: content.reviewedAt };
}

/** Editorial readiness only; this does not change publication indexability. */
export function publicationContentEligible(content: PublicationContent | undefined, domain: string) {
  const safe = publicPublicationContent(content, domain);
  return !!safe && !!(safe.editorialGuidelines || safe.contentRequirements);
}
