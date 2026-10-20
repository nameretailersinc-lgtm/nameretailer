import { sitemapUrlset } from "./sitemap";
import assert from "node:assert/strict";
import { withProductionServer, pageHtml } from "./server";
await withProductionServer(async (base) => {
  for (const [source, target] of [
    ["/home/", "/"],
    ["/products/", "/"],
    ["/contact-us/", "/contact/"],
    ["/?sort=domain&page=2&pageSize=20", "/page/2/"],
    ["/?page=2", "/page/2/"],
    ["/page/1/", "/"],
  ]) {
    const response = await fetch(base + source, { redirect: "manual" });
    assert.equal(response.status, 301, source);
    assert.equal(
      new URL(response.headers.get("location")!, base).pathname,
      target,
    );
  }
  for (const [path, canonical, index] of [
    ["/?sort=priceAsc", "/", false],
    ["/?q=business", "/", false],
    ["/?pageSize=50", "/", false],
    ["/?page=1", "/", true],
    ["/page/2/", "/", false],
    ["/page/2/?sort=priceAsc", "/", false],
    ["/page/2/?pageSize=50", "/", false],
    ["/blog/?q=SEO", "/blog/", false],
    ["/policies/", "/policies/", true],
    ["/site-map/", "/site-map/", true],
  ] as const) {
    const html = await pageHtml(base, path);
    assert(
      html.includes(
        `href="https://nameretailer.com${canonical.replaceAll("&", "&amp;")}"`,
      ),
      `${path}: canonical missing`,
    );
    assert(
      new RegExp(
        `<meta name="robots" content="${index ? "index" : "noindex"}, follow`,
      ).test(html),
      `${path}: wrong indexing`,
    );
  }
  const html = await pageHtml(base, "/blog/");
  const id = html.match(/<option value="([^"]+)"[^>]*>Marketplace<\/option>/)?.[1];
  assert(id, "Marketplace category missing");
  const old = await fetch(`${base}/blog/?category=${id}`, {
    redirect: "manual",
  });
  assert.equal(old.status, 301);
  assert.equal(
    new URL(old.headers.get("location")!, base).pathname,
    "/blog/category/marketplace/",
  );
  assert((await fetch(`${base}/blog/category/marketplace/`)).ok);
  const robots = await pageHtml(base, "/robots.txt");
  assert(robots.includes("Disallow: /custom-login/"));
  assert(!robots.includes("Disallow: /_next"));
  for (const key of [
    "q",
    "category",
    "country",
    "language",
    "minDa",
    "maxPrice",
  ])
    assert(
      !robots.includes("Disallow: /*?*" + key + "="),
      key + ": noindex must be crawlable",
    );
  for (const key of ["sort", "pageSize"])
    assert(
      !robots.includes("Disallow: /*?*" + key + "="),
      key + ": redirects and noindex must be crawlable",
    );
  const pagination = await pageHtml(base, "/page/2/");
  assert(
    /<a\b[^>]*href="\/page\/3\/"/.test(pagination),
    "Next catalogue page needs a crawlable link",
  );
  for (const path of ["/page/invalid/", "/page/10000/"])
    assert.equal(
      (await fetch(base + path, { headers: { "user-agent": "Googlebot" } }))
        .status,
      404,
      path,
    );
  const sitemap = await sitemapUrlset(base);
  for (const path of ["/home/", "/products/", "/cart/"])
    assert(
      !sitemap.includes(`https://nameretailer.com${path}</loc>`),
      `${path}: excluded URL in sitemap`,
    );
  console.log(
    "Canonical, pagination, facet, category redirect, robots and sitemap checks passed.",
  );
});
