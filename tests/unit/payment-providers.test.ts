import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { paymentMethods, paymentOrigin } from "@/lib/commerce/payment-config";
import {
  createProviderSession,
  confirmProviderPayment,
  validatePaymentTotal,
  verifyStripeSession,
  verifyPaypalOrder,
  verifyStripeSignature,
  verifyPaypalSignature,
  paymentRedirectUrl,
  rawPaymentWebhook,
  type PaymentSnapshot,
} from "@/lib/commerce/payment-providers";

const order: PaymentSnapshot = {
  id: "a".repeat(64),
  provider: "stripe",
  totalCents: 12345,
  billingEmail: "buyer@example.com",
  createdAt: new Date().toISOString(),
  live: false,
  items: [{ domain: "example.com", totalCents: 12345, writingWords: 500 }],
};
const stripe = {
  id: "cs_test_123",
  client_reference_id: order.id,
  metadata: { orderId: order.id },
  livemode: false,
  amount_total: 12345,
  currency: "usd",
  payment_status: "paid",
  status: "complete",
  payment_intent: "pi_test_123",
};
const paypal = {
  id: "PAYPAL123",
  status: "COMPLETED",
  purchase_units: [
    {
      custom_id: order.id,
      invoice_id: order.id,
      amount: { currency_code: "USD", value: "123.45" },
      payments: {
        captures: [
          {
            id: "CAPTURE123",
            status: "COMPLETED",
            amount: { currency_code: "USD", value: "123.45" },
            final_capture: true,
          },
        ],
      },
    },
  ],
};
function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
beforeEach(() => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fixture");
  vi.stubEnv("PAYPAL_CLIENT_ID", "fixture-client");
  vi.stubEnv("PAYPAL_CLIENT_SECRET", "fixture-secret");
  vi.stubEnv("PAYPAL_WEBHOOK_ID", "fixture-hook");
  vi.stubEnv("PAYPAL_ENV", "sandbox");
  vi.stubEnv("NEXTAUTH_URL", "https://shop.example.com");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("payment configuration and boundaries", () => {
  it("only advertises methods with complete server credentials", () => {
    expect(paymentMethods()).toEqual({ stripe: true, paypal: true });
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "");
    expect(paymentMethods()).toEqual({ stripe: false, paypal: false });
  });
  it("rejects invalid PayPal environments and unsafe return origins", () => {
    vi.stubEnv("PAYPAL_ENV", "typo");
    expect(paymentMethods().paypal).toBe(false);
    vi.stubEnv("NEXTAUTH_URL", "http://outside.example");
    expect(() => paymentOrigin()).toThrow();
    vi.stubEnv("NEXTAUTH_URL", "https://user:secret@outside.example");
    expect(() => paymentOrigin()).toThrow();
    vi.stubEnv("NEXTAUTH_URL", "https://shop.example.com/path?bad=1");
    expect(paymentOrigin()).toBe("https://shop.example.com");
  });
  it.each([0, 49, -1, 10.5, NaN, Infinity, 100000000, Number.MAX_SAFE_INTEGER])(
    "rejects unsupported total %s",
    (total) => expect(() => validatePaymentTotal(total)).toThrow(),
  );
  it("accepts the supported USD boundaries", () => {
    expect(() => validatePaymentTotal(50)).not.toThrow();
    expect(() => validatePaymentTotal(99999999)).not.toThrow();
  });
  it("only redirects to the selected provider's HTTPS checkout", () => {
    expect(
      paymentRedirectUrl("stripe", "https://checkout.stripe.com/c/pay/test"),
    ).toContain("checkout.stripe.com");
    for (const url of [
      "javascript:alert(1)",
      "https://checkout.stripe.com.evil.example/",
      "http://checkout.stripe.com/",
      "https://secret@checkout.stripe.com/",
    ])
      expect(() => paymentRedirectUrl("stripe", url)).toThrow();
    expect(() =>
      paymentRedirectUrl("paypal", "https://www.paypal.com/checkoutnow"),
    ).toThrow();
    expect(
      paymentRedirectUrl(
        "paypal",
        "https://www.sandbox.paypal.com/checkoutnow",
      ),
    ).toContain("sandbox");
  });
});
describe("provider request and verification", () => {
  it("creates Stripe hosted checkout with immutable USD lines and an idempotency key", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(async () =>
        reply({ id: stripe.id, url: "https://checkout.stripe.com/c/pay/test" }),
      );
    vi.stubGlobal("fetch", fetcher);
    await createProviderSession(order);
    await createProviderSession(order);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect(init.headers["Idempotency-Key"]).toBe(`checkout-${order.id}`);
    expect(fetcher.mock.calls[1][1].headers["Idempotency-Key"]).toBe(
      init.headers["Idempotency-Key"],
    );
    expect(init.body.get("line_items[0][price_data][unit_amount]")).toBe(
      "12345",
    );
    expect(init.body.get("metadata[orderId]")).toBe(order.id);
    expect(init.body.get("success_url")).toBe(
      `https://shop.example.com/checkout/return/?order=${order.id}`,
    );
  });
  it("creates a sandbox PayPal approval bound to the local order and exact USD amount", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply({ access_token: "fixture-token" }))
      .mockResolvedValueOnce(
        reply({
          id: paypal.id,
          links: [
            {
              rel: "payer-action",
              href: "https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL123",
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const redirect = await createProviderSession({
      ...order,
      provider: "paypal",
    });
    expect(redirect.id).toBe(paypal.id);
    const [url, init] = fetcher.mock.calls[1];
    expect(url).toContain("api-m.sandbox.paypal.com");
    const body = JSON.parse(init.body);
    expect(body.purchase_units[0]).toMatchObject({
      invoice_id: order.id,
      custom_id: order.id,
      amount: { currency_code: "USD", value: "123.45" },
    });
    expect(
      body.payment_source.paypal.experience_context.shipping_preference,
    ).toBe("NO_SHIPPING");
    expect(init.headers["PayPal-Request-Id"]).toBe(`checkout-${order.id}`);
  });
  it("accepts Stripe payment only after full order, amount, mode and currency verification", () => {
    expect(verifyStripeSession(order, stripe.id, stripe)).toEqual({
      status: "paid",
      reference: "pi_test_123",
    });
    for (const patch of [
      { amount_total: 1 },
      { currency: "eur" },
      { livemode: true },
      { client_reference_id: "other" },
      { metadata: { orderId: "other" } },
      { id: "cs_other" },
      { payment_intent: null },
    ])
      expect(() =>
        verifyStripeSession(order, stripe.id, { ...stripe, ...patch }),
      ).toThrow();
    expect(
      verifyStripeSession(order, stripe.id, {
        ...stripe,
        payment_status: "unpaid",
      }).status,
    ).toBe("pending");
    expect(
      verifyStripeSession(order, stripe.id, {
        ...stripe,
        status: "expired",
        payment_status: "unpaid",
      }).status,
    ).toBe("expired");
  });
  it("checks PayPal's completed capture rather than approval or a browser success flag", () => {
    const p = { ...order, provider: "paypal" as const };
    expect(verifyPaypalOrder(p, paypal.id, paypal)).toEqual({
      status: "paid",
      reference: "CAPTURE123",
    });
    const approved = {
      ...paypal,
      status: "APPROVED",
      purchase_units: [{ ...paypal.purchase_units[0], payments: undefined }],
    };
    expect(verifyPaypalOrder(p, paypal.id, approved).status).toBe("pending");
    for (const patch of [
      { custom_id: "other" },
      { invoice_id: "other" },
      { amount: { currency_code: "EUR", value: "123.45" } },
      {
        payments: {
          captures: [
            {
              ...paypal.purchase_units[0].payments.captures[0],
              amount: { currency_code: "USD", value: "1.00" },
            },
          ],
        },
      },
      {
        payments: {
          captures: [
            {
              ...paypal.purchase_units[0].payments.captures[0],
              final_capture: false,
            },
          ],
        },
      },
    ])
      expect(() =>
        verifyPaypalOrder(p, paypal.id, {
          ...paypal,
          purchase_units: [{ ...paypal.purchase_units[0], ...patch }],
        }),
      ).toThrow();
  });
  it("validates PayPal order before capture and reuses a capture idempotency key", async () => {
    const approved = {
      ...paypal,
      status: "APPROVED",
      purchase_units: [{ ...paypal.purchase_units[0], payments: undefined }],
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply({ access_token: "token" }))
      .mockResolvedValueOnce(reply(approved))
      .mockResolvedValueOnce(reply(paypal));
    vi.stubGlobal("fetch", fetcher);
    expect(
      (
        await confirmProviderPayment(
          { ...order, provider: "paypal" },
          paypal.id,
          true,
        )
      ).status,
    ).toBe("paid");
    expect(fetcher.mock.calls[2][1].headers["PayPal-Request-Id"]).toBe(
      `capture-${order.id}`,
    );
  });
  it("never captures a mismatched PayPal order", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply({ access_token: "token" }))
      .mockResolvedValueOnce(
        reply({
          ...paypal,
          status: "APPROVED",
          purchase_units: [{ ...paypal.purchase_units[0], custom_id: "other" }],
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    await expect(
      confirmProviderPayment({ ...order, provider: "paypal" }, paypal.id, true),
    ).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("does not recapture an already completed PayPal payment", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply({ access_token: "token" }))
      .mockResolvedValueOnce(reply(paypal));
    vi.stubGlobal("fetch", fetcher);
    await confirmProviderPayment(
      { ...order, provider: "paypal" },
      paypal.id,
      true,
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("does not leak provider error bodies or credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(reply({ secret: "must-not-leak" }, 401)),
    );
    await expect(createProviderSession(order)).rejects.toThrow(
      "The payment service could not complete this request",
    );
  });
});
describe("webhook authenticity", () => {
  const raw = '{"type":"checkout.session.completed"}',
    time = 1800000000;
  const signature = createHmac("sha256", "whsec_fixture")
    .update(`${time}.${raw}`)
    .digest("hex");
  it("verifies the raw Stripe payload with timestamp tolerance and multiple rotated signatures", () => {
    expect(() =>
      verifyStripeSignature(
        raw,
        `t=${time},v1=${"0".repeat(64)},v1=${signature}`,
        time * 1000,
      ),
    ).not.toThrow();
    expect(() =>
      verifyStripeSignature(
        raw + " ",
        `t=${time},v1=${signature}`,
        time * 1000,
      ),
    ).toThrow();
    expect(() =>
      verifyStripeSignature(
        raw,
        `t=${time},v1=${signature}`,
        (time + 301) * 1000,
      ),
    ).toThrow();
    expect(() =>
      verifyStripeSignature(raw, `t=${time},v0=${signature}`, time * 1000),
    ).toThrow();
    expect(() => verifyStripeSignature(raw, null, time * 1000)).toThrow();
  });
  it("requires PayPal transmission headers and a successful server signature verification", async () => {
    const headers = new Headers({
      "paypal-auth-algo": "SHA256withRSA",
      "paypal-cert-url": "https://api.paypal.com/certificate",
      "paypal-transmission-id": "test",
      "paypal-transmission-sig": "signature",
      "paypal-transmission-time": "2026-10-11T00:00:00Z",
    });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply({ access_token: "token" }))
      .mockResolvedValueOnce(reply({ verification_status: "SUCCESS" }));
    vi.stubGlobal("fetch", fetcher);
    await expect(
      verifyPaypalSignature({ id: "event" }, headers),
    ).resolves.toBeUndefined();
    expect(fetcher.mock.calls[1][0]).toContain(
      "/v1/notifications/verify-webhook-signature",
    );
    expect(JSON.parse(fetcher.mock.calls[1][1].body).webhook_id).toBe(
      "fixture-hook",
    );
    await expect(verifyPaypalSignature({}, new Headers())).rejects.toThrow(
      "Missing PayPal signature",
    );
    fetcher
      .mockResolvedValueOnce(reply({ access_token: "token" }))
      .mockResolvedValueOnce(reply({ verification_status: "FAILURE" }));
    await expect(verifyPaypalSignature({}, headers)).rejects.toThrow(
      "Invalid PayPal signature",
    );
  });
  it("limits the streamed webhook body and preserves exact bytes", async () => {
    expect(
      await rawPaymentWebhook(
        new Request("https://shop.example.com", { method: "POST", body: raw }),
      ),
    ).toBe(raw);
    await expect(
      rawPaymentWebhook(
        new Request("https://shop.example.com", {
          method: "POST",
          body: "x".repeat(1024 * 1024 + 1),
        }),
      ),
    ).rejects.toThrow("too large");
  });
});
