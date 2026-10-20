import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// All sitemap pages plus recursively discovered public HTML links. A maximum
// can be supplied for diagnosis; the output explicitly records truncation.
const base = (process.env.SEO_BASE_URL || "https://nameretailer.com").replace(
  /\/$/,
  "",
);
const output =
  process.env.RECOVERY_OUTPUT || ".local/seo-recovery/production-crawl";
const maximum = Number(process.env.RECOVERY_MAX_PAGES || 20000);
const concurrency = Number(process.env.RECOVERY_CONCURRENCY || 3);
const preferred = "https://nameretailer.com";
const profileSample = Number(process.env.RECOVERY_PROFILE_SAMPLE || Infinity);
await mkdir(output, { recursive: true });
const decode = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)=(?:"([^"]*)"|'([^']*)')/g)].map((m) => [
      m[1].toLowerCase(),
      decode(m[2] ?? m[3]),
    ]),
  );
const textOnly = (html) =>
  decode(
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
const request = async (route) => {
  const start = performance.now();
  try {
    const res = await fetch(base + route, {
      redirect: "manual",
      signal: AbortSignal.timeout(route.endsWith(".xml") ? 120000 : 45000),
    });
    const ttfbMs = Math.round(performance.now() - start);
    const html = await res.text();
    return {
      route,
      status: res.status,
      location: res.headers.get("location"),
      headers: Object.fromEntries(res.headers),
      ttfbMs,
      totalMs: Math.round(performance.now() - start),
      html,
    };
  } catch (error) {
    return {
      route,
      status: 0,
      error: error.message,
      totalMs: Math.round(performance.now() - start),
      html: "",
    };
  }
};
const xml = [];
const sitemapUrls = new Map();
async function sitemap(route) {
  let row = await request(route);
  const attempts = [{ status: row.status, totalMs: row.totalMs }];
  while (row.status !== 200 && attempts.length < 3) {
    row = await request(route);
    attempts.push({ status: row.status, totalMs: row.totalMs });
  }
  const locs = [...row.html.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) =>
    decode(m[1]),
  );
  xml.push({
    route,
    status: row.status,
    urls: locs.length,
    bytes: Buffer.byteLength(row.html),
    attempts,
  });
  await writeFile(
    path.join(output, route.replaceAll("/", "_") + ".xml"),
    row.html,
  );
  if (row.html.includes("<sitemapindex")) {
    for (const loc of locs) await sitemap(new URL(loc).pathname);
  } else
    for (const entry of row.html.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = decode(entry[1].match(/<loc>(.*?)<\/loc>/)?.[1] || "");
      if (!loc) continue;
      const url = new URL(loc);
      sitemapUrls.set(url.pathname + url.search, {
        url: loc,
        sitemap: route,
        lastmod: entry[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || "",
      });
    }
}
await sitemap("/sitemap.xml");
console.log(
  JSON.stringify({ sitemapFiles: xml, sitemapUrls: sitemapUrls.size }),
);
const profiles = [...sitemapUrls.keys()].filter((route) =>
  route.startsWith("/publication/"),
);
const sampledProfiles = new Set(
  Number.isFinite(profileSample)
    ? Array.from(
        { length: Math.min(profileSample, profiles.length) },
        (_, i) =>
          profiles[
            Math.floor(
              (i * profiles.length) / Math.min(profileSample, profiles.length),
            )
          ],
      )
    : profiles,
);
const inScope = (route) =>
  !route.startsWith("/publication/") || sampledProfiles.has(route);
const queue = [
  ...new Set([
    "/",
    ...[...sitemapUrls.keys()].filter(inScope),
    "/site-map/",
    "/blog/a-responsive-article-page-qa-checklist/",
  ]),
];
const seen = new Set(queue);
const pages = [],
  edges = [],
  assets = new Set();
const assetSources = new Map();
let done = 0;
const publicPath = (route) =>
  !/^\/(?:api|admin|my-account|cart|checkout|_next|design-system|page)(?:\/|$)/.test(
    route,
  );
const assetPath = (route) =>
  /\.[a-z\d]{2,8}(?:\?|$)/i.test(route) && !route.endsWith("/");
function local(raw, source) {
  try {
    const url = new URL(raw, preferred + source);
    if (![preferred, new URL(base).origin].includes(url.origin)) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
while (queue.length && done < maximum) {
  const batch = queue.splice(0, Math.min(concurrency, maximum - done));
  const results = await Promise.all(batch.map(request));
  for (const row of results) {
    done++;
    const html = row.html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    const tags = [...html.matchAll(/<(meta|link)\b[^>]*>/gi)].map((m) => ({
      tag: m[1],
      ...attributes(m[0]),
    }));
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
    const article = main.match(
      /<article\b[^>]*class="[^"]*journal-prose[^"]*"[^>]*>([\s\S]*?)<\/article>/i,
    )?.[1];
    const jsonldErrors = [],
      types = [];
    for (const m of row.html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    )) {
      try {
        const parsed = JSON.parse(m[1]);
        const visit = (node) => {
          if (Array.isArray(node)) node.forEach(visit);
          else if (node && typeof node === "object") {
            if (node["@type"]) types.push(node["@type"]);
            Object.values(node).forEach(visit);
          }
        };
        visit(parsed);
      } catch (error) {
        jsonldErrors.push(error.message);
      }
    }
    const headings = [
      ...main.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi),
    ].map((m) => ({ level: Number(m[1]), text: textOnly(m[2]) }));
    const metadata = {
      ...row,
      html: undefined,
      title: textOnly(
        html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "",
      ),
      description: tags.find((t) => t.name === "description")?.content || "",
      canonical: tags.find((t) => t.rel === "canonical")?.href || "",
      robots: tags
        .filter((t) => ["robots", "googlebot"].includes(t.name))
        .map((t) => t.content)
        .join("; "),
      h1Count: headings.filter((h) => h.level === 1).length,
      headings,
      mainWords: textOnly(main).split(/\s+/).filter(Boolean).length,
      articleText: article ? textOnly(article) : undefined,
      jsonldErrors,
      schemaTypes: [...new Set(types)],
      inSitemap: sitemapUrls.has(row.route),
      sitemap: sitemapUrls.get(row.route)?.sitemap || "",
      lastmod: sitemapUrls.get(row.route)?.lastmod || "",
    };
    pages.push(metadata);
    for (const m of html.matchAll(
      /<a\b[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi,
    )) {
      const raw = decode(m[1] ?? m[2]);
      if (!raw || raw.startsWith("#")) continue;
      const target = local(raw, row.route);
      if (!target) continue;
      edges.push({ source: row.route, target, anchor: textOnly(m[3]) });
      if (!publicPath(target)) continue;
      if (assetPath(target)) {
        assets.add(target);
        assetSources.set(target, row.route);
        continue;
      }
      // Parameter combinations form an unbounded crawl space. Record every edge
      // but don't recursively crawl filters or expand pagination during this audit.
      // Their eligibility and behavior are checked separately as URL controls.
      if (!target.includes("?") && inScope(target) && !seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
    for (const m of html.matchAll(/<(?:img|script|link|source)\b[^>]*>/gi)) {
      const tag = attributes(m[0]);
      const raw =
        tag.src ||
        (tag.rel && /stylesheet|icon|preload/.test(tag.rel) ? tag.href : "");
      const target = raw && local(raw, row.route);
      if (target) {
        assets.add(target);
        assetSources.set(target, row.route);
      }
    }
    if (done % 50 === 0)
      console.log(
        JSON.stringify({
          crawled: done,
          queued: queue.length,
          edges: edges.length,
        }),
      );
  }
  await writeFile(
    path.join(output, "crawl.json"),
    JSON.stringify(
      {
        base,
        capturedAt: new Date().toISOString(),
        profileSample: Number.isFinite(profileSample)
          ? profileSample
          : "all sitemap profiles",
        truncated: queue.length > 0,
        remaining: queue.length,
        xml,
        sitemapUrls: [...sitemapUrls.values()],
        pages,
        edges,
      },
      null,
      2,
    ),
  );
}
const assetResults = [];
const targets = [...assets];
for (let i = 0; i < targets.length; i += concurrency) {
  for (const row of await Promise.all(
    targets.slice(i, i + concurrency).map(request),
  ))
    assetResults.push({
      route: row.route,
      status: row.status,
      error: row.error,
      source: assetSources.get(row.route),
      bytes: Buffer.byteLength(row.html),
      contentType: row.headers?.["content-type"],
    });
}
await writeFile(
  path.join(output, "assets.json"),
  JSON.stringify(assetResults, null, 2),
);
console.log(
  JSON.stringify({
    crawled: pages.length,
    remaining: queue.length,
    edges: edges.length,
    assets: assetResults.length,
    brokenAssets: assetResults.filter((a) => a.status !== 200).length,
  }),
);
