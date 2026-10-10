import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { withProductionServer } from "./server";
await withProductionServer(async (base) => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      if (!PerformanceObserver.supportedEntryTypes.includes("event"))
        throw new Error("Event Timing is unavailable");
      const target = window as Window & { interactionDurations?: number[] };
      target.interactionDurations = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const timing = entry as PerformanceEntry & { interactionId?: number };
          if (timing.interactionId)
            target.interactionDurations!.push(timing.duration);
        }
      }).observe({
        type: "event",
        buffered: true,
        durationThreshold: 16,
      } as PerformanceObserverInit);
    });
    const results = [];
    for (const path of [
      "/",
      "/guest-posting-sites/",
      "/technology-guest-posting-sites/",
      "/guest-posting-sites-under-50/",
    ]) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      if (path === "/") {
        await page
          .getByRole("button", { name: "Shortlist", exact: true })
          .first()
          .click();
        await page
          .getByRole("button", { name: "Remove from shortlist", exact: true })
          .first()
          .click();
      } else {
        const question = page.locator("details summary").first();
        await question.click();
        await question.click();
      }
      await page.waitForTimeout(350);
      const samples = await page.evaluate(
        () =>
          (window as Window & { interactionDurations?: number[] })
            .interactionDurations || [],
      );
      // Entries below the 16ms observation threshold may legitimately be absent.
      const maximum = samples.length ? Math.max(...samples) : null;
      results.push({
        path,
        samples: samples.length,
        maxObservedInteractionMs: maximum,
      });
      assert(
        maximum === null || maximum <= 200,
        path + ": sampled interaction exceeded 200 ms (" + maximum + ")",
      );
    }
    await writeFile(
      ".local/interaction-performance.json",
      JSON.stringify(results, null, 2),
    );
    console.table(results);
    console.log(
      "Local interaction samples passed. These are not field INP or a production percentile.",
    );
  } finally {
    await browser.close();
  }
});
