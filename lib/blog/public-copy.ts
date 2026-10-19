import type { CmsRecord } from "@/lib/cms/types";
import { finishedCopy, finishedHtml } from "@/lib/site/public-copy";
import { blogContentUpdatedAt, buyerArticleAuthor } from "./editorial";
import { blogLibrary } from "./library";

const libraryBySlug = new Map(
  blogLibrary.map((article) => [`blog/${article.slug}`, article]),
);

/** Presentation-only wording updates; preserve CMS history, identities and URLs. */
export function publicArticle(record: CmsRecord): CmsRecord {
  const data = { ...record.data };
  const lib = libraryBySlug.get(record.slug);
  if (lib) {
    if (lib.buyerRelevant) {
      data.authorId = buyerArticleAuthor.id;
      data.reviewerId = undefined;
      data.canonical = `https://nameretailer.com/${record.slug}/`;
    }
    if (lib.seoTitle) data.seoTitle = lib.seoTitle;
    if (lib.metaDescription) data.metaDescription = lib.metaDescription;
    if (lib.answer) data.excerpt = lib.answer;
    if (lib.body) data.body = lib.body;
    if (lib.question && lib.response) {
      data.faq = [
        { question: lib.question, answer: lib.response },
        ...(lib.extraFaq || []).map(([question, answer]) => ({
          question,
          answer,
        })),
      ];
    }
    if (lib.sources?.length) {
      data.sources = lib.sources;
    }
  }
  for (const key of ["excerpt", "seoTitle", "metaDescription"])
    if (typeof data[key] === "string") data[key] = finishedCopy(data[key]);
  if (typeof data.body === "string") data.body = finishedHtml(data.body);
  if (Array.isArray(data.faq))
    data.faq = data.faq.map((item) => {
      if (!item || typeof item !== "object") return item;
      const row = item as Record<string, unknown>;
      return {
        ...row,
        ...(typeof row.question === "string"
          ? { question: finishedCopy(row.question) }
          : {}),
        ...(typeof row.answer === "string"
          ? { answer: finishedCopy(row.answer) }
          : {}),
      };
    });
  return {
    ...record,
    updatedAt: blogContentUpdatedAt(record),
    title: lib?.buyerRelevant ? lib.seoTitle! : finishedCopy(record.title),
    data,
  };
}
