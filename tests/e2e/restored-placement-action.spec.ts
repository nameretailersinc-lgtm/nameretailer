import { expect, test } from "@playwright/test";

for (const width of [375, 1280]) {
  test(`publication details use one restored Add to plan action at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/products/*/options/**", async route => {
      const productId = new URL(route.request().url()).pathname.split("/")[3];
      await route.fulfill({ json: { productId, productVersion: 1, domain: "https://example.com", placementCents: 10000, currency: "USD", writingOptions: [], requirements: "", turnaround: "", linkType: "" } });
    });
    await page.route("**/api/cart/**", route => route.fulfill({ status: 401, json: { error: "Sign in to continue." } }));
    await page.goto("/");
    const listing = page.locator(width === 375 ? ".marketplace-cards article" : ".marketplace-table tbody tr").first();
    await listing.getByRole("button", { name: "View Details", exact: true }).click();
    const details = page.locator(".marketplace-publication-dialog");
    await expect(details).toBeVisible();
    await expect(details.getByRole("link", { name: "Plan placement", exact: true })).toHaveCount(0);
    const action = details.getByRole("button", { name: "Add to plan", exact: true });
    await expect(action).toHaveCount(1);
    await page.screenshot({ path: `.local/restored-placement-${width}.png` });
    await action.click();
    const brief = page.getByRole("dialog", { name: "Create a placement brief", exact: true });
    await expect(brief).toBeVisible();
    await expect(brief.getByLabel("Promoted URL")).toBeVisible();
    await expect(brief.getByLabel("Keyword or anchor text")).toBeVisible();
    await expect(brief.getByRole("heading", { name: "Create Your Placement Brief", exact: true })).toBeVisible();
    await expect(page.locator(".inquiry-dialog")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(brief).toHaveCount(0);
    await expect(action).toBeFocused();
  });
}
