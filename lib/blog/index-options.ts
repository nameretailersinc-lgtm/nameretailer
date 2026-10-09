export type ArticleSearchParams = Record<string, string | string[] | undefined>;
export const articlePageSizes = [12, 24, 60] as const;
export function articleIndexOptions(
  params: ArticleSearchParams,
  defaultSize = 24,
) {
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const category =
    typeof params.category === "string" &&
    /^[a-z0-9-]{1,128}$/.test(params.category)
      ? params.category
      : "";
  const page =
    typeof params.page === "string" && /^\d+$/.test(params.page)
      ? Math.min(10000, Math.max(1, Number(params.page)))
      : 1;
  const size =
    typeof params.pageSize === "string" ? Number(params.pageSize) : defaultSize;
  const pageSize = articlePageSizes.some((allowed) => allowed === size)
    ? size
    : defaultSize;
  return { q, category, page, pageSize };
}
export function articleIndexHref(
  path: string,
  options: ReturnType<typeof articleIndexOptions>,
  page = 1,
) {
  const query = new URLSearchParams({
    ...(options.q ? { q: options.q } : {}),
    ...(options.category && !path.startsWith("/blog/category/") ? { category: options.category } : {}),
    pageSize: String(options.pageSize),
    page: String(page),
  });
  return path + "?" + query.toString();
}
