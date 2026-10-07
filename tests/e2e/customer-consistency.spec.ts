import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { actor, fixtures, key, mutation } from "./helpers";
import type { ProductInput } from "../../lib/commerce/types";
const group = key("consistent");
const routes = [
  "/",
  "/products/",
  "/guest-post-by-dr/",
  "/how-to-buy-links/",
  "/word-counter/",
  "/my-account/",
  "/cart/",
  "/my-account/forgot-password/",
  "/my-account/reset-password/",
];
async function ready(page: Page, route: string) {
  await page.goto(
    route === "/products/" || route === "/guest-post-by-dr/"
      ? `${route}?q=${group}`
      : route,
  );
  await expect(page.locator(".reference-header")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  if (route === "/products/" || route === "/guest-post-by-dr/")
    await expect(
      page.getByRole("status").filter({ hasText: "2 matching publications" }),
    ).toBeVisible({ timeout: 30000 });
  if (route === "/my-account/")
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
}
async function geometry(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector(".reference-header")!;
    const brand = header.querySelector(".marketplace-brand")!;
    const footer = document.querySelector(
      ".reference-footer .marketplace-brand",
    )!;
    const main = document.querySelector(
      "main .reference-container, main.reference-container, .reference-marketplace > main, .reference-customer > main",
    )!;
    const links = [...header.querySelectorAll("a")].filter(
      (link) => link.getBoundingClientRect().width > 0,
    );
    const boxes = links.map((link) => {
      const { left, right, top, bottom } = link.getBoundingClientRect();
      return {
        name: link.getAttribute("aria-label") || link.textContent?.trim(),
        left,
        right,
        top,
        bottom,
      };
    });
    const outside = boxes.filter(
      (box) => Number(box.left) < -1 || Number(box.right) > innerWidth + 1,
    );
    const overlap = boxes.filter((box, index) =>
      boxes
        .slice(index + 1)
        .some(
          (other) =>
            Number(box.left) < Number(other.right) - 1 &&
            Number(other.left) < Number(box.right) - 1 &&
            Number(box.top) < Number(other.bottom) - 1 &&
            Number(other.top) < Number(box.bottom) - 1,
        ),
    );
    const h1 = document.querySelector("h1")!;
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      outside,
      overlap,
      headerLeft: brand.getBoundingClientRect().left,
      mainLeft: main.getBoundingClientRect().left,
      footerLeft: footer.getBoundingClientRect().left,
      brandSize: getComputedStyle(brand).fontSize,
      titleSize: getComputedStyle(h1).fontSize,
      titleFont: getComputedStyle(h1).fontFamily,
      headerHeight: header.getBoundingClientRect().height,
    };
  });
}
test.beforeAll(async () => {
  const api = await actor((await fixtures()).admin);
  for (let index = 0; index < 2; index++) {
    const input: ProductInput = {
      externalId: null,
      domain: `${group}-${index}.com`,
      category: "QA consistency",
      country: "QA country",
      language: "English",
      priceCents: 10001 + index,
      currency: "USD",
      status: "active",
      metrics: {
        da: null,
        dr: null,
        tf: null,
        ur: null,
        traffic: null,
        referringDomains: null,
        backlinks: null,
        spamScore: null,
      },
      linkType: "",
      turnaround: "",
      requirements: "Synthetic isolated consistency fixture only.",
    };
    expect(
      (await mutation(api, "post", "/api/admin/products", input)).status(),
    ).toBe(201);
  }
  await api.dispose();
});
for (const width of [320, 375, 768, 820, 1024, 1280])
  test(`shared customer shell is aligned and accessible across all routes at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    let expected: Awaited<ReturnType<typeof geometry>> | undefined;
    for (const route of routes) {
      await ready(page, route);
      await expect(page.locator(".reference-topbar")).toHaveCount(1);
      await expect(page.locator(".reference-footer")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
      const measured = await geometry(page);
      expect(measured.overflow, `${route}: no document overflow`).toBe(false);
      expect(measured.outside, `${route}: navigation is not clipped`).toEqual(
        [],
      );
      expect(
        measured.overlap,
        `${route}: navigation targets do not overlap`,
      ).toEqual([]);
      expect(
        measured.headerLeft,
        `${route}: navbar fits inside the content gutter`,
      ).toBeLessThanOrEqual(measured.mainLeft + 1);
      expect(
        Math.abs(measured.mainLeft - measured.footerLeft),
        `${route}: main/footer gutters align`,
      ).toBeLessThanOrEqual(1);
      if (!expected) expected = measured;
      expect(
        {
          brandSize: measured.brandSize,
          titleSize:
            route === "/products/" ? expected.titleSize : measured.titleSize,
          titleFont:
            route === "/products/" ? expected.titleFont : measured.titleFont,
          headerHeight: measured.headerHeight,
        },
        `${route}: shared type scale and header height`,
      ).toEqual({
        brandSize: expected.brandSize,
        titleSize: expected.titleSize,
        titleFont: expected.titleFont,
        headerHeight: expected.headerHeight,
      });
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        axe.violations.map((issue) => ({
          id: issue.id,
          targets: issue.nodes.map((node) => node.target),
        })),
        route,
      ).toEqual([]);
      await page
        .getByRole("link", { name: "Skip to main content", exact: true })
        .focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("main")).toBeFocused();
      await page.locator("main").evaluate((main: HTMLElement) => main.blur());
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: info.outputPath(
          `${route === "/" ? "home" : route.split("/").filter(Boolean).join("-")}-${width}.png`,
        ),
      });
    }
  });
test("navigation and publication surfaces remain usable on either side of layout breakpoints", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [800, 801, 1000, 1001, 1100, 1101]) {
    await page.setViewportSize({ width, height: 900 });
    await ready(page, "/products/");
    const measured = await geometry(page);
    expect(measured.outside).toEqual([]);
    expect(measured.overlap).toEqual([]);
    expect(measured.overflow).toBe(false);
    await expect(
      page.locator(
        width <= 1100 ? ".marketplace-cards" : ".marketplace-table-region",
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        width <= 1100 ? ".marketplace-table-region" : ".marketplace-cards",
      ),
    ).toBeHidden();
  }
});
test("tablet catalog filters, comparisons and account/cart navigation remain functional", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 900 });
  await ready(page, "/products/");
  await page
    .getByLabel("Search publications", { exact: true })
    .fill(`${group}-0`);
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "1 matching publications" }),
  ).toBeVisible({ timeout: 30000 });
  await page
    .locator(".marketplace-cards")
    .getByRole("button", { name: "Shortlist", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your shortlist (1/4)", exact: true }),
  ).toBeVisible();
  await page
    .locator(".reference-header")
    .getByRole("button", { name: "Account info", exact: true })
    .click();
  await page
    .locator(".reference-header")
    .getByRole("link", { name: "Your planning cart", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cart\/$/);
  await expect(
    page.locator(".reference-header .site-account-trigger"),
  ).toHaveAttribute("aria-current", "page");
  await page
    .locator(".reference-header")
    .getByRole("button", { name: "Account info", exact: true })
    .click();
  await page
    .locator(".reference-header")
    .getByRole("link", { name: "Your account", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".reference-header .site-account-trigger"),
  ).toHaveAttribute("aria-current", "page");
});
