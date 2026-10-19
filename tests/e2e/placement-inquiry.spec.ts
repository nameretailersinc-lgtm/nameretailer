import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [375, 1280]) {
  test(`placement inquiry is usable and restores focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    let submission: Record<string, unknown> | undefined;
    await page.route("**/api/inquiries/", async (route) => {
      submission = route.request().postDataJSON();
      await route.fulfill({
        json: {
          success: true,
          message: "Thanks, we'll reply within 1 business day.",
        },
      });
    });
    await page.goto("/contact/");
    const trigger = page.getByRole("button", {
      name: "Request a placement",
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: "Request a placement",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Name", { exact: true }).fill("Browser test buyer");
    await dialog.getByLabel("Email", { exact: true }).fill("buyer@example.com");
    await dialog
      .getByLabel("Website URL", { exact: true })
      .fill("https://example.com/resource");
    await dialog
      .getByLabel("Target keyword / anchor", { exact: true })
      .fill("Useful resource");
    await dialog
      .getByLabel("Budget (include currency)", { exact: true })
      .fill("USD 300 total");
    await dialog
      .getByLabel("Message", { exact: true })
      .fill("Please confirm the editorial scope.");
    expect(
      (await new AxeBuilder({ page }).include(".inquiry-dialog").analyze())
        .violations,
    ).toEqual([]);
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `.local/inquiry-${width}.png` });
    await dialog
      .getByRole("button", { name: "Send placement request", exact: true })
      .click();
    await expect(dialog.getByRole("status")).toHaveText(
      "Thanks, we'll reply within 1 business day.",
    );
    expect(submission).toMatchObject({
      name: "Browser test buyer",
      websiteUrl: "https://example.com/resource",
      anchor: "Useful resource",
      budget: "USD 300 total",
      productIds: [],
      companyWebsite: "",
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}
