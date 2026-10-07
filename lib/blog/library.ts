import { marketplaceContent } from "./marketplace-content";
import { technicalAeo } from "./technical-aeo";
import { geoMeasurement } from "./geo-measurement";
import { escapeMarkup } from "@/lib/tools/core";
import { normalizeSlug } from "@/lib/cms/validation";
import { bodyText, wordCount, sanitizeBody } from "@/lib/cms/content";
export const blogDrafts = [
  ...marketplaceContent,
  ...technicalAeo,
  ...geoMeasurement,
];
export const blogClusters = [
  ...new Set(blogDrafts.map((article) => article.cluster)),
];
export const blogLibrary = blogDrafts.map((article) => {
  const slug = normalizeSlug("", article.title);
  const e = escapeMarkup;
  const body = sanitizeBody(
    `<h2>The short answer</h2><p>${e(article.answer)}</p><h2>A worked example</h2><p>${e(article.example)}</p><h2>A practical checklist</h2><ol>${article.steps.map((step) => `<li>${e(step)}</li>`).join("")}</ol><h2>What to avoid</h2><p>${e(article.avoid)}</p><h2>A useful follow-up</h2><h3>${e(article.question)}</h3><p>${e(article.response)}</p>`,
  );
  return {
    ...article,
    slug,
    body,
    metaDescription:
      bodyText(article.answer)
        .slice(0, 157)
        .replace(/\s+\S*$/, "") + "…",
    words: wordCount(body),
  };
});
export function validateLibrary() {
  if (
    blogLibrary.length !== 60 ||
    new Set(blogLibrary.map((article) => article.slug)).size !== 60 ||
    new Set(blogLibrary.map((article) => article.body)).size !== 60
  )
    throw new Error("Exactly 60 distinct articles required.");
  for (const article of blogLibrary)
    if (
      article.words < 180 ||
      article.steps.length !== 3 ||
      !article.answer ||
      !article.question
    )
      throw new Error("Article content is incomplete.");
  return {
    articles: blogLibrary.length,
    clusters: blogClusters.length,
    totalWords: blogLibrary.reduce((sum, article) => sum + article.words, 0),
    minimumWords: Math.min(...blogLibrary.map((article) => article.words)),
  };
}
