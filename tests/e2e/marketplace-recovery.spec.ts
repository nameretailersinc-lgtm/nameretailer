import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [375, 1280])
  test(`invalid filter ranges keep results and recover after correction at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
    if (width === 375)
      await page.locator(".marketplace-filter-panel > summary").click();
    await page.getByLabel("Minimum price (USD)", { exact: true }).fill("200");
    await page.getByLabel("Maximum price (USD)", { exact: true }).fill("50");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
    expect(
      await page
        .getByLabel("Maximum price (USD)", { exact: true })
        .evaluate((input: HTMLInputElement) => input.validationMessage),
    ).toContain("minimum");
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
    await page.getByLabel("Maximum price (USD)", { exact: true }).fill("250");
    const corrected = page.waitForResponse(
      (response) =>
        response.url().includes("/api/products/?") &&
        new URL(response.url()).searchParams.get("maxPrice") === "250",
    );
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    expect((await corrected).status()).toBe(200);
    await expect(page).toHaveURL(/maxPrice=250&minPrice=200/);
    await expect(page.locator(".marketplace-results")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("Back restores cached results without showing an error from a different search", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
  await page.route("**/api/products/?*", async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("q") ===
      "qa-network-error"
    )
      await route.fulfill({
        status: 503,
        json: { error: "Temporary inventory failure" },
      });
    else await route.abort();
  });
  await page
    .getByLabel("Find a publication by domain or keyword")
    .fill("qa-network-error");
  await page
    .getByRole("button", { name: "Find Publications", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Temporary inventory failure",
  );
  // Hold the Back request so the assertion distinguishes cached state from a
  // fast successful network response that could hide the stale-error bug.
  await page.unroute("**/api/products/?*");
  let release!: () => void;
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/products/?*", async (route) => {
    await hold;
    await route.abort();
  });
  try {
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
  } finally {
    release();
  }
});

test("a price floor fixed by a curated URL is included in validation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/price-200-plus/");
  await page.getByLabel("Maximum price (USD)", { exact: true }).fill("100");
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(page).toHaveURL(/\/price-200-plus\/$/);
  expect(
    await page
      .getByLabel("Maximum price (USD)", { exact: true })
      .evaluate((input: HTMLInputElement) => input.validationMessage),
  ).toContain("200.01");
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
});

test("metric and traffic conflicts are explained before making a request", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.locator(".marketplace-extra-ranges > summary").click();
  let inventoryRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/products/?")) inventoryRequests++;
  });
  for (const [minimum, maximum] of [
    ["Minimum DR", "Maximum DR"],
    ["Minimum DA", "Maximum DA"],
    ["Minimum traffic", "Maximum traffic"],
  ]) {
    await page.getByLabel(minimum, { exact: true }).fill("80");
    await page.getByLabel(maximum, { exact: true }).fill("20");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    expect(
      await page
        .getByLabel(maximum, { exact: true })
        .evaluate((input: HTMLInputElement) => input.validationMessage),
    ).toContain("minimum");
    await expect(page).toHaveURL(/\/$/);
    await page.getByLabel(minimum, { exact: true }).fill("");
    await page.getByLabel(maximum, { exact: true }).fill("");
  }
  expect(inventoryRequests).toBe(0);
  expect(
    (await new AxeBuilder({ page }).include("main").analyze()).violations,
  ).toEqual([]);
});

test("mobile shortlisting still supports four publications and removal", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const listings = page.locator(
    ".marketplace-results .marketplace-cards article",
  );
  await expect(listings).toHaveCount(20);
  for (let index = 0; index < 4; index++)
    await listings
      .nth(index)
      .getByRole("button", { name: "Shortlist", exact: true })
      .click();
  await expect(page.locator("#shortlist h2")).toContainText("4/4");
  await expect(
    listings.nth(4).getByRole("button", { name: "Shortlist", exact: true }),
  ).toBeDisabled();
  await listings
    .nth(0)
    .getByRole("button", { name: "Remove from shortlist", exact: true })
    .click();
  await expect(page.locator("#shortlist h2")).toContainText("3/4");
  await expect(
    listings.nth(4).getByRole("button", { name: "Shortlist", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Clear shortlist", exact: true })
    .click();
  await expect(page.locator("#shortlist h2")).toContainText("0/4");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("a failed search can be retried and rapid searches keep only the latest response", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
  const initialDomain = await page
    .locator(".marketplace-table tbody tr")
    .first()
    .locator("th a")
    .innerText();
  const inventory = await (
    await page.request.get("/api/products/?pageSize=20")
  ).json();
  let requests = 0;
  await page.route("**/api/products/?*", async (route) => {
    requests++;
    if (requests === 1)
      await route.fulfill({
        status: 503,
        json: { error: "Retry this search" },
      });
    else await route.fulfill({ json: inventory });
  });
  await page
    .getByLabel("Find a publication by domain or keyword")
    .fill("qa-retry");
  await page
    .getByRole("button", { name: "Find Publications", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Retry this search",
  );
  await page
    .getByRole("button", { name: "Retry inventory", exact: true })
    .click();
  await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await page.unroute("**/api/products/?*");
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/products/?*", async (route) => {
    if (new URL(route.request().url()).searchParams.get("q") === "qa-slow") {
      await held;
      await route
        .fulfill({ json: { ...inventory, data: [], total: 0 } })
        .catch(() => {});
    } else await route.fulfill({ json: inventory });
  });
  try {
    const slowStarted = page.waitForRequest(
      (request) => new URL(request.url()).searchParams.get("q") === "qa-slow",
    );
    await page
      .getByLabel("Find a publication by domain or keyword")
      .fill("qa-slow");
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await slowStarted;
    const slowCancelled = page.waitForEvent("requestfailed", {
      predicate: (request) =>
        new URL(request.url()).searchParams.get("q") === "qa-slow",
    });
    await page
      .getByLabel("Find a publication by domain or keyword")
      .fill("qa-fast");
    await page
      .getByRole("button", { name: "Find Publications", exact: true })
      .click();
    await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(20);
    await slowCancelled;
    release();
    await expect(page.locator(".marketplace-results")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect(
      page.locator(".marketplace-table tbody tr").first().locator("th a"),
    ).toHaveText(initialDomain);
    await expect(page).toHaveURL(/q=qa-fast/);
  } finally {
    release();
  }
});
