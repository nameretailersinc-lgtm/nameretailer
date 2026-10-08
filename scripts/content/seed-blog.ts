import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { getDb, recordTransaction } from "../../lib/db";
import { logAudit } from "../../lib/audit";
import {
  blogLibrary,
  blogClusters,
  validateLibrary,
} from "../../lib/blog/library";
import { validateRecord, normalizeSlug } from "../../lib/cms/validation";
import type { CmsRecord, Collection } from "../../lib/cms/types";
import type { ClientSession } from "mongodb";
const args = process.argv.slice(2);
const batch = "name-retailer-original-library-v1";
const stableId = (slug: string) =>
  "nr-library-" +
  createHash("sha256")
    .update(batch + ":" + slug)
    .digest("hex")
    .slice(0, 24);
try {
  const quality = validateLibrary();
  if (args.includes("--test")) {
    const fixture = JSON.parse(await readFile(".local/e2e.json", "utf8")) as {
      database: string;
    };
    if (!/_test(?:_|$)/.test(fixture.database))
      throw new Error("Isolated test database required.");
    process.env.MONGODB_DB = fixture.database;
  }
  const db = await getDb();
  const records = db.collection<CmsRecord>("cms_records");
  const now = new Date().toISOString();
  const make = (
    collection: Collection,
    slug: string,
    title: string,
    status: string,
    data: Record<string, unknown>,
  ): CmsRecord => ({
    id: stableId(collection + ":" + slug),
    collection,
    title,
    slug,
    status,
    data,
    ownerId: "owner-authorized-cli",
    version: 1,
    createdAt: now,
    updatedAt: now,
  });
  const makeAuthor = (slug: string, name: string) =>
    make("authors", slug, name, "active", {
      entityType: "Person",
      name,
      bio: `${name} writes practical guides on guest posting, SEO, AEO and GEO for Name Retailer, a guest-post publication marketplace.`,
      url: "https://nameretailer.com/about/",
      verified: true,
    });
  const authors = [
    makeAuthor("zuhoor-uddin", "Zuhoor Uddin"),
    makeAuthor("fahad-sheikh", "Fahad Sheikh"),
  ];
  const categories = blogClusters.map((cluster) =>
    make(
      "categories",
      "journal-" + normalizeSlug("", cluster),
      cluster,
      "active",
      {
        description: `Practical ${cluster} guides for publication and content planning.`,
      },
    ),
  );
  const articles = blogLibrary.map((article, index) =>
    make("content", "blog/" + article.slug, article.title, "published", {
      type: "post",
      body: article.body,
      excerpt: article.answer,
      authorId: authors[index % authors.length].id,
      categoryIds: [
        categories.find((category) => category.title === article.cluster)!.id,
      ],
      relatedIds: blogLibrary
        .filter(
          (item) =>
            item.cluster === article.cluster && item.slug !== article.slug,
        )
        .slice(0, 3)
        .map((item) => stableId("content:blog/" + item.slug)),
      seoTitle: article.title,
      metaDescription: article.metaDescription,
      canonical: `https://nameretailer.com/blog/${article.slug}/`,
      robotsIndex: true,
      robotsFollow: true,
      schemaType: "BlogPosting",
      publishedAt: now,
      lastReviewedAt: null,
      faq: [{ question: article.question, answer: article.response }],
      sources: article.source ? [article.source] : [],
    }),
  );
  const proposed = [...authors, ...categories, ...articles];
  const ids = proposed.map((record) => record.id);
  const execute = async (session?: ClientSession) => {
    const existing = await records
      .find({}, { session, projection: { _id: 0 } })
      .toArray();
    const present = existing.filter((record) => ids.includes(record.id));
    if (present.length === proposed.length)
      return { inserted: 0, existing: articles.length };
    if (present.length)
      throw new Error(
        "Partial library requires review; existing records will not be overwritten.",
      );
    if (
      proposed.some((record) =>
        existing.some(
          (row) =>
            row.collection === record.collection && row.slug === record.slug,
        ),
      )
    )
      throw new Error("An existing slug conflicts; no content overwritten.");
    const context = [...existing, ...proposed];
    const validated = proposed.map((record) => ({
      ...record,
      ...validateRecord(record.collection, record, context, record.id),
    }));
    if (!args.includes("--commit"))
      return { inserted: 0, preview: articles.length };
    await records.insertMany(validated, { session });
    await db.collection("cms_revisions").insertMany(
      validated.map((record) => ({
        id: randomUUID(),
        recordId: record.id,
        version: 1,
        snapshot: record,
        actorId: "owner-authorized-cli",
        createdAt: now,
      })),
      { session },
    );
    await logAudit(
      "owner-authorized-cli",
      "content.seed.owner-requested",
      "content",
      batch,
      "60 original AI-assisted guides, 6 categories and legitimate organizational attribution. Preview noindex; no legacy content overwritten.",
      session,
    );
    return { inserted: articles.length, existing: 0 };
  };
  const inserted = args.includes("--commit")
    ? await recordTransaction(execute)
    : await execute();
  console.log(
    JSON.stringify({
      mode: args.includes("--commit") ? "COMMITTED" : "PREVIEW",
      ...quality,
      ...inserted,
      testDatabase: args.includes("--test"),
      legacyRecordsOverwritten: 0,
      indexingEnabled: false,
    }),
  );
  process.exit(0);
} catch {
  console.error(
    "Blog library import stopped. Details withheld; inspect validation and slug conflicts. Existing content was not overwritten.",
  );
  process.exit(1);
}
