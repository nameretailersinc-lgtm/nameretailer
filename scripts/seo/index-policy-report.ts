import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { catalogueSummary } from "../../lib/commerce/catalogue-summary";
import { directoryIndexable } from "../../lib/commerce/catalogue-statistics";
import { marketplaceRanges } from "../../lib/commerce/marketplace-ranges";
import { directories } from "../../lib/site/directories";
import {
  activePublicationFilter,
  profileSitemapEntries,
} from "../../lib/commerce/publication-profiles";
import { productStore } from "../../lib/commerce/products";
import { publicationPath } from "../../lib/commerce/publication-pages";
import {
  MIN_INDEXABLE_LISTINGS,
  MIN_INDEXABLE_WORDS,
  rangeCopy,
} from "../../lib/site/range-copy";

// Logs which directory and metric-range pages the code indexes (`index, follow`, in the
// sitemap) and which are `noindex, follow`, using the same rule functions as the site.
// No judgment on search demand: check impressions in Search Console afterwards.
const lines = ["slug,type,listings,intro_words,indexable,reason"];
const catalogue = await catalogueSummary("").catch(() => null);
for (const range of marketplaceRanges) {
  const stats = await catalogueSummary(
    new URLSearchParams(range.bounds).toString(),
  ).catch(() => null);
  const copy = rangeCopy(range, stats, catalogue);
  const words = copy.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  const reason = copy.indexable
    ? "meets listing and copy thresholds"
    : !stats || stats.total < MIN_INDEXABLE_LISTINGS
      ? `fewer than ${MIN_INDEXABLE_LISTINGS} listings`
      : `fewer than ${MIN_INDEXABLE_WORDS} words of intro copy`;
  lines.push(
    [
      range.slug,
      "metric-range",
      stats?.total ?? 0,
      words,
      copy.indexable,
      reason,
    ].join(","),
  );
}
for (const directory of directories) {
  const stats = await catalogueSummary("", directory.slug).catch(() => null);
  const ok = !!stats && directoryIndexable(stats.total);
  lines.push(
    [
      directory.slug,
      "directory",
      stats?.total ?? 0,
      "",
      ok,
      ok ? "meets listing threshold" : "below listing threshold",
    ].join(","),
  );
}
if (process.argv.includes("--publications")) {
  const eligible = new Set(
    (await profileSitemapEntries()).map(publicationPath),
  );
  const { products } = await productStore();
  const rows = await products
    .find(await activePublicationFilter(), {
      projection: { _id: 0, id: 1, domain: 1 },
    })
    .toArray();
  const seen = new Set<string>();
  for (const row of rows) {
    const path = publicationPath(row);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const indexable = eligible.has(path);
    lines.push(
      [
        path,
        "publication",
        1,
        "",
        indexable,
        indexable
          ? "meets shared publication completeness rule"
          : "below publication completeness rule",
      ].join(","),
    );
  }
}
await mkdir("reports", { recursive: true });
await writeFile("reports/index-policy.csv", lines.join("\n") + "\n");
const indexable = lines.filter((line) => line.includes(",true,")).length;
console.log(
  `${lines.length - 1} pages: ${indexable} indexable, ${lines.length - 1 - indexable} noindex.`,
);
process.exit(0);
