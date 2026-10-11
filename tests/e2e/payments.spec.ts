import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { CheckoutView } from "../../lib/commerce/checkout-types";
import type { OrderView } from "../../lib/commerce/payment-types";
const id = "a".repeat(64),
  productId = "e67939ad-8f50-41d7-912b-62928b8a1775";
const billing = {
  email: "payment-qa@example.com",
  firstName: "Test",
  lastName: "Buyer",
  country: "US",
  street: "Test street",
  city: "Test city",
  region: "",
  postalCode: "",
  apartment: "",
  phone: "",
};
const item = {
  productId,
  productVersion: 1,
  domain: "example.com",
  writingWords: 0 as const,
  placementCents: 12345,
  writingCents: 0,
  totalCents: 12345,
  status: "ready" as const,
  options: null,
  brief: {
    promotedUrl: "https://example.com/qa",
    keyword: "test",
    specialRequirements: "",
    articleText: "Original article",
    fileId: null,
  },
  file: null,
};
const checkout: CheckoutView = {
  cart: {
    version: 3,
    currency: "USD",
    checkoutAvailable: true,
    totalCents: 12345,
    items: [item],
  },
  draft: {
    version: 2,
    cartVersion: 3,
    billing,
    notes: "",
    paymentPreference: "stripe",
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  issues: [],
  paymentAvailable: true,
  orderSubmissionAvailable: true,
  paymentMethods: { stripe: true, paypal: true },
};
const order: OrderView = {
  id,
  provider: "stripe",
  status: "paid",
  totalCents: 12345,
  currency: "USD",
  items: [item],
  billing,
  notes: "",
  createdAt: new Date().toISOString(),
  paidAt: new Date().toISOString(),
  version: 2,
  fulfillmentStatus: "processing",
  publishedPlacements: [],
};
async function mocks(page: Page) {
  await page.route("**/api/auth/session/**", (route) =>
    route.fulfill({ json: null }),
  );
  await page.route("**/api/account/csrf/**", (route) =>
    route.fulfill({ json: { token: "mock-csrf" } }),
  );
  await page.route("**/api/checkout/", (route) =>
    route.fulfill({
      json:
        route.request().method() === "PUT"
          ? {
              ...checkout,
              draft: {
                ...checkout.draft,
                ...route.request().postDataJSON(),
                version: 3,
                updatedAt: new Date().toISOString(),
                expiresAt: checkout.draft!.expiresAt,
              },
            }
          : checkout,
    }),
  );
  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Mock card checkout</h1>",
    }),
  );
  await page.route("https://www.sandbox.paypal.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Mock PayPal approval</h1>",
    }),
  );
}
test.describe("hosted payment checkout", () => {
  test.beforeEach(async ({ page }) => {
    await mocks(page);
  });
  for (const provider of ["stripe", "paypal"] as const)
    test(`saves billing and redirects to ${provider} with no client amount`, async ({
      page,
    }) => {
      let payload: unknown;
      await page.route("**/api/checkout/payments/", (route) => {
        payload = route.request().postDataJSON();
        expect(route.request().headers()["x-csrf-token"]).toBe("mock-csrf");
        return route.fulfill({
          json: {
            orderId: id,
            url:
              provider === "stripe"
                ? "https://checkout.stripe.com/c/pay/mock"
                : "https://www.sandbox.paypal.com/checkoutnow?token=MOCKORDER",
          },
        });
      });
      await page.goto("/checkout/");
      await expect(
        page.getByLabel("Billing email", { exact: false }),
      ).toHaveValue(billing.email);
      await page
        .getByRole("radio", {
          name: provider === "stripe" ? /Debit \/ credit card/ : /PayPal/,
        })
        .check();
      const pay = page.getByRole("button", { name: /^Pay \$123\.45 with/ });
      await expect(pay).toBeDisabled();
      await page.getByRole("checkbox", { name: /I agree to the/ }).check();
      await pay.click();
      await expect(page).toHaveURL(
        provider === "stripe"
          ? /checkout\.stripe\.com/
          : /sandbox\.paypal\.com/,
      );
      expect(payload).toEqual({
        cartVersion: 3,
        draftVersion: 3,
        provider,
        termsAccepted: true,
      });
    });
  test("preserves draft planning when payment credentials are unavailable", async ({
    page,
  }) => {
    await page.route("**/api/checkout/", (route) =>
      route.fulfill({
        json: {
          ...checkout,
          paymentMethods: { stripe: false, paypal: false },
          paymentAvailable: false,
          orderSubmissionAvailable: false,
        },
      }),
    );
    await page.goto("/checkout/");
    await page.getByRole("radio", { name: /PayPal/ }).check();
    await expect(
      page.getByRole("button", { name: /^Pay .* with/ }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Save checkout draft" }).click();
    await expect(page.getByRole("status")).toContainText(
      "No order has been placed",
    );
  });
  test("verifies a return through the server and shows its receipt", async ({
    page,
  }) => {
    await page.route("**/api/checkout/payments/confirm/", (route) => {
      expect(route.request().postDataJSON()).toEqual({
        orderId: id,
        token: "MOCKORDER",
      });
      return route.fulfill({
        json: {
          ...order,
          provider: "paypal",
          fulfillmentStatus: "completed",
          publishedPlacements: [
            { productId, url: "https://example.com/published" },
          ],
        },
      });
    });
    await page.goto(`/checkout/return/?order=${id}&token=MOCKORDER`);
    await expect(
      page.getByRole("heading", { name: "Payment received" }),
    ).toBeVisible();
    await expect(
      page.getByText("Paid · Completed", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View published placement" }),
    ).toHaveAttribute("href", "https://example.com/published");
  });
  test("does not capture payment on the cancel return", async ({ page }) => {
    let confirmations = 0;
    await page.route(`**/api/orders/${id}/`, (route) =>
      route.fulfill({ json: { ...order, status: "pending", paidAt: null } }),
    );
    await page.route("**/api/checkout/payments/confirm/", (route) => {
      confirmations++;
      return route.fulfill({ json: order });
    });
    await page.goto(`/checkout/return/?order=${id}&cancelled=1`);
    await expect(
      page.getByRole("heading", { name: "Checkout paused" }),
    ).toBeVisible();
    await expect(
      page.getByText("You returned from checkout", { exact: true }),
    ).toBeVisible();
    expect(confirmations).toBe(0);
    await page.getByRole("button", { name: "Check payment status" }).click();
    await expect(
      page.getByRole("heading", { name: "Payment received" }),
    ).toBeVisible();
    expect(confirmations).toBe(1);
  });
  test("requires sign-in before showing private order details", async ({
    page,
  }) => {
    await page.route("**/api/checkout/payments/confirm/", (route) =>
      route.fulfill({ status: 401, json: { error: "Sign in to continue." } }),
    );
    await page.goto(`/checkout/return/?order=${id}`);
    await expect(
      page.getByRole("heading", { name: "Sign in to view this order" }),
    ).toBeVisible();
    await expect(page.getByText("example.com", { exact: true })).toHaveCount(0);
  });
  for (const width of [320, 375, 768, 1440])
    for (const theme of ["light", "dark"])
      test(`checkout and receipt reflow and accessibility ${width}px ${theme}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript(
          (value) => localStorage.setItem("nr-site-theme", value),
          theme,
        );
        await page.route("**/api/checkout/payments/confirm/", (route) =>
          route.fulfill({ json: order }),
        );
        for (const path of ["/checkout/", `/checkout/return/?order=${id}`]) {
          await page.goto(path);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          if (path === "/checkout/")
            await expect(
              page.getByLabel("Billing email", { exact: false }),
            ).toHaveValue(billing.email);
          else
            await expect(
              page.getByRole("heading", { name: "Payment received" }),
            ).toBeVisible();
          if (theme === "dark") {
            const button = page.getByRole("button", {
              name: "Use dark appearance",
              exact: true,
            });
            if (await button.count()) await button.click();
          }
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            ),
          ).toBe(false);
          expect(
            (
              await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
                .analyze()
            ).violations.map((issue) => ({
              id: issue.id,
              nodes: issue.nodes.map((node) => node.failureSummary),
            })),
          ).toEqual([]);
        }
      });
});
