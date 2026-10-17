import { test, expect } from "@playwright/test";

test("URL mode sends the address and analyzes fetched HTML", async ({
  page,
}) => {
  await page.goto("/aeo-geo-seo-checker/");
  await page.getByLabel("Check from").selectOption("url");
  await expect(page.getByLabel("Page HTML", { exact: true })).toHaveCount(0);
  await page.route("**/api/tools/readiness/", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      input: "https://example.com/guide/",
    });
    await route.fulfill({
      json: {
        html: "<title>A useful guide to search readiness</title><h1>Guide</h1>",
        url: "https://example.com/final/",
      },
    });
  });
  await page
    .getByLabel("Page URL", { exact: true })
    .fill("https://example.com/guide/");
  await page
    .getByRole("button", { name: "Run AEO, GEO and SEO check" })
    .click();
  await expect(
    page.getByText("Checked URL: https://example.com/final/", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Pass: Page title", { exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/tools/readiness/");
  await page.route("**/api/tools/readiness/", (route) =>
    route.fulfill({
      status: 422,
      json: { error: "Only publicly accessible websites can be checked." },
    }),
  );
  await page
    .getByRole("button", { name: "Run AEO, GEO and SEO check" })
    .click();
  await expect(
    page.locator(".tool-workspace").getByRole("alert"),
  ).toContainText("publicly accessible");
  await expect(
    page.getByRole("button", { name: "Run AEO, GEO and SEO check" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Download report" }),
  ).toHaveCount(0);
});

test("search readiness inspects HTML safely and exports actionable reports", async ({
  page,
}) => {
  await page.goto("/aeo-geo-seo-checker/");
  const outbound: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("example.com")) outbound.push(request.url());
  });
  const html = `<html><head><title>A useful guide to search readiness</title>
    <meta name="description" content="Learn how to structure a useful guide with clear answers, descriptive headings, credible sources and practical examples for your readers.">
    <meta name="author" content="Example Author">
    <link rel="canonical" href="https://example.com/guide/">
    <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Article"}]}</script>
    </head><body><h1>Search readiness guide</h1><h2>What is search readiness?</h2>
    <p>${"Clear answers help readers understand a topic and decide what to do next. ".repeat(4)}</p>
    <ul><li>Use clear headings</li></ul><a href="https://example.com/source">Research source</a>
    <time datetime="2026-10-17">October 17, 2026</time><img src="https://example.com/image" alt="">
    <iframe src="https://example.com/frame"></iframe><script>window.badReadinessInput=true</script></body></html>`;
  await page.getByLabel("Page HTML").fill(html);
  await page
    .getByRole("button", { name: "Run AEO, GEO and SEO check" })
    .click();
  await expect(
    page.getByText("6 / 6 checks passed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("4 / 4 checks passed", { exact: true }),
  ).toHaveCount(2);
  expect(outbound).toEqual([]);
  expect(await page.evaluate(() => "badReadinessInput" in window)).toBe(false);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  expect((await download).suggestedFilename()).toBe("aeo-geo-seo-report.txt");
  await page
    .getByLabel("Page HTML")
    .fill(
      '<meta name="robots" content="noindex"><h1>Test</h1><img><script type="application/ld+json">broken</script>',
    );
  await expect(
    page.getByRole("button", { name: "Download report" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Run AEO, GEO and SEO check" })
    .click();
  await expect(
    page.getByText("Review: No HTML indexing block", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Review: Image alt attributes", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Review: Parseable typed JSON-LD", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Page HTML")).toHaveValue("");
  await page.getByLabel("Page HTML").fill("https://example.com");
  await page
    .getByRole("button", { name: "Run AEO, GEO and SEO check" })
    .click();
  await expect(
    page.locator(".tool-workspace").getByRole("alert"),
  ).toContainText("Paste page HTML");
});
