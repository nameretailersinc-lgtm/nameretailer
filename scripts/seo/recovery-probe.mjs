import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Read-only HTTP evidence. Never follows redirects or changes remote data.
const base = process.env.SEO_BASE_URL || "https://nameretailer.com";
const output =
  process.env.RECOVERY_OUTPUT || ".local/seo-recovery/production-baseline";
const paths = [
  "/guest-posting-sites/",
  "/saas-guest-posting-sites/",
  "/technology-guest-posting-sites/",
  "/guides/vet-a-guest-post-site/",
  "/blog/a-responsive-article-page-qa-checklist/",
  "/marketing-guest-posting-sites/",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/ads.txt",
  "/app-ads.txt",
  "/feed/",
  "/comments/feed/",
  "/.well-known/apple-app-site-association",
  "/hello-world/",
  "/2824-2/",
  "/category/uncategorized/",
  "/product/link-purchase/",
  "/guest-post-sites-by-domain-rating-why-dr-matters-link-building-2/",
  "/da70toda80/page/92/",
  "/da90toda100/page/2/",
  "/customer-support-2/",
  "/?SA",
  "/price-50-to-100/?price_range=50-100&paged_price=1",
  "/llms.txt",
];
await mkdir(output, { recursive: true });
const results = [];
const rounds = Number(process.env.RECOVERY_ROUNDS || 3);
for (let round = 1; round <= rounds; round++) {
  for (const [index, route] of paths.entries()) {
    if (round > 1 && index > 5) continue;
    const start = performance.now();
    try {
      const response = await fetch(base + route, {
        redirect: "manual",
        signal: AbortSignal.timeout(30000),
      });
      const ttfb = Math.round(performance.now() - start);
      const body = Buffer.from(await response.arrayBuffer());
      const html = body.toString("utf8");
      const row = {
        route,
        round,
        status: response.status,
        ttfbMs: ttfb,
        totalMs: Math.round(performance.now() - start),
        bytes: body.length,
        headers: Object.fromEntries(response.headers),
        title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],
        canonical: html.match(
          /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i,
        )?.[1],
        robots: html.match(
          /<meta[^>]*name="robots"[^>]*content="([^"]+)"/i,
        )?.[1],
        publicationLinks: new Set(
          [...html.matchAll(/<a\b[^>]*href="(\/publication\/[^"#?]+)"/g)].map(
            (m) => m[1],
          ),
        ).size,
        loadingPrices: html.includes("Loading price data"),
        priceTable: html.includes("Placement price by topic"),
      };
      results.push(row);
      if (round === 1)
        await writeFile(
          path.join(
            output,
            `${index}${route.endsWith("ico") ? ".ico" : ".html"}`,
          ),
          body,
        );
      console.log(
        JSON.stringify({
          route,
          round,
          status: row.status,
          ttfbMs: ttfb,
          totalMs: row.totalMs,
          bytes: row.bytes,
          canonical: row.canonical,
          robots: row.robots,
        }),
      );
    } catch (error) {
      const row = {
        route,
        round,
        error: error.message,
        totalMs: Math.round(performance.now() - start),
      };
      results.push(row);
      console.log(JSON.stringify(row));
    }
    await writeFile(
      path.join(output, "responses.json"),
      JSON.stringify(
        { base, capturedAt: new Date().toISOString(), results },
        null,
        2,
      ),
    );
  }
}
