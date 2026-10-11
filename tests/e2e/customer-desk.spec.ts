import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { CartView, PlacementOptions } from "../../lib/commerce/cart-types";
import type { UserSummary } from "../../lib/cms/types";

const productId = "bdc43825-d1ac-4d26-8c12-ec1bf1b95c47";
const options: PlacementOptions = {
  productId,
  productVersion: 1,
  domain: "https://example.com",
  placementCents: 8844,
  currency: "USD",
  writingOptions: [{ words: 500, priceCents: 1200 }],
  requirements: "Review the publication guidelines.",
  turnaround: "4 days",
  linkType: "DoFollow",
};
async function mockDesk(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem("nr-analytics-consent-v1", "denied"),
  );
  const state: { user: UserSummary; cart: CartView; saved: unknown } = {
    user: {
      id: "preview-customer",
      name: "Preview customer",
      email: "preview@example.com",
      role: "customer",
      active: true,
      createdAt: "2026-01-01T00:00:00Z",
    },
    cart: {
      version: 1,
      currency: "USD",
      totalCents: 8844,
      checkoutAvailable: true,
      items: [
        {
          productId,
          productVersion: 1,
          domain: options.domain,
          writingWords: 0,
          placementCents: 8844,
          writingCents: 0,
          totalCents: 8844,
          status: "ready",
          options,
          file: null,
          brief: {
            promotedUrl: "https://example.com/campaign",
            keyword: "a relevant anchor",
            specialRequirements: "Original content only",
            articleText: "An original article for the selected publication.",
            fileId: null,
          },
        },
      ],
    },
    saved: null,
  };
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    const json = (data: unknown) => route.fulfill({ json: data });
    if (path === "/api/auth/session/") return json(null);
    if (path === "/api/account/profile/") {
      if (method === "PATCH") {
        state.saved = route.request().postDataJSON();
        state.user = { ...state.user, ...(state.saved as { name: string }) };
      }
      return json({ user: state.user });
    }
    if (path === "/api/account/csrf/") return json({ token: "preview-csrf" });
    if (path === "/api/cart/files/") return json([]);
    if (path === `/api/products/${productId}/options/`) return json(options);
    if (path === "/api/cart/") {
      if (method === "DELETE")
        state.cart = { ...state.cart, version: 2, items: [], totalCents: 0 };
      if (method === "PUT") {
        const data = route.request().postDataJSON();
        state.saved = data.item;
        const writingCents = data.item.writingWords ? 1200 : 0;
        state.cart = {
          ...state.cart,
          version: 2,
          totalCents: 8844 + writingCents,
          items: [
            {
              ...state.cart.items[0],
              ...data.item,
              writingCents,
              totalCents: 8844 + writingCents,
            },
          ],
        };
      }
      return json(state.cart);
    }
    if (method !== "GET") return route.abort();
    return route.continue();
  });
  return state;
}

test("cart retains editing, server totals and removal", async ({ page }) => {
  const state = await mockDesk(page);
  await page.goto("/cart/");
  const panel = page.getByRole("region", { name: "Saved placements (1)" });
  await panel.getByText("View saved article brief", { exact: true }).click();
  await expect(
    panel
      .locator(".cart-article-text")
      .filter({ hasText: "An original article for the selected publication." }),
  ).toBeVisible();
  await panel
    .getByText("Review or change article option", { exact: true })
    .click();
  await panel.getByRole("radio", { name: /Link \+ article/ }).check();
  await panel.getByRole("button", { name: "Save placement to cart" }).click();
  await expect(page.getByRole("status")).toContainText("Placement saved");
  await expect(
    page.getByRole("complementary", { name: "Order summary" }),
  ).toContainText("$100.44");
  expect(state.saved).toMatchObject({
    productId,
    writingWords: 500,
    brief: {
      promotedUrl: "https://example.com/campaign",
      keyword: "a relevant anchor",
    },
  });
  await page
    .getByRole("button", { name: "Remove https://example.com" })
    .click();
  await expect(
    page.getByRole("heading", { name: "No saved placements yet" }),
  ).toBeVisible();
  expect(state.cart.items).toEqual([]);
});

test("account profile saves and existing destinations remain available", async ({
  page,
}) => {
  const state = await mockDesk(page);
  await page.goto("/my-account/");
  await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(
    "preview@example.com",
  );
  await expect(
    page.getByLabel("Email address", { exact: true }),
  ).toHaveAttribute("readonly", "");
  await page
    .getByLabel("Name", { exact: true })
    .fill("Updated preview customer");
  await page.getByRole("button", { name: "Save account details" }).click();
  await expect(page.getByRole("status")).toContainText("Account details saved");
  expect(state.saved).toEqual({ name: "Updated preview customer" });
  await expect(
    page.getByRole("link", { name: /View your cart/ }),
  ).toHaveAttribute("href", "/cart/");
  await expect(page.getByRole("link", { name: /Your orders/ })).toHaveAttribute(
    "href",
    "/my-account/orders/",
  );
  await expect(
    page.getByRole("link", { name: "Reset your password", exact: true }),
  ).toHaveAttribute("href", "/my-account/forgot-password/");
});

for (const width of [320, 375, 768, 1440])
  for (const theme of ["light", "dark"] as const) {
    test(`cart and account reflow and accessibility ${width}px ${theme}`, async ({
      page,
    }, info) => {
      await mockDesk(page);
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript(
        (value) => localStorage.setItem("nr-site-theme", value),
        theme,
      );
      for (const path of ["/cart/", "/my-account/"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(
          page.getByRole("heading", {
            name:
              path === "/cart/" ? "Saved placements (1)" : "Account details",
            exact: true,
          }),
        ).toBeVisible();
        if (theme === "dark") {
          const toggle = page.getByRole("button", {
            name: "Use dark appearance",
            exact: true,
          });
          if (await toggle.count()) await toggle.click();
          await expect(page.locator("html")).toHaveAttribute(
            "data-site-theme",
            "dark",
          );
        } else
          await expect(page.locator("html")).not.toHaveAttribute(
            "data-site-theme",
            "dark",
          );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
        ).toBe(false);
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          result.violations.map((issue) => ({
            id: issue.id,
            nodes: issue.nodes.map((node) => node.target),
          })),
        ).toEqual([]);
        if ([375, 1440].includes(width))
          await page.screenshot({
            path: info.outputPath(
              `${path === "/cart/" ? "cart" : "account"}-${width}-${theme}.png`,
            ),
            fullPage: true,
          });
      }
    });
  }

for (const width of [320, 768, 1440])
  test(`placement brief matches the customer theme at ${width}px`, async ({
    page,
  }, info) => {
    await mockDesk(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/cart/?product=${productId}`);
    await expect(
      page.getByRole("heading", { name: "Prepare Your Placement" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: /Your article text/ }),
    ).toContainText("An original article");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((issue) => ({
        id: issue.id,
        nodes: issue.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: info.outputPath(`placement-${width}.png`),
      fullPage: true,
    });
  });
