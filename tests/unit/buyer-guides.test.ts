import { expect, it } from "vitest";
import { buyerGuides, costAnswer } from "@/lib/site/buyer-guides";
const words=(text:string)=>text.split(/\s+/).filter(Boolean).length;
it("keeps all five buyer scaffolds unapproved with answer-first openings", () => {
  expect(buyerGuides).toHaveLength(5);
  for(const guide of buyerGuides) {
    expect(guide.approved).toBe(false);
    expect(guide.sources.length).toBeGreaterThan(0);
    if(guide.answer) {expect(words(guide.answer)).toBeGreaterThanOrEqual(40); expect(words(guide.answer)).toBeLessThanOrEqual(60);}
  }
});
it("uses real supplied cost statistics and does not fabricate missing prices", () => {
  const stats={total:10,minPriceCents:1000,maxPriceCents:10000,medianPriceCents:5500,topCountries:[],topTopics:[]};
  expect(costAnswer(stats)).toContain("$55.00");
  expect(words(costAnswer(stats))).toBeGreaterThanOrEqual(40);
  expect(words(costAnswer(stats))).toBeLessThanOrEqual(60);
  expect(costAnswer({...stats,minPriceCents:null})).toContain("no price distribution");
});
