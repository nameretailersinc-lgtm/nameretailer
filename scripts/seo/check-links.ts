import { sitemapUrlset } from "./sitemap";
import { withProductionServer, pageHtml } from "./server";

// Crawls every sitemap URL, then every internal link found on those pages, and fails
// on any link that redirects or returns a non-200 status. Set SEO_BASE_URL to test a
// running server. Set LINK_CHECK_REPORT_ONLY=1 to print problems without failing.
const concurrency = 8;

async function mapLimit<T, R>(items: T[], run: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await run(items[index]);
      }
    }),
  );
  return results;
}

await withProductionServer(async (base) => {
  const sitemapIndex = await sitemapUrlset(base);
  const pages = new Set<string>();
  for (const match of sitemapIndex.matchAll(/<loc>(.*?)<\/loc>/g))
    pages.add(new URL(match[1]).pathname + new URL(match[1]).search);

  const problems: string[] = [];
  const status = async (path: string) => {
    try {
      const response = await fetch(base + path, {
        redirect: "manual",
        signal: AbortSignal.timeout(60000),
      });
      await response.arrayBuffer();
      return {
        code: response.status,
        location: response.headers.get("location"),
      };
    } catch (error) {
      return { code: 0, location: String(error) };
    }
  };

  const sources = new Map<string, string>();
  const pageList = [...pages];
  const pageResults = await mapLimit(pageList, async (path) => {
    const response = await fetch(base + path, {
      signal: AbortSignal.timeout(60000),
    }).catch(() => null);
    return {
      path,
      code: response?.status ?? 0,
      html: (await response?.text()) ?? "",
    };
  });
  for (const { path, code, html } of pageResults) {
    if (code !== 200) problems.push(`sitemap URL ${path}: HTTP ${code}`);
    for (const match of html.matchAll(/<a\s[^>]*?href="([^"]+)"/g)) {
      const raw = match[1].replaceAll("&amp;", "&");
      if (!raw.startsWith("/") || raw.startsWith("//")) continue;
      const url = new URL(raw, "http://x");
      const target = url.pathname + url.search;
      if (/^\/(?:_next|api|admin)\//.test(target)) continue;
      if (!sources.has(target)) sources.set(target, path);
    }
  }

  const targets = [...sources.keys()];
  const linkResults = await mapLimit(targets, status);
  targets.forEach((target, index) => {
    const { code, location } = linkResults[index];
    if (code !== 200)
      problems.push(
        `${target} (linked from ${sources.get(target)}): HTTP ${code}${location ? ` → ${location}` : ""}`,
      );
  });

  console.log(
    `Checked ${pageList.length} sitemap URLs and ${targets.length} distinct internal links.`,
  );
  if (problems.length) {
    console.error(problems.join("\n"));
    if (!process.env.LINK_CHECK_REPORT_ONLY)
      throw new Error(`${problems.length} link problem(s).`);
  } else
    console.log(
      "All sitemap URLs and internal links return 200 without redirects.",
    );
});
