import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
        page
          .getByRole("main")
          .getByRole("region", { name: "Analytics preferences" }),
      ).toContainText(choice === "granted" ? "accepted" : "declined");
      await page.reload();
      await expect(
        page
          .getByRole("main")
          .getByRole("region", { name: "Analytics preferences" }),
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
      page
        .getByRole("main")
        .getByRole("region", { name: "Analytics preferences" }),
    ).toContainText("declined");
  });

  test("does not serve an unhydrated consent banner with inactive buttons", async ({
    request,
  }) => {
    const response = await request.get("/cookies/");
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain(
      'aria-label="Optional analytics"',
    );
  });

  test("keyboard choices can be changed from the cookie preferences panel", async ({
    page,
  }) => {
    await page.goto("/cookies/");
    const banner = page.getByRole("complementary", {
      name: "Optional analytics",
    });
    await banner.getByRole("button", { name: "Decline analytics" }).focus();
    await page.keyboard.press("Enter");
    await expect(banner).toHaveCount(0);
    const panel = page
      .getByRole("main")
      .getByRole("region", { name: "Analytics preferences" });
    const accept = panel.getByRole("button", { name: "Accept analytics" });
    const decline = panel.getByRole("button", { name: "Decline analytics" });
    await expect(decline).toHaveAttribute("aria-pressed", "true");
    await accept.focus();
    await page.keyboard.press("Enter");
    await expect(panel.getByRole("status")).toContainText("Analytics accepted");
    await expect(accept).toHaveAttribute("aria-pressed", "true");
    await decline.click();
    await expect(panel.getByRole("status")).toContainText("Analytics declined");
    await expect(decline).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('footer a[href="/cookies/#analytics-preferences"]'),
    ).toHaveText("Cookie preferences");
  });

  test("a changed choice synchronizes across tabs", async ({
    page,
    context,
  }) => {
    await context.route(
      /https:\/\/.*(?:googletagmanager|google-analytics)\.com\//,
      (route) => route.abort(),
    );
    await page.goto("/cookies/");
    const other = await context.newPage();
    try {
      await other.goto("/cookies/");
      const banner = page.getByRole("complementary", {
        name: "Optional analytics",
      });
      const otherBanner = other.getByRole("complementary", {
        name: "Optional analytics",
      });
      await expect(otherBanner).toBeVisible();
      await banner.getByRole("button", { name: "Accept analytics" }).click();
      await expect(otherBanner).toHaveCount(0);
      const preferences = other
        .getByRole("main")
        .getByRole("region", { name: "Analytics preferences" });
      await preferences
        .getByRole("button", { name: "Decline analytics" })
        .click();
      await expect(
        page
          .getByRole("main")
          .getByRole("region", { name: "Analytics preferences" }),
      ).toContainText("Analytics declined");
    } finally {
      await other.close();
    }
  });

  for (const { width, theme } of [
    { width: 320, theme: "light" },
    { width: 375, theme: "light" },
    { width: 375, theme: "dark" },
    { width: 1280, theme: "light" },
  ] as const) {
    test(`consent panel is accessible at ${width}px in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/cookies/");
      if (theme === "dark")
        await page.evaluate(() => {
          document.documentElement.dataset.siteTheme = "dark";
          window.dispatchEvent(new Event("site-theme-change"));
        });
      const banner = page.getByRole("complementary", {
        name: "Optional analytics",
      });
      await expect(banner).toBeVisible();
      await expect(
        banner.getByRole("heading", { name: "Your privacy, your choice" }),
      ).toBeVisible();
      await expect(
        banner.getByRole("link", { name: "Cookie preferences" }),
      ).toHaveAttribute("href", "/cookies/#analytics-preferences");
      const bounds = await banner.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const scan = await new AxeBuilder({ page })
        .include(".analytics-consent")
        .include("#analytics-preferences")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((violation) => ({
          id: violation.id,
          targets: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
      await banner.screenshot({
        path: testInfo.outputPath(`consent-${theme}-${width}.png`),
      });
    });
  }
});
