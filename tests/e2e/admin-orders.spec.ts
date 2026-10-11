import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { actor, fixtures } from "./helpers";
import type { AdminOrderView } from "../../lib/commerce/payment-types";
const id = "a".repeat(64),
  productId = "e67939ad-8f50-41d7-912b-62928b8a1775";
const fixtureOrder: AdminOrderView = {
  id,
  version: 2,
  provider: "stripe",
  status: "paid",
  fulfillmentStatus: "queued",
  publishedPlacements: [],
  internalNotes: "",
  live: false,
  paymentReference: "pi_mock_paid",
  currency: "USD",
  totalCents: 12345,
  createdAt: new Date().toISOString(),
  paidAt: new Date().toISOString(),
  notes: "Customer note",
  billing: {
    email: "order-qa@example.com",
    firstName: "Test",
    lastName: "Buyer",
    country: "US",
    street: "Test street",
    city: "Test city",
    region: "",
    postalCode: "",
    apartment: "",
    phone: "",
  },
  items: [
    {
      productId,
      productVersion: 1,
      domain: "example.com",
      writingWords: 0,
      placementCents: 12345,
      writingCents: 0,
      totalCents: 12345,
      status: "ready",
      options: null,
      brief: {
        promotedUrl: "https://example.com/qa",
        keyword: "test",
        specialRequirements: "",
        articleText: "Synthetic article",
        fileId: null,
      },
      file: null,
    },
  ],
};
test.describe("admin order management", () => {
  test("requires an administrator and CSRF protection for updates", async () => {
    const data = await fixtures(),
      customer = await actor(data.customer),
      admin = await actor(data.admin);
    try {
      expect((await customer.get("/api/admin/orders/")).status()).toBe(403);
      expect(
        (
          await admin.patch(`/api/admin/orders/${id}/`, {
            data: { version: 2, fulfillmentStatus: "completed" },
          })
        ).status(),
      ).toBe(403);
    } finally {
      await customer.dispose();
      await admin.dispose();
    }
  });
  for (const width of [375, 1440])
    test(`review and update paid order at ${width}px`, async ({ page }) => {
      const admin = await actor((await fixtures()).admin);
      try {
        await page.context().addCookies((await admin.storageState()).cookies);
        await page.setViewportSize({ width, height: 950 });
        let order = structuredClone(fixtureOrder),
          submitted: any;
        await page.route("**/api/admin/orders/**", (route) => {
          const url = new URL(route.request().url());
          if (url.pathname === "/api/admin/orders/")
            return route.fulfill({
              json: {
                data: [
                  {
                    ...order,
                    placementCount: 1,
                    billingEmail: order.billing.email,
                  },
                ],
                total: 1,
                page: 1,
              },
            });
          if (route.request().method() === "PATCH") {
            submitted = route.request().postDataJSON();
            order = { ...order, ...submitted, version: order.version + 1 };
          }
          return route.fulfill({ json: order });
        });
        await page.goto("/admin/orders/");
        await expect(
          page.getByRole("heading", { name: "Placement orders" }),
        ).toBeVisible();
        await page
          .getByRole("button", { name: `View order ${id.slice(0, 12)}` })
          .click();
        await expect(
          page.getByRole("region", { name: "Order details" }),
        ).toContainText("Customer note");
        await page.getByLabel("Fulfillment status").selectOption("completed");
        await page
          .getByLabel("Internal notes")
          .fill("Publisher completed the placement");
        await page
          .getByLabel("Published URL for example.com")
          .fill("https://example.com/published");
        await page.getByRole("button", { name: "Save order progress" }).click();
        await expect(page.getByRole("status")).toContainText(
          "Order progress saved",
          { timeout: 30000 },
        );
        expect(submitted).toEqual({
          version: 2,
          fulfillmentStatus: "completed",
          internalNotes: "Publisher completed the placement",
          publishedPlacements: [
            { productId, url: "https://example.com/published" },
          ],
        });
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
      } finally {
        await admin.dispose();
      }
    });
  test("shows a conflicting edit and keeps unpaid fulfillment controls disabled", async ({
    page,
  }) => {
    const admin = await actor((await fixtures()).admin);
    try {
      await page.context().addCookies((await admin.storageState()).cookies);
      let paid = true;
      await page.route("**/api/admin/orders/**", (route) => {
        const order = { ...fixtureOrder, status: paid ? "paid" : "pending" };
        if (new URL(route.request().url()).pathname === "/api/admin/orders/")
          return route.fulfill({
            json: {
              data: [
                {
                  ...order,
                  placementCount: 1,
                  billingEmail: order.billing.email,
                },
              ],
              total: 1,
              page: 1,
            },
          });
        return route.request().method() === "PATCH"
          ? route.fulfill({
              status: 409,
              json: {
                error: "This order changed. Reload its details before saving.",
              },
            })
          : route.fulfill({ json: order });
      });
      await page.goto("/admin/orders/");
      await page
        .getByRole("button", { name: `View order ${id.slice(0, 12)}` })
        .click();
      await page.getByRole("button", { name: "Save order progress" }).click();
      await expect(page.getByRole("alert").filter({ hasText: "This order changed" })).toContainText("This order changed");
      paid = false;
      await page.getByRole("button", { name: "Reload order details" }).click();
      await expect(
        page.getByRole("button", { name: "Save order progress" }),
      ).toBeDisabled();
      await expect(page.getByLabel("Fulfillment status")).toBeDisabled();
    } finally {
      await admin.dispose();
    }
  });
});
