import { expect, it } from "vitest";
import { blogLibrary } from "@/lib/blog/library";
import { publicArticle } from "@/lib/blog/public-copy";
import { buyerArticleAuthor } from "@/lib/blog/editorial";
import { blogSitemapEntry } from "@/lib/blog/seo";
import { articleWithArtwork } from "@/lib/blog/artwork";
import { completeArticleSchema, faqSchema } from "@/lib/seo/structured-data";
import type { CmsRecord } from "@/lib/cms/types";

it("keeps all 30 buyer articles, public FAQs, authorship and sitemap dates consistent", () => {
  const retained = blogLibrary.filter(article => article.buyerRelevant);
  expect(retained).toHaveLength(30);
  for (const article of retained) {
    const record: CmsRecord = {
      id: article.slug, collection: "content", status: "published", slug: `blog/${article.slug}`, title: "Old CMS title",
      ownerId: "fixture", version: 1, createdAt: "2026-07-02", updatedAt: "2026-07-02",
      data: { type: "post", body: "<p>Old text</p>", publishedAt: "2026-07-02" },
    };
    const visible = publicArticle(record);
    expect(visible.title).toBe(article.seoTitle);
    expect(visible.data.body).toBe(article.body);
    const faq = faqSchema(visible) as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
    const visibleFaq = visible.data.faq as Array<{ question: string; answer: string }>;
    expect(faq.mainEntity).toHaveLength(3);
    expect(faq.mainEntity.map(item => [item.name, item.acceptedAnswer.text])).toEqual(visibleFaq.map(item => [item.question, item.answer]));
    expect(completeArticleSchema(articleWithArtwork(visible), buyerArticleAuthor)).toMatchObject({
      headline: visible.title, author: { name: "Fahad Shaikh", url: "https://nameretailer.com/authors/fahad-shaikh/" }, dateModified: "2026-10-19",
    });
    expect(blogSitemapEntry(record)).toEqual({ url: `https://nameretailer.com/blog/${article.slug}/`, lastModified: new Date("2026-10-19") });
  }
});
