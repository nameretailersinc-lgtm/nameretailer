import { readdir } from "node:fs/promises";
import { tools } from "../../lib/tools/catalog";
import { directories } from "../../lib/site/directories";
import { marketplaceRanges } from "../../lib/commerce/marketplace-ranges";
import { legacyRedirects } from "../../lib/seo/redirect-map";
import { buyerGuides } from "../../lib/site/buyer-guides";
import { pageHtml } from "./server";
export async function publicRoutes(base: string) {
  const paths = new Set(["/", ...buyerGuides.map(item=>`/guides/${item.slug}/`), ...tools.map(item => `/${item.slug}/`), ...directories.map(item => `/${item.slug}/`), ...marketplaceRanges.map(item => `/${item.slug}/`)]);
  for (const entry of await readdir("app", {withFileTypes: true})) {
    if (!entry.isDirectory() || /^(?:admin|api|media|my-account|cart|checkout|design-system|\[)/.test(entry.name)) continue;
    try {const files = await readdir(`app/${entry.name}`); if (files.includes("page.tsx")) paths.add(`/${entry.name}/`);} catch { /* route handler */ }
  }
  const sitemap = await pageHtml(base, "/sitemap.xml");
  for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) paths.add(new URL(match[1]).pathname);
  // Include noindex articles too, so validation is not limited to the sitemap.
  const library = await pageHtml(base, "/blog/?pageSize=60");
  for (const match of library.matchAll(/href="(\/blog\/(?:category\/)?[a-z0-9-]+\/)"/g)) paths.add(match[1]);
  for (const row of legacyRedirects) paths.delete(row.source);
  return [...paths].sort();
}
