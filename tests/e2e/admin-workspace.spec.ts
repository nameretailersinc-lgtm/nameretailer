import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { actor, createDraft, fixtures, key } from "./helpers";

async function authenticate(page: Page, role: "admin" | "author" = "admin") {
  const api = await actor((await fixtures())[role]);
  await page.context().addCookies((await api.storageState()).cookies);
  await api.dispose();
}

test("workspace search finds content and the theme and sidebar controls work", async ({
  page,
}) => {
  await authenticate(page);
  const api = await actor((await fixtures()).admin);
  const draft = await createDraft(api, key("workspace-search"));
  await api.dispose();
  await page.goto("/admin/");
  await expect(
    page.getByRole("heading", { name: "Workspace overview" }),
  ).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("searchbox", { name: "Search workspace", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("searchbox", { name: "Search workspace", exact: true })
    .fill(draft.title);
  await page
    .getByRole("combobox", { name: "Search in", exact: true })
    .selectOption("content");
  await page.getByRole("button", { name: "Submit workspace search" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/content/\\?q=${encodeURIComponent(draft.title)}`),
  );
  await expect(page.getByRole("table")).toContainText(draft.title);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator(".admin-shell")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.reload();
  await expect(page.locator(".admin-shell")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".admin-shell")).toHaveAttribute(
    "data-collapsed",
    "true",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link", { name: "Content", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeHidden();
});

test("dashboard checks expand, tips change, and published cards filter the content list", async ({
  page,
}) => {
  await authenticate(page);
  await page.goto("/admin/");
  const list = page.locator("#dashboard-warning-list");
  await expect(list.getByRole("listitem")).toHaveCount(10);
  await page
    .getByRole("button", { name: "View all checks", exact: true })
    .click();
  await expect
    .poll(() => list.getByRole("listitem").count())
    .toBeGreaterThan(10);
  await page.getByRole("button", { name: "Show fewer", exact: true }).click();
  await expect(list.getByRole("listitem")).toHaveCount(10);
  const tip = page.locator(".workspace-tip h3");
  const initialTip = await tip.textContent();
  await page.getByRole("button", { name: "Next tip", exact: true }).click();
  await expect(tip).not.toHaveText(initialTip || "");
  await page.getByRole("button", { name: "Previous tip", exact: true }).click();
  await expect(tip).toHaveText(initialTip || "");
  const response = page.waitForResponse(
    (value) =>
      value.url().includes("/api/admin/dashboard/") && value.status() === 200,
  );
  await page
    .getByRole("button", { name: "Refresh dashboard", exact: true })
    .click();
  await response;
  await expect(
    page.getByRole("button", { name: "Refresh dashboard", exact: true }),
  ).toBeEnabled();
  await page
    .locator('.workspace-stat[href="/admin/content/?status=published"]')
    .click();
  await expect(
    page.getByRole("combobox", { name: "Status filter", exact: true }),
  ).toHaveValue("published");
  await page
    .getByRole("navigation", { name: "Filter content by status" })
    .getByRole("button", { name: "Draft", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Status filter", exact: true }),
  ).toHaveValue("draft");
  await expect(page).toHaveURL(/status=draft/);
});

test("mobile navigation traps keyboard focus and Escape returns to the menu button", async ({
  page,
}) => {
  await authenticate(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/admin/");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.click();
  await expect(
    page.getByRole("button", { name: "Close menu", exact: true }),
  ).toBeFocused();
  const sidebar = page.getByRole("complementary", {
    name: "Workspace sidebar",
  });
  await sidebar
    .getByRole("link", { name: "Visit website", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(
    sidebar.getByRole("link", { name: "Name Retailer workspace overview" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("author dashboard keeps navigation and quick actions within their role", async ({
  page,
}) => {
  await authenticate(page, "author");
  await page.goto("/admin/");
  await expect(page.locator(".workspace-stat")).toHaveCount(4);
  await expect(page.locator(".quick-action-grid")).toContainText(
    "Create content",
  );
  await expect(page.locator(".quick-action-grid")).not.toContainText(
    "Upload media",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link", { name: "Users", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "View all activity", exact: true }),
  ).toHaveCount(0);
});

test("dark workspace pages reflow and meet accessibility checks on desktop and mobile", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  await authenticate(page);
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  for (const width of [1536, 375]) {
    await page.setViewportSize({ width, height: 1024 });
    for (const path of [
      "/admin/",
      "/admin/content/",
      "/admin/settings/",
      "/admin/products/",
      "/admin/orders/",
    ]) {
      await page.goto(path);
      await expect(page.locator(".admin-shell")).toHaveAttribute(
        "data-theme",
        "dark",
      );
      await expect(page.locator("main .loading")).toHaveCount(0, {
        timeout: 30000,
      });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        path,
      ).toBe(false);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map((violation) => ({
          id: violation.id,
          targets: violation.nodes.map((node) => node.target),
        })),
        path,
      ).toEqual([]);
      if (path === "/admin/")
        await page.screenshot({
          path: testInfo.outputPath(`dashboard-dark-${width}.png`),
          fullPage: true,
        });
    }
  }
});
