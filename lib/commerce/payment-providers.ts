import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ProductError } from "./errors";
import {
  paypalBase,
  paymentOrigin,
  requirePaymentProvider,
} from "./payment-config";
import type { PaymentProvider, PaymentStatus } from "./payment-types";

export interface PaymentSnapshot {
  id: string;
  provider: PaymentProvider;
  totalCents: number;
  billingEmail: string;
  createdAt: string;
  live: boolean;
  items: { domain: string; totalCents: number; writingWords: number }[];
}
export interface ProviderSession {
  id: string;
  url: string;
}
export interface VerifiedPayment {
  status: PaymentStatus;
  reference?: string;
}

async function providerJson(url: string, init: RequestInit) {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ProductError(
      502,
      "The payment service did not respond. Retry to check the same payment attempt.",
    );
  }
  if (!response.ok)
    throw new ProductError(
      502,
      "The payment service could not complete this request. Retry or contact support with your order number.",
    );
  try {
    return await response.json();
  } catch {
    throw new ProductError(
      502,
      "The payment service returned an invalid response.",
    );
  }
}
function stripeHeaders() {
  requirePaymentProvider("stripe");
  return {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!.trim()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}
async function paypalHeaders() {
  requirePaymentProvider("paypal");
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID!.trim()}:${process.env.PAYPAL_CLIENT_SECRET!.trim()}`,
  ).toString("base64");
  const data = z.object({ access_token: z.string().min(1) }).parse(
    await providerJson(`${paypalBase()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }),
  );
  return {
    Authorization: `Bearer ${data.access_token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}
export function validatePaymentTotal(totalCents: number) {
  if (
    !Number.isSafeInteger(totalCents) ||
    totalCents < 50 ||
    totalCents > 99999999
  )
    throw new ProductError(
      422,
      "Online checkout supports totals from $0.50 to $999,999.99. Contact support for this placement.",
    );
}
export function paymentRedirectUrl(provider: PaymentProvider, value: string) {
  const url = new URL(value);
  const hosts =
    provider === "stripe"
      ? ["checkout.stripe.com"]
      : process.env.PAYPAL_ENV === "live"
        ? ["www.paypal.com"]
        : ["www.sandbox.paypal.com"];
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !hosts.includes(url.hostname)
  )
    throw new ProductError(
      502,
      "The payment service returned an unexpected checkout address.",
    );
  return url.href;
}
export async function createProviderSession(
  order: PaymentSnapshot,
): Promise<ProviderSession> {
  validatePaymentTotal(order.totalCents);
  const origin = paymentOrigin();
  const returnUrl = `${origin}/checkout/return/?order=${order.id}`;
  const cancelUrl = `${returnUrl}&cancelled=1`;
  if (order.provider === "stripe") {
    const form = new URLSearchParams({
      mode: "payment",
      customer_email: order.billingEmail,
      client_reference_id: order.id,
      "metadata[orderId]": order.id,
      "payment_intent_data[metadata][orderId]": order.id,
      "payment_method_types[0]": "card",
      success_url: returnUrl,
      cancel_url: cancelUrl,
      expires_at: String(
        Math.floor(new Date(order.createdAt).getTime() / 1000) + 3600,
      ),
    });
    order.items.forEach((item, i) => {
      form.set(`line_items[${i}][quantity]`, "1");
      form.set(`line_items[${i}][price_data][currency]`, "usd");
      form.set(
        `line_items[${i}][price_data][unit_amount]`,
        String(item.totalCents),
      );
      form.set(
        `line_items[${i}][price_data][product_data][name]`,
        `Guest post: ${item.domain}`.slice(0, 200),
      );
      if (item.writingWords)
        form.set(
          `line_items[${i}][price_data][product_data][description]`,
          `Includes ${item.writingWords}-word article writing`,
        );
    });
    const data = z
      .object({ id: z.string().startsWith("cs_"), url: z.url() })
      .parse(
        await providerJson("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            ...stripeHeaders(),
            "Idempotency-Key": `checkout-${order.id}`,
          },
          body: form,
        }),
      );
    return { id: data.id, url: paymentRedirectUrl("stripe", data.url) };
  }
  const data = z
    .object({
      id: z.string().regex(/^[A-Z0-9]+$/),
      links: z.array(z.object({ rel: z.string(), href: z.url() })),
    })
    .parse(
      await providerJson(`${paypalBase()}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          ...(await paypalHeaders()),
          "PayPal-Request-Id": `checkout-${order.id}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: order.id,
              custom_id: order.id,
              invoice_id: order.id,
              description: "Name Retailer guest post placements",
              amount: {
                currency_code: "USD",
                value: (order.totalCents / 100).toFixed(2),
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                brand_name: "Name Retailer",
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
                return_url: returnUrl,
                cancel_url: cancelUrl,
              },
            },
          },
        }),
      }),
    );
  const approval = data.links.find((link) =>
    ["payer-action", "approve"].includes(link.rel),
  );
  if (!approval)
    throw new ProductError(
      502,
      "PayPal did not return an approval link. Retry this payment attempt.",
    );
  return { id: data.id, url: paymentRedirectUrl("paypal", approval.href) };
}

export const stripeSessionSchema = z.object({
  id: z.string(),
  client_reference_id: z.string().nullable(),
  metadata: z.object({ orderId: z.string() }),
  livemode: z.boolean(),
  amount_total: z.number().int(),
  currency: z.string(),
  payment_status: z.string(),
  status: z.string(),
  payment_intent: z
    .union([z.string(), z.object({ id: z.string() }), z.null()])
    .optional(),
});
export function verifyStripeSession(
  order: PaymentSnapshot,
  sessionId: string,
  raw: unknown,
): VerifiedPayment {
  const data = stripeSessionSchema.parse(raw);
  if (
    data.id !== sessionId ||
    data.client_reference_id !== order.id ||
    data.metadata.orderId !== order.id ||
    data.livemode !== order.live ||
    data.amount_total !== order.totalCents ||
    data.currency !== "usd"
  )
    throw new ProductError(
      409,
      "Payment details do not match this order. Contact support.",
    );
  if (data.payment_status === "paid" && data.status === "complete") {
    const reference =
      typeof data.payment_intent === "string"
        ? data.payment_intent
        : data.payment_intent?.id;
    if (!reference)
      throw new ProductError(
        409,
        "Payment confirmation is missing its transaction reference.",
      );
    return { status: "paid", reference };
  }
  return { status: data.status === "expired" ? "expired" : "pending" };
}
const amountSchema = z.object({
  currency_code: z.string(),
  value: z.string().regex(/^\d+\.\d{2}$/),
});
const paypalOrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  purchase_units: z.array(
    z.object({
      custom_id: z.string(),
      invoice_id: z.string(),
      amount: amountSchema.optional(),
      payments: z
        .object({
          captures: z.array(
            z.object({
              id: z.string(),
              status: z.string(),
              amount: amountSchema,
              final_capture: z.boolean(),
            }),
          ),
        })
        .optional(),
    }),
  ),
});
export function verifyPaypalOrder(
  order: PaymentSnapshot,
  remoteId: string,
  raw: unknown,
): VerifiedPayment {
  const data = paypalOrderSchema.parse(raw);
  const unit = data.purchase_units[0];
  const expected = (order.totalCents / 100).toFixed(2);
  if (
    data.id !== remoteId ||
    data.purchase_units.length !== 1 ||
    unit.custom_id !== order.id ||
    unit.invoice_id !== order.id ||
    (unit.amount &&
      (unit.amount.currency_code !== "USD" || unit.amount.value !== expected))
  )
    throw new ProductError(
      409,
      "PayPal payment details do not match this order. Contact support.",
    );
  const captures = unit.payments?.captures || [];
  if (captures.length) {
    if (
      captures.length !== 1 ||
      captures[0].amount.currency_code !== "USD" ||
      captures[0].amount.value !== expected ||
      !captures[0].final_capture
    )
      throw new ProductError(
        409,
        "PayPal capture details do not match this order. Contact support.",
      );
    if (data.status === "COMPLETED" && captures[0].status === "COMPLETED")
      return { status: "paid", reference: captures[0].id };
    if (["DECLINED", "FAILED"].includes(captures[0].status))
      return { status: "failed" };
  }
  return { status: data.status === "VOIDED" ? "expired" : "pending" };
}
export async function confirmProviderPayment(
  order: PaymentSnapshot,
  remoteId: string,
  capturePaypal = false,
): Promise<VerifiedPayment> {
  if (order.provider === "stripe")
    return verifyStripeSession(
      order,
      remoteId,
      await providerJson(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(remoteId)}`,
        { headers: stripeHeaders() },
      ),
    );
  if (order.live !== (process.env.PAYPAL_ENV === "live"))
    throw new ProductError(
      503,
      "This order belongs to a different PayPal environment.",
    );
  const headers = await paypalHeaders();
  const url = `${paypalBase()}/v2/checkout/orders/${encodeURIComponent(remoteId)}`;
  let data = await providerJson(url, { headers });
  // Validate the amount and order binding BEFORE authorizing a capture.
  const result = verifyPaypalOrder(order, remoteId, data);
  if (capturePaypal && data.status === "APPROVED") {
    data = await providerJson(`${url}/capture`, {
      method: "POST",
      headers: { ...headers, "PayPal-Request-Id": `capture-${order.id}` },
      body: "{}",
    });
    return verifyPaypalOrder(order, remoteId, data);
  }
  return result;
}
export function verifyStripeSignature(
  raw: string,
  header: string | null,
  now = Date.now(),
) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret)
    throw new ProductError(503, "Stripe webhooks are not configured.");
  const parts = (header || "").split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    throw new ProductError(400, "Invalid or expired Stripe signature.");
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${raw}`)
    .digest();
  if (
    !parts.some(
      ([key, value]) =>
        key === "v1" &&
        /^[a-f0-9]{64}$/i.test(value || "") &&
        timingSafeEqual(expected, Buffer.from(value, "hex")),
    )
  )
    throw new ProductError(400, "Invalid Stripe signature.");
}
export async function verifyPaypalSignature(event: unknown, headers: Headers) {
  const fields: Record<string, string> = {};
  for (const [field, header] of [
    ["auth_algo", "paypal-auth-algo"],
    ["cert_url", "paypal-cert-url"],
    ["transmission_id", "paypal-transmission-id"],
    ["transmission_sig", "paypal-transmission-sig"],
    ["transmission_time", "paypal-transmission-time"],
  ]) {
    const value = headers.get(header);
    if (!value) throw new ProductError(400, "Missing PayPal signature.");
    fields[field] = value;
  }
  // Certificate URL is passed to PayPal's verifier; never fetched by this server.
  const data = await providerJson(
    `${paypalBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: await paypalHeaders(),
      body: JSON.stringify({
        ...fields,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID!.trim(),
        webhook_event: event,
      }),
    },
  );
  if (data.verification_status !== "SUCCESS")
    throw new ProductError(400, "Invalid PayPal signature.");
}
export async function rawPaymentWebhook(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new ProductError(400, "Missing webhook body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024 * 1024) {
      await reader.cancel();
      throw new ProductError(413, "Webhook payload is too large.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
