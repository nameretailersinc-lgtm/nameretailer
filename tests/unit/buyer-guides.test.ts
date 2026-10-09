import { expect, it } from "vitest";
import { buyerGuides, costAnswer } from "@/lib/site/buyer-guides";
import { buyerGuideArticleNode } from "@/lib/seo/json-ld";
const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
it("keeps all five buyer guides approved with answer-first openings", () => {
  expect(buyerGuides).toHaveLength(5);
  for (const guide of buyerGuides) {
    expect(guide.approved).toBe(true);
    expect(guide.sources.length).toBeGreaterThan(0);
    if (guide.answer) {
      expect(words(guide.answer)).toBeGreaterThanOrEqual(40);
      expect(words(guide.answer)).toBeLessThanOrEqual(60);
    }
  }
});
it("uses real supplied cost statistics and does not fabricate missing prices", () => {
  const stats = {
    total: 10,
    minPriceCents: 1000,
    maxPriceCents: 10000,
    medianPriceCents: 5500,
    topCountries: [],
    topTopics: [],
  };
  expect(costAnswer(stats)).toContain("$55.00");
  expect(words(costAnswer(stats))).toBeGreaterThanOrEqual(40);
  expect(words(costAnswer(stats))).toBeLessThanOrEqual(60);
  expect(costAnswer({ ...stats, minPriceCents: null })).toContain(
    "no price distribution",
  );
});
it("emits Article markup only with owner-supplied author and publication date", () => {
  for (const guide of buyerGuides) {
    expect(guide.author).toBe("Zuhoor Uddin");
    expect(guide.publishedAt).toBe("2026-07-02");
    expect(guide.reviewer).toBeUndefined();
    const node = buyerGuideArticleNode({
      ...guide,
      updatedAt: "2026-10-09T00:00:00.000Z",
      image: "/x.png",
    });
    expect(node).toMatchObject({
      "@type": "Article",
      author: { "@type": "Person", name: "Zuhoor Uddin" },
      datePublished: "2026-07-02",
    });
    expect(
      buyerGuideArticleNode({
        ...guide,
        author: undefined,
        updatedAt: "2026-10-09T00:00:00.000Z",
        image: "/x.png",
      }),
    ).toBeNull();
  }
});
