import { expect, it } from "vitest";
import { buyerGuides, costAnswer } from "@/lib/site/buyer-guides";
import { mainGuideSlugs } from "@/lib/site/guide-expansions";
import { buyerGuideArticleNode } from "@/lib/seo/json-ld";
import { wordCount } from "@/lib/cms/content";
it("retains complete buyer guides with factual author attribution and useful metadata", () => {
  expect(buyerGuides.filter(guide => guide.approved)).toHaveLength(22);
  for (const guide of buyerGuides.filter(guide => guide.approved)) {
    expect(guide.author).toBe("Fahad Shaikh");
    expect(guide.sources.length).toBeGreaterThan(0);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
    expect(guide.faq!.length).toBeLessThanOrEqual(5);
    expect(guide.seoTitle!.length).toBeGreaterThanOrEqual(50);
    expect(guide.seoTitle!.length).toBeLessThanOrEqual(60);
    expect(guide.description.length).toBeGreaterThanOrEqual(140);
    expect(guide.description.length).toBeLessThanOrEqual(160);
    const text = [guide.answer, ...guide.questions.flatMap(item => [item.title, item.body]), ...(guide.steps || []), ...(guide.checklist || []), ...(guide.templates || []).flatMap(item => [item.title, item.text]), ...(guide.faq || []).flat(), ...(guide.table ? [...guide.table.columns, ...guide.table.rows.flat()] : [])].join(" ");
    expect(wordCount(text), guide.slug).toBeGreaterThanOrEqual(mainGuideSlugs.has(guide.slug) ? 1200 : 800);
    if (mainGuideSlugs.has(guide.slug)) expect(wordCount(text)).toBeLessThanOrEqual(2000);
  }
});
it("uses real dated statistics and omits missing aggregates", () => {
  const stats = { total: 10, updatedAt: "2026-10-09", minPriceCents: 1000, maxPriceCents: 10000, medianPriceCents: 5500, topCountries: [], topTopics: [] };
  expect(costAnswer(stats)).toContain("$55.00");
  expect(costAnswer({ ...stats, minPriceCents: null })).not.toContain("$55");
  expect(costAnswer({ ...stats, updatedAt: undefined })).not.toContain("$55");
});
it("emits Article markup with supplied authorship without inventing a historical publication date", () => {
  for (const guide of buyerGuides.filter(guide => guide.approved)) {
    const node = buyerGuideArticleNode({ ...guide, image: "/og/guide.png" });
    expect(node).toMatchObject({ "@type": "Article", author: { name: "Fahad Shaikh", url: "https://nameretailer.com/authors/fahad-shaikh/" }, dateModified: guide.updatedAt });
    if (!guide.publishedAt) expect(node).not.toHaveProperty("datePublished");
  }
});
it("excludes domain planning guides and leaves their unsupplied authorship empty", () => {
  const excluded = buyerGuides.filter(guide => !guide.approved);
  expect(excluded).toHaveLength(3);
  for (const guide of excluded) {
    expect(guide.author).toBeUndefined();
    expect(buyerGuideArticleNode({ ...guide, image: "/og/guide.png" })).toBeNull();
  }
});
