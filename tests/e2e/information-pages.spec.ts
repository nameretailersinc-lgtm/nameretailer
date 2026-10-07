import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/about/",
  "/contact/",
  "/how-it-works/",
  "/help-center/",
  "/services/",
  "/guides/",
  "/blog/",
  "/policies/",
  "/faq/",
  "/seo-tools/",
  "/site-map/",
  "/guest-post-marketplace/",
];
for (const width of [320, 375, 768, 820, 1024, 1280])
  test(`information pages share accessible chrome and reflow at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
      await expect
        .poll(() =>
          page
            .locator("main img")
            .evaluateAll((images) =>
              images.every(
                (image) =>
                  (image as HTMLImageElement).complete &&
                  (image as HTMLImageElement).naturalWidth > 0,
              ),
            ),
        )
        .toBe(true);
      expect(
        await page.locator("main img").evaluateAll((images) =>
          images.every((image) => {
            const img = image as HTMLImageElement;
            return (
              Math.abs(
                Number(img.getAttribute("width")) /
                  Number(img.getAttribute("height")) -
                  img.naturalWidth / img.naturalHeight,
              ) < 0.01
            );
          }),
        ),
      ).toBe(true);
      const geometry = await page.evaluate(() => {
        const header = document.querySelector(".reference-header")!;
        const rects = [...header.querySelectorAll("a")]
          .map((link) => link.getBoundingClientRect())
          .filter((rect) => rect.width > 0);
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          outside: rects.some(
            (rect) => rect.left < -1 || rect.right > innerWidth + 1,
          ),
          overlap: rects.some((rect, index) =>
            rects
              .slice(index + 1)
              .some(
                (other) =>
                  rect.left < other.right - 1 &&
                  other.left < rect.right - 1 &&
                  rect.top < other.bottom - 1 &&
                  other.top < rect.bottom - 1,
              ),
          ),
          main: document.querySelector("main")!.getBoundingClientRect().left,
          brand: header
            .querySelector(".marketplace-brand")!
            .getBoundingClientRect().left,
          footer: document
            .querySelector(".reference-footer .marketplace-brand")!
            .getBoundingClientRect().left,
        };
      });
      expect(geometry.overflow).toBe(false);
      expect(geometry.outside).toBe(false);
      expect(geometry.overlap).toBe(false);
      expect(Math.abs(geometry.main - geometry.brand)).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.main - geometry.footer)).toBeLessThanOrEqual(1);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${route.replaceAll("/", "")}-${width}.png`),
        fullPage: true,
      });
    }
  });
test("directories lead to real pages and FAQ controls expose truthful answers", async ({
  page,
}) => {
  await page.goto("/about/");
  await page
    .getByRole("navigation", { name: "Site navigation" })
    .getByRole("link", { name: "Tools", exact: true })
    .click();
  await expect(page).toHaveURL(/\/seo-tools\/$/);
  await page
    .getByRole("link", { name: "Open word counter", exact: true })
    .click();
  await expect(page).toHaveURL(/\/word-counter\/$/);
  await page.goto("/faq/");
  await page
    .getByText("Does saving a cart place an order?", { exact: true })
    .click();
  await expect(
    page.getByText(/Saving does not reserve inventory/),
  ).toBeVisible();
  await page.goto("/site-map/");
  const destinations = await page
    .locator("main li a")
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).pathname),
    );
  for (const destination of destinations)
    expect((await page.request.get(destination)).status()).toBe(200);
  await page.goto("/guest-post-marketplace/");
  await expect(
    page
      .getByRole("link", { name: "Continue" })
      .filter({ has: page.locator("svg") })
      .first(),
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/products/?maxPrice=50"]'),
  ).toHaveCount(1);
});
