import { test, expect } from "@playwright/test";

test("the HTML site map links to the retained broad traffic directory", async ({
  request,
}) => {
  const response = await request.get("/site-map/");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/500k-plus-traffic/"');
  const index = await (await request.get("/sitemap.xml")).text();
  const files = [
    ...index.matchAll(
      /<loc>https:\/\/nameretailer\.com(\/sitemaps\/publications-\d+\.xml)<\/loc>/g,
    ),
  ];
  for (const [, file] of files) {
    const xml = await (await request.get(file)).text();
    for (const [, path] of xml.matchAll(
      /<loc>https:\/\/nameretailer\.com([^<]+)<\/loc>/g,
    ))
      expect(html).toContain(`href="${path}"`);
  }
});

// Read-only: safe for a local server backed by real inventory. No account,
// payment, content, publisher or production mutation is performed.
test("public filter directives are discoverable and empty later pages return 404", async ({
  request,
}) => {
  test.setTimeout(120000);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin/");
  expect(robots).not.toContain("Disallow: /*?*");
  for (const path of [
    "/?category=Technology",
    "/?country=United+States",
    "/?sort=priceAsc",
  ]) {
    const response = await request.get(path, {
      headers: { "user-agent": "Googlebot" },
    });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html).toContain('name="robots" content="noindex, follow"');
    expect(html).toContain('rel="canonical" href="https://nameretailer.com/"');
  }
  for (const path of [
    "/guest-post-by-dr/?page=10000",
    "/dr-50-plus/?page=10000",
    "/page/10000/",
  ]) {
    const response = await request.get(path, {
      headers: { "user-agent": "Googlebot" },
    });
    expect(response.status(), path).toBe(404);
  }
  const empty = await request.get("/?q=sprint1-no-such-publisher-6f96b0", {
    headers: { "user-agent": "Googlebot" },
  });
  expect(empty.status()).toBe(200);
  expect(await empty.text()).toContain(
    'name="robots" content="noindex, follow"',
  );
});

test("clean range pagination stays canonical and filtered pagination limits crawl expansion", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/da-30-to-39/");
  const pages = page.getByRole("navigation", {
    name: "Publication result pages",
  });
  const next = pages.getByRole("link", { name: "Next page", exact: true });
  await expect(next).toHaveAttribute("href", "/da-30-to-39/?page=2");
  expect(await next.getAttribute("rel")).toBeNull();
  await next.click();
  await expect(page).toHaveURL(/\/da-30-to-39\/\?page=2$/);
  await page.reload();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://nameretailer.com/da-30-to-39/?page=2",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow",
  );
  await page.goto("/?category=Technology");
  await expect(
    page
      .getByRole("navigation", { name: "Publication result pages" })
      .getByRole("link", { name: "Next page", exact: true }),
  ).toHaveAttribute("rel", "nofollow");
});

for (const width of [375, 1280]) {
  test(`important public pages render with one visible H1 at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/guest-posting-sites/",
      "/technology-guest-posting-sites/",
      "/guest-posting-sites-usa/",
      "/guest-post-prices/",
      "/guides/guest-post-cost/",
      "/domain-length-checker/",
    ]) {
      expect((await page.goto(path))?.status(), path).toBe(200);
      await expect(page.locator("h1:visible"), path).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://nameretailer.com" + path,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        path,
      ).toBe(true);
      for (const text of await page
        .locator('script[type="application/ld+json"]')
        .allTextContents())
        expect(() => JSON.parse(text), path).not.toThrow();
    }
  });
}
