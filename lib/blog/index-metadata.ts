import { pageMetadata } from "../seo/page-metadata";
import { blogIndex } from "./queries";
import { articleIndexOptions, type ArticleSearchParams } from "./index-options";
import { facetMetadata } from "../seo/facets";
export async function indexMetadata(
  path: string,
  title: string,
  description: string,
  params: ArticleSearchParams,
  category = "",
) {
  const options = articleIndexOptions(
    { ...params, ...(category ? { category } : {}) },
    path === "/blog/" ? 12 : 24,
  );
  const result = await blogIndex(
    options.q,
    options.category,
    options.page,
    options.pageSize,
  );
  const unique = result.page === options.page && result.data.length > 0;
  return pageMetadata(
    {
      title: {
        absolute: title + (options.page > 1 ? ` — Page ${options.page}` : ""),
      },
      description:
        description + (options.page > 1 ? ` Page ${options.page}.` : ""),
      ...facetMetadata(path, params, unique),
    },
    path,
  );
}
