import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import {
  directoryListings,
  productFacets,
  publicProductStatistics,
} from "../../lib/commerce/products";
import { directoryIndexable } from "../../lib/commerce/catalogue-statistics";
import type { DirectoryFilter } from "../../lib/site/directories";

// Read-only: use the same active/committed visibility and exact field matching
// as public pages. Counts establish eligibility, not editorial quality or demand.
const candidates: Array<{ slug: string; filter: DirectoryFilter }> = [
  { slug: "guest-posting-sites-uk", filter: { country: "United Kingdom" } },
  { slug: "finance-guest-posting-sites", filter: { categories: ["Finance"] } },
  {
    slug: "real-estate-guest-posting-sites",
    filter: { categories: ["Real Estate"] },
  },
];

try {
  const facets = await productFacets();
  const rows = [];
  for (const candidate of candidates) {
    const stats = await publicProductStatistics(
      new URLSearchParams(),
      candidate.filter,
    );
    const listings = await directoryListings(candidate.filter, 5);
    const exactFieldsPresent =
      (!candidate.filter.country ||
        facets.countries.includes(candidate.filter.country)) &&
      (!candidate.filter.categories ||
        candidate.filter.categories.every((label) =>
          facets.categories.includes(label),
        ));
    rows.push({
      ...candidate,
      exactFieldsPresent,
      meetsInventoryThreshold:
        exactFieldsPresent && directoryIndexable(stats.total),
      stats,
      samples: listings.data.map(
        ({ domain, category, country, priceCents }) => ({
          domain,
          category,
          country,
          priceCents,
        }),
      ),
    });
  }
  const report = {
    checkedAt: new Date().toISOString(),
    scope:
      "Read-only configured catalogue; active listings in committed imports. Supplied categories/countries are not independently verified audiences. Editorial and demand review remain separate.",
    rows,
  };
  await mkdir("reports", { recursive: true });
  await writeFile(
    "reports/seo-directory-qualification.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      rows.map(
        ({ slug, exactFieldsPresent, meetsInventoryThreshold, stats }) => ({
          slug,
          exactFieldsPresent,
          meetsInventoryThreshold,
          total: stats.total,
        }),
      ),
      null,
      2,
    ),
  );
  process.exit(0);
} catch {
  // Connection errors can contain private connection details; keep logs generic.
  console.error(
    "Directory qualification failed. Check private database/network configuration; no inventory was changed.",
  );
  process.exit(1);
}
