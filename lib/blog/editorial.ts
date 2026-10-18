import type { CmsRecord } from "../cms/types";

export const budgetWorksheetEditorial = {
  slug: "blog/a-practical-guest-post-budget-worksheet",
  updatedAt: "2026-10-18",
};

/** The rendered article includes a code-managed worksheet alongside CMS text. */
export function blogContentUpdatedAt(
  record: Pick<CmsRecord, "slug" | "updatedAt">,
) {
  if (record.slug !== budgetWorksheetEditorial.slug) return record.updatedAt;
  return Number.isFinite(Date.parse(record.updatedAt)) &&
    Date.parse(record.updatedAt) >
      Date.parse(budgetWorksheetEditorial.updatedAt)
    ? record.updatedAt
    : budgetWorksheetEditorial.updatedAt;
}
