import { buyerExpansions } from "./buyer-expansions";
import type { CmsRecord } from "../cms/types";

export const budgetWorksheetEditorial = {
  slug: "blog/a-practical-guest-post-budget-worksheet",
  updatedAt: "2026-10-19",
};
export const responsiveQaEditorial = {
  slug: "blog/a-responsive-article-page-qa-checklist",
  updatedAt: "2026-10-20",
};
const linkCorrectionSlugs = new Set([
  "blog/a-wordpress-to-next-js-content-migration-worksheet",
  "blog/build-a-question-map-before-drafting-answer-led-content",
  "blog/ai-crawler-access-needs-a-documented-product-specific-policy",
]);

/** The rendered article includes a code-managed worksheet alongside CMS text. */
export function blogContentUpdatedAt(
  record: Pick<CmsRecord, "slug" | "updatedAt">,
) {
  if (record.slug === responsiveQaEditorial.slug || linkCorrectionSlugs.has(record.slug))
    return Date.parse(record.updatedAt) >
      Date.parse(responsiveQaEditorial.updatedAt)
      ? record.updatedAt
      : responsiveQaEditorial.updatedAt;
  if (!Object.hasOwn(buyerExpansions, record.slug.replace(/^blog\//, "")))
    return record.updatedAt;
  return Number.isFinite(Date.parse(record.updatedAt)) &&
    Date.parse(record.updatedAt) >
      Date.parse(budgetWorksheetEditorial.updatedAt)
    ? record.updatedAt
    : budgetWorksheetEditorial.updatedAt;
}

export const buyerArticleAuthor: CmsRecord = {
  id: "owner-fahad-shaikh",
  collection: "authors",
  title: "Fahad Shaikh",
  slug: "fahad-shaikh",
  status: "active",
  data: {
    entityType: "Person",
    name: "Fahad Shaikh",
    bio: "Fahad Shaikh is the owner of THE Promoters FZC, NameRetailer.com and YourMainDomain.com.",
    url: "https://nameretailer.com/authors/fahad-shaikh/",
    verified: true,
  },
  ownerId: "owner",
  version: 1,
  createdAt: "2026-10-19",
  updatedAt: "2026-10-19",
};
