import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { productStore } from "../../lib/commerce/products";

// Read-only report on the active publication catalogue. Nothing is changed, hidden or
// deleted. Every flag is a heuristic prompt for human review, not a verdict.
// Output: reports/inventory-quality.csv (one row per listing with at least one issue).

const genericCategories = new Set([
  "Business",
  "General",
  "All Niches",
  "Other",
]);
// A strong word in the domain name implies these category labels. Substring matching
// is crude, so only reasonably distinctive words are used.
const topicWords: Array<[RegExp, string[]]> = [
  [/health|medic|wellness|fitness|clinic|dental|pharma/, ["Health"]],
  [/beauty|makeup|skincare|cosmetic/, ["Beauty"]],
  [/fashion|apparel|clothing/, ["Fashion"]],
  [/automotive|autos|motors|truck/, ["Automobiles"]],
  [/travel|tourism|vacation/, ["Travelling"]],
  [/recipe|cooking|restaurant|foodie/, ["Food"]],
  [/finance|invest|mortgage|crypto|forex|insurance/, ["Finance"]],
  [/sports|soccer|football|cricket|tennis/, ["Sports"]],
  [/gaming|games/, ["Games"]],
  [/lawyer|attorney|legal/, ["Law"]],
  [/realestate|property|homes/, ["Real Estate"]],
  [/music|musician/, ["Music"]],
  [
    /tech|software|gadget|computer/,
    [
      "Technology",
      "Computers",
      "Gadgets",
      "Software development",
      "Web-development",
      "Internet",
    ],
  ],
];
const riskPatterns: Array<[string, RegExp]> = [
  [
    "gambling",
    /casino|poker|slots?\b|betting|bookmaker|gambl|sportsbook|lottery/,
  ],
  ["adult", /porn|xxx|escort|hentai|nsfw|sexcam|camgirl|\badult/],
  [
    "piracy",
    /torrent|warez|crack(ed|s)?\b|123movies|putlocker|fmovies|streameast|freemovies|pirate/,
  ],
  ["policy-risk", /viagra|cialis|payday|replica|essay-?writing|buy-?followers/],
];

const quote = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const hostOf = (domain: string) => {
  try {
    return new URL(domain).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return domain.toLowerCase();
  }
};
const percentile = (sorted: number[], p: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;

const { products } = await productStore();
const rows = await products
  .find(
    { status: "active" },
    {
      projection: {
        _id: 0,
        id: 1,
        domain: 1,
        category: 1,
        country: 1,
        priceCents: 1,
        metrics: 1,
        metricsUpdatedAt: 1,
      },
    },
  )
  .toArray();
const prices = rows.map((row) => row.priceCents).sort((a, b) => a - b);
const highPrice = percentile(prices, 0.99);

const counts = new Map<string, number>();
const lines = ["id,domain,category,country,price_usd,da,dr,traffic,issues"];
let withoutDate = 0;
for (const row of rows) {
  const issues: string[] = [];
  const host = hostOf(row.domain);
  const label = host.replace(/\.[a-z.]+$/, "").replace(/[^a-z0-9]/g, "");
  const { da, dr, traffic } = row.metrics;
  const usd = row.priceCents / 100;
  if (traffic === null) issues.push("missing_traffic");
  if (da === null && dr === null) issues.push("missing_da_and_dr");
  if (!("metricsUpdatedAt" in row) || !row.metricsUpdatedAt) withoutDate++;
  if (da !== null && da <= 10 && usd > 500) issues.push("low_da_high_price");
  if (dr !== null && dr <= 10 && usd > 500) issues.push("low_dr_high_price");
  if (row.priceCents >= highPrice && row.priceCents > 0)
    issues.push("price_top_1_percent");
  if (!genericCategories.has(row.category)) {
    for (const [pattern, categories] of topicWords)
      if (pattern.test(label) && !categories.includes(row.category))
        issues.push(`topic_mismatch(domain suggests ${categories[0]})`);
  }
  for (const [kind, pattern] of riskPatterns)
    if (pattern.test(label)) issues.push(`risk_${kind}`);
  if (!issues.length) continue;
  for (const issue of issues) {
    const key = issue.replace(/\(.*\)/, "");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  lines.push(
    [
      row.id,
      host,
      row.category,
      row.country,
      usd.toFixed(2),
      da ?? "",
      dr ?? "",
      traffic ?? "",
      issues.join("; "),
    ]
      .map(quote)
      .join(","),
  );
}
await mkdir("reports", { recursive: true });
await writeFile("reports/inventory-quality.csv", lines.join("\n") + "\n");
console.log(
  `Active listings: ${rows.length}; with at least one flag: ${lines.length - 1}`,
);
console.log(
  `99th-percentile price threshold: $${(highPrice / 100).toFixed(2)}`,
);
console.log(
  `Listings without a metrics measurement date (field not yet supplied): ${withoutDate}`,
);
for (const [issue, count] of [...counts].sort((a, b) => b[1] - a[1]))
  console.log(`  ${issue}: ${count}`);
console.log(
  "Wrote reports/inventory-quality.csv. No listing was changed or hidden.",
);
process.exit(0);
