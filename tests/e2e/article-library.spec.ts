import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { origin } from "./helpers";
test.setTimeout(90000);
// Read-only public-page checks. No accounts, API mutations or fixture seeding.
test.beforeAll(() => {
  expect(["http://localhost:3001", "http://localhost:3003"]).toContain(origin);
});
test("Guides exposes all 60 articles with pagination, topic filters, search and clear recovery", async ({
  page,
}) => {
  await page.goto("/guides/");
  await expect(page.locator(".journal-card")).toHaveCount(24);
  await expect(page.locator(".journal-count")).toContainText(
    "Showing 1–24 of 60 articles",
  );
  const firstTitles = await page.locator(".journal-card h3").allTextContents();
  await page.getByRole("link", { name: "Next articles", exact: true }).click();
  await expect(page).toHaveURL(/\/guides\/\?.*page=2/, { timeout: 15000 });
  await expect(page.locator(".journal-count")).toContainText(
    "Showing 25–48 of 60 articles",
    { timeout: 15000 },
  );
  await expect(page.locator(".journal-card")).toHaveCount(24);
  const nextTitles = await page.locator(".journal-card h3").allTextContents();
  expect(nextTitles.some((title) => firstTitles.includes(title))).toBe(false);
  await page.getByRole("link", { name: "Article page 3", exact: true }).click();
  await expect(page.locator(".journal-card")).toHaveCount(12);
  await expect(page.locator(".journal-count")).toContainText(
    "Showing 49–60 of 60 articles",
  );
  await page
    .getByLabel("Articles per page", { exact: true })
    .selectOption("60");
  await page
    .getByRole("button", { name: "Find articles", exact: true })
    .click();
  await expect(page.locator(".journal-card")).toHaveCount(60);
  await expect(page.locator(".journal-card-media img")).toHaveCount(60);
  const links = await page
    .locator(".journal-card h3 a")
    .evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).pathname),
    );
  expect(new Set(links).size).toBe(60);
  expect(links.every((href) => href.startsWith("/blog/"))).toBe(true);
  await page
    .getByRole("navigation", { name: "Article topics" })
    .getByRole("link", { name: "AEO", exact: true })
    .click();
  await expect(page.locator(".journal-card")).toHaveCount(10);
  await expect(page.locator(".journal-card .eyebrow").first()).toHaveText(
    "AEO",
  );
  await page
    .getByLabel("Search articles", { exact: true })
    .fill("no-match-unique-qa-title-4826");
  await page
    .getByRole("button", { name: "Find articles", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "No articles match this search" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "View all articles", exact: true })
    .click();
  await expect(page.locator(".journal-card")).toHaveCount(24);
  const title = await page.locator(".journal-card h3").first().innerText();
  const cardImage = await page
    .locator(".journal-card-media img")
    .first()
    .getAttribute("src");
  const source = new URL(cardImage!, origin).searchParams.get("url");
  expect(source).toMatch(/^\/blogs\/guide_image_\d{2}\.png$/);
  await page.locator(".journal-card h3 a").first().click();
  await expect(page).toHaveURL(/\/blog\/[^/]+\/$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title, {
    timeout: 15000,
  });
  const heroImage = page.locator(".reference-page-hero > img");
  expect(
    new URL((await heroImage.getAttribute("src"))!, origin).searchParams.get(
      "url",
    ),
  ).toBe(source);
  await expect(heroImage).toHaveAttribute("alt", /^Illustration of /);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `https://nameretailer.com${source}`,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary",
  );
  await heroImage.evaluate((image) => (image as HTMLImageElement).decode());
  expect(
    await heroImage.evaluate(
      (image) => (image as HTMLImageElement).naturalWidth > 0,
    ),
  ).toBe(true);
  await page.goto("/blog/");
  await expect(page.locator(".journal-card")).toHaveCount(12);
  await page.getByRole("link", { name: "Next articles", exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/\?.*page=2/, { timeout: 15000 });
});
for (const width of [320, 375, 768, 1280])
  test(`guide library is accessible without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/guides/");
    await expect(page.locator(".journal-card")).toHaveCount(24);
    await expect(page.locator(".journal-card-media img")).toHaveCount(24);
    const firstImage = page.locator(".journal-card-media img").first();
    await firstImage.scrollIntoViewIfNeeded();
    await firstImage.evaluate((image) => (image as HTMLImageElement).decode());
    expect(
      await firstImage.evaluate(
        (image) => (image as HTMLImageElement).naturalWidth > 0,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
