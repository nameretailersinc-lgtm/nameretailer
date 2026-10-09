import { withProductionServer, pageHtml } from "./server";

// Requests every URL in the sitemap and reports non-200 responses and slow pages.
// Set SEO_BASE_URL to test a running server. Exits non-zero on any failure.
const slowMs = Number(process.env.HEALTH_SLOW_MS || 3000);

await withProductionServer(async (base) => {
  const xml = await pageHtml(base, "/sitemap.xml");
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    return url.pathname + url.search;
  });
  const failures: string[] = [];
  const slow: string[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < paths.length) {
        const path = paths[next++];
        const started = Date.now();
        try {
          const response = await fetch(base + path, {
            redirect: "manual",
            signal: AbortSignal.timeout(60000),
          });
          await response.arrayBuffer();
          if (response.status !== 200)
            failures.push(`${path}: HTTP ${response.status}`);
        } catch (error) {
          failures.push(`${path}: ${String(error)}`);
        }
        const elapsed = Date.now() - started;
        if (elapsed > slowMs) slow.push(`${path}: ${elapsed}ms`);
      }
    }),
  );
  console.log(`Requested ${paths.length} sitemap URLs.`);
  if (slow.length) console.warn(`Slow (>${slowMs}ms):\n${slow.join("\n")}`);
  if (failures.length) {
    console.error(`Failures:\n${failures.join("\n")}`);
    process.exitCode = 1;
  } else console.log("All sitemap URLs returned 200.");
});
