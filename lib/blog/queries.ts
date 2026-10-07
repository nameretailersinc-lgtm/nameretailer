import { cache } from "react";
import { getDb } from "@/lib/db";
import type { CmsRecord } from "@/lib/cms/types";
import { articlePageSizes } from "./index-options";
export const getBlogArticle = cache(async (slug: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 230)
    return null;
  return (await getDb()).collection<CmsRecord>("cms_records").findOne(
    {
      collection: "content",
      status: "published",
      slug: "blog/" + slug,
      "data.type": "post",
    },
    { projection: { _id: 0 } },
  );
});
export async function blogIndex(
  q: string,
  category: string,
  page: number,
  requestedSize = 12,
) {
  const pageSize = articlePageSizes.some((size) => size === requestedSize)
    ? requestedSize
    : 12;
  const records = (await getDb()).collection<CmsRecord>("cms_records");
  const base = {
    collection: "content" as const,
    status: "published",
    "data.type": "post",
    slug: { $regex: "^blog/" },
  };
  const categories = await records
    .find(
      {
        collection: "categories",
        status: { $in: ["active", "published"] },
        slug: { $regex: "^journal-" },
      },
      { projection: { _id: 0 } },
    )
    .sort({ title: 1 })
    .toArray();
  const filter = {
    ...base,
    ...(q
      ? {
          title: {
            $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        }
      : {}),
    ...(category ? { "data.categoryIds": category } : {}),
  };
  const total = await records.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(
    pages,
    Math.max(1, Number.isSafeInteger(page) ? page : 1),
  );
  const data = await records
    .find(filter, { projection: { _id: 0, "data.body": 0 } })
    .sort({ "data.publishedAt": -1, title: 1, id: 1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .toArray();
  return {
    data,
    total,
    page: currentPage,
    pageSize,
    pages,
    categories,
  };
}
export async function articleContext(article: CmsRecord) {
  const records = (await getDb()).collection<CmsRecord>("cms_records");
  const [author, related, categories] = await Promise.all([
    records.findOne(
      {
        id:
          typeof article.data.authorId === "string"
            ? article.data.authorId
            : "",
        collection: "authors",
        status: "active",
      },
      { projection: { _id: 0 } },
    ),
    records
      .find(
        {
          collection: "content",
          status: "published",
          id: {
            $in: Array.isArray(article.data.relatedIds)
              ? article.data.relatedIds
              : [],
          },
          slug: { $regex: "^blog/" },
        },
        { projection: { _id: 0, "data.body": 0 } },
      )
      .limit(3)
      .toArray(),
    records
      .find(
        {
          collection: "categories",
          id: {
            $in: Array.isArray(article.data.categoryIds)
              ? article.data.categoryIds
              : [],
          },
          status: { $in: ["active", "published"] },
        },
        { projection: { _id: 0 } },
      )
      .toArray(),
  ]);
  return { author, related, categories };
}
