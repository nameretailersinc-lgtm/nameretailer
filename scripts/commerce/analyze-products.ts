import { readFile } from "node:fs/promises";
import { analyzeProductCsv } from "../../lib/commerce/csv";

const filename = process.argv[2];
if (!filename)
  throw new Error(
    "Usage: node --import tsx scripts/commerce/analyze-products.ts <private CSV path>",
  );
const csv = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
  await readFile(filename),
);
const analysis = analyzeProductCsv(csv);
const metricUnavailable = Object.fromEntries(
  [
    "da",
    "dr",
    "tf",
    "ur",
    "traffic",
    "referringDomains",
    "backlinks",
    "spamScore",
  ].map((key) => [
    key,
    analysis.products.filter(
      (product) =>
        product.metrics[key as keyof typeof product.metrics] === null,
    ).length,
  ]),
);
// Do not print private source fields, account data or marketing copy.
console.log(
  JSON.stringify(
    {
      rows: analysis.rows,
      valid: analysis.valid,
      skipped: analysis.skipped,
      errors: analysis.errors,
      warnings: analysis.warnings,
      sha256: analysis.sha256,
      fatal: analysis.fatal,
      issueCounts: analysis.issueCounts,
      eligibleSummary: {
        distinctCountries: new Set(
          analysis.products.map((product) => product.country).filter(Boolean),
        ).size,
        distinctLanguages: new Set(
          analysis.products.map((product) => product.language).filter(Boolean),
        ).size,
        distinctCategories: new Set(
          analysis.products.map((product) => product.category).filter(Boolean),
        ).size,
        meaningfulPaths: analysis.products.filter(
          (product) => new URL(product.domain).pathname !== "/",
        ).length,
        metricUnavailable,
      },
      issues: process.argv.includes("--summary") ? undefined : analysis.issues,
    },
    null,
    2,
  ),
);
