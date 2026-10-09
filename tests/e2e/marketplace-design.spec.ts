import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { actor, fixtures, key, mutation } from "./helpers";
import type { ProductInput } from "../../lib/commerce/types";

const group = key("design");
async function loaded(page: Page) {
  await expect(
    page.getByRole("status").filter({ hasText: "2 matching publications" }),
  ).toBeVisible({ timeout: 30000 });
}
async function branding(page: Page) {
  await expect(page).toHaveTitle(/Name Retailer/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  const text = await page.locator("body").innerText();
  expect(text).toContain("Name Retailer");
  expect(text).toContain("Trusted by 10,000+ marketers");
  await expect(page.locator(".marketplace-trust-note")).toBeVisible();
  await expect(page.locator(".marketplace-trust-note")).toContainText(
    "Trusted by 10,000+ marketers",
  );
  await expect(page.locator(".marketplace-trust-note")).toContainText(
    "Owner-reported community size",
  );
  // The exact 10,000+ marketer line is owner-confirmed, not an inventory count.
  expect(text).not.toMatch(
    /Premier SEO Services|Ahmed R\.|Sara M\.|Usman K\.|300%|\+186%|245\.8K|ranked on page 1 for 50\+/i,
  );
  expect(text).not.toMatch(
    /independently verified publishers|guaranteed (?:rankings|traffic|growth)/i,
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /guest|publication|placement/i,
  );
}
async function semantics(page: Page) {
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    "Refreshed page has no document-level horizontal overflow",
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
    "Visible form controls retain associated labels",
  ).toBe(0);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    result.violations.map((issue) => ({
      id: issue.id,
      impact: issue.impact,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test.describe("reference-led marketplace refresh", () => {
  test.beforeAll(async () => {
    const api = await actor((await fixtures()).admin);
    for (let index = 0; index < 2; index++) {
      const input: ProductInput = {
        externalId: null,
        domain: `${group}-${index}.com`,
        country: "QA design country",
        category: "QA design topic",
        language: "English",
        priceCents: 10001 + index * 100,
        currency: "USD",
        status: "active",
        metrics: {
          da: null,
          dr: index ? 42 : null,
          tf: null,
          ur: null,
          traffic: null,
          referringDomains: null,
          backlinks: null,
          spamScore: null,
        },
        linkType: "",
        turnaround: "",
        requirements:
          "Synthetic visual QA listing in the isolated test database only.",
      };
      expect(
        (await mutation(api, "post", "/api/admin/products", input)).status(),
      ).toBe(201);
    }
    await api.dispose();
  });

  for (const route of ["/products/", "/guest-post-by-dr/"])
    for (const width of [320, 375, 1280]) {
      test(`${route} retains real marketplace branding, anchors and accessible reflow at ${width}px`, async ({
        page,
      }, testInfo) => {
        test.setTimeout(90000);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${route}?q=${group}`);
        await loaded(page);
        await branding(page);
        await semantics(page);
        await expect(page.locator(".marketplace-method")).toContainText(
          "No measurement date was supplied",
        );
        const hero = page.locator(".marketplace-hero");
        if (route === "/products/") {
          await expect(hero).toHaveCount(0);
          await expect(page.locator(".marketplace-search-panel")).toBeVisible();
          await expect(
            page.getByLabel("Results per page", { exact: true }),
          ).toHaveValue("10");
        } else {
          expect(
            await page
              .locator(".marketplace-benefits h2")
              .first()
              .evaluate((node) => getComputedStyle(node).fontSize),
            "Marketplace benefits retain compact UI typography, not inherited editorial headings",
          ).toBe("14px");
          await expect(
            hero.getByRole("link", {
              name: "Browse publications",
              exact: true,
            }),
          ).toHaveAttribute("href", "#inventory");
          await expect(
            hero.getByRole("link", {
              name: "Compare your shortlist",
              exact: true,
            }),
          ).toHaveAttribute("href", "#shortlist");
          await expect(
            page.locator("#buyer-guide .marketplace-selection-steps > li"),
          ).toHaveCount(3);
          await expect(page.locator("#marketplace-help > details")).toHaveCount(
            3,
          );
          if (width <= 375) {
            expect(
              await page
                .locator(".marketplace-metric-callout > div")
                .evaluate((element) => element.getBoundingClientRect().width),
              "Mobile metric context has a readable text column",
            ).toBeGreaterThanOrEqual(width === 320 ? 180 : 200);
          }
        }
        if (width === 1280) {
          const comparisonFits = await page
            .locator(".marketplace-table-region")
            .evaluate((element) => {
              const edge = element.getBoundingClientRect().right;
              const header = element.querySelector("thead th:last-child")!;
              const button = element.querySelector(
                "tbody tr:first-child td:last-child button",
              )!;
              return (
                header.getBoundingClientRect().right <= edge + 1 &&
                button.getBoundingClientRect().right <= edge + 1
              );
            });
          expect(
            comparisonFits,
            "Desktop Compare heading and shortlist action fit without hidden-right-edge scrolling",
          ).toBe(true);
        }
        if (route !== "/products/") {
          const anchors = hero.locator('a[href^="#"]');
          expect(
            await anchors.count(),
            "Hero provides working in-page marketplace actions",
          ).toBeGreaterThanOrEqual(1);
          for (let index = 0; index < (await anchors.count()); index++) {
            const href = await anchors.nth(index).getAttribute("href");
            expect(href).not.toBe("#");
            await expect(page.locator(`[id="${href!.slice(1)}"]`)).toHaveCount(
              1,
            );
          }
        }
        for (const href of await page
          .getByRole("main")
          .locator('a[href^="#"]')
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute("href")!),
          )) {
          expect(href).not.toBe("#");
          await expect(page.locator(`[id="${href.slice(1)}"]`)).toHaveCount(1);
        }
        if (route !== "/products/") {
          const inquiry = page.getByRole("link", {
            name: "Ask a placement question",
            exact: true,
          });
          await expect(inquiry).toBeVisible();
          await expect(inquiry).toHaveAttribute(
            "href",
            "mailto:info@nameretailer.com",
          );
        }
        await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
        await page
          .locator(".reference-header")
          .getByRole("button", { name: "Account info", exact: true })
          .click();
        await expect(
          page
            .locator(".reference-header")
            .getByRole("link", { name: "Your planning cart", exact: true }),
        ).toHaveAttribute("href", "/cart/");
        await expect(
          page
            .locator(".reference-header")
            .getByRole("link", { name: "Your account", exact: true }),
        ).toHaveAttribute("href", "/my-account/");
        await page.keyboard.press("Escape");
        if (route !== "/products/") {
          const art = page.locator(".marketplace-hero-art");
          await expect(art).toHaveAttribute("alt", "");
          await expect
            .poll(() =>
              art.evaluate(
                (element: HTMLImageElement) =>
                  element.complete && element.naturalWidth > 0,
              ),
            )
            .toBe(true);
        }
        if (width !== 320) {
          const label =
            route === "/guest-post-by-dr/" ? "domain-rating" : "products";
          await page.screenshot({
            path: testInfo.outputPath(`${label}-${width}.png`),
            fullPage: true,
          });
          await page.screenshot({
            path: testInfo.outputPath(`${label}-${width}-viewport.png`),
          });
        }
      });
    }

  test("refreshed empty inventory state comes from a real unmatched query", async ({
    page,
  }) => {
    await fixtures();
    await page.goto(`/products/?q=${key("unmatched-design")}`);
    await expect(
      page.getByRole("heading", {
        name: "No publications match these filters",
        exact: true,
      }),
    ).toBeVisible({ timeout: 30000 });
    await expect(
      page.getByRole("status").filter({ hasText: "0 matching publications" }),
    ).toBeVisible();
    await expect(
      page.locator(".marketplace-table tbody tr, .marketplace-cards article"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Clear all filters", exact: true })
      .click();
    await expect(page).toHaveURL(/\/products\/$/);
    await expect(
      page.getByRole("status").filter({ hasText: /matching publications/ }),
    ).toBeVisible({ timeout: 30000 });
  });

  test("hero action, skip link and buyer help disclosures work with the keyboard", async ({
    page,
  }) => {
    await page.goto(`/guest-post-by-dr/?q=${group}`);
    await loaded(page);
    const hero = page.locator(".marketplace-hero");
    const browse = hero.getByRole("link", {
      name: "Browse publications",
      exact: true,
    });
    const href = await browse.getAttribute("href");
    await browse.focus();
    await page.keyboard.press("Enter");
    expect(new URL(page.url()).hash).toBe(href);
    expect(
      await page.locator("#inventory").evaluate((element) => {
        const top = element.getBoundingClientRect().top;
        return top >= 0 && top < innerHeight;
      }),
      "Hero action scrolls to the real inventory section",
    ).toBe(true);
    await page
      .getByRole("link", { name: "Skip to main content", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    const help = page.locator("#marketplace-help > details").first();
    await help
      .getByText("Does shortlisting reserve a publication or price?", {
        exact: true,
      })
      .focus();
    await page.keyboard.press("Enter");
    await expect(help).toHaveAttribute("open", "");
    await expect(help.locator("p")).toContainText("No.");
    await expect(help.locator("p")).toBeVisible();
    await expect(help.locator("p")).toContainText(
      "does not reserve it or lock its price",
    );
    await page.keyboard.press("Enter");
    await expect(help).not.toHaveAttribute("open", "");
    await page.locator(".marketplace-filter-panel > summary").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".marketplace-filter-panel")).not.toHaveAttribute(
      "open",
      "",
    );
    await page.keyboard.press("Enter");
    await expect(page.locator(".marketplace-filter-panel")).toHaveAttribute(
      "open",
      "",
    );
  });
});
