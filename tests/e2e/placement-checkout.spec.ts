import {
  test,
  expect,
  request as requests,
  type APIRequestContext,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  accountMutation,
  accountInput,
  seedCartProducts,
  savedInput,
} from "./account-cart-fixtures";
import { actor, fixtures, mutation, origin, signIn } from "./helpers";
import type { CartView } from "../../lib/commerce/cart-types";
import type { CheckoutView } from "../../lib/commerce/checkout-types";
let products: Awaited<ReturnType<typeof seedCartProducts>>;
const brief = {
  promotedUrl: "https://example.com/synthetic-brief/",
  keyword: "synthetic anchor",
  specialRequirements: "Test-only brief, not a real order.",
  articleText: "Synthetic article text for testing the placement workflow.",
  fileId: null,
};
const billing = {
  email: "synthetic-billing@example.com",
  firstName: "Synthetic",
  lastName: "Buyer",
  country: "PK",
  street: "Test address only",
  city: "Test city",
  region: "",
  postalCode: "",
  apartment: "",
  phone: "",
};
async function freshBuyer() {
  const api = await requests.newContext({ baseURL: origin });
  // Registration itself is covered by account-cart.spec; create distinct fixture
  // buyers through the isolated admin API without weakening its public limiter.
  const input = accountInput();
  const admin = await actor((await fixtures()).admin);
  try {
    const response = await mutation(admin, "post", "/api/admin/users/", {
      name: input.name,
      email: input.email,
      password: input.password,
      role: "customer",
      active: true,
    });
    expect(response.status()).toBe(201);
    await signIn(api, {
      email: input.email,
      password: input.password,
      id: (await response.json()).data.id,
    });
  } finally {
    await admin.dispose();
  }
  return api;
}
async function upload(
  api: APIRequestContext,
  name: string,
  text: string,
  mimeType = "text/plain",
) {
  const { token } = await (await api.get("/api/account/csrf/")).json();
  return api.post("/api/cart/files/", {
    headers: { Origin: origin, "x-csrf-token": token },
    multipart: { file: { name, mimeType, buffer: Buffer.from(text) } },
  });
}
test.describe("placement brief, private uploads and checkout drafts", () => {
  test.beforeAll(async () => {
    await fixtures();
    if (new URL(origin).port !== "3003")
      throw new Error(
        "Run placement mutation tests only on the isolated port-3003 test server.",
      );
    products = await seedCartProducts();
  });
  test("ownership, format limits, private downloads, billing drafts and stale price/cart guards", async ({
    request,
  }) => {
    const a = await freshBuyer(),
      b = await freshBuyer();
    try {
      expect((await request.get("/api/checkout/")).status()).toBe(401);
      expect((await request.get("/api/cart/files/")).status()).toBe(401);
      expect(
        (
          await a.post("/api/cart/files/", {
            multipart: {
              file: {
                name: "article.txt",
                mimeType: "text/plain",
                buffer: Buffer.from("Test text"),
              },
            },
          })
        ).status(),
      ).toBe(403);
      expect(
        (
          await upload(
            a,
            "disguised.pdf",
            "<html>not PDF</html>",
            "application/pdf",
          )
        ).status(),
      ).toBe(422);
      const fileResponse = await upload(
        a,
        "draft-article.txt",
        "A synthetic uploaded article.\nTest only.",
      );
      expect(fileResponse.status()).toBe(201);
      const file = await fileResponse.json();
      expect(Object.keys(file).sort()).toEqual([
        "expiresAt",
        "id",
        "name",
        "size",
      ]);
      expect((await a.get("/api/cart/files/")).status()).toBe(200);
      expect(await (await b.get("/api/cart/files/")).json()).toEqual([]);
      const downloaded = await a.get(`/api/cart/files/${file.id}/`);
      expect(downloaded.headers()["content-type"]).toBe(
        "application/octet-stream",
      );
      expect(downloaded.headers()["content-disposition"]).toContain(
        "attachment",
      );
      expect(downloaded.headers()["cache-control"]).toContain("no-store");
      expect(downloaded.headers()["content-security-policy"]).toContain(
        "sandbox",
      );
      expect(await downloaded.text()).toBe(
        "A synthetic uploaded article.\nTest only.",
      );
      expect((await b.get(`/api/cart/files/${file.id}/`)).status()).toBe(404);
      const selection = {
        productId: products.manual.id,
        productVersion: products.manual.version,
        writingWords: 0,
        brief: { ...brief, articleText: "", fileId: file.id },
      };
      expect(
        (
          await accountMutation(b, "put", "/api/cart/", {
            version: 0,
            item: selection,
          })
        ).status(),
      ).toBe(422);
      const saved = await accountMutation(a, "put", "/api/cart/", {
        version: 0,
        item: selection,
      });
      expect(saved.status()).toBe(200);
      const cart = (await saved.json()) as CartView;
      expect(cart.totalCents).toBe(12345);
      expect(cart.items[0].file?.id).toBe(file.id);
      const input = {
        version: 0,
        cartVersion: cart.version,
        billing,
        notes: "Synthetic draft",
        paymentPreference: "paypal",
      };
      const csrf = (await (await a.get("/api/account/csrf/")).json()).token;
      expect(
        (
          await a.put("/api/checkout/", {
            data: input,
            headers: {
              Origin: "https://outside.invalid",
              "x-csrf-token": csrf,
            },
          })
        ).status(),
      ).toBe(403);
      expect(
        (
          await accountMutation(a, "put", "/api/checkout/", {
            ...input,
            paid: true,
          })
        ).status(),
      ).toBe(422);
      const checkout = await accountMutation(a, "put", "/api/checkout/", input);
      expect(checkout.status()).toBe(200);
      const view = (await checkout.json()) as CheckoutView;
      expect(view.paymentAvailable).toBe(false);
      expect(view.orderSubmissionAvailable).toBe(false);
      expect(view.draft?.paymentPreference).toBe("paypal");
      expect(view.draft?.version).toBe(1);
      expect((await (await b.get("/api/checkout/")).json()).draft).toBeNull();
      expect(
        (await accountMutation(a, "put", "/api/checkout/", input)).status(),
      ).toBe(409);
      const updated = await accountMutation(a, "put", "/api/cart/", {
        version: cart.version,
        item: selection,
      });
      expect(updated.status()).toBe(200);
      const updatedCart = (await updated.json()) as CartView;
      expect(
        (
          await accountMutation(a, "put", "/api/checkout/", {
            ...input,
            version: 1,
          })
        ).status(),
      ).toBe(409);
      const admin = await actor((await fixtures()).admin);
      try {
        const changed = await mutation(
          admin,
          "patch",
          `/api/admin/products/${products.manual.id}/`,
          {
            ...savedInput(products.manual),
            version: products.manual.version,
            priceCents: 15000,
          },
        );
        expect(changed.status()).toBe(200);
        products.manual = (await changed.json()).data;
        expect(
          (
            await accountMutation(a, "put", "/api/checkout/", {
              ...input,
              version: 1,
              cartVersion: updatedCart.version,
            })
          ).status(),
        ).toBe(422);
      } finally {
        await admin.dispose();
      }
      expect(
        (
          await accountMutation(a, "delete", `/api/cart/files/${file.id}/`, {})
        ).status(),
      ).toBe(200);
      expect((await a.get(`/api/cart/files/${file.id}/`)).status()).toBe(404);
      expect(
        (await accountMutation(a, "delete", "/api/checkout/", {})).status(),
      ).toBe(200);
      expect((await (await a.get("/api/checkout/")).json()).draft).toBeNull();
    } finally {
      await a.dispose();
      await b.dispose();
    }
  });
  test("Buy now opens a real modal, writing package reaches cart and billing draft survives reload", async ({
    page,
  }) => {
    const api = await freshBuyer();
    try {
      await page.context().addCookies((await api.storageState()).cookies);
      await page.goto(
        `/products/?q=${encodeURIComponent(new URL(products.writing.domain).hostname)}`,
      );
      const buy = page.locator(".marketplace-table .placement-buy").first();
      await expect(buy).toBeVisible();
      await buy.click();
      const dialog = page.getByRole("dialog", {
        name: "Create a placement brief",
      });
      await expect(dialog).toBeVisible();
      await dialog
        .getByLabel("Promoted URL", { exact: false })
        .fill(brief.promotedUrl);
      await dialog
        .getByLabel("Keyword or anchor text", { exact: false })
        .fill(brief.keyword);
      await dialog.getByRole("radio", { name: /Link \+ article/ }).check();
      await expect(dialog.getByLabel("Content length")).toHaveValue("500");
      await dialog
        .getByLabel("Article brief / theme suggestions", { exact: false })
        .fill(brief.articleText);
      await expect(dialog.locator(".placement-total")).toContainText("$143.46");
      await dialog
        .getByRole("button", { name: "Save placement to cart" })
        .click();
      await expect(page).toHaveURL(/\/cart\/$/);
      await expect(page.locator(".cart-brief-details")).toContainText(
        brief.keyword,
      );
      await page
        .getByRole("link", { name: "Proceed to checkout review" })
        .click();
      await expect(page).toHaveURL(/\/checkout\/$/);
      await page
        .getByLabel("Billing email", { exact: false })
        .fill(billing.email);
      await page
        .getByLabel("First name", { exact: false })
        .fill(billing.firstName);
      await page
        .getByLabel("Last name", { exact: false })
        .fill(billing.lastName);
      await page
        .getByLabel("Street address", { exact: false })
        .fill(billing.street);
      await page.getByLabel("Town / city", { exact: false }).fill(billing.city);
      await page
        .getByLabel("Country / region", { exact: false })
        .selectOption("PK");
      await page.getByRole("radio", { name: /PayPal/ }).check();
      await page.getByRole("button", { name: "Save checkout draft" }).click();
      await expect(page.getByRole("status")).toContainText(
        "No order has been placed",
      );
      await page.reload();
      await expect(
        page.getByLabel("Billing email", { exact: false }),
      ).toHaveValue(billing.email);
      await expect(page.getByRole("radio", { name: /PayPal/ })).toBeChecked();
      await expect(
        page.getByRole("button", { name: /Place order/ }),
      ).toBeDisabled();
    } finally {
      await api.dispose();
    }
  });
  test("article upload is usable in the browser without pasting article text", async ({
    page,
  }) => {
    const api = await freshBuyer();
    try {
      await page.context().addCookies((await api.storageState()).cookies);
      await page.goto(`/cart/?product=${products.manual.id}`);
      const form = page.getByRole("region", { name: "Configure placement" });
      await form
        .getByLabel("Promoted URL", { exact: false })
        .fill(brief.promotedUrl);
      await form
        .getByLabel("Keyword or anchor text", { exact: false })
        .fill(brief.keyword);
      await form
        .getByLabel("Or upload article", { exact: false })
        .setInputFiles({
          name: "browser-article.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("Synthetic browser upload. Test-only article."),
        });
      await form
        .getByRole("button", { name: "Upload selected article" })
        .click();
      await expect(
        form.getByRole("link", { name: "Download browser-article.txt" }),
      ).toBeVisible();
      await expect(
        form.getByLabel("Your article text", { exact: false }),
      ).not.toHaveAttribute("required", "");
      await form.getByRole("button", { name: "Save and continue" }).click();
      await expect(page).toHaveURL(/\/checkout\/$/);
      await page.goto(`/cart/?product=${products.manual.id}`);
      await expect(
        page.getByRole("heading", { name: "Saved placements (1)" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Proceed to checkout review" }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page
          .locator(".customer-cart-items")
          .getByRole("link", { name: "Download browser-article.txt" }),
      ).toBeVisible();
      const configured = page.getByRole("region", {
        name: "Configure placement",
      });
      await configured.getByRole("button", { name: "Remove file" }).click();
      await expect(
        configured.getByRole("link", { name: "Download browser-article.txt" }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Refresh cart and prices" })
        .click();
      await expect(page.locator(".customer-cart-items")).toContainText(
        "expired or is unavailable",
      );
      await expect(
        page.getByRole("link", { name: "Proceed to checkout review" }),
      ).toHaveCount(0);
    } finally {
      await api.dispose();
    }
  });
  for (const width of [320, 375, 768, 1280])
    test(`placement/cart/checkout reflow and accessibility at ${width}px`, async ({
      page,
    }, info) => {
      const api = await freshBuyer();
      try {
        const response = await accountMutation(api, "put", "/api/cart/", {
          version: 0,
          item: {
            productId: products.writing.id,
            productVersion: products.writing.version,
            writingWords: 500,
            brief,
          },
        });
        expect(response.status()).toBe(200);
        await page.context().addCookies((await api.storageState()).cookies);
        await page.setViewportSize({ width, height: 900 });
        for (const route of [
          `/cart/?product=${products.writing.id}`,
          "/checkout/",
          `/products/?q=${new URL(products.writing.domain).hostname}`,
        ]) {
          const response = await page.goto(route);
          await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
          if (route.startsWith("/products")) {
            await page.locator(".placement-buy:visible").first().click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expect(
              page.getByLabel("Promoted URL", { exact: false }),
            ).toHaveValue(brief.promotedUrl);
            expect(
              await page.getByRole("dialog").evaluate((element) => {
                const rect = element.getBoundingClientRect();
                return (
                  rect.top >= -1 &&
                  rect.bottom <= innerHeight + 1 &&
                  element.scrollWidth <= element.clientWidth + 1
                );
              }),
            ).toBe(true);
          } else {
            expect(response?.headers()["cache-control"]).toContain("no-store");
            await expect(
              page
                .getByRole("button", {
                  name: route.startsWith("/cart")
                    ? "Save and continue"
                    : "Save checkout draft",
                  exact: true,
                })
                .first(),
            ).toBeVisible();
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
            ).violations.map((issue) => issue.id),
          ).toEqual([]);
          await page.screenshot({
            path: info.outputPath(
              `${route.startsWith("/cart") ? "cart" : route.startsWith("/checkout") ? "checkout" : "placement-dialog"}-${width}.png`,
            ),
            fullPage: !route.startsWith("/products"),
          });
          if (route.startsWith("/products")) {
            await page
              .getByRole("dialog")
              .getByRole("button", { name: "Save placement to cart" })
              .scrollIntoViewIfNeeded();
            await expect(
              page
                .getByRole("dialog")
                .getByRole("button", { name: "Save placement to cart" }),
            ).toBeVisible();
            await page.keyboard.press("Escape");
            await expect(page.getByRole("dialog")).toHaveCount(0);
            await expect(
              page.locator(".placement-buy:visible").first(),
            ).toBeFocused();
          }
        }
      } finally {
        await api.dispose();
      }
    });
});
