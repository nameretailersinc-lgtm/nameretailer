import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [375, 1280]) {
  test(`publication details stay open when their inner padding is clicked at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const listings = page.locator(
      width === 375
        ? ".marketplace-cards article"
        : ".marketplace-table tbody tr",
    );
    await listings
      .first()
      .getByRole("button", { name: "View Details", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.click({ position: { x: 8, y: 8 } });
    await expect(dialog).toBeVisible();
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press("Tab");
      expect(
        await dialog.evaluate(
          (element) =>
            document.activeElement === document.body ||
            element.contains(document.activeElement),
        ),
      ).toBe(true);
    }
    await page
      .locator(".site-theme-toggle")
      .evaluate((element: HTMLButtonElement) => element.focus());
    await expect(page.locator(".site-theme-toggle")).not.toBeFocused();
    expect(
      (
        await new AxeBuilder({ page })
          .include(".marketplace-publication-dialog")
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(
      listings
        .first()
        .getByRole("button", { name: "View Details", exact: true }),
    ).toBeFocused();
  });
}

test("opening publication details locks the background and closing restores prior styles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const before = await page.evaluate(() => ({
    root: document.documentElement.style.overflow,
    body: document.body.style.overflow,
  }));
  await page
    .locator(".marketplace-cards article")
    .first()
    .getByRole("button", { name: "View Details", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).toBe("hidden");
  await page
    .getByRole("button", { name: "Close publication details", exact: true })
    .click();
  expect(
    await page.evaluate(() => ({
      root: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    })),
  ).toEqual(before);
});

for (const path of ["/", "/guest-post-by-dr/"]) {
  test(`shortlisted publications open details without losing comparison on ${path}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(path);
    const firstListing = page
      .locator(".marketplace-results .marketplace-cards article")
      .first();
    const name = (await firstListing.locator("h3 a").textContent())!.trim();
    await firstListing
      .getByRole("button", { name: "Shortlist", exact: true })
      .click();
    const comparison = page.locator("#shortlist");
    const trigger = comparison.getByRole("button", {
      name: `View details for ${name}`,
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(name);
    await expect(
      dialog.getByRole("link", { name: "Plan placement", exact: true }),
    ).toHaveAttribute("href", /\/cart\/\?product=/);
    await expect(
      dialog.getByRole("link", { name: "listing methodology", exact: true }),
    ).toHaveAttribute("href", "/methodology/");
    await expect(comparison.locator("h2")).toContainText("1/4");
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(trigger).toBeInViewport();
    await expect(comparison.locator("h2")).toContainText("1/4");
    expect(new URL(page.url()).pathname).toBe(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("only a real backdrop click dismisses publication details", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const trigger = page
    .locator(".marketplace-table tbody tr")
    .first()
    .getByRole("button", { name: "View Details", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  const rect = (await dialog.boundingBox())!;
  await page.mouse.move(rect.x + 8, rect.y + 8);
  await page.mouse.down();
  await page.mouse.move(5, 5);
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("publication details retain accessible source links in dark appearance", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Use dark appearance", exact: true })
    .click();
  await page
    .locator(".marketplace-cards article")
    .first()
    .getByRole("button", { name: "View Details", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("link", { name: "listing methodology", exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .include(".marketplace-publication-dialog")
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
});
