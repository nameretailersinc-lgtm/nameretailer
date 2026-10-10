import { expect, it } from "vitest";
import { finishedCopy, finishedHtml, unfinishedCopy } from "@/lib/site/public-copy";
import { buyerQuestions } from "@/lib/site/faq";
import { blogLibrary } from "@/lib/blog/library";

it("gives buyer questions a direct 40–60 word answer and supporting detail", () => {
  for (const question of buyerQuestions) {
    const words = question.answer.split(/\s+/).length;
    expect(words, question.question).toBeGreaterThanOrEqual(40);
    expect(words, question.question).toBeLessThanOrEqual(60);
    expect(question.detail).not.toBe("");
    expect(JSON.stringify(question)).not.toMatch(unfinishedCopy);
  }
});

it("keeps unfinished-product copy out of seed presentation while retaining identities", () => {
  for (const article of blogLibrary) {
    const { slug, source, ...copy } = article;
    expect(slug).not.toBe("");
    expect(JSON.stringify(copy), slug).not.toMatch(unfinishedCopy);
    if (source) expect(source.url).toMatch(/^https:\/\//);
  }
});

it("corrects visible historical CMS copy without altering links or markup", () => {
  expect(
    finishedHtml('<p>Compare the preview.</p><a href="/preview/">Draft</a>'),
  ).toBe('<p>Compare the result.</p><a href="/preview/">manuscript</a>');
});

it('replaces obsolete site-status claims with general indexing guidance',()=>{const text=finishedCopy('This rebuild remains noindex during development; canonical metadata does not override that restriction or activate a migration. This rebuild keeps public previews noindex until the migration and editorial release are approved.');expect(text).not.toMatch(/Name Retailer.*noindex|remains noindex|until the migration/);expect(text).toContain('canonical metadata serve separate purposes');});
