import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import {
  seoDirectoryData,
  seoCatalogue,
} from "../../lib/commerce/seo-catalogue";
import { directoryBySlug } from "../../lib/site/directories";
import { clearTtlCache } from "../../lib/cache/ttl";

const results: object[] = [];
for (const slug of [
  "saas-guest-posting-sites",
  "technology-guest-posting-sites",
  "guest-posting-sites-usa",
]) {
  clearTtlCache();
  for (let round = 1; round <= 3; round++) {
    const start = performance.now();
    try {
      const data = await seoDirectoryData(directoryBySlug(slug)!);
      const row = {
        slug,
        round,
        ms: Math.round(performance.now() - start),
        count: data.summary.count,
        rows: data.rows.length,
        bytes: Buffer.byteLength(JSON.stringify(data)),
        median: data.summary.medianCents,
        drBands: data.drBands,
        subtopics: data.subtopics.map((t) => ({
          label: t.label,
          count: t.count,
          rows: t.rows.length,
        })),
      };
      results.push(row);
      console.log(JSON.stringify(row));
    } catch (error) {
      const row = {
        slug,
        round,
        ms: Math.round(performance.now() - start),
        errorType: error instanceof Error ? error.name : "Unknown",
      };
      results.push(row);
      console.log(JSON.stringify(row));
    }
  }
}
// Reproduce the old whole-catalogue read under the same deadline, read-only.
clearTtlCache();
const start = performance.now();
try {
  const data = await seoCatalogue();
  results.push({
    slug: "whole-catalogue-before",
    ms: Math.round(performance.now() - start),
    rows: data.rows.length,
    bytes: Buffer.byteLength(JSON.stringify(data)),
  });
} catch (error) {
  results.push({
    slug: "whole-catalogue-before",
    ms: Math.round(performance.now() - start),
    errorType: error instanceof Error ? error.name : "Unknown",
  });
}
await mkdir(".local/seo-recovery", { recursive: true });
await writeFile(
  ".local/seo-recovery/directory-benchmark.json",
  JSON.stringify(results, null, 2),
);
process.exit(0);
