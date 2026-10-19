import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { blogLibrary } from "../../lib/blog/library";
import { buyerGuides } from "../../lib/site/buyer-guides";
import { mainGuideSlugs } from "../../lib/site/guide-expansions";
import { wordCount } from "../../lib/cms/content";
import { concise } from "../../lib/seo/page-metadata";
import { resetMailAvailable } from "../../lib/mail";

const articles = blogLibrary.map((article) => ({
  path: `/blog/${article.slug}/`,
  disposition: article.buyerRelevant ? "rewritten" : "noindex",
  words: article.words,
  minimum: 800,
  titleLength: (article.seoTitle || article.title).length,
  descriptionLength: article.metaDescription.length,
}));
const guides = buyerGuides.map((guide) => ({
  path: `/guides/${guide.slug}/`,
  disposition: guide.approved ? "expanded" : "noindex",
  words: wordCount(
    [
      guide.answer,
      ...guide.questions.flatMap((item) => [item.title, item.body]),
      ...(guide.steps || []),
      ...(guide.checklist || []),
      ...(guide.templates || []).flatMap((item) => [item.title, item.text]),
      ...(guide.faq || []).flat(),
      ...(guide.table
        ? [...guide.table.columns, ...guide.table.rows.flat()]
        : []),
    ].join(" "),
  ),
  minimum: mainGuideSlugs.has(guide.slug) ? 1200 : 800,
  titleLength: (guide.seoTitle || guide.title).length,
  descriptionLength: guide.description.length,
}));
const violations = [...articles, ...guides].filter(
  (item) =>
    item.disposition !== "noindex" &&
    (item.words < item.minimum ||
      (item.minimum === 1200 && item.words > 2000) ||
      item.titleLength < 50 ||
      item.titleLength > 60 ||
      item.descriptionLength < 140 ||
      item.descriptionLength > 160),
);
for (const guide of buyerGuides.filter((guide) => guide.approved)) {
  if (
    !guide.faq ||
    guide.faq.length < 3 ||
    guide.faq.length > 5 ||
    concise(guide.description, 155).length < 140
  )
    throw new Error(
      `Guide FAQ or rendered description needs review: ${guide.slug}`,
    );
}
// A content-only rerun preserves the dated database census rather than erasing it.
const previous = JSON.parse(
  await readFile("reports/buyer-content-audit.json", "utf8").catch(() => "{}"),
);
let publications: Record<string, unknown> | undefined = previous.publications;
let databaseArticles: Array<{ path: string; indexable: boolean }> | undefined =
  previous.databaseArticles;
if (process.argv.includes("--database")) {
  const { productStore } = await import("../../lib/commerce/products");
  const { activePublicationFilter, profileSitemapEntries } =
    await import("../../lib/commerce/publication-profiles");
  const { publicationPath } =
    await import("../../lib/commerce/publication-pages");
  const { products } = await productStore();
  console.log("Counting active publication URLs (read only).");
  const rows = await products
    .find(await activePublicationFilter(), {
      projection: { _id: 0, id: 1, domain: 1 },
    })
    .toArray();
  const paths = new Set(rows.map(publicationPath).filter(Boolean));
  console.log(
    `Loaded ${rows.length} active listings; applying the shared sitemap rule.`,
  );
  const indexable = await profileSitemapEntries();
  publications = {
    activeListings: rows.length,
    detailPages: paths.size,
    indexable: indexable.length,
    noindex: paths.size - indexable.length,
  };
}
if (process.argv.includes("--database") || process.argv.includes("--database-posts")) {
  const { getDb } = await import("../../lib/db");
  const { blogArticleIndexable } =
    await import("../../lib/blog/indexing-policy");
  const posts = await (
    await getDb()
  )
    .collection<import("../../lib/cms/types").CmsRecord>("cms_records")
    .find(
      {
        collection: "content",
        status: "published",
        "data.type": "post",
        slug: { $regex: "^blog/" },
      },
      { projection: { _id: 0, slug: 1, "data.robotsIndex": 1 } },
    )
    .toArray();
  databaseArticles = posts.map((post) => ({
    path: `/${post.slug}/`,
    indexable: blogArticleIndexable(post),
  }));
}
await mkdir("reports", { recursive: true });
await writeFile(
  "reports/buyer-content-audit.json",
  JSON.stringify(
    {
      articles,
      guides,
      violations,
      publications,
      databaseArticles,
      mailConfigured: resetMailAvailable(),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      rewrittenBlogs: articles.filter(
        (item) => item.disposition === "rewritten",
      ).length,
      expandedGuides: guides.filter((item) => item.disposition === "expanded")
        .length,
      noindexBlogs: articles.filter((item) => item.disposition === "noindex")
        .length,
      noindexGuides: guides.filter((item) => item.disposition === "noindex")
        .length,
      violations,
      publications,
    },
    null,
    2,
  ),
);
process.exit(violations.length ? 1 : 0);
