import { writeFileSync } from "node:fs";
import { legacyRedirects } from "../../lib/seo/redirect-map";

// One-off seed: writes the redirects already defined in lib/seo/redirect-map.ts so the
// owner can review and extend them. Re-running overwrites docs/redirect-map.csv.
const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
const lines = ["old_url,new_url,status,notes"];
for (const { source, destination, reason } of legacyRedirects)
  lines.push([source, destination, "301", quote(reason)].join(","));
writeFileSync("docs/redirect-map.csv", lines.join("\n") + "\n");
console.log(`Wrote ${legacyRedirects.length} rows to docs/redirect-map.csv`);
