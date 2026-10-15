import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const paths = ["/domain-names/", "/domain-length-checker/", "/guides/choose-a-domain-name/", "/guides/buy-and-register-a-domain-name/", "/guides/domain-name-seo-and-migrations/"];
for (const width of [320, 768, 1280]) {
  test(`domain resources render accessible content at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://nameretailer.com${path}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /\bindex\b/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const text of await page.locator('script[type="application/ld+json"]').allTextContents()) expect(() => JSON.parse(text)).not.toThrow();
      expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
    }
  });
}
test("checks internationalized names and reports invalid input without making lookups", async ({ page }) => {
  await page.goto("/domain-length-checker/");
  const requests: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/tools/")) requests.push(request.url()); });
  await page.getByLabel("Domain name", { exact: true }).fill("bücher.de");
  await page.getByRole("button", { name: "Check length" }).click();
  await expect(page.getByText("xn--bcher-kva.de", { exact: true })).toBeVisible();
  await expect(page.getByText(/16 ASCII characters including dots/)).toBeVisible();
  await page.getByLabel("Domain name", { exact: true }).fill("https://example.com/path");
  await page.getByRole("button", { name: "Check length" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Enter a domain only");
  expect(requests).toEqual([]);
  await page.goto("/domain-length-checker/?q=example");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
