import { mkdir, readFile, writeFile } from "node:fs/promises";
import { technicalArticleSlugs } from "../../lib/blog/indexing-policy";

// Builds reports/blog-triage.csv from BLOG_AUDIT.md. No article is deleted, merged or
// redirected. `traffic` and `backlinks` stay blank for the owner to fill from Search
// Console and Ahrefs before deciding to keep, merge or redirect.
const offIntentSlugs: Record<string, string> = {
  "a-content-experiment-log-that-records-confounders":
    "Internal content-team experiment log, not a guest-post buying question",
  "a-geo-experiment-brief-with-a-useful-stopping-rule":
    "Internal GEO experiment planning, not a guest-post buying question",
};
const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
const source = await readFile("BLOG_AUDIT.md", "utf8");
const lines = [
  "url,title,topic_category,off_intent,off_intent_reason,audit_recommendation,indexable_in_code,traffic,backlinks,owner_decision",
];
let count = 0;
for (const match of source.matchAll(
  /^\| \[([^\]]+)\]\((\/blog\/([^)]+?)\/)\) \| ([^|]+?) \| ([^|]+?) \|/gm,
)) {
  const [, title, url, slug, cluster, recommendation] = match;
  const technical = technicalArticleSlugs.has(`blog/${slug}`);
  const reason = technical
    ? "Site-implementation or migration topic; not aimed at guest-post buyers"
    : offIntentSlugs[slug] || "";
  lines.push(
    [
      url,
      quote(title),
      cluster,
      reason ? "true" : "false",
      quote(reason),
      recommendation,
      technical ? "false" : "true",
      "",
      "",
      "",
    ].join(","),
  );
  count++;
}
if (count !== 60) throw new Error(`Expected 60 articles, found ${count}.`);
await mkdir("reports", { recursive: true });
await writeFile("reports/blog-triage.csv", lines.join("\n") + "\n");
console.log(`Wrote ${count} articles to reports/blog-triage.csv`);
