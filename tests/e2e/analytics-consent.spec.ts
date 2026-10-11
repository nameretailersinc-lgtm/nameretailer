import { test, expect } from "@playwright/test";

test.describe("analytics consent banner", () => {
  test.beforeEach(async ({ page }) => {
    // Exercise consent without sending analytics data to Google.
    await page.route(
      /https:\/\/.*(?:googletagmanager|google-analytics)\.com\//,
      (route) => route.abort(),
    );
  });

  for (const choice of ["granted", "denied"] as const) {
    test(`${choice} closes the banner and persists after reload`, async ({
      page,
    }) => {
      await page.goto("/cookies/");
      const banner = page.getByRole("complementary", {
        name: "Optional analytics",
      });
      await expect(banner).toBeVisible();
      await page.evaluate(() => {
        Object.assign(window, {
          gtag: () => {
            throw new Error("Analytics blocked");
          },
        });
      });
      await banner
        .getByRole("button", {
          name: choice === "granted" ? "Accept analytics" : "Decline analytics",
        })
        .click();
      await expect(banner).toHaveCount(0);
      expect(
        await page.evaluate(() =>
          localStorage.getItem("nr-analytics-consent-v1"),
        ),
      ).toBe(choice);
      await expect(
        page.getByRole("region", { name: "Analytics preferences" }),
      ).toContainText(choice === "granted" ? "accepted" : "declined");
      await page.reload();
      await expect(
        page.getByRole("region", { name: "Analytics preferences" }),
      ).toContainText(choice === "granted" ? "accepted" : "declined");
      await expect(banner).toHaveCount(0);
    });
  }

  test("declining still dismisses the banner with browser storage blocked", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const originalGet = Storage.prototype.getItem;
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.getItem = function (key) {
        if (key === "nr-analytics-consent-v1")
          throw new Error("Storage blocked");
        return originalGet.call(this, key);
      };
      Storage.prototype.setItem = function (key, value) {
        if (key === "nr-analytics-consent-v1")
          throw new Error("Storage blocked");
        return originalSet.call(this, key, value);
      };
    });
    await page.goto("/cookies/");
    const banner = page.getByRole("complementary", {
      name: "Optional analytics",
    });
    await banner.getByRole("button", { name: "Decline analytics" }).click();
    await expect(banner).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Analytics preferences" }),
    ).toContainText("declined");
  });
});
