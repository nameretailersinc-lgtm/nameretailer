import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { publicationSitemapLinks } from "../../lib/commerce/publication-profiles";
import { publicationPath } from "../../lib/commerce/publication-pages";
import { catalogueSummary } from "../../lib/commerce/catalogue-summary";
import {
  priceBreakdown,
  priceSummaryStages,
} from "../../lib/commerce/price-breakdown";
import { summarizePrices } from "../../lib/commerce/seo-catalogue";
import { allSitemapEntries } from "../../lib/seo/sitemap-entries";
import { getDb } from "../../lib/db";
const results = [];
try {
  const info = await (await getDb()).command({ buildInfo: 1 });
  console.log(JSON.stringify({ mongoVersion: info.version }));
} catch {
  console.log("MongoDB version could not be read");
}
try {
  let checks = 0;
  for (const values of [
    [0],
    [0, 1],
    [999, 1, 1],
    [0, 400, 300, 200],
    Array.from({ length: 101 }, (_, i) => (i * 137) % 3000),
  ]) {
    const response = await (
      await getDb()
    ).command({
      aggregate: 1,
      pipeline: [{ $documents: [{ values }] }, ...priceSummaryStages()],
      cursor: {},
    });
    const actual = response.cursor.firstBatch[0];
    const expected = summarizePrices(
      values.map((priceCents) => ({ priceCents })),
    );
    for (const key of [
      "count",
      "minCents",
      "maxCents",
      "medianCents",
      "lowCents",
      "highCents",
    ] as const)
      if (actual[key] !== expected[key])
        throw new Error("Exact summary mismatch");
    checks++;
  }
  console.log(
    JSON.stringify({ exactSummaryFixtureChecks: checks, success: true }),
  );
} catch {
  console.log(
    JSON.stringify({ exactSummaryFixtureChecks: "failed", success: false }),
  );
  process.exit(1);
}
for (const [name, load] of [
  ["grouped-prices", priceBreakdown],
  ["all-sitemap-entries", allSitemapEntries],
] as const) {
  const start = performance.now();
  try {
    const data = await load();
    const result = {
      name,
      ms: Math.round(performance.now() - start),
      count: Array.isArray(data) ? data.length : data.total,
      success: true,
    };
    results.push(result);
    console.log(JSON.stringify(result));
  } catch (error) {
    const message =
      error instanceof Error &&
      /^(Timed out after|Publication sitemap data|Article sitemap data)/.test(
        error.message,
      )
        ? error.message
        : "Read error; connection details withheld";
    const result = {
      name,
      ms: Math.round(performance.now() - start),
      success: false,
      message,
    };
    results.push(result);
    console.log(JSON.stringify(result));
  }
}
await writeFile(
  ".local/seo-recovery/sitemap-benchmark.json",
  JSON.stringify(results, null, 2),
);
try {
  const expected = JSON.parse(
    await readFile(".local/seo-recovery/profile-audit.json", "utf8"),
  ) as { rows: Array<{ url: string }> };
  const links = await publicationSitemapLinks();
  const before = new Set(expected.rows.map((row) => row.url));
  const after = new Set(
    links.map((row) => "https://nameretailer.com" + publicationPath(row)),
  );
  const added = [...after].filter((url) => !before.has(url)).length;
  const removed = [...before].filter((url) => !after.has(url)).length;
  const prices = await priceBreakdown();
  const stats = await catalogueSummary("");
  if (
    added ||
    removed ||
    prices.total !== stats.total ||
    prices.medianCents !== stats.medianPriceCents
  )
    throw new Error("Public data mismatch");
  console.log(
    JSON.stringify({
      publicationLinks: links.length,
      added,
      removed,
      exactCatalogueMedian: stats.medianPriceCents,
      count: stats.total,
      success: true,
    }),
  );
} catch {
  console.log(JSON.stringify({ publicDataEquivalence: false }));
  process.exit(1);
}
process.exit(0);
