import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { validateJsonLd } from "../../lib/seo/validate-jsonld";

const paths = [
  "/",
  "/guest-post-prices/",
  "/how-to-buy-links/",
  "/guides/guest-post-cost/",
  "/guides/da-vs-dr-and-traffic/",
  "/guides/vet-a-guest-post-site/",
];

for (const width of [375, 1280]) {
  test(`commercial content and buyer guides stay accessible and canonical at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    const rows: Record<string, unknown>[] = [];
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    await page.setViewportSize({ width, height: 1000 });
    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("h1:visible"), path).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://nameretailer.com${path}`,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "index, follow",
      );
      const title = await page.title();
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description).toBeTruthy();
      expect(description!.length).toBeLessThanOrEqual(155);
      expect(titles.has(title), path).toBe(false);
      expect(descriptions.has(description!), path).toBe(false);
      titles.add(title);
      descriptions.add(description!);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        title,
      );
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
        "content",
        title,
      );
      if (path === "/")
        await expect(page.locator("h1")).toHaveText(
          "Find Guest Posting Sites & Direct Guest Post Placements",
        );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path,
      ).toBe(true);
      const schema = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      for (const text of schema)
        expect(validateJsonLd(JSON.parse(text), path), path).toEqual([]);
      if (path.startsWith("/guides/")) {
        const article = schema
          .map((text) => JSON.parse(text))
          .find((node) => node["@type"] === "Article");
        expect(article, path).toMatchObject({
          datePublished: "2026-07-02",
          dateModified: "2026-10-18",
        });
        await expect(page.locator('time[datetime="2026-10-18"]')).toBeVisible();
      }
      const violations = (
        await new AxeBuilder({ page }).include("main").analyze()
      ).violations;
      expect(violations, path).toEqual([]);
      rows.push(
        await page.evaluate(
          (route) => ({
            path: route,
            canonical: document.querySelector<HTMLLinkElement>(
              'link[rel="canonical"]',
            )?.href,
            title: document.title,
            description: document.querySelector<HTMLMetaElement>(
              'meta[name="description"]',
            )?.content,
            headings: Array.from(
              document.querySelectorAll("main h1, main h2, main h3"),
              (node) => ({
                level: node.tagName,
                text: node.textContent?.trim(),
              }),
            ),
            internalLinks: [
              ...new Set(
                Array.from(
                  document.querySelectorAll<HTMLAnchorElement>("main a[href]"),
                  (link) => link.getAttribute("href"),
                ).filter((href) => href?.startsWith("/")),
              ),
            ],
          }),
          path,
        ),
      );
    }
    if (width === 1280) {
      await mkdir("reports", { recursive: true });
      await writeFile(
        "reports/seo-sprint2-pages.json",
        JSON.stringify(
          {
            checkedAt: new Date().toISOString(),
            scope:
              "Local production build only; not deployed metadata or Google indexing evidence",
            rows,
          },
          null,
          2,
        ) + "\n",
      );
    }
  });
}

test("cost examples, related guides and query exclusions are usable without fabricated data", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  await page.goto("/guides/guest-post-cost/");
  const example = page.getByRole("table", {
    name: "How much does a guest post cost? comparison",
  });
  await expect(example).toContainText("Hypothetical amount");
  await expect(example).toContainText("$75");
  await expect(page.getByText(/These are hypothetical inputs/)).toBeVisible();
  const destinations = await page
    .locator("main a[href^='/']")
    .evaluateAll((links) => [
      ...new Set(
        links.map((node) => new URL((node as HTMLAnchorElement).href).pathname),
      ),
    ]);
  for (const path of destinations)
    expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(
      200,
    );
  await page
    .getByRole("link", {
      name: "Compare guest post pricing by niche",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/guest-post-prices\/$/);
  await expect(
    page.getByRole("heading", { name: "How to compare guest post prices" }),
  ).toBeVisible();
  await expect(page.locator('time[datetime="2026-10-18"]')).toBeVisible();
  const xml = await (await request.get("/sitemaps/static-0.xml")).text();
  const priceEntry = xml.match(
    /<url><loc>https:\/\/nameretailer\.com\/guest-post-prices\/<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/,
  );
  expect(priceEntry).not.toBeNull();
  expect(Date.parse(priceEntry![1])).toBeGreaterThanOrEqual(
    Date.parse("2026-10-18"),
  );
  for (const path of [
    "/?category=Technology",
    "/guest-post-prices/?q=cost",
    "/how-to-buy-links/?utm_source=qa",
    "/guides/guest-post-cost/?q=cost",
  ]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://nameretailer.com" + path.split("?")[0],
    );
  }
});
