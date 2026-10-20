import { test, expect, request as requests } from "@playwright/test";
import { fixtures, origin, signIn } from "./helpers";
import {
  seedCartProducts,
  newCustomer,
  accountMutation,
} from "./account-cart-fixtures";
import { CHECKOUT_ENABLED } from "../../lib/config/features";
import type { CartView } from "../../lib/commerce/cart-types";

test("fresh customers can authenticate and save a private, server-priced plan with ordering disabled", async ({
  request,
}) => {
  test.setTimeout(120000);
  await fixtures(); // Refuses non-loopback URLs and non-test fixture databases.
  expect(CHECKOUT_ENABLED).toBe(false);
  const products = await seedCartProducts();
  const buyer = await requests.newContext({ baseURL: origin });
  const other = await requests.newContext({ baseURL: origin });
  try {
    const customer = await newCustomer(buyer);
    await signIn(buyer, customer.account);
    const second = await newCustomer(other);
    await signIn(other, second.account);
    expect((await request.get("/api/cart/")).status()).toBe(401);
    const initial = (await (await buyer.get("/api/cart/")).json()) as CartView;
    expect(initial.items).toEqual([]);
    const response = await accountMutation(buyer, "put", "/api/cart/", {
      version: initial.version,
      item: {
        productId: products.writing.id,
        productVersion: products.writing.version,
        writingWords: 500,
      },
    });
    expect(response.status()).toBe(200);
    const saved = (await response.json()) as CartView;
    expect(saved.items).toHaveLength(1);
    expect(saved.totalCents).toBe(12345 + 2001);
    expect((await (await buyer.get("/api/cart/")).json()).items).toHaveLength(
      1,
    );
    expect((await (await other.get("/api/cart/")).json()).items).toEqual([]);
    const removed = await accountMutation(buyer, "delete", "/api/cart/", {
      version: saved.version,
      productId: products.writing.id,
    });
    expect(removed.status()).toBe(200);
    expect((await removed.json()).items).toEqual([]);
  } finally {
    await buyer.dispose();
    await other.dispose();
  }
});
