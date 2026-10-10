import { canonicalOrigin } from "../../lib/seo/metadata";
import { bodyText } from "../../lib/cms/content";
import { sitemapUrlset } from "./sitemap";
import { withProductionServer } from "./server";
import { directories } from "../../lib/site/directories";
import { marketplaceRanges } from "../../lib/commerce/marketplace-ranges";

// Requests every URL in the sitemap and reports non-200 responses and slow pages.
// Set SEO_BASE_URL to test a running server. Exits non-zero on any failure.
const slowMs = Number(process.env.HEALTH_SLOW_MS || 3000);

await withProductionServer(async (base) => {
  const xml = await sitemapUrlset(base);
  const sitemapPaths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    return url.pathname + url.search;
  });
  // Check every registered hub, including noindex hubs omitted from the sitemap.
  const paths = [
    ...new Set([
      "/",
      "/guest-posting-sites/",
      "/guest-post-marketplace/",
      "/guest-post-by-dr/",
      ...directories.map((item) => `/${item.slug}/`),
      ...marketplaceRanges.map((item) => `/${item.slug}/`),
      ...sitemapPaths,
    ]),
  ];
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
          const html = await response.text();
          if (sitemapPaths.includes(path) && response.status === 200) {
            const canonical = html.match(
              /<link rel="canonical" href="([^"]+)"/,
            );
            if (!canonical || bodyText(canonical[1]) !== canonicalOrigin + path)
              failures.push(path + ": sitemap canonical mismatch");
            if (/<meta name="robots" content="noindex/i.test(html))
              failures.push(path + ": noindex URL in sitemap");
          }
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
  console.log(
    `Requested ${paths.length} public URLs, including every registered hub.`,
  );
  if (slow.length) console.warn(`Slow (>${slowMs}ms):\n${slow.join("\n")}`);
  if (failures.length) {
    console.error(`Failures:\n${failures.join("\n")}`);
    process.exitCode = 1;
  } else console.log("All sitemap URLs returned 200.");
});
