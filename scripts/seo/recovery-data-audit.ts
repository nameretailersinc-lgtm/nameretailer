import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { getDb } from "../../lib/db";
import { publicArticle } from "../../lib/blog/public-copy";
import { bodyText } from "../../lib/cms/content";
import type { CmsRecord } from "../../lib/cms/types";
import { buyerGuides } from "../../lib/site/buyer-guides";

// Public catalogue/content fields only. No writes, credentials or account records.
try {
  const db = await getDb();
  const records = await db
    .collection<CmsRecord>("cms_records")
    .find(
      { collection: "content" },
      {
        projection: {
          _id: 0,
          slug: 1,
          title: 1,
          status: 1,
          data: 1,
          updatedAt: 1,
        },
        maxTimeMS: 10000,
      },
    )
    .toArray();
  const products = db.collection("commerce_products");
  const [totals, descriptions, indexes] = await Promise.all([
    products
      .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }], {
        maxTimeMS: 10000,
      })
      .toArray(),
    products
      .aggregate(
        [
          {
            $match: {
              status: "active",
              "publicationContent.description": { $type: "string", $ne: "" },
            },
          },
          {
            $group: {
              _id: "$publicationContent.description",
              count: { $sum: 1 },
              domains: { $push: "$domain" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ],
        { maxTimeMS: 10000 },
      )
      .toArray(),
    products.listIndexes().toArray(),
  ]);
  const articles = records.map((record) => {
    const presented = publicArticle(record);
    const body = String(presented.data.body || "");
    return {
      slug: record.slug,
      title: presented.title,
      status: record.status,
      robotsIndex: record.data.robotsIndex,
      updatedAt: presented.updatedAt,
      words: bodyText(body).split(/\s+/).length,
      canonical: presented.data.canonical,
      headings: [...body.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/g)].map((m) =>
        bodyText(m[1]),
      ),
      legacyAssets: [
        ...JSON.stringify(record.data).matchAll(
          /(?:https?:[^\s"<>]+)?\/wp-(?:content|includes)\/[^\s"<>\\]+/g,
        ),
      ].map((m) => m[0]),
      undefinedKeyword: /\bundefined\b/.test(body),
    };
  });
  const duplicateBodies = new Map<string, string[]>();
  const paragraphs = new Map<string, Set<string>>();
  for (const record of records) {
    const body = bodyText(String(publicArticle(record).data.body || ""));
    if (body)
      duplicateBodies.set(body, [
        ...(duplicateBodies.get(body) || []),
        record.slug,
      ]);
    for (const match of String(publicArticle(record).data.body || "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      const paragraph = bodyText(match[1]).replace(/\s+/g, " ").trim();
      if (paragraph.length > 100) paragraphs.set(paragraph, new Set([...(paragraphs.get(paragraph) || []), record.slug]));
    }
  }
  const result = {
    capturedAt: new Date().toISOString(),
    totals,
    indexes: indexes.map((i) => ({ name: i.name, key: i.key })),
    articles,
    guides: buyerGuides.map(guide => ({ slug: guide.slug, title: guide.title, approved: guide.approved, updatedAt: guide.updatedAt, questions: guide.questions.length, undefinedKeyword: /\bundefined\b/.test(JSON.stringify(guide)) })),
    repeatedArticleParagraphs: [...paragraphs.entries()].filter(([, slugs]) => slugs.size > 1).map(([paragraph, slugs]) => ({ paragraph, slugs: [...slugs] })),
    duplicateArticleBodies: [...duplicateBodies.values()].filter(
      (slugs) => slugs.length > 1,
    ),
    publicationDescriptions: descriptions.map((row) => ({
      count: row.count,
      domains: row.domains.slice(0, 5),
      description: String(row._id).slice(0, 300),
    })),
    legacyContentRecords: records
      .filter((r) =>
        /hello-world|2824-2|uncategorized|link-purchase|customer-support-2/.test(
          r.slug,
        ),
      )
      .map((r) => ({ slug: r.slug, status: r.status, title: r.title })),
  };
  const directory = ".local/seo-recovery";
  await mkdir(directory, { recursive: true });
  await writeFile(
    `${directory}/${process.env.RECOVERY_DATA_PHASE === "after" ? "data-audit-after.json" : "data-audit.json"}`,
    JSON.stringify(result, null, 2),
  );
  console.log(
    JSON.stringify({
      records: records.length,
      totals,
      duplicates: result.duplicateArticleBodies.length,
      legacyAssets: articles.flatMap((a) => a.legacyAssets).length,
      responsiveArticle: articles.find((a) =>
        a.slug.includes("a-responsive-article-page"),
      ),
    }),
  );
  process.exit(0);
} catch (error) {
  console.error(
    "Read-only content audit could not complete. No data changed; connection details withheld.",
  );
  console.error(
    JSON.stringify({
      name: error instanceof Error ? error.name : "Unknown",
      code: (error as { code?: unknown })?.code,
    }),
  );
  process.exit(1);
}
