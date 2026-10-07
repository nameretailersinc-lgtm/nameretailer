import { test, expect, request as requests } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  accountInput,
  accountMutation,
  challenge,
  seedCartProducts,
  savedInput,
  newCustomer,
} from "./account-cart-fixtures";
import { actor, fixtures, mutation, origin, signIn } from "./helpers";
import type { CartView, PlacementOptions } from "../../lib/commerce/cart-types";
let products: Awaited<ReturnType<typeof seedCartProducts>>;
test.describe("customer account and server-priced planning cart", () => {
  test.beforeAll(async () => {
    products = await seedCartProducts();
  });
  test("registration challenge, strict customer assignment, duplicates and honeypot", async ({
    request,
  }) => {
    const input = accountInput();
    expect(
      (
        await request.post("/api/account/register/", {
          data: input,
          headers: { Origin: origin },
        })
      ).status(),
    ).toBe(403);
    const token = await challenge(request);
    expect(
      (
        await request.post("/api/account/register/", {
          data: input,
          headers: { Origin: "https://outside.invalid", "x-csrf-token": token },
        })
      ).status(),
    ).toBe(403);
    const other = await requests.newContext({ baseURL: origin });
    expect(
      (
        await other.post("/api/account/register/", {
          data: input,
          headers: { Origin: origin, "x-csrf-token": token },
        })
      ).status(),
    ).toBe(403);
    await other.dispose();
    expect(
      (
        await request.post("/api/account/register/", {
          data: { ...input, role: "admin" },
          headers: { Origin: origin, "x-csrf-token": token },
        })
      ).status(),
    ).toBe(422);
    const registered = await request.post("/api/account/register/", {
      data: input,
      headers: { Origin: origin, "x-csrf-token": token },
    });
    expect(registered.status()).toBe(202);
    const generic = await registered.json();
    expect(
      (await (await request.get("/api/auth/session")).json()).user,
    ).toBeUndefined();
    const duplicate = await request.post("/api/account/register/", {
      data: {
        ...input,
        name: "Do not overwrite",
        password: "Different synthetic password",
      },
      headers: { Origin: origin, "x-csrf-token": await challenge(request) },
    });
    expect(duplicate.status()).toBe(202);
    expect(await duplicate.json()).toEqual(generic);
    await signIn(request, { ...input, id: "" });
    const profile = (await (await request.get("/api/account/profile/")).json())
      .user;
    expect(profile.role).toBe("customer");
    expect(profile.name).toBe(input.name);
    expect(profile.passwordHash).toBeUndefined();
    expect(profile.sessionVersion).toBeUndefined();
    expect((await request.get("/api/admin/products/")).status()).toBe(403);
    expect(
      (
        await accountMutation(request, "patch", "/api/account/profile/", {
          name: "Buyer revised",
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await accountMutation(request, "patch", "/api/account/profile/", {
          name: "Buyer",
          role: "admin",
        })
      ).status(),
    ).toBe(422);
    const honey = accountInput();
    const blocked = await request.post("/api/account/register/", {
      data: { ...honey, website: "spam" },
      headers: { Origin: origin, "x-csrf-token": await challenge(request) },
    });
    expect(blocked.status()).toBe(202);
    expect(await blocked.json()).toEqual(generic);
    const staff = (await fixtures()).admin;
    expect(
      (
        await request.post("/api/account/register/", {
          data: { ...accountInput(), email: staff.email },
          headers: { Origin: origin, "x-csrf-token": await challenge(request) },
        })
      ).status(),
    ).toBe(202);
    const admin = await actor(staff);
    expect(
      (await (await admin.get("/api/account/profile/")).json()).user.role,
    ).toBe("admin");
    await admin.dispose();
  });
  test("only active committed listings expose safe options and exact available tiers", async ({
    request,
  }) => {
    const options = await request.get(
      `/api/products/${products.writing.id}/options/`,
    );
    expect(options.status()).toBe(200);
    const data = (await options.json()) as PlacementOptions;
    expect(data.writingOptions).toEqual([{ words: 500, priceCents: 2001 }]);
    expect(data.placementCents).toBe(12345);
    expect(JSON.stringify(data)).not.toMatch(
      /PRIVATE_CART_SOURCE|source|externalId|importId|Article_Price/,
    );
    expect(
      (
        await request.get(`/api/products/${products.draft.id}/options/`)
      ).status(),
    ).toBe(404);
    expect(
      (
        await (
          await request.get(
            `/api/products/${products.invalidAddons.id}/options/`,
          )
        ).json()
      ).writingOptions,
    ).toEqual([]);
    expect(
      (
        await (
          await request.get(`/api/products/${products.manual.id}/options/`)
        ).json()
      ).writingOptions,
    ).toEqual([]);
    expect(options.headers()["cache-control"]).toContain("no-store");
  });
  test("private cart ignores no prices, rejects stale writes, isolates owners and blocks changed/archived totals", async ({
    request,
  }) => {
    const a = await actor((await fixtures()).customer);
    const b = await requests.newContext({ baseURL: origin });
    const fresh = await newCustomer(b);
    await signIn(b, fresh.account);
    try {
      expect((await request.get("/api/cart/")).status()).toBe(401);
      let cart = (await (await a.get("/api/cart/")).json()) as CartView;
      const item = {
        productId: products.writing.id,
        productVersion: products.writing.version,
        writingWords: 500,
      };
      const state = await a.storageState();
      const registrationContext = await requests.newContext({
        baseURL: origin,
        storageState: {
          ...state,
          cookies: [
            ...state.cookies,
            {
              name: "nr-registration",
              value: (await fixtures()).customer.id,
              domain: "localhost",
              path: "/",
              expires: Math.floor(Date.now() / 1000) + 3600,
              httpOnly: true,
              secure: false,
              sameSite: "Strict",
            },
          ],
        },
      });
      const anonymousToken = await challenge(registrationContext);
      expect(
        (
          await registrationContext.put("/api/cart/", {
            data: { version: cart.version, item },
            headers: { Origin: origin, "x-csrf-token": anonymousToken },
          })
        ).status(),
      ).toBe(403);
      await registrationContext.dispose();
      expect(
        (
          await a.put("/api/cart/", {
            data: { version: cart.version, item },
            headers: { Origin: origin },
          })
        ).status(),
      ).toBe(403);
      for (const extra of [
        { totalCents: 1 },
        { ownerId: fresh.account.id },
        { quantity: 2 },
      ])
        expect(
          (
            await accountMutation(a, "put", "/api/cart/", {
              version: cart.version,
              item: { ...item, ...extra },
            })
          ).status(),
        ).toBe(422);
      expect(
        (
          await accountMutation(a, "put", "/api/cart/", {
            version: cart.version,
            item: { ...item, writingWords: 750 },
          })
        ).status(),
      ).toBe(422);
      const result = await accountMutation(a, "put", "/api/cart/", {
        version: cart.version,
        item,
      });
      expect(result.status()).toBe(200);
      const oldVersion = cart.version;
      cart = await result.json();
      expect(cart.totalCents).toBe(14346);
      expect(cart.checkoutAvailable).toBe(false);
      expect(
        (
          await accountMutation(a, "put", "/api/cart/", {
            version: oldVersion,
            item,
          })
        ).status(),
      ).toBe(409);
      const concurrent = await Promise.all(
        [1, 2].map(() =>
          accountMutation(a, "put", "/api/cart/", {
            version: cart.version,
            item,
          }),
        ),
      );
      expect(concurrent.map((response) => response.status()).sort()).toEqual([
        200, 409,
      ]);
      cart = await concurrent
        .find((response) => response.status() === 200)!
        .json();
      expect((await (await b.get("/api/cart/")).json()).items).toEqual([]);
      expect(
        (
          await accountMutation(b, "delete", "/api/cart/", {
            version: 0,
            productId: item.productId,
          })
        ).status(),
      ).toBe(200);
      expect((await (await a.get("/api/cart/")).json()).items).toHaveLength(1);
      const admin = await actor((await fixtures()).admin);
      const bProfile = (await (await b.get("/api/account/profile/")).json())
        .user;
      const oldToken = (await (await b.get("/api/account/csrf/")).json()).token;
      expect(
        (
          await mutation(admin, "patch", `/api/admin/users/${bProfile.id}/`, {
            active: false,
          })
        ).status(),
      ).toBe(200);
      expect((await b.get("/api/cart/")).status()).toBe(401);
      expect(
        (
          await b.put("/api/cart/", {
            data: { version: 1, item },
            headers: { Origin: origin, "x-csrf-token": oldToken },
          })
        ).status(),
      ).toBe(401);
      expect(
        (
          await b.post("/api/account/register/", {
            data: { ...fresh.input, name: "Do not reactivate" },
            headers: { Origin: origin, "x-csrf-token": await challenge(b) },
          })
        ).status(),
      ).toBe(202);
      expect((await b.get("/api/account/profile/")).status()).toBe(401);
      const changedResponse = await mutation(
        admin,
        "patch",
        `/api/admin/products/${products.writing.id}/`,
        {
          ...savedInput(products.writing),
          priceCents: 15000,
          version: products.writing.version,
        },
      );
      expect(changedResponse.status()).toBe(200);
      const changed = (await changedResponse.json()).data;
      const quote = (await (await a.get("/api/cart/")).json()) as CartView;
      expect(quote.items[0].status).toBe("changed");
      expect(quote.items[0].totalCents).toBe(17001);
      expect(quote.totalCents).toBeNull();
      expect(
        (
          await accountMutation(a, "put", "/api/cart/", {
            version: cart.version,
            item,
          })
        ).status(),
      ).toBe(409);
      const accepted = await accountMutation(a, "put", "/api/cart/", {
        version: cart.version,
        item: { ...item, productVersion: changed.version },
      });
      expect(accepted.status()).toBe(200);
      cart = await accepted.json();
      expect(cart.totalCents).toBe(17001);
      expect(
        (
          await mutation(admin, "patch", `/api/admin/products/${changed.id}/`, {
            ...savedInput(changed),
            status: "archived",
            version: changed.version,
          })
        ).status(),
      ).toBe(200);
      const archived = (await (await a.get("/api/cart/")).json()) as CartView;
      expect(archived.totalCents).toBeNull();
      expect(archived.items[0].status).toBe("unavailable");
      expect(
        (
          await accountMutation(a, "delete", "/api/cart/", {
            version: cart.version,
            productId: item.productId,
          })
        ).status(),
      ).toBe(200);
      // Restore only this synthetic fixture for the subsequent browser tests.
      expect(
        (
          await mutation(admin, "patch", `/api/admin/products/${changed.id}/`, {
            ...savedInput(changed),
            priceCents: 12345,
            status: "active",
            version: changed.version + 1,
          })
        ).status(),
      ).toBe(200);
      await admin.dispose();
    } finally {
      await a.dispose();
      await b.dispose();
    }
  });
  for (const width of [320, 375, 1280])
    test(`customer account and anonymous cart reflow/labels/noindex at ${width}px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "/my-account/",
        `/cart/?product=${products.manual.id}`,
      ]) {
        const response = await page.goto(route);
        expect(response?.headers()["cache-control"]).toContain("no-store");
        expect(response?.headers()["content-security-policy"]).toContain(
          "nonce-",
        );
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        if (route.startsWith("/cart"))
          await expect(
            page.getByRole("link", { name: "Sign in to save this placement" }),
          ).toBeVisible();
        else
          await expect(
            page.getByRole("button", { name: "Sign in", exact: true }),
          ).toBeVisible();
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
            `${route.startsWith("/cart") ? "cart" : "account"}-${width}.png`,
          ),
          fullPage: true,
        });
      }
    });
  test("customer browser can sign in, configure, save, update and remove a placement", async ({
    page,
  }) => {
    const account = (await fixtures()).customer;
    await page.goto(`/my-account/?returnTo=cart&product=${products.manual.id}`);
    await page.getByLabel("Email", { exact: true }).fill(account.email);
    await page.getByLabel("Password", { exact: true }).fill(account.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/cart\//);
    const configure = page.getByRole("region", { name: "Configure placement" });
    await configure
      .getByLabel("Promoted URL", { exact: false })
      .fill("https://example.com/synthetic-article/");
    await configure
      .getByLabel("Keyword or anchor text", { exact: false })
      .fill("synthetic anchor");
    await configure
      .getByLabel("Your article text", { exact: false })
      .fill("A synthetic article for the customer cart regression test.");
    await configure.getByRole("button", { name: "Save and continue" }).click();
    await expect(page).toHaveURL(/\/checkout\/$/);
    await expect(
      page.getByRole("button", { name: /Place order/ }),
    ).toBeDisabled();
    await page.goto("/cart/");
    await expect(
      page.getByRole("heading", { name: "Saved placements (1)" }),
    ).toBeVisible();
    const saved = page.locator(".customer-cart-items article");
    await saved
      .getByText("Review or change article option", { exact: true })
      .click();
    await saved.getByRole("button", { name: "Save placement to cart" }).click();
    await expect(page.getByRole("status")).toContainText("Placement saved");
    await saved.getByRole("button", { name: /^Remove / }).click();
    await expect(
      page.getByRole("heading", { name: "No saved placements yet" }),
    ).toBeVisible();
    const image = page.locator(".customer-empty img");
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await page.goto("/my-account/");
    await expect(
      page.getByRole("heading", { name: "Your account details" }),
    ).toBeVisible();
    await page
      .getByLabel("Name", { exact: true })
      .fill("Synthetic browser buyer");
    await page.getByRole("button", { name: "Save account details" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Account details saved",
    );
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
  });
  test("customer registration browser and reset pages keep honest private states", async ({
    page,
    request,
  }) => {
    const input = accountInput();
    await page.goto("/my-account/");
    await page
      .getByRole("button", { name: "Create a customer account", exact: true })
      .click();
    await page.getByLabel("Name", { exact: true }).fill(input.name);
    await page.getByLabel("Email", { exact: true }).fill(input.email);
    await page.getByLabel("Password", { exact: true }).fill(input.password);
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "If this email is eligible",
    );
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill(input.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your account details" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await page.goto("/my-account/forgot-password/");
    await expect(page.getByLabel("Account email")).toBeVisible();
    expect(
      (
        await request.post("/api/account/forgot-password/", {
          data: { email: input.email },
          headers: { Origin: origin },
        })
      ).status(),
    ).toBe(503);
    await page.goto(`/my-account/reset-password/?token=${"a".repeat(43)}`);
    await expect(
      page.getByLabel("New password", { exact: true }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});
