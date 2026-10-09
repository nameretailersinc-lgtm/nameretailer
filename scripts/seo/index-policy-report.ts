import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { catalogueSummary } from "../../lib/commerce/catalogue-summary";
import { directoryIndexable } from "../../lib/commerce/catalogue-statistics";
import { marketplaceRanges } from "../../lib/commerce/marketplace-ranges";
import { directories } from "../../lib/site/directories";
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
await mkdir("reports", { recursive: true });
await writeFile("reports/index-policy.csv", lines.join("\n") + "\n");
const indexable = lines.filter((line) => line.includes(",true,")).length;
console.log(
  `${lines.length - 1} pages: ${indexable} indexable, ${lines.length - 1 - indexable} noindex.`,
);
process.exit(0);
