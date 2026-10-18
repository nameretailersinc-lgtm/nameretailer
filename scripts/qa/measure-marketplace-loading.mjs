import { mkdir, writeFile } from "node:fs/promises";

const base = new URL(process.env.TEST_BASE_URL || "http://127.0.0.1:3253");
if (!["localhost", "127.0.0.1", "[::1]"].includes(base.hostname))
  throw new Error("Use an isolated loopback server for this read-only measurement.");
const phase = process.argv[2];
if (!["before", "after"].includes(phase)) throw new Error("Choose before or after.");
const paths = [
  "/api/products/facets/",
  "/api/products/?page=1&pageSize=20&sort=domain",
  "/api/products/?category=Technology&pageSize=20",
  "/api/products/?country=United%20Kingdom&pageSize=20",
  "/api/products/?q=software&pageSize=20",
];
const rows = [];
for (const path of paths) {
  const samples = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    const started = performance.now();
    const response = await fetch(new URL(path, base), {
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    samples.push({
      elapsedMs: Math.round(performance.now() - started),
      total: typeof body.total === "number" ? body.total : undefined,
      facetCounts: path.includes("facets")
        ? Object.fromEntries(Object.entries(body.data).map(([key, values]) => [key, values.length]))
        : undefined,
    });
  }
  const repeatTimes = samples.slice(1).map(({ elapsedMs }) => elapsedMs).sort((a, b) => a - b);
  rows.push({ path, firstMs: samples[0].elapsedMs, repeatMedianMs: repeatTimes[1], samples });
}
await mkdir("reports", { recursive: true });
await writeFile(`reports/marketplace-loading-${phase}.json`, JSON.stringify({
  measuredAt: new Date().toISOString(),
  base: base.origin,
  scope: "Read-only local production HTTP measurements with configured remote catalogue. Four sequential requests per endpoint; includes network and database effects. Not production load testing, field CWV or ranking evidence.",
  rows,
}, null, 2) + "\n");
console.log(JSON.stringify(rows.map(({ path, firstMs, repeatMedianMs }) => ({ path, firstMs, repeatMedianMs })), null, 2));
