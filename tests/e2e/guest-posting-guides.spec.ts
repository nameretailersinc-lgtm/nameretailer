import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { guestPostingGuides } from "../../lib/site/guest-posting-guides";

test("every commissioned guide serves distinct canonical HTML with its answer and FAQs", async ({
  request,
}) => {
  test.setTimeout(180000);
  for (const guide of guestPostingGuides) {
    const path = `/guides/${guide.slug}/`;
    const response = await request.get(path, {
      headers: { "user-agent": "Googlebot" },
    });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html, path).toContain(`href="https://nameretailer.com${path}"`);
    expect(html, path).toContain('name="robots" content="index, follow"');
    expect(html, path).toContain("Common questions");
    expect(html, path).toContain(guide.questions[0].title);
    expect(html, path).not.toContain('"@type":"Article"');
  }
});

test("templates, checklists and tables stay readable on mobile and desktop", async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of [
      "guest-post-outreach-templates",
      "check-guest-post-website-traffic",
      "measure-guest-posting-results",
      "guest-posting-checklist",
    ]) {
      await page.goto(`/guides/${slug}/`);
      await expect(page.locator("h1:visible")).toHaveCount(1);
      await expect(
        page.getByRole("heading", { name: "Common questions", exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        slug,
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).analyze()).violations,
        slug,
      ).toEqual([]);
    }
    await page.goto("/guides/guest-post-outreach-templates/");
    await expect(
      page.getByRole("heading", {
        name: "Template: a sponsored-placement enquiry",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Subject: Article idea for", { exact: false }),
    ).toContainText("\n");
  }
});

test("the blank budget worksheet download is available", async ({
  request,
}) => {
  const response = await request.get("/worksheets/guest-post-budget.csv");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain(
    "Unknown costs,Scope and evidence,Primary outcome,Reporting window",
  );
});

test("the library, article supplement and sitemap expose the new content", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  await page.goto("/guides/");
  for (const guide of guestPostingGuides)
    await expect(
      page.locator(`main a[href='/guides/${guide.slug}/']`).first(),
    ).toBeVisible();
  await page.goto("/blog/a-practical-guest-post-budget-worksheet/");
  await expect(
    page.getByRole("heading", { name: "Fill in a complete placement budget" }),
  ).toBeVisible();
  await expect(
    page.locator('a[download][href="/worksheets/guest-post-budget.csv"]'),
  ).toBeVisible();
  await expect(
    page.locator('time[datetime="2026-10-18"]').first(),
  ).toBeVisible();
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const sitemap = await request.get("/sitemaps/content-0.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const guide of guestPostingGuides)
    expect(xml).toContain(
      `<loc>https://nameretailer.com/guides/${guide.slug}/</loc>`,
    );
  expect(xml).not.toContain("guest-posting-best-practices-2027");
  const entry = xml.match(
    /<url><loc>https:\/\/nameretailer\.com\/blog\/a-practical-guest-post-budget-worksheet\/<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/,
  );
  expect(entry).not.toBeNull();
  expect(Date.parse(entry![1])).toBeGreaterThanOrEqual(
    Date.parse("2026-10-18"),
  );
  await page.goto("/guides/guest-posting-checklist/?utm_source=qa");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://nameretailer.com/guides/guest-posting-checklist/",
  );
});
