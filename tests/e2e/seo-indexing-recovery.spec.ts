import { test, expect } from "@playwright/test";
import { validateJsonLd } from "../../lib/seo/validate-jsonld";

const paths = [
  "/guest-posting-sites/",
  "/saas-guest-posting-sites/",
  "/technology-guest-posting-sites/",
  "/guides/vet-a-guest-post-site/",
  "/blog/a-responsive-article-page-qa-checklist/",
];

test("priority pages serve complete, eligible HTML with consistent sitemap signals", async ({
  request,
}) => {
  test.setTimeout(240000);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const xml = (
    await Promise.all(
      ["hubs", "content"].map(async (name) => {
        const response = await request.get(`/sitemaps/${name}-0.xml`);
        expect(response.status()).toBe(200);
        return response.text();
      }),
    )
  ).join("");
  for (const path of paths) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    expect(response.headers()["x-robots-tag"] || "").not.toContain("noindex");
    const html = await response.text();
    expect(html, path).toContain(
      `rel="canonical" href="https://nameretailer.com${path}"`,
    );
    expect(html, path).toContain('name="robots" content="index, follow"');
    expect(xml, path).toContain(`<loc>https://nameretailer.com${path}</loc>`);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const description =
      html.match(/name="description" content="([^"]+)"/)?.[1] || "";
    expect(title, path).toBeTruthy();
    expect(description, path).toBeTruthy();
    expect(titles.has(title), path).toBe(false);
    expect(descriptions.has(description), path).toBe(false);
    titles.add(title);
    descriptions.add(description);
    if (path.includes("guest-posting-sites") && !path.includes("guides")) {
      expect(
        html.match(/<a\b[^>]*href="\/publication\//g)?.length || 0,
        path,
      ).toBeGreaterThan(10);
      expect(html).not.toContain("Live catalogue data could not load");
    }
    if (path === paths[0]) {
      expect(html).not.toContain("Loading price data");
      expect(html).toContain("Placement price by topic");
      expect(html).not.toContain(
        "Metrics are supplied with each listing and verified",
      );
      expect(html).toContain("does not reserve a placement");
    }
    if (path === paths[4]) {
      expect(html).toContain("collapsing it is different from omitting it");
      expect(html).not.toContain(
        "hiding content on mobile viewports removes it",
      );
      expect(html).toContain('"dateModified":"2026-10-20"');
    }
    for (const match of html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ))
      expect(validateJsonLd(JSON.parse(match[1]), path), path).toEqual([]);
  }
});

for (const width of [320, 375, 1280]) {
  test(`priority pages preserve mobile layout and readable navigation at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      expect((await page.goto(path))?.status(), path).toBe(200);
      await expect(page.locator("main h1:visible"), path).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path,
      ).toBe(true);
      expect(
        await page.locator('main a[href^="/"]').count(),
        path,
      ).toBeGreaterThan(0);
    }
  });
}

test("legacy removals, matching redirects and duplicate variants use the intended status", async ({
  request,
}) => {
  for (const path of [
    "/hello-world/",
    "/2824-2/",
    "/category/uncategorized/",
    "/product/link-purchase/",
    "/da70toda80/page/92/",
    "/feed/",
    "/ads.txt",
    "/app-ads.txt",
  ])
    expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(
      404,
    );
  const redirect = await request.get("/customer-support-2/", {
    maxRedirects: 0,
  });
  expect(redirect.status()).toBe(301);
  expect(redirect.headers().location).toBe("/help-center/");
  for (const path of [
    "/site-map/?q=audit",
    "/technology-guest-posting-sites/?subtopic=Mobile",
    "/?SA",
  ]) {
    const response = await request.get(path);
    expect(await response.text(), path).toContain(
      'name="robots" content="noindex, follow"',
    );
  }
  const icon = await request.get("/favicon.ico");
  expect(icon.status()).toBe(200);
  expect([...(await icon.body()).subarray(0, 4)]).toEqual([0, 0, 1, 0]);
});
