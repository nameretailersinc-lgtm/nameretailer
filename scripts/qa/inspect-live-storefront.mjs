import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
// Read-only public review. Never sign in, submit forms, or change the live site.
const destination = ".local/live-storefront-review";
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
try {
  const page = await browser.newPage();
  const response = await page.goto("https://nameretailer.com/", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  console.log(
    JSON.stringify({
      status: response?.status(),
      title: await page.title(),
      headings: await page.locator("h1").allTextContents(),
      navigation: await page
        .locator("header nav a, header .menu a")
        .allTextContents(),
    }),
  );
  for (const width of [375, 820, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({
      path: `${destination}/live-${width}.png`,
      timeout: 10000,
    });
    console.log(
      JSON.stringify({
        width,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      }),
    );
  }
} catch (error) {
  console.log(
    JSON.stringify({
      review: "Could not fully load the live storefront",
      error: error instanceof Error ? error.name : "UnknownError",
    }),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
