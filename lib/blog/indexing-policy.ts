// Unreviewed technical articles keep their existing restriction. The recovery
// request explicitly includes the existing responsive QA article for review.
export const technicalArticleSlugs = new Set([
  "blog/a-canonical-url-checklist-for-a-rebuilt-website",
  "blog/internal-links-that-make-an-article-library-easier-to-use",
  "blog/noindex-and-robots-txt-are-different-controls",
  "blog/plan-a-sitemap-around-approved-public-pages",
  "blog/a-structured-data-review-checklist-for-blog-articles",
  "blog/check-server-rendered-article-content-before-launch",
  "blog/a-responsive-article-page-qa-checklist",
  "blog/choose-image-dimensions-and-formats-deliberately",
  "blog/measure-page-experience-with-a-repeatable-test-setup",
  "blog/a-wordpress-to-next-js-content-migration-worksheet",
]);
import { buyerExpansions } from "./buyer-expansions";
export const reviewedTechnicalArticleSlugs = new Set([
  "blog/a-responsive-article-page-qa-checklist",
]);
export const indexableBlogSlugs = [
  ...Object.keys(buyerExpansions).map((slug) => `blog/${slug}`),
  ...reviewedTechnicalArticleSlugs,
];
export const blogArticleIndexable = (record: {
  slug: string;
  data: { robotsIndex?: unknown };
}) =>
  record.data.robotsIndex !== false &&
  record.slug.startsWith("blog/") &&
  indexableBlogSlugs.includes(record.slug);
