import assert from "node:assert/strict";
import { withProductionServer, pageHtml } from "./server";
await withProductionServer(async base => {
  for (const [source, target] of [["/home/", "/"], ["/products/", "/"], ["/contact-us/", "/contact/"]]) {
    const response = await fetch(base + source, {redirect: "manual"});
    assert.equal(response.status, 301, source);
    assert.equal(new URL(response.headers.get("location")!, base).pathname, target);
  }
  for (const [path, canonical, index] of [["/?sort=priceAsc", "/", false], ["/?q=business", "/", false], ["/?pageSize=50", "/", false], ["/?page=1", "/", true], ["/?page=2", "/?page=2", true], ["/?page=10000", "/?page=10000", false], ["/blog/?q=SEO", "/blog/", false], ["/policies/", "/policies/", false], ["/site-map/", "/site-map/", false]] as const) {
    const html = await pageHtml(base, path);
    assert(html.includes(`href="https://nameretailer.com${canonical.replaceAll("&", "&amp;")}"`), `${path}: canonical missing`);
    assert(new RegExp(`<meta name="robots" content="${index ? "index" : "noindex"}, follow`).test(html), `${path}: wrong indexing`);
  }
  const html = await pageHtml(base, "/blog/");
  const id = html.match(/<option value="([^"]+)"[^>]*>AEO<\/option>/)?.[1];
  assert(id, "AEO category missing");
  const old = await fetch(`${base}/blog/?category=${id}`, {redirect: "manual"});
  assert.equal(old.status, 301);
  assert.equal(new URL(old.headers.get("location")!, base).pathname, "/blog/category/aeo/");
  assert((await fetch(`${base}/blog/category/aeo/`)).ok);
  const robots = await pageHtml(base, "/robots.txt");
  assert(robots.includes("Disallow: /custom-login/"));
  assert(!robots.includes("Disallow: /_next"));
  const sitemap = await pageHtml(base, "/sitemap.xml");
  for (const path of ["/home/", "/products/", "/cart/", "/policies/", "/site-map/"]) assert(!sitemap.includes(`https://nameretailer.com${path}</loc>`), `${path}: excluded URL in sitemap`);
  console.log("Canonical, pagination, facet, category redirect, robots and sitemap checks passed.");
});
