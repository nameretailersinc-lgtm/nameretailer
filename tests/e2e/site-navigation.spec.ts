import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 1536]) {
  test(`the navbar cart opens the planning cart at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/seo-tools/");
    const cart = page.locator(".site-header").getByRole("link", {
      name: "Open planning cart",
      exact: true,
    });
    await expect(cart).toBeInViewport();
    await expect(cart).toHaveAttribute("href", "/cart/");
    await page
      .getByRole("button", { name: "Account info", exact: true })
      .click();
    await cart.click();
    await expect(page).toHaveURL(/\/cart\/$/);
    await expect(page.locator("#site-account-menu")).toHaveCount(0);
    await expect(cart).toHaveAttribute("aria-current", "page");
  });
}

test("category menus open, switch, close with Escape and link to real sections", async ({
  page,
}) => {
  await page.goto("/seo-tools/");
  const tools = page.getByRole("button", { name: "Browse tools", exact: true });
  await tools.click();
  const toolMenu = page.getByRole("region", { name: "Tool categories" });
  await expect(toolMenu).toBeVisible();
  await expect(tools).toHaveAttribute("aria-expanded", "true");
  await expect(
    toolMenu.getByRole("link", { name: "Images 9 tools" }),
  ).toHaveAttribute("href", "/seo-tools/#images");
  await page.keyboard.press("Escape");
  await expect(toolMenu).toHaveCount(0);
  await expect(tools).toBeFocused();
  await tools.click();
  await page
    .getByRole("button", { name: "Browse guides", exact: true })
    .click();
  await expect(toolMenu).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Guide topics" }),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "Guide topics" })
    .getByRole("link", { name: /Guest Posting Guides/ })
    .click();
  await expect(page).toHaveURL(/\/how-to-buy-links\/$/);
  await page.getByRole("button", { name: "Browse tools", exact: true }).click();
  await page
    .getByRole("region", { name: "Tool categories" })
    .getByRole("link", { name: "Images 9 tools" })
    .click();
  await expect(page).toHaveURL(/\/seo-tools\/#images$/);
  await expect(page.locator("#images")).toBeInViewport();
});

test("header search supports its shortcut, filtering, navigation and focus restoration", async ({
  page,
}) => {
  await page.goto("/seo-tools/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", {
    name: "Find your next useful tool",
  });
  await expect(dialog).toBeVisible();
  const search = dialog.getByRole("searchbox", {
    name: "Search tools and guides",
  });
  await expect(search).toBeFocused();
  await search.fill("webp");
  await expect(dialog.locator(".site-search-results > a")).toHaveCount(2);
  await expect(dialog.getByRole("status")).toHaveText("2 results");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Search tools and guides" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Search tools and guides" }).click();
  await search.fill("jpg");
  await dialog.getByRole("link", { name: /JPG to PNG converter/ }).click();
  await expect(page).toHaveURL(/\/jpg-to-png-converter\/$/);
});

test("account, updates and appearance controls work without leaving a menu open", async ({
  page,
}) => {
  await page.goto("/seo-tools/");
  await page.getByRole("button", { name: "Account info", exact: true }).click();
  await expect(
    page
      .locator("#site-account-menu")
      .getByRole("link", { name: "Your account" }),
  ).toHaveAttribute("href", "/my-account/");
  await expect(
    page
      .locator("#site-account-menu")
      .getByRole("link", { name: "Your planning cart" }),
  ).toHaveAttribute("href", "/cart/");
  await page.getByRole("button", { name: "Site updates" }).click();
  await expect(page.locator("#site-account-menu")).toHaveCount(0);
  await expect(page.locator("#site-updates-menu")).toContainText(
    "28 free tools",
  );
  await expect(page.locator(".site-unread-dot")).toHaveCount(0);
  await page.getByRole("heading", { level: 1 }).click();
  await expect(page.locator("#site-updates-menu")).toHaveCount(0);
  await page.getByRole("button", { name: "Use dark appearance" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-site-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Use light appearance" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Open word counter" }).click();
  await expect(
    page.getByRole("button", { name: "Use light appearance" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use light appearance" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-site-theme",
    "light",
  );
});

for (const width of [320, 768, 1280, 1536]) {
  test(`shared navbar and both menus stay accessible at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/seo-tools/");
    await page.evaluate(() => document.fonts.ready);
    for (const menu of ["closed", "tools", "guides"]) {
      if (menu !== "closed")
        await page.getByRole("button", { name: `Browse ${menu}` }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        axe.violations.map((issue) => ({
          id: issue.id,
          targets: issue.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`navbar-${menu}-${width}.png`),
      });
    }
  });
}
