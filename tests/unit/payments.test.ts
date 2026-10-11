import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { AccountIdentity } from "@/lib/account";
import type { CartView } from "@/lib/commerce/cart-types";
import type { ClientSession } from "mongodb";

type MockRow = Record<string, unknown> & { _id: string };
interface MockUpdate {
  $set?: Record<string, unknown>;
  $inc?: Record<string, number>;
  $unset?: Record<string, unknown>;
}
const state = vi.hoisted(() => ({
  collections: new Map<string, Map<string, MockRow>>(),
  cart: {
    version: 0,
    currency: "USD",
    checkoutAvailable: false,
    totalCents: 0,
    items: [],
  } as CartView,
  create:
    vi.fn<
      typeof import("@/lib/commerce/payment-providers").createProviderSession
    >(),
  confirm:
    vi.fn<
      typeof import("@/lib/commerce/payment-providers").confirmProviderPayment
    >(),
  audits: vi.fn<typeof import("@/lib/audit").logAudit>(),
  lock: Promise.resolve(),
}));
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function matches(row: MockRow, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or")
      return (
        Array.isArray(expected) &&
        expected.some((part: unknown) => isRecord(part) && matches(row, part))
      );
    const actual = key
      .split(".")
      .reduce<unknown>(
        (value, part) => (isRecord(value) ? value[part] : undefined),
        row,
      );
    if (isRecord(expected) && !(expected instanceof Date)) {
      if ("$exists" in expected)
        return (actual !== undefined) === expected.$exists;
      if ("$gt" in expected) {
        const minimum = expected.$gt;
        if (actual instanceof Date && minimum instanceof Date)
          return actual.getTime() > minimum.getTime();
        if (typeof actual === "number" && typeof minimum === "number")
          return actual > minimum;
        if (typeof actual === "string" && typeof minimum === "string")
          return actual > minimum;
        return false;
      }
      if ("$ne" in expected) return actual !== expected.$ne;
      if ("$regex" in expected)
        return (
          typeof actual === "string" &&
          typeof expected.$regex === "string" &&
          new RegExp(
            expected.$regex,
            typeof expected.$options === "string"
              ? expected.$options
              : undefined,
          ).test(actual)
        );
    }
    return actual === expected;
  });
}
function collection(name: string) {
  if (!state.collections.has(name)) state.collections.set(name, new Map());
  const rows = state.collections.get(name)!;
  return {
    createIndex: async () => "index",
    findOne: async (filter: Record<string, unknown>) =>
      structuredClone(
        [...rows.values()].find((row) => matches(row, filter)) || null,
      ),
    insertOne: async (row: MockRow) => {
      if (rows.has(row._id)) throw new Error("Duplicate");
      rows.set(row._id, structuredClone(row));
    },
    updateOne: async (filter: Record<string, unknown>, update: MockUpdate) => {
      const row = [...rows.values()].find((value) => matches(value, filter));
      if (!row) return { modifiedCount: 0 };
      Object.assign(row, update.$set);
      for (const [key, value] of Object.entries(update.$inc || {})) {
        const current = row[key];
        if (current !== undefined && typeof current !== "number")
          throw new Error(`Cannot increment non-numeric field ${key}`);
        row[key] = (current ?? 0) + value;
      }
      for (const key of Object.keys(update.$unset || {})) delete row[key];
      return { modifiedCount: 1 };
    },
    updateMany: async (filter: Record<string, unknown>, update: MockUpdate) => {
      for (const row of rows.values())
        if (matches(row, filter))
          for (const key of Object.keys(update.$unset || {})) delete row[key];
    },
    deleteOne: async (filter: Record<string, unknown>) => {
      const row = [...rows.values()].find((value) => matches(value, filter));
      if (row) rows.delete(row._id);
    },
    countDocuments: async (filter: Record<string, unknown>) =>
      [...rows.values()].filter((row) => matches(row, filter)).length,
    find: (filter: Record<string, unknown>) => {
      let offset = 0,
        limit = Infinity;
      const cursor = {
        sort: () => cursor,
        skip: (value: number) => {
          offset = value;
          return cursor;
        },
        limit: (value: number) => {
          limit = value;
          return cursor;
        },
        toArray: async () =>
          structuredClone(
            [...rows.values()]
              .filter((row) => matches(row, filter))
              .slice(offset, offset + limit),
          ),
      };
      return cursor;
    },
  };
}
vi.mock("@/lib/db", () => ({
  getDb: async () => ({ collection }),
  transaction: async <T>(fn: (session: ClientSession) => Promise<T>) =>
    fn({} as ClientSession),
  userTransaction: async <T>(fn: (session: ClientSession) => Promise<T>) => {
    const run = state.lock.then(() => fn({} as ClientSession));
    state.lock = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  },
}));
vi.mock("@/lib/account", () => ({
  freshAccount: vi.fn(async (actor: AccountIdentity) => actor),
}));
vi.mock("@/lib/audit", () => ({
  logAudit: state.audits,
}));
vi.mock("@/lib/commerce/cart", () => ({
  savedOwnCart: async () => state.cart,
  cartView: async () => state.cart,
  attachArticleFiles: async (cart: CartView) => cart,
}));
vi.mock("@/lib/commerce/payment-providers", async (importOriginal) => {
  const real =
    await importOriginal<typeof import("@/lib/commerce/payment-providers")>();
  return {
    ...real,
    createProviderSession: state.create,
    confirmProviderPayment: state.confirm,
  };
});
import {
  startPayment,
  confirmPayment,
  getOrder,
  listOrders,
  handleStripeEvent,
  handlePaypalEvent,
  getAdminOrder,
  listAdminOrders,
  downloadOrderFile,
  downloadAdminOrderFile,
  updateAdminOrder,
} from "@/lib/commerce/payments";
const actor = { id: "customer-a", sessionVersion: 1 } as AccountIdentity;
const other = { id: "customer-b", sessionVersion: 1 } as AccountIdentity;
const billing = {
  email: "buyer@example.com",
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
const input = {
  cartVersion: 3,
  draftVersion: 2,
  provider: "stripe",
  termsAccepted: true,
};
beforeEach(() => {
  state.collections.clear();
  state.lock = Promise.resolve();
  state.create.mockReset();
  state.confirm.mockReset();
  state.audits.mockReset();
  state.cart = {
    version: 3,
    currency: "USD",
    checkoutAvailable: true,
    totalCents: 12345,
    items: [
      {
        productId: "e67939ad-8f50-41d7-912b-62928b8a1775",
        productVersion: 1,
        domain: "example.com",
        status: "ready",
        placementCents: 12345,
        writingCents: 0,
        totalCents: 12345,
        writingWords: 0,
        options: null,
        brief: {
          promotedUrl: "https://example.com/article",
          keyword: "test",
          articleText: "Original article",
          specialRequirements: "",
          fileId: null,
        },
        file: null,
      },
    ],
  } satisfies CartView;
  collection("commerce_carts");
  state.collections
    .get("commerce_carts")!
    .set(actor.id, { _id: actor.id, ...structuredClone(state.cart) });
  collection("commerce_checkout_drafts");
  state.collections.get("commerce_checkout_drafts")!.set(actor.id, {
    _id: actor.id,
    version: 2,
    cartVersion: 3,
    paymentPreference: "stripe",
    billing,
    notes: "Test brief",
    expiresAt: new Date(Date.now() + 86400000),
  });
  state.create.mockResolvedValue({
    id: "cs_test_attempt",
    url: "https://checkout.stripe.com/c/pay/test",
  });
  state.confirm.mockResolvedValue({
    status: "paid",
    reference: "pi_test_paid",
  });
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fixture");
  vi.stubEnv("PAYPAL_CLIENT_ID", "test");
  vi.stubEnv("PAYPAL_CLIENT_SECRET", "test");
  vi.stubEnv("PAYPAL_WEBHOOK_ID", "test");
  vi.stubEnv("PAYPAL_ENV", "sandbox");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
describe("checkout order integrity", () => {
  it("persists server prices, briefs and billing before redirecting", async () => {
    const result = await startPayment(actor, input);
    const order = await getOrder(actor, result.orderId);
    expect(order.totalCents).toBe(12345);
    expect(order.billing).toEqual(billing);
    expect(order.items[0].brief?.articleText).toBe("Original article");
    expect(order.status).toBe("pending");
    expect(state.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalCents: 12345, id: result.orderId }),
    );
  });
  it("reuses one remote payment attempt across retries and concurrent clicks", async () => {
    const [a, b] = await Promise.all([
      startPayment(actor, input),
      startPayment(actor, input),
    ]);
    expect(a.orderId).toBe(b.orderId);
    expect(state.collections.get("commerce_orders")!.size).toBe(1);
    expect(
      state.create.mock.calls.every(([snapshot]) => snapshot.id === a.orderId),
    ).toBe(true);
    const calls = state.create.mock.calls.length;
    await startPayment(actor, input);
    expect(state.create).toHaveBeenCalledTimes(calls);
  });
  it("blocks client prices, forged paid state and missing accepted terms", async () => {
    for (const patch of [
      { totalCents: 1 },
      { paid: true },
      { ownerId: other.id },
      { termsAccepted: false },
    ])
      await expect(
        startPayment(actor, { ...input, ...patch }),
      ).rejects.toThrow();
    expect(state.create).not.toHaveBeenCalled();
  });
  it("rejects changed cart, stale billing and incomplete briefs before creating a payment", async () => {
    await expect(
      startPayment(actor, { ...input, cartVersion: 2 }),
    ).rejects.toThrow(/cart changed/);
    await expect(
      startPayment(actor, { ...input, draftVersion: 1 }),
    ).rejects.toThrow(/billing/);
    state.cart.items[0].brief!.articleText = "";
    await expect(startPayment(actor, input)).rejects.toThrow(/article/);
    expect(state.create).not.toHaveBeenCalled();
  });
  it("keeps failed network attempts retryable under the same idempotency key", async () => {
    state.create.mockRejectedValueOnce(new Error("Network failure"));
    await expect(startPayment(actor, input)).rejects.toThrow("Network failure");
    const result = await startPayment(actor, input);
    expect(state.create.mock.calls[0][0].id).toBe(result.orderId);
    expect(state.collections.get("commerce_orders")!.size).toBe(1);
  });
  it("prevents another provider creating a second payment for the same cart", async () => {
    await startPayment(actor, input);
    await expect(
      startPayment(actor, { ...input, provider: "paypal" }),
    ).rejects.toThrow(/already has/);
    expect(state.create).toHaveBeenCalledTimes(1);
  });
  it("makes provider confirmation idempotent and clears only the paid cart revision", async () => {
    const { orderId } = await startPayment(actor, input);
    expect((await confirmPayment(actor, { orderId })).status).toBe("paid");
    await confirmPayment(actor, { orderId });
    expect(state.confirm).toHaveBeenCalledTimes(1);
    expect(
      state.collections.get("commerce_carts")!.get(actor.id).items,
    ).toEqual([]);
    expect(state.collections.get("commerce_carts")!.get(actor.id).version).toBe(
      4,
    );
    expect(
      state.audits.mock.calls.filter((args) => args[1] === "order.paid"),
    ).toHaveLength(1);
    expect((await startPayment(actor, input)).url).toContain(
      "/checkout/return/",
    );
    expect(state.create).toHaveBeenCalledTimes(1);
  });
  it("preserves a newer cart and billing draft when an older order gets paid", async () => {
    const { orderId } = await startPayment(actor, input);
    state.collections.get("commerce_carts")!.get(actor.id).version = 4;
    state.collections.get("commerce_checkout_drafts")!.get(actor.id).version =
      3;
    await confirmPayment(actor, { orderId });
    expect(
      state.collections.get("commerce_carts")!.get(actor.id).items,
    ).toHaveLength(1);
    expect(
      state.collections.get("commerce_checkout_drafts")!.get(actor.id).version,
    ).toBe(3);
  });
  it("never exposes or confirms another customer's order", async () => {
    const { orderId } = await startPayment(actor, input);
    await expect(getOrder(other, orderId)).rejects.toThrow("Order not found");
    await expect(confirmPayment(other, { orderId })).rejects.toThrow(
      "Order not found",
    );
    expect(await listOrders(other)).toEqual([]);
    expect(state.confirm).not.toHaveBeenCalled();
    expect(await listOrders(actor)).toHaveLength(1);
    expect((await listOrders(actor))[0]).toEqual(
      expect.objectContaining({ placementCount: 1, totalCents: 12345 }),
    );
    expect((await listOrders(actor))[0]).not.toHaveProperty("billing");
    expect((await listOrders(actor))[0]).not.toHaveProperty("items");
  });
  it("leaves unpaid approvals pending without clearing any cart", async () => {
    state.confirm.mockResolvedValue({ status: "pending" });
    const { orderId } = await startPayment(actor, input);
    expect((await confirmPayment(actor, { orderId })).status).toBe("pending");
    expect(
      state.collections.get("commerce_carts")!.get(actor.id).items,
    ).toHaveLength(1);
  });
  it("reconciles Stripe webhook replay once and does not regress paid status", async () => {
    const { orderId } = await startPayment(actor, input);
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_attempt",
          metadata: { orderId },
          client_reference_id: orderId,
          livemode: false,
          amount_total: 12345,
          currency: "usd",
          payment_status: "paid",
          status: "complete",
          payment_intent: "pi_test_paid",
        },
      },
    };
    await handleStripeEvent(event);
    await handleStripeEvent(event);
    await handleStripeEvent({
      ...event,
      type: "checkout.session.expired",
      data: {
        object: {
          ...event.data.object,
          payment_status: "unpaid",
          status: "expired",
        },
      },
    });
    expect((await getOrder(actor, orderId)).status).toBe("paid");
    expect(
      state.audits.mock.calls.filter((args) => args[1] === "order.paid"),
    ).toHaveLength(1);
  });
  it("rejects a different PayPal approval token before capture", async () => {
    state.collections
      .get("commerce_checkout_drafts")!
      .get(actor.id).paymentPreference = "paypal";
    state.create.mockResolvedValue({
      id: "PAYPALORDER",
      url: "https://www.sandbox.paypal.com/checkoutnow?token=PAYPALORDER",
    });
    const { orderId } = await startPayment(actor, {
      ...input,
      provider: "paypal",
    });
    await expect(
      confirmPayment(actor, { orderId, token: "WRONGORDER" }),
    ).rejects.toThrow(/does not match/);
    expect(state.confirm).not.toHaveBeenCalled();
  });
  it("reconciles PayPal approval that arrives before its remote ID is persisted", async () => {
    state.collections
      .get("commerce_checkout_drafts")!
      .get(actor.id).paymentPreference = "paypal";
    state.create.mockResolvedValue({
      id: "PAYPALORDER",
      url: "https://www.sandbox.paypal.com/checkoutnow?token=PAYPALORDER",
    });
    const { orderId } = await startPayment(actor, {
      ...input,
      provider: "paypal",
    });
    delete state.collections.get("commerce_orders")!.get(orderId).remoteId;
    await handlePaypalEvent({
      event_type: "CHECKOUT.ORDER.APPROVED",
      resource: { id: "PAYPALORDER", purchase_units: [{ custom_id: orderId }] },
    });
    expect(state.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ id: orderId }),
      "PAYPALORDER",
      true,
    );
    expect((await getOrder(actor, orderId)).status).toBe("paid");
  });
  it("copies article files and retains the paid copy after planning expiry", async () => {
    const fileId = "6a7e573c-c5c4-438b-9c2a-ff0a4e3f4d63";
    state.cart.items[0].file = {
      id: fileId,
      name: "article.txt",
      size: 7,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
    collection("commerce_article_files");
    state.collections.get("commerce_article_files")!.set(fileId, {
      _id: fileId,
      ownerId: actor.id,
      name: "article.txt",
      bytes: { buffer: new TextEncoder().encode("Article") },
      expiresAt: new Date(Date.now() + 86400000),
    });
    const { orderId } = await startPayment(actor, input);
    expect(
      state.collections.get("commerce_order_files")!.get(`${orderId}:${fileId}`)
        .expiresAt,
    ).toBeInstanceOf(Date);
    await confirmPayment(actor, { orderId });
    state.collections.get("commerce_article_files")!.clear();
    expect(
      state.collections
        .get("commerce_order_files")!
        .get(`${orderId}:${fileId}`),
    ).not.toHaveProperty("expiresAt");
    expect(await (await downloadOrderFile(actor, orderId, fileId)).text()).toBe(
      "Article",
    );
    await expect(downloadOrderFile(other, orderId, fileId)).rejects.toThrow(
      /not found/,
    );
    await expect(
      downloadAdminOrderFile(other, orderId, fileId),
    ).rejects.toThrow(/permission/);
    const admin = { ...other, role: "admin" } as AccountIdentity;
    expect(
      await (await downloadAdminOrderFile(admin, orderId, fileId)).text(),
    ).toBe("Article");
  });
  it("restricts fulfillment details to a current administrator", async () => {
    const { orderId } = await startPayment(actor, input);
    await expect(getAdminOrder(actor, orderId)).rejects.toThrow(/permission/);
    await expect(listAdminOrders(actor, new URLSearchParams())).rejects.toThrow(
      /permission/,
    );
    expect(
      (
        await getAdminOrder(
          { ...other, role: "admin" } as AccountIdentity,
          orderId,
        )
      ).billing.email,
    ).toBe(billing.email);
  });
  it("blocks cross-environment retries without creating another attempt", async () => {
    await startPayment(actor, input);
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_fixture");
    await expect(startPayment(actor, input)).rejects.toThrow(/environment/);
    expect(state.create).toHaveBeenCalledTimes(1);
  });
  it("updates paid order progress with revision checks and private internal notes", async () => {
    const { orderId } = await startPayment(actor, input);
    await confirmPayment(actor, { orderId });
    const admin = { ...other, role: "admin" } as AccountIdentity;
    const saved = await getAdminOrder(admin, orderId);
    const change = {
      version: saved.version,
      fulfillmentStatus: "processing",
      internalNotes: "Publisher contacted",
      publishedPlacements: [],
    };
    await expect(updateAdminOrder(actor, orderId, change)).rejects.toThrow(
      /permission/,
    );
    const result = await updateAdminOrder(admin, orderId, change);
    expect(result.version).toBe(saved.version + 1);
    expect(result.fulfillmentStatus).toBe("processing");
    expect(result.internalNotes).toBe("Publisher contacted");
    expect((await getOrder(actor, orderId)).fulfillmentStatus).toBe(
      "processing",
    );
    expect(await getOrder(actor, orderId)).not.toHaveProperty("internalNotes");
    await expect(updateAdminOrder(admin, orderId, change)).rejects.toThrow(
      /order changed/,
    );
    expect(
      state.audits.mock.calls.filter(
        (args) => args[1] === "order.fulfillment.update",
      ),
    ).toHaveLength(1);
  });
  it("requires a live URL for every placement before completion and rejects payment edits", async () => {
    const { orderId } = await startPayment(actor, input);
    const admin = { ...other, role: "admin" } as AccountIdentity;
    let saved = await getAdminOrder(admin, orderId);
    const change = {
      version: saved.version,
      fulfillmentStatus: "completed",
      internalNotes: "",
      publishedPlacements: [],
    };
    await expect(updateAdminOrder(admin, orderId, change)).rejects.toThrow(
      /verified paid/,
    );
    await confirmPayment(actor, { orderId });
    saved = await getAdminOrder(admin, orderId);
    change.version = saved.version;
    await expect(updateAdminOrder(admin, orderId, change)).rejects.toThrow(
      /every placement/,
    );
    const placement = {
      productId: state.cart.items[0].productId,
      url: "https://example.com/published",
    };
    await expect(
      updateAdminOrder(admin, orderId, {
        ...change,
        publishedPlacements: [{ ...placement, url: "javascript:alert(1)" }],
      }),
    ).rejects.toThrow();
    await expect(
      updateAdminOrder(admin, orderId, {
        ...change,
        publishedPlacements: [placement, placement],
      }),
    ).rejects.toThrow(/distinct placements/);
    await expect(
      updateAdminOrder(admin, orderId, {
        ...change,
        status: "paid",
        totalCents: 1,
        publishedPlacements: [placement],
      }),
    ).rejects.toThrow();
    const done = await updateAdminOrder(admin, orderId, {
      ...change,
      publishedPlacements: [placement],
    });
    expect(done.fulfillmentStatus).toBe("completed");
    expect((await getOrder(actor, orderId)).publishedPlacements).toEqual([
      placement,
    ]);
  });
  it("searches and filters admin orders without including private brief payloads", async () => {
    const { orderId } = await startPayment(actor, input);
    await confirmPayment(actor, { orderId });
    const admin = { ...other, role: "admin" } as AccountIdentity;
    const result = await listAdminOrders(
      admin,
      new URLSearchParams({
        status: "paid",
        fulfillment: "queued",
        q: "buyer@example.com",
      }),
    );
    expect(result.total).toBe(1);
    expect(result.data[0].billingEmail).toBe(billing.email);
    expect(result.data[0]).not.toHaveProperty("items");
    expect(
      (await listAdminOrders(admin, new URLSearchParams({ q: ".*" }))).total,
    ).toBe(0);
  });
});
