import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function check(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /\bindex\b/,
  );
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
  await page
    .getByRole("link", { name: "Skip to main content", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
}
for (const [route, label] of [
  ["/", "home"],
  ["/how-to-buy-links/", "guide"],
  ["/word-counter/", "word-counter"],
])
  for (const width of [320, 375, 1280])
    test(`${label} reference template reflows accessibly at ${width}px`, async ({
      page,
    }, info) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator(".reference-header")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await check(page);
      const image = page.locator("main img").first();
      await expect
        .poll(() =>
          image.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
          ),
        )
        .toBe(true);
      await expect(image).toHaveAttribute("alt", "");
      if (label === "home") {
        await expect(page.locator(".marketplace-browser")).toBeVisible();
        await expect(
          page.locator(".marketplace-table tbody tr").first(),
        ).toBeVisible();
        await expect(
          page
            .locator(".reference-header")
            .getByRole("link", { name: "Marketplace", exact: true }),
        ).toHaveAttribute("href", "/");
        expect(await page.locator("body").innerText()).not.toMatch(
          /Trusted by 10,000|Ahmed R\.|Sara M\.|Usman K\.|300%|\+186%/,
        );
        await expect(page.locator(".reference-proof-pending")).toHaveCount(0);
      }
      if (label === "guide") {
        await expect(page.locator(".reference-draft-notice")).toHaveCount(0);
        await expect(page.getByText(/Last updated:/)).toBeVisible();
        await expect(page.locator(".reference-guide-section")).toHaveCount(4);
        for (const href of await page
          .locator('.reference-guide-aside a[href^="#"]')
          .evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute("href")!),
          ))
          await expect(page.locator(href)).toHaveCount(1);
        await expect(
          page.locator('a[href*="developers.google.com/search/docs/"]'),
        ).toHaveCount(2);
      }
      // Accessibility checks deliberately focus/scroll to main. Capture the
      // actual top-of-page design afterward, without a test-created focus ring.
      await page.locator("main").evaluate((node: HTMLElement) => node.blur());
      await page.locator("main img").evaluateAll((nodes) => {
        for (const node of nodes) (node as HTMLImageElement).loading = "eager";
      });
      await expect
        .poll(() =>
          page
            .locator("main img")
            .evaluateAll((nodes) =>
              nodes.every(
                (node) =>
                  (node as HTMLImageElement).complete &&
                  (node as HTMLImageElement).naturalWidth > 0,
              ),
            ),
        )
        .toBe(true);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: info.outputPath(`${label}-${width}.png`),
        fullPage: true,
      });
      await page.screenshot({
        path: info.outputPath(`${label}-${width}-viewport.png`),
      });
    });
test("word counter counts locally, clears and copies a text-free summary", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/word-counter/");
  await page
    .getByRole("button", { name: "Load example text", exact: true })
    .click();
  await expect(page.locator('[data-count="Words"]')).not.toHaveText("0");
  const sentBodies: string[] = [];
  page.on("request", (request) => {
    if (request.postData()) sentBodies.push(request.postData()!);
  });
  const text = "PrivateWritingMarker hello\n\nAnother line.";
  await page.getByLabel("Your text", { exact: true }).fill(text);
  await expect(page.locator('[data-count="Words"]')).toHaveText("4");
  await expect(page.locator('[data-count="Paragraphs"]')).toHaveText("2");
  await expect(page.locator('[data-count="Characters"]')).toHaveText(
    String(Array.from(text).length),
  );
  await page.getByRole("button", { name: "Copy counts", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Counts copied");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Words: 4");
  expect(copied).not.toContain("PrivateWritingMarker");
  expect(sentBodies.join(" ")).not.toContain("PrivateWritingMarker");
  expect(
    await page.evaluate(() =>
      JSON.stringify({
        local: { ...localStorage },
        session: { ...sessionStorage },
      }),
    ),
  ).not.toContain("PrivateWritingMarker");
  await page.getByRole("button", { name: "Clear text", exact: true }).click();
  await expect(page.getByLabel("Your text", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Your text", { exact: true })).toBeFocused();
  await expect(page.locator('[data-count="Words"]')).toHaveText("0");
  await page.locator(".reference-tool-faq summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(
    page.locator(".reference-tool-faq details").first(),
  ).toHaveAttribute("open", "");
});
