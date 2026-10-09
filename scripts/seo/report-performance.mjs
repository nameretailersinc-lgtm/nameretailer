import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
const reports = [];
for (const name of await readdir(".lighthouseci")) {
  if (!name.endsWith(".json")) continue;
  const data = JSON.parse(await readFile(`.lighthouseci/${name}`, "utf8"));
  if (!data.audits) continue;
  if (data.runtimeError) throw new Error(`${name}: ${data.runtimeError.message}`);
  const value = key => {
    const measured = data.audits[key]?.numericValue;
    if (typeof measured !== "number") throw new Error(`${name}: missing ${key}`);
    return measured;
  };
  reports.push({
    url: data.finalDisplayedUrl || data.finalUrl,
    measuredAt: data.fetchTime,
    lcpMs: value("largest-contentful-paint"),
    tbtMs: value("total-blocking-time"),
    cls: value("cumulative-layout-shift"),
  });
}
if (!reports.length) throw new Error("No Lighthouse measurements found. Run collect first.");
await mkdir(".local", { recursive: true });
await writeFile(".local/performance.json", JSON.stringify(reports, null, 2) + "\n");
console.table(reports);
