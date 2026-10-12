import { marketplaceQuery } from "./marketplace-query";

const homepagePagination = /^\/page\/(\d+)\/?$/;

export function marketplaceBasePath(pathname: string): string {
  return homepagePagination.test(pathname) ? "/" : pathname;
}

/** The page in the path takes precedence over a stale query parameter. */
export function marketplaceLocationQuery(
  pathname: string,
  query: string,
): string {
  const params = new URLSearchParams(query);
  const page = pathname.match(homepagePagination)?.[1];
  if (page) params.set("page", page);
  return params.toString();
}

/** Keep defaults implicit and give each homepage result page one stable URL. */
export function marketplaceHref(pathname: string, query: string): string {
  const params = new URLSearchParams(query);
  const normalized = marketplaceQuery(query);
  for (const [key, fallback] of [
    ["sort", "domain"],
    ["pageSize", "20"],
  ]) {
    if (normalized.get(key) === fallback) params.delete(key);
    else params.set(key, normalized.get(key)!);
  }
  const page = Number(normalized.get("page"));
  let path = marketplaceBasePath(pathname);
  params.delete("page");
  if (path === "/" && page > 1) path = `/page/${page}/`;
  else if (page > 1) params.set("page", String(page));
  params.sort();
  const search = params.toString();
  return path + (search ? `?${search}` : "");
}
