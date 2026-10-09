import { cache } from "react";
import { getDb } from "../db";
import type { CmsRecord } from "../cms/types";
export const categorySlug = (category: Pick<CmsRecord, "slug">) =>
  category.slug.replace(/^journal-/, "");
export const blogCategories = cache(async () =>
  (await getDb())
    .collection<CmsRecord>("cms_records")
    .find(
      {
        collection: "categories",
        status: { $in: ["active", "published"] },
        slug: { $regex: "^journal-" },
      },
      { projection: { _id: 0 } },
    )
    .sort({ title: 1 })
    .toArray(),
);
export async function findBlogCategory(value: string) {
  return (await blogCategories()).find(
    (category) => category.id === value || categorySlug(category) === value,
  );
}
