import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { ProductPage } from "../../lib/commerce/types";

async function loaded(page: Page) {
  await expect(
    page.locator(".marketplace-results[aria-busy=false]"),
  ).toBeVisible();
  await expect(page.locator(".marketplace-result-count")).toContainText(
    "matching publications",
  );
}

test.describe("compact public catalog", () => {
  test("the homepage opens the publications marketplace and preserves its own filter URL", async ({
    page,
  }) => {
    await page.goto("/seo-tools/");
    await page
      .getByRole("link", { name: "Name Retailer home", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/$/);
    expect(new URL(page.url()).pathname).toBe("/");
    await loaded(page);
    await expect(page.locator(".marketplace-browser")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Available Publications",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Site navigation" })
        .getByRole("link", { name: "Home", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await page
      .getByLabel("Sort publications", { exact: true })
      .selectOption("priceAsc");
    await loaded(page);
    expect(new URL(page.url()).pathname).toBe("/");
    expect(new URL(page.url()).searchParams.get("sort")).toBe("priceAsc");
    await page.reload();
    await loaded(page);
    await expect(
      page.getByLabel("Sort publications", { exact: true }),
    ).toHaveValue("priceAsc");
  });

  test("publication rows use the normal page scroll with the wheel and keyboard", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto("/products/");
    await loaded(page);
    const table = page.getByRole("region", {
      name: "Publication comparison table — scroll horizontally if needed",
      exact: true,
    });
    test.skip(
      (await table.locator("tbody tr").count()) < 10,
      "Requires ten active publications to exercise scrolling.",
    );
    await table.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await table.hover({ position: { x: 300, y: 150 } });
    const pageScroll = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 280);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(pageScroll + 200);
    expect(await table.evaluate((element) => element.scrollTop)).toBe(0);
    expect(
      await table.evaluate(
        (element) => element.scrollHeight - element.clientHeight,
      ),
    ).toBeLessThanOrEqual(1);
    await table.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await table.focus();
    const keyboardPageScroll = await page.evaluate(() => window.scrollY);
    await page.keyboard.press("PageDown");
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(keyboardPageScroll + 200);
    expect(await table.evaluate((element) => element.scrollTop)).toBe(0);
    await table.locator("tbody tr").last().scrollIntoViewIfNeeded();
    await expect(table.locator("tbody tr").last()).toBeInViewport();
  });

  test("sorting, page size, pagination and reload preserve URL state", async ({
    page,
    request,
  }) => {
    const inventory = (await (
      await request.get("/api/products/?pageSize=10")
    ).json()) as ProductPage;
    test.skip(
      inventory.total < 21,
      "Requires at least 21 active publications.",
    );
    await page.goto("/products/");
    await loaded(page);
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
    await page
      .getByLabel("Results per page", { exact: true })
      .selectOption("10");
    await loaded(page);
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(10);
    await page
      .getByLabel("Sort publications", { exact: true })
      .selectOption("priceDesc");
    await loaded(page);
    await expect(page).toHaveURL(/sort=priceDesc/);
    await page
      .getByLabel("Results per page", { exact: true })
      .selectOption("20");
    await loaded(page);
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await loaded(page);
    await expect(page.locator(".marketplace-row-number").first()).toHaveText(
      "21",
    );
    await page.reload();
    await loaded(page);
    await expect(
      page.getByLabel("Sort publications", { exact: true }),
    ).toHaveValue("priceDesc");
    await expect(
      page.getByLabel("Results per page", { exact: true }),
    ).toHaveValue("20");
    await expect(
      page.getByRole("button", { name: "Page 2", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("search methods and score sliders retain applied filters and reset together", async ({
    page,
    request,
  }) => {
    const inventory = (await (
      await request.get("/api/products/?pageSize=10")
    ).json()) as ProductPage;
    const product = inventory.data.find(
      (item) => item.category && item.country,
    );
    test.skip(!product, "Requires a publication with topic and country.");
    await page.goto("/products/");
    await loaded(page);
    await page.getByLabel("Minimum DR slider", { exact: true }).fill("40");
    await expect(page.getByLabel("Minimum DR", { exact: true })).toHaveValue(
      "40",
    );
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await loaded(page);
    await expect(page).toHaveURL(/minDr=40/);
    await expect(page.locator(".marketplace-chips")).toContainText(
      /Minimum DR:\s*40/,
    );
    await page.getByRole("button", { name: /Search by Topic/ }).click();
    await page
      .getByLabel("Find publications by topic", { exact: true })
      .selectOption(product!.category);
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await loaded(page);
    expect(new URL(page.url()).searchParams.get("category")).toBe(
      product!.category,
    );
    expect(new URL(page.url()).searchParams.get("minDr")).toBe("40");
    await page.getByRole("button", { name: /Search by Location/ }).click();
    await page
      .getByLabel("Find publications by country", { exact: true })
      .selectOption(product!.country);
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await loaded(page);
    expect(new URL(page.url()).searchParams.get("country")).toBe(
      product!.country,
    );
    expect(new URL(page.url()).searchParams.get("category")).toBe(
      product!.category,
    );
    await page.getByRole("button", { name: "Reset All", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await loaded(page);
    await expect(page.getByLabel("Minimum DR", { exact: true })).toHaveValue(
      "",
    );
    await page
      .getByRole("button", { name: /Search by Domain \/ Keyword/ })
      .click();
    await page
      .getByLabel("Find a publication by domain or keyword", { exact: true })
      .fill(new URL(product!.domain).hostname);
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await loaded(page);
    await expect(page.locator(".marketplace-table tbody")).toContainText(
      new URL(product!.domain).hostname,
    );
  });

  test("details restore keyboard focus and bookmarks populate the comparison", async ({
    page,
  }) => {
    await page.goto("/products/");
    await loaded(page);
    test.skip(
      (await page.locator(".marketplace-table tbody tr").count()) === 0,
      "Requires active publications.",
    );
    const row = page.locator(".marketplace-table tbody tr").first();
    const publication = new URL(
      (await row.locator("th a").getAttribute("href"))!,
    ).hostname;
    const details = row.getByRole("button", {
      name: "View Details",
      exact: true,
    });
    await details.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText(publication);
    await expect(
      page
        .getByRole("dialog")
        .getByRole("link", { name: "Plan placement", exact: true }),
    ).toHaveAttribute("href", /\/cart\/\?product=/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(details).toBeFocused();
    await row.getByRole("button", { name: "Shortlist", exact: true }).click();
    await expect(
      page
        .getByRole("complementary", { name: "Selected publications" })
        .getByRole("link", { name: "Compare shortlist" }),
    ).toHaveAttribute("href", "#shortlist");
    await expect(page.locator("#shortlist-heading")).toHaveText(
      "Your shortlist (1/4)",
    );
    await expect(page.locator("#shortlist article")).toContainText(publication);
    await row
      .getByRole("button", { name: "Remove from shortlist", exact: true })
      .click();
    await expect(page.locator("#shortlist-heading")).toHaveText(
      "Your shortlist (0/4)",
    );
    await expect(
      page.getByRole("complementary", { name: "Selected publications" }),
    ).toHaveCount(0);
  });

  test("mobile publication cards open details and link directly to their comparison", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 1024 });
    await page.goto("/products/");
    await loaded(page);
    const card = page.locator(".marketplace-listing-card").first();
    test.skip((await card.count()) === 0, "Requires an active publication.");
    await expect(
      card.locator(".marketplace-listing-metrics > div"),
    ).toHaveCount(3);
    const details = card.getByRole("button", {
      name: "View Details",
      exact: true,
    });
    await details.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".marketplace-dialog-overview")).toContainText(
      "Placement price",
    );
    await expect(
      dialog.getByRole("link", { name: "Plan placement", exact: true }),
    ).toHaveAttribute("href", /\/cart\/\?product=/);
    await page.keyboard.press("Escape");
    await expect(details).toBeFocused();
    await card.getByRole("button", { name: "Shortlist", exact: true }).click();
    await expect(card).toHaveAttribute("data-shortlisted", "true");
    await page
      .getByRole("complementary", { name: "Selected publications" })
      .getByRole("link", { name: "Compare shortlist" })
      .click();
    await expect(page.locator("#shortlist")).toBeFocused();
    await expect(page.locator("#shortlist")).toBeInViewport();
    await page
      .getByRole("button", { name: "Clear shortlist", exact: true })
      .click();
    await expect(
      page.getByRole("complementary", { name: "Selected publications" }),
    ).toHaveCount(0);
  });

  test("topic shortcuts clear a keyword, retain filters and restore their selection after reload", async ({
    page,
    request,
  }) => {
    const { data: facets } = await (
      await request.get("/api/products/facets/")
    ).json();
    test.skip(
      !facets.categories.includes("Technology"),
      "Requires the Technology topic.",
    );
    await page.goto("/products/?q=example&minDr=30");
    await loaded(page);
    const shortcut = page
      .getByRole("group", { name: "Explore publication topics" })
      .getByRole("button", { name: "Technology", exact: true });
    await shortcut.click();
    await loaded(page);
    expect(new URL(page.url()).searchParams.get("q")).toBeNull();
    expect(new URL(page.url()).searchParams.get("minDr")).toBe("30");
    expect(new URL(page.url()).searchParams.get("category")).toBe("Technology");
    await expect(shortcut).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await loaded(page);
    await expect(
      page.getByLabel("Find publications by topic", { exact: true }),
    ).toHaveValue("Technology");
    await expect(page.getByLabel("Topics", { exact: true })).toHaveValue(
      "Technology",
    );
    await shortcut.click();
    await loaded(page);
    expect(new URL(page.url()).searchParams.get("category")).toBeNull();
    expect(new URL(page.url()).searchParams.get("minDr")).toBe("30");
    await expect(shortcut).toHaveAttribute("aria-pressed", "false");
  });

  test("mobile filters expand with the keyboard and can reset while collapsed", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 1024 });
    await page.goto("/products/?minDr=30");
    await loaded(page);
    const panel = page.locator(".marketplace-filter-panel");
    const summary = panel.locator("summary");
    await expect(panel).not.toHaveAttribute("open", "");
    await expect(
      page.getByLabel("Minimum DR", { exact: true }),
    ).not.toBeVisible();
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Minimum DR", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Minimum DR", { exact: true })).toHaveValue(
      "30",
    );
    await summary.click();
    await expect(
      page.getByLabel("Minimum DR", { exact: true }),
    ).not.toBeVisible();
    await page.getByRole("button", { name: "Reset All", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await loaded(page);
    await summary.click();
    await expect(page.getByLabel("Minimum DR", { exact: true })).toHaveValue(
      "",
    );
  });

  test("inventory errors offer a working retry", async ({ page }) => {
    const endpoint = /\/api\/products\/\?/;
    await page.route(endpoint, (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Temporary test outage" }),
      }),
    );
    await page.goto("/products/");
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "Inventory could not load",
    );
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(0);
    await page.unroute(endpoint);
    await page
      .getByRole("button", { name: "Retry inventory", exact: true })
      .click();
    await loaded(page);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  });

  for (const width of [320, 375, 768, 1280, 1536]) {
    test(`search, filters and inventory reflow accessibly at ${width}px without a hero`, async ({
      page,
    }, info) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 1024 });
      await page.goto("/products/");
      await loaded(page);
      await expect(
        page.locator(".marketplace-hero, .marketplace-benefits"),
      ).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        accessibility.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map(({ target }) => target),
        })),
      ).toEqual([]);
      await page.screenshot({ path: info.outputPath(`products-${width}.png`) });
    });
  }
});
