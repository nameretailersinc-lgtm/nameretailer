import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { marketplaceGroups } from "../../lib/commerce/marketplace-ranges";

async function openMenu(page: Page) {
  const trigger = page.getByRole("button", {
    name: "Browse marketplace",
    exact: true,
  });
  await trigger.click();
  const menu = page.getByRole("region", {
    name: "Marketplace ranges",
    exact: true,
  });
  await expect(menu).toBeVisible();
  return { trigger, menu };
}

for (const width of [320, 1536]) {
  test(`the Marketplace label navigates and only its arrow opens the menu at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/seo-tools/");
    const link = page
      .getByRole("navigation", { name: "Site navigation" })
      .getByRole("link", {
        name: "Marketplace",
        exact: true,
      });
    await link.click();
    await expect(page).toHaveURL(/\/guest-posting-sites\/$/);
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(page.locator("#site-marketplace-menu")).toHaveCount(0);
    const { menu, trigger } = await openMenu(page);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page).toHaveURL(/\/guest-posting-sites\/$/);
    await link.click();
    await expect(menu).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
}

test("the marketplace overlay supports keyboard opening, close, outside dismissal and menu switching", async ({
  page,
}) => {
  await page.goto("/products/");
  const trigger = page.getByRole("button", {
    name: "Browse marketplace",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("region", {
    name: "Marketplace ranges",
    exact: true,
  });
  await expect(
    menu.getByRole("link", { name: "All publications", exact: true }),
  ).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await trigger.click();
  await menu.getByRole("button", { name: "Close marketplace menu" }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .locator(".site-marketplace-backdrop")
    .click({ position: { x: 10, y: 25 } });
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "Browse tools", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Tool categories" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("every category link targets its own route and new traffic ranges apply to actual catalog requests", async ({
  page,
}) => {
  await page.goto("/products/");
  const { menu } = await openMenu(page);
  for (const group of marketplaceGroups) {
    const card = menu.getByRole("region", { name: group.title, exact: true });
    for (const range of group.ranges) {
      await expect(
        card.getByRole("link", { name: range.label, exact: true }),
      ).toHaveAttribute("href", `/${range.slug}/`);
    }
  }
  const trafficRequest = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname.replace(/\/$/, "") === "/api/products" &&
      url.searchParams.get("minTraffic") === "5000000" &&
      url.searchParams.get("maxTraffic") === "10000000" &&
      response.status() === 200
    );
  });
  await menu.getByRole("link", { name: "Traffic 5M–10M", exact: true }).click();
  await expect(page).toHaveURL(/\/5m-to-10m-traffic\/$/);
  await trafficRequest;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Guest post sites: Traffic 5M–10M",
  );
  await expect(page.locator(".site-marketplace-backdrop")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

for (const width of [320, 375, 768, 1280, 1536]) {
  test(`the marketplace menu fits and remains accessible at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/products/");
    const { menu } = await openMenu(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect(
      await menu.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.left >= 0 &&
          rect.right <= innerWidth &&
          rect.top >= 0 &&
          rect.bottom <= innerHeight
        );
      }),
    ).toBe(true);
    expect(
      await menu
        .locator(".site-marketplace-menu-scroll")
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations.map((issue) => ({
        id: issue.id,
        nodes: issue.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: info.outputPath(`marketplace-menu-${width}.png`),
    });
    if (width <= 600) {
      await menu
        .getByRole("navigation", { name: "Browse marketplace categories" })
        .getByRole("link", { name: "Price", exact: true })
        .click();
      await expect(
        menu.getByRole("heading", {
          name: "Guest Posts By Price",
          exact: true,
        }),
      ).toBeInViewport();
      await expect(
        menu.getByRole("button", { name: "Close marketplace menu" }),
      ).toBeInViewport();
    }
    await menu
      .getByRole("link", { name: "Above $200 USD", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      menu.getByRole("link", { name: "Above $200 USD", exact: true }),
    ).toBeInViewport();
  });
}

test("marketplace cards retain contrast in dark mode and reflow in a short mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto("/products/");
  await page
    .getByRole("button", { name: "Use dark appearance", exact: true })
    .click();
  const { menu } = await openMenu(page);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations.map((issue) => ({
      id: issue.id,
      nodes: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 640 });
  await menu
    .getByRole("link", { name: "Above $200 USD", exact: true })
    .scrollIntoViewIfNeeded();
  expect(
    await menu.evaluate(
      (element) => element.getBoundingClientRect().bottom <= innerHeight,
    ),
  ).toBe(true);
  await expect(
    menu.getByRole("link", { name: "Above $200 USD", exact: true }),
  ).toBeInViewport();
  expect(
    await menu
      .locator(".site-marketplace-menu-scroll")
      .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
  ).toBe(true);
});
