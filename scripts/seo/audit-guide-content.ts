import { mkdir, writeFile } from "node:fs/promises";
import { buyerGuides } from "../../lib/site/buyer-guides";
import { domainGuides } from "../../lib/site/domain-guides";
import { guestPostingGuides } from "../../lib/site/guest-posting-guides";
import { concise } from "../../lib/seo/page-metadata";
import { buyerGuideArticleNode } from "../../lib/seo/json-ld";

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();
const words = (value: string) => normalize(value).match(/[\p{L}\p{N}]+/gu) || [];
const shingles = (value: string) => {
  const tokens = words(value);
  return new Set(tokens.slice(0, -4).map((_, i) => tokens.slice(i, i + 5).join(" ")));
};
const jaccard = (a: Set<string>, b: Set<string>) => {
  const intersection = [...a].filter(value => b.has(value)).length;
  return intersection / (a.size + b.size - intersection || 1);
};
const body = (guide: typeof buyerGuides[number]) => [
  guide.answer, ...guide.questions.flatMap(section => [section.title, section.body]),
  ...(guide.steps || []), ...(guide.checklist || []),
  ...(guide.templates || []).flatMap(template => [template.title, template.text]),
  ...(guide.faq || []).flat(), ...(guide.table?.columns || []), ...(guide.table?.rows.flat() || []),
].join(" ");
const duplicates = (items: Array<{ path: string; value: string }>) => {
  const groups = new Map<string, string[]>();
  for (const { path, value } of items) if (normalize(value)) groups.set(normalize(value), [...(groups.get(normalize(value)) || []), path]);
  return [...groups].filter(([, paths]) => new Set(paths).size > 1).map(([value, paths]) => ({ value, paths: [...new Set(paths)] }));
};
const records = buyerGuides.map(guide => {
  const path = `/guides/${guide.slug}/`;
  const headings = [
    ...guide.questions.map(section => section.title),
    ...(guide.steps ? ["Put it into practice"] : []),
    ...(guide.templates?.map(template => template.title) || []),
    ...(guide.checklist ? ["Decision checklist"] : []),
    ...(guide.faq ? ["Common questions", ...guide.faq.map(([question]) => question)] : []),
    ...(domainGuides.some(item => item.slug === guide.slug) ? ["Continue planning your domain"] : []),
    "Sources", ...(guide.related ? ["Continue with this decision"] : []),
    "Which publications should I compare next?",
  ];
  return {
    path, slug: guide.slug,
    group: domainGuides.some(item => item.slug === guide.slug) ? "domain" : guestPostingGuides.some(item => item.slug === guide.slug) ? "guest-posting-expansion" : "original-buyer-guide",
    title: guide.title, metadataTitle: concise(guide.title, 60), metadataDescription: concise(guide.description, 155),
    storedAnswer: guide.answer, liveAnswer: guide.slug === "guest-post-cost",
    approved: guide.approved, cleanUrlIndexable: guide.approved, sitemapEligibleInSource: guide.approved,
    author: guide.author || null, reviewer: guide.reviewer || null, publishedAt: guide.publishedAt || null,
    updatedAt: guide.updatedAt, sourcesCheckedAt: guide.sourcesCheckedAt || null,
    renderedSourcesCheckedAt: guide.sourcesCheckedAt || "2026-10-09",
    articleSchemaEligible: !!buyerGuideArticleNode({ ...guide, image: "/01_guest_post_checklist.png" }),
    authoredWords: words(body(guide)).length, questionSections: guide.questions.length,
    steps: guide.steps?.length || 0, checklistItems: guide.checklist?.length || 0,
    templates: guide.templates?.length || 0, faqQuestions: guide.faq?.length || 0,
    tableRows: guide.table?.rows.length || 0, headings,
    related: guide.related || [], sources: guide.sources,
    flags: [
      ...(!guide.author ? ["Missing supplied author"] : []),
      ...(!guide.reviewer ? ["No named reviewer; not automatically a defect"] : []),
      ...(!guide.publishedAt ? ["Missing supplied original publication date"] : []),
      ...(!guide.sourcesCheckedAt ? ["Template supplies fallback source-check date without a per-guide record"] : []),
      ...(!guide.answer && guide.slug !== "guest-post-cost" ? ["Missing direct answer"] : []),
      ...(guide.questions.length < 3 ? ["Fewer than three authored question sections; inspect depth manually"] : []),
      ...(!guide.related?.length ? ["No topic-specific related links"] : []),
      ...(domainGuides.some(item => item.slug === guide.slug) ? ["Shared closing CTA promotes guest-post inventory on a domain-planning guide"] : []),
      ...(guide.table && guide.table.rows.some(row => row.length !== guide.table!.columns.length) ? ["Table column mismatch"] : []),
    ],
  };
});
const similarities: Array<{ a: string; b: string; fiveWordShingleJaccard: number }> = [];
const sets = buyerGuides.map(guide => shingles(body(guide)));
for (let a = 0; a < records.length; a++) for (let b = a + 1; b < records.length; b++)
  similarities.push({ a: records[a].path, b: records[b].path, fiveWordShingleJaccard: Number(jaccard(sets[a], sets[b]).toFixed(4)) });
