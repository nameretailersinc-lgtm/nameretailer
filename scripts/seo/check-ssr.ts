import assert from "node:assert/strict";
import { marketplaceRanges } from "../../lib/commerce/marketplace-ranges";
import { directories } from "../../lib/site/directories";
import { withProductionServer, pageHtml, visibleHtml } from "./server";

await withProductionServer(async (base) => {
  const paths = [
    "/",
    "/guest-posting-sites/",
    "/guest-post-by-dr/",
    ...marketplaceRanges.map((range) => `/${range.slug}/`),
    ...directories.map((directory) => `/${directory.slug}/`),
  ];
  for (const path of [...paths, ...paths]) {
    const html = visibleHtml(await pageHtml(base, path));
    assert(
      !/Loading publications|Loading marketplace/.test(html),
      `${path}: loading placeholder in server HTML`,
    );
    const rows = [...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)]
      .map((match) => match[0])
      .filter(
        (row) =>
          /href="(?:https?:\/\/nameretailer\.com)?\/publication\//.test(row) &&
          /\$[\d,]+(?:\.\d{2})?/.test(row),
      );
    assert(
      rows.length > 0,
      `${path}: no server-rendered publication link and USD price (check active catalogue)`,
    );
    if (path === "/")
      assert(rows.length >= 20, `${path}: fewer than 20 initial listings`);
    console.log(
      `${path}: ${rows.length} publication rows with prices in raw HTML`,
    );
  }
});
