import { createHash } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PRODUCT_CSV_HEADERS } from "../../lib/commerce/csv";
import type { ProductInput } from "../../lib/commerce/types";
import { actor, fixtures, key, mutation } from "./helpers";

const group = key("browse");
const country = key("country");
const topic = key("topic");
function input(domain: string, index = 0): ProductInput {
  return {
    externalId: null,
    domain,
    language: "English",
    country,
    category: topic,
    priceCents: 10001 + index * 100,
    currency: "USD",
    status: "active",
    metrics: {
      da: index ? 50 + index : null,
      dr: index ? 30 + index : null,
      tf: null,
      ur: null,
      traffic: index ? index * 1000 : null,
      referringDomains: null,
      backlinks: null,
      spamScore: null,
    },
    linkType: "",
    turnaround: "",
    requirements: "Synthetic isolated QA publication, not real inventory.",
  };
}
function csv(domain: string) {
  const row: Record<string, string> = {
    id: BigInt(
      `0x${createHash("sha256").update(key("ui-legacy")).digest("hex")}`,
    ).toString(),
    domain,
    Price: "101.01",
    language: "English",
    Country: country,
    Category: topic,
    da: "0",
    dr: "0",
    traffic: "0",
    date_added: "0000-00-00 00:00:00",
  };
  return `${PRODUCT_CSV_HEADERS.join(",")}\r\n${PRODUCT_CSV_HEADERS.map((header) => `"${(row[header] ?? "").replaceAll('"', '""')}"`).join(",")}`;
}
async function authenticatedPage(page: Page) {
  const api = await actor((await fixtures()).admin);
  await page.context().addCookies((await api.storageState()).cookies);
  await api.dispose();
}
async function loaded(page: Page) {
  await expect(
    page.getByRole("status").filter({ hasText: /matching publications/ }),
  ).toBeVisible({ timeout: 30000 });
}
async function checkSemantics(page: Page) {
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    "No document-level horizontal overflow",
  ).toBe(false);
  expect(
    await page
      .locator("main input:not([type=hidden]), main select, main textarea")
      .evaluateAll(
        (elements) =>
          elements.filter((element) => {
            const control = element as HTMLInputElement;
            return (
              !control.labels?.length &&
              !control.getAttribute("aria-label") &&
              !control.getAttribute("aria-labelledby")
            );
          }).length,
      ),
    "Every form control is labelled",
  ).toBe(0);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.map((issue) => ({
      id: issue.id,
      impact: issue.impact,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test.describe("first-slice marketplace browser", () => {
  test.beforeAll(async () => {
    test.setTimeout(120000);
    const api = await actor((await fixtures()).admin);
    for (let index = 0; index < 21; index++) {
      const response = await mutation(
        api,
        "post",
        "/api/admin/products",
        input(`${group}-${String(index).padStart(2, "0")}.com`, index),
      );
      expect(response.status()).toBe(201);
    }
    await api.dispose();
  });

  test("guest filters, topic search, URL state, sorting, pagination, chips and empty reset use actual inventory", async ({
    page,
  }) => {
    await page.goto(`/products/?q=${group}`);
    await loaded(page);
    await expect(
      page.getByRole("status").filter({ hasText: "21 matching publications" }),
    ).toBeVisible();
    await page
      .getByLabel("Results per page", { exact: true })
      .selectOption("20");
    await loaded(page);
    await page
      .getByLabel("Sort publications", { exact: true })
      .selectOption("priceDesc");
    await expect(page).toHaveURL(/sort=priceDesc/);
    await loaded(page);
    await expect(
      page.locator(".marketplace-table tbody tr").first(),
    ).toContainText("$120.01");
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await loaded(page);
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(1);
    await page.reload();
    await loaded(page);
    await expect(
      page.getByLabel("Sort publications", { exact: true }),
    ).toHaveValue("priceDesc");
    await page.getByLabel("Search publications", { exact: true }).fill(topic);
    await page.getByLabel("Countries", { exact: true }).selectOption(country);
    await page.getByLabel("Languages", { exact: true }).selectOption("English");
    await page
      .getByLabel("Maximum price (USD)", { exact: true })
      .fill("105.01");
    await page.getByLabel("Minimum DR", { exact: true }).fill("32");
    await page.getByLabel("Minimum DA", { exact: true }).fill("52");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await loaded(page);
    await expect(
      page.getByRole("status").filter({ hasText: "4 matching publications" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/page=1/);
    await page
      .getByRole("button", { name: `Remove minDr filter: 32`, exact: true })
      .click();
    await expect(page).not.toHaveURL(/minDr=/);
    await page
      .getByLabel("Search publications", { exact: true })
      .fill(key("absent"));
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "No publications match these filters",
      }),
    ).toBeVisible({ timeout: 30000 });
    await page
      .getByRole("button", { name: "Clear all filters", exact: true })
      .click();
    await expect(page).toHaveURL(/\/products\/$/);
    await loaded(page);
    await expect(page.locator(".marketplace-stage-notice")).toContainText(
      /planning cart are available\. Checkout and payments are upcoming/,
    );
    await expect(page.locator(".marketplace-stage-notice")).toBeVisible();
  });

  test("guest shortlist limits four, compares unknown metrics truthfully and remains keyboard operable", async ({
    page,
  }) => {
    await page.goto(`/products/?q=${group}`);
    await loaded(page);
    const table = page.locator(".marketplace-table");
    for (let index = 0; index < 4; index++)
      await table
        .getByRole("button", { name: "Shortlist", exact: true })
        .first()
        .click();
    await expect(
      page.getByRole("heading", { name: "Your shortlist (4/4)", exact: true }),
    ).toBeVisible();
    await expect(
      table.getByRole("button", { name: "Shortlist", exact: true }).first(),
    ).toBeDisabled();
    const shortlist = page.locator("#shortlist");
    await expect(shortlist.locator("article")).toHaveCount(4);
    await expect(shortlist.locator("article").first()).toContainText(
      "Unavailable",
    );
    await expect(shortlist).toContainText(
      "not live price or availability reservations",
    );
    const remove = shortlist
      .getByRole("button", { name: /Remove .* from comparison/ })
      .first();
    await remove.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Your shortlist (3/4)", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear shortlist", exact: true })
      .click();
    await expect(shortlist.locator("article")).toHaveCount(0);
    await page
      .getByRole("link", { name: "Skip to main content", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });

  test("compact search modes, score sliders and publication details use the current filters", async ({
    page,
  }) => {
    await page.goto(`/products/?q=${group}`);
    await loaded(page);
    await expect(page.locator(".marketplace-hero")).toHaveCount(0);
    await expect(
      page.getByLabel("Results per page", { exact: true }),
    ).toHaveValue("10");
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(10);

    await page.getByLabel("Minimum DR slider", { exact: true }).fill("40");
    await expect(page.getByLabel("Minimum DR", { exact: true })).toHaveValue(
      "40",
    );
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await loaded(page);
    await expect(
      page.getByRole("status").filter({ hasText: "11 matching publications" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/minDr=40/);

    await page.getByRole("button", { name: /Search by Topic/ }).click();
    await page
      .getByLabel("Find publications by topic", { exact: true })
      .selectOption(topic);
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await loaded(page);
    expect(new URL(page.url()).searchParams.get("category")).toBe(topic);
    expect(new URL(page.url()).searchParams.get("minDr")).toBe("40");
    expect(new URL(page.url()).searchParams.get("q")).toBe(group);

    await page.getByRole("button", { name: /Search by Location/ }).click();
    await page
      .getByLabel("Find publications by country", { exact: true })
      .selectOption(country);
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await loaded(page);
    expect(new URL(page.url()).searchParams.get("country")).toBe(country);

    const details = page
      .getByRole("button", { name: "View Details", exact: true })
      .first();
    await details.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(`${group}-10.com`);
    await expect(dialog).toContainText("Unavailable");
    await expect(
      dialog.getByRole("link", { name: "Plan placement", exact: true }),
    ).toHaveAttribute("href", /\/cart\/\?product=/);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(details).toBeFocused();

    await page
      .getByRole("button", { name: /Search by Domain \/ Keyword/ })
      .click();
    await page
      .getByLabel("Find a publication by domain or keyword", { exact: true })
      .fill(`${group}-10`);
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await loaded(page);
    await expect(
      page.getByRole("status").filter({ hasText: "1 matching publications" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Reset All", exact: true }).click();
    await expect(page).toHaveURL(/\/products\/$/);
    await loaded(page);
    await expect(page.getByLabel("Minimum DR", { exact: true })).toHaveValue(
      "",
    );
  });

  test("inventory load error and retry are truthful without fabricated products", async ({
    page,
  }) => {
    await fixtures();
    const productApi = /\/api\/products\/\?/;
    await page.route(productApi, (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Synthetic QA unavailable inventory" }),
      }),
    );
    await page.goto(`/products/?q=${group}`);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "Inventory could not load",
      { timeout: 30000 },
    );
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(0);
    await page.unroute(productApi);
    await page
      .getByRole("button", { name: "Retry inventory", exact: true })
      .click();
    await loaded(page);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  });

  test("admin creates a draft, edits exact price and activates reviewed inventory", async ({
    page,
    request,
  }) => {
    await authenticatedPage(page);
    const host = `${key("manual-ui")}.com`;
    await page.goto("/admin/products/");
    await loaded(page);
    await page
      .getByRole("button", { name: "Add publication", exact: true })
      .click();
    await page.getByLabel("Publication URL", { exact: true }).fill(host);
    await page
      .getByLabel("Placement price (USD)", { exact: true })
      .fill("101.01");
    await page.getByLabel("Publication topic", { exact: true }).fill(topic);
    await page
      .getByRole("button", { name: "Save publication", exact: true })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Publication saved as draft." }),
    ).toBeVisible({ timeout: 30000 });
    expect(
      (await (await request.get(`/api/products?q=${host}`)).json()).total,
    ).toBe(0);
    await page.getByLabel("Search inventory", { exact: true }).fill(host);
    await page
      .getByRole("button", { name: "Search inventory", exact: true })
      .click();
    await loaded(page);
    await page
      .getByRole("button", { name: "Edit publication", exact: true })
      .click();
    await expect(
      page.getByLabel("Placement price (USD)", { exact: true }),
    ).toHaveValue("101.01");
    await page
      .getByLabel("Placement price (USD)", { exact: true })
      .fill("109.99");
    await page
      .getByLabel("Publication status", { exact: true })
      .selectOption("active");
    await page
      .getByRole("button", { name: "Save publication", exact: true })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Publication saved as active." }),
    ).toBeVisible({ timeout: 30000 });
    expect(
      (await (await request.get(`/api/products?q=${host}`)).json()).data[0],
    ).toMatchObject({ priceCents: 10999, status: "active" });
  });

  test("admin previews exact CSV before explicit draft commit and new file invalidates review", async ({
    page,
    request,
  }) => {
    await authenticatedPage(page);
    const host = `${key("csv-ui")}.com`;
    await page.goto("/admin/products/");
    await loaded(page);
    const file = page.getByLabel("Publication CSV file", { exact: true });
    await file.setInputFiles({
      name: "synthetic-ui.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv(host)),
    });
    await page
      .getByRole("button", { name: "Preview CSV", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Import review", exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await expect(
      page.getByRole("region", { name: "Normalized CSV sample", exact: true }),
    ).toContainText("$101.01");
    await file.setInputFiles({
      name: "synthetic-ui-second.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv(host)),
    });
    await expect(
      page.getByRole("heading", { name: "Import review", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Preview CSV", exact: true })
      .click();
    const commit = page.getByRole("button", {
      name: "Import reviewed file as drafts",
      exact: true,
    });
    await expect(commit).toBeEnabled({ timeout: 30000 });
    page.once("dialog", (dialog) => dialog.accept());
    await commit.click();
    await expect(
      page.getByRole("status").filter({
        hasText: /1 publications imported as drafts; 0 rows excluded/,
      }),
    ).toBeVisible({ timeout: 30000 });
    expect(
      (await (await request.get(`/api/products?q=${host}`)).json()).total,
    ).toBe(0);
    await page.getByLabel("Search inventory", { exact: true }).fill(host);
    await page
      .getByRole("button", { name: "Search inventory", exact: true })
      .click();
    await loaded(page);
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("tbody tr")).toContainText("draft");
  });

  test("CSV row quarantine is explicit and fatal structure cannot be committed", async ({
    page,
  }) => {
    await authenticatedPage(page);
    await page.goto("/admin/products/");
    await loaded(page);
    const file = page.getByLabel("Publication CSV file", { exact: true });
    const valid = csv(`${key("quarantine-ui")}.com`);
    const invalid = csv(`${key("invalid-ui")}.com`)
      .split("\r\n")[1]
      .replace('"101.01"', '"0.00"');
    await file.setInputFiles({
      name: "synthetic-quarantine.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(`${valid}\r\n${invalid}`),
    });
    await page
      .getByRole("button", { name: "Preview CSV", exact: true })
      .click();
    const commit = page.getByRole("button", {
      name: "Import valid rows as drafts",
      exact: true,
    });
    await expect(commit).toBeDisabled({ timeout: 30000 });
    await page
      .getByLabel("Import only valid rows as drafts; exclude flagged rows", {
        exact: true,
      })
      .check();
    await expect(commit).toBeEnabled();
    page.once("dialog", (dialog) => dialog.accept());
    await commit.click();
    await expect(
      page.getByRole("status").filter({
        hasText: /1 publications imported as drafts; 1 rows excluded/,
      }),
    ).toBeVisible({ timeout: 30000 });
    await file.setInputFiles({
      name: "synthetic-fatal.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(`${csv(`${key("fatal-ui")}.com`)}\r\nshort,row`),
    });
    await page
      .getByRole("button", { name: "Preview CSV", exact: true })
      .click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "The CSV file structure is invalid" }),
    ).toBeVisible({ timeout: 30000 });
    await expect(
      page.getByRole("button", {
        name: /Import (?:valid rows|reviewed file) as drafts/,
      }),
    ).toBeDisabled();
    await expect(
      page.getByLabel(
        "Import only valid rows as drafts; exclude flagged rows",
        { exact: true },
      ),
    ).toHaveCount(0);
  });

  for (const width of [320, 375, 1280]) {
    test(`marketplace and admin product templates reflow with labelled controls and targeted axe at ${width}px`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(120000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/products/?q=${group}`);
      await loaded(page);
      await checkSemantics(page);
      const surface =
        width < 800
          ? page.locator(".marketplace-cards")
          : page.locator(".marketplace-table");
      await surface
        .getByRole("button", { name: "Shortlist", exact: true })
        .first()
        .click();
      await expect(
        page.getByRole("heading", {
          name: "Your shortlist (1/4)",
          exact: true,
        }),
      ).toBeVisible();
      await checkSemantics(page);
      if (width !== 320)
        await page.screenshot({
          path: testInfo.outputPath(`products-${width}.png`),
          fullPage: true,
        });
      await authenticatedPage(page);
      await page.goto(`/admin/products/?q=${group}`);
      await loaded(page);
      await checkSemantics(page);
      await page
        .getByRole("button", { name: "Add publication", exact: true })
        .click();
      await checkSemantics(page);
      if (width !== 320)
        await page.screenshot({
          path: testInfo.outputPath(`admin-products-${width}.png`),
          fullPage: true,
        });
    });
  }
});
