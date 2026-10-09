// Preserve technical articles; review GSC/backlinks before changing this restriction.
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
export const blogArticleIndexable = (record: {
  slug: string;
  data: { robotsIndex?: unknown };
}) =>
  record.data.robotsIndex !== false && !technicalArticleSlugs.has(record.slug);