similarities.sort((a, b) => b.fiveWordShingleJaccard - a.fiveWordShingleJaccard);
const sourceFrequency = new Map<string, number>();
for (const record of records) for (const url of new Set(record.sources.map(([, url]) => url))) sourceFrequency.set(url, (sourceFrequency.get(url) || 0) + 1);
const report = {
  auditedAt: new Date().toISOString(),
  scope: "Read-only census of every code-managed /guides/[slug]/ detail page. No content, routes, database, approval or indexing changes. Source presence is not claim-by-claim source verification.",
  total: records.length,
  approved: records.filter(record => record.approved).length,
  groupCounts: Object.fromEntries([...new Set(records.map(r => r.group))].map(group => [group, records.filter(r => r.group === group).length])),
  completeness: Object.fromEntries(["author", "reviewer", "publishedAt", "updatedAt", "sourcesCheckedAt"].map(key => [key, { present: records.filter(r => !!r[key as keyof typeof r]).length, missing: records.filter(r => !r[key as keyof typeof r]).length }])),
  articleSchemaEligible: records.filter(r => r.articleSchemaEligible).length,
  distinctSourceUrls: sourceFrequency.size,
  sourceFrequency: [...sourceFrequency].sort((a,b) => b[1] - a[1]).map(([url, pages]) => ({ url, pages })),
  similarity: {
    methodology: "Case/whitespace-normalized exact comparison; pairwise Jaccard of sets of consecutive five-word tokens from authored answer, sections, steps, checklists, templates, FAQs and tables. Excludes common site chrome, source lists, related links and CTA. Empty stored cost answer is runtime-generated, checked separately in HTML. This is lexical overlap, not proof of intent cannibalization, expertise or SEO quality.",
    pairCount: similarities.length,
    exactDuplicateTitles: duplicates(records.map(r => ({ path: r.path, value: r.metadataTitle }))),
    exactDuplicateDescriptions: duplicates(records.map(r => ({ path: r.path, value: r.metadataDescription }))),
    exactDuplicateAnswers: duplicates(records.map(r => ({ path: r.path, value: r.storedAnswer }))),
    exactDuplicateSectionBodies: duplicates(buyerGuides.flatMap(guide => guide.questions.map(section => ({ path: `/guides/${guide.slug}/`, value: section.body })))),
    repeatedHeadings: duplicates(records.flatMap(record => record.headings.map(value => ({ path: record.path, value })))),
    highestOverlapPairs: similarities.slice(0, 15),
  },
  sample: records,
};
await mkdir("reports", { recursive: true });
await writeFile("reports/guide-content-audit.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ total: report.total, groups: report.groupCounts, completeness: report.completeness, articleSchemaEligible: report.articleSchemaEligible, topOverlapPairs: similarities.slice(0, 5) }, null, 2));
