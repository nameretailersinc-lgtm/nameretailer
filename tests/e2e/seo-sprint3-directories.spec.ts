import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { validateJsonLd } from "../../lib/seo/validate-jsonld";

const cases = [
  { slug: "guest-posting-sites-uk", country: "United Kingdom", category: null },
  { slug: "finance-guest-posting-sites", country: null, category: "Finance" },
  {
    slug: "real-estate-guest-posting-sites",
    country: null,
    category: "Real Estate",
  },
];

for (const width of [375, 1280]) {
  test(`specialist directories render relevant inventory and accessible content at ${width}px`, async ({
    page,
    request,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const item of cases) {
      const path = `/${item.slug}/`;
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
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
      expect(description?.length).toBeLessThanOrEqual(155);
      expect(titles.has(title)).toBe(false);
      expect(descriptions.has(description!)).toBe(false);
      titles.add(title);
      descriptions.add(description!);
      const rows = page.locator(".directory-table tbody tr");
      await expect(rows).toHaveCount(25);
      for (const row of await rows.all()) {
        const cells = row.locator("td");
        if (item.category) await expect(cells.nth(0)).toHaveText(item.category);
        if (item.country)
          await expect(cells.nth(1)).toContainText(item.country);
        await expect(cells.last()).toHaveText(/^\$[\d,.]+$/);
      }
      await expect(
        page.getByRole("heading", { name: "Further guidance and sources" }),
      ).toBeVisible();
      for (const raw of await page
        .locator('script[type="application/ld+json"]')
        .allTextContents())
        expect(validateJsonLd(JSON.parse(raw), path)).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include("main").analyze()).violations,
      ).toEqual([]);
      const links = page.locator(".directory-listings .directory-link-list a");
      for (const link of await links.all()) {
        const href = (await link.getAttribute("href"))!;
        const response = await request.get(href);
        expect(response.status(), href).toBe(200);
        const html = await response.text();
        expect(html, href).toMatch(/name="robots" content="noindex, follow"/);
        const url = new URL(href, "https://nameretailer.com");
        if (item.category)
          expect(url.searchParams.get("category")).toBe(item.category);
        if (item.country)
          expect(url.searchParams.get("country")).toBe(item.country);
      }
    }
  });
}

test("directory discovery, sitemap eligibility and query canonicals agree", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  await page.goto("/guest-posting-sites/");
  for (const { slug } of cases)
    expect(
      await page.locator(`main a[href='/${slug}/']`).count(),
    ).toBeGreaterThan(0);
  const sitemap = await (await request.get("/sitemaps/hubs-0.xml")).text();
  for (const { slug } of cases) {
    expect(sitemap).toContain(`<loc>https://nameretailer.com/${slug}/</loc>`);
    await page.goto(`/${slug}/?utm_source=qa`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://nameretailer.com/${slug}/`,
    );
  }
});
