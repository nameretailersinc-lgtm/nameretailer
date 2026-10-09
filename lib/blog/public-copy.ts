import type { CmsRecord } from "@/lib/cms/types";
import { finishedCopy, finishedHtml } from "@/lib/site/public-copy";

/** Presentation-only wording updates; preserve CMS history, identities and URLs. */
export function publicArticle(record: CmsRecord): CmsRecord {
  const data = { ...record.data };
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
  return { ...record, title: finishedCopy(record.title), data };
}
