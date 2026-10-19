import type { ArticleDraft } from "./types";
import { buyerExpansions } from "./buyer-expansions";
import { marketplaceContent } from "./marketplace-content";
import { technicalAeo } from "./technical-aeo";
import { geoMeasurement } from "./geo-measurement";
import { finishedCopy } from "@/lib/site/public-copy";
import { escapeMarkup } from "@/lib/tools/core";
import { normalizeSlug } from "@/lib/cms/validation";
import { bodyText, wordCount, sanitizeBody } from "@/lib/cms/content";
import { getArticleKeywordData } from "@/lib/seo/article-keyword-registry";
export const blogDrafts = [
  ...marketplaceContent,
  ...technicalAeo,
  ...geoMeasurement,
];
export const blogClusters = [
  ...new Set(blogDrafts.map((article) => article.cluster)),
];
export const blogLibrary = blogDrafts.map((source) => {
  // Existing slug identities survive copy corrections.
  const slug = normalizeSlug("", source.title);
  const expansion = buyerExpansions[slug];
  const article = {
    ...source,
    title: finishedCopy(source.title),
    seoTitle: expansion?.title || (source.seoTitle ? finishedCopy(source.seoTitle) : undefined),
    metaDescription: expansion?.description || (source.metaDescription ? finishedCopy(source.metaDescription) : undefined),
    answer: finishedCopy(source.answer),
    example: finishedCopy(source.example),
    steps: source.steps.map(finishedCopy) as [string, string, string],
    avoid: finishedCopy(source.avoid),
    question: finishedCopy(source.question),
    response: finishedCopy(source.response),
    sections: ([...(source.sections || []), ...(expansion?.sections || [])] as NonNullable<ArticleDraft["sections"]>).map((sec) => ({
      heading: finishedCopy(sec.heading),
      body: finishedCopy(sec.body),
      code: sec.code,
      checklist: ("checklist" in sec ? sec.checklist : undefined)?.map(finishedCopy),
      table: ("table" in sec ? sec.table : undefined)
        ? {
            columns: ("table" in sec ? sec.table! : { columns: [], rows: [] }).columns.map(finishedCopy),
            rows: ("table" in sec ? sec.table! : { columns: [], rows: [] }).rows.map((row) => row.map(finishedCopy)),
          }
        : undefined,
    })),
    relatedLinks: source.relatedLinks?.map(
      ([label, href]) => [finishedCopy(label), href] as [string, string],
    ),
    extraFaq: (expansion ? expansion.faq : source.extraFaq)?.map(
      ([q, a]) => [finishedCopy(q), finishedCopy(a)] as [string, string],
    ),
    sources: [
      ...(source.source ? [source.source] : []),
      ...(source.extraSources || []),
    ],
  };
  const e = escapeMarkup;
  const extraSectionsHtml = (article.sections || [])
    .map((sec) => {
      const codeHtml = sec.code
        ? `<pre><code>${e(sec.code)}</code></pre>`
        : "";
      const listHtml = sec.checklist?.length
        ? `<ul>${sec.checklist.map((item) => `<li>${e(item)}</li>`).join("")}</ul>`
        : "";
      const tableHtml = ("table" in sec ? sec.table : undefined)
        ? `<div class="directory-table-wrap" role="region" aria-label="${e(sec.heading)} comparison table"><table class="directory-table"><caption>${e(sec.heading)} comparison</caption><thead><tr>${("table" in sec ? sec.table! : { columns: [], rows: [] }).columns.map((col) => `<th scope="col">${e(col)}</th>`).join("")}</tr></thead><tbody>${("table" in sec ? sec.table! : { columns: [], rows: [] }).rows.map((row) => `<tr>${row.map((cell, idx) => (idx === 0 ? `<th scope="row">${e(cell)}</th>` : `<td>${e(cell)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`
        : "";
      return `<h3>${e(sec.heading)}</h3><p>${e(sec.body)}</p>${codeHtml}${listHtml}${tableHtml}`;
    })
    .join("");
  article.relatedLinks = expansion ? [["Compare guest posting sites by niche", "/guest-posting-sites/"], ["Review placement and writing costs", "/guest-post-prices/"], ["Evaluate publisher evidence", "/guides/vet-a-guest-post-site/"], ["Count words in your article brief", "/word-counter/"]] : article.relatedLinks;
  const relatedHtml = article.relatedLinks?.length
    ? `<h3>Related guides and tools</h3><ul>${article.relatedLinks.map(([label, href]) => `<li><a href="${e(href)}">${e(label)}</a></li>`).join("")}</ul>`
    : "";
  const body = sanitizeBody(
    `<h2>A worked example</h2><p>${e(article.example)}</p><h2>A practical checklist</h2><ol>${article.steps.map((step) => `<li>${e(step)}</li>`).join("")}</ol>${extraSectionsHtml}<h2>What to avoid</h2><p>${e(article.avoid)}</p>${relatedHtml}`,
  );
  const computedMeta =
    article.metaDescription ||
    bodyText(article.answer)
      .slice(0, 154)
      .replace(/\s+\S*$/, "") + "…";
  const kw = getArticleKeywordData(slug);
  const primaryKeyword = article.primaryKeyword || kw?.primaryKeyword || "";
  const secondaryKeywords =
    article.secondaryKeywords ||
    (kw?.secondaryKeywords ? kw.secondaryKeywords.join("; ") : "");
  const searchIntent =
    article.searchIntent || kw?.searchIntent || "Informational";
  return {
    ...article,
    slug,
    body,
    metaDescription: computedMeta,
    words: wordCount(body) + wordCount(article.answer) + wordCount([article.question, article.response, ...(article.extraFaq || []).flat()].join(" ")),
    buyerRelevant: !!expansion,
    primaryKeyword,
    keyword: primaryKeyword,
    secondaryKeywords,
    searchIntent,
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
      article.words < (article.buyerRelevant ? 800 : 180) ||
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
