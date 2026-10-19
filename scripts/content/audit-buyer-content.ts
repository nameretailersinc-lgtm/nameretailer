import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { blogLibrary } from "../../lib/blog/library";
import { buyerGuides } from "../../lib/site/buyer-guides";
import { mainGuideSlugs } from "../../lib/site/guide-expansions";
import { wordCount } from "../../lib/cms/content";

const articles = blogLibrary.map(article => ({ path: `/blog/${article.slug}/`, disposition: article.buyerRelevant ? "rewritten" : "noindex", words: article.words, minimum: 800, titleLength: (article.seoTitle || article.title).length, descriptionLength: article.metaDescription.length }));
const guides = buyerGuides.map(guide => ({
  path: `/guides/${guide.slug}/`, disposition: guide.approved ? "expanded" : "noindex",
  words: wordCount([guide.answer, ...guide.questions.flatMap(item => [item.title, item.body]), ...(guide.steps || []), ...(guide.checklist || []), ...(guide.templates || []).flatMap(item => [item.title, item.text]), ...(guide.faq || []).flat(), ...(guide.table ? [...guide.table.columns, ...guide.table.rows.flat()] : [])].join(" ")),
  minimum: mainGuideSlugs.has(guide.slug) ? 1200 : 800,
  titleLength: (guide.seoTitle || guide.title).length, descriptionLength: guide.description.length,
}));
const violations = [...articles, ...guides].filter(item => item.disposition !== "noindex" && (item.words < item.minimum || item.titleLength < 50 || item.titleLength > 60 || item.descriptionLength < 140 || item.descriptionLength > 160));
let publications: Record<string, unknown> | undefined;
if (process.argv.includes("--database")) {
  const { productStore } = await import("../../lib/commerce/products");
  const { activePublicationFilter, profileSitemapEntries } = await import("../../lib/commerce/publication-profiles");
  const { publicationPath } = await import("../../lib/commerce/publication-pages");
  const { products } = await productStore();
  const rows = await products.find(await activePublicationFilter(), { projection: { _id: 0, id: 1, domain: 1 } }).toArray();
  const paths = new Set(rows.map(publicationPath).filter(Boolean));
  const indexable = await profileSitemapEntries();
  publications = { activeListings: rows.length, detailPages: paths.size, indexable: indexable.length, noindex: paths.size - indexable.length };
}
await mkdir("reports", { recursive: true });
await writeFile("reports/buyer-content-audit.json", JSON.stringify({ articles, guides, violations, publications }, null, 2) + "\n");
console.log(JSON.stringify({ rewrittenBlogs: articles.filter(item => item.disposition === "rewritten").length, expandedGuides: guides.filter(item => item.disposition === "expanded").length, noindexBlogs: articles.filter(item => item.disposition === "noindex").length, noindexGuides: guides.filter(item => item.disposition === "noindex").length, violations, publications }, null, 2));
process.exit(violations.length ? 1 : 0);
