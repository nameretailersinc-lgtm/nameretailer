import { ProductError } from "./errors";
import type { PaymentMethods, PaymentProvider } from "./payment-types";

// Server-only configuration: clients receive availability, never credentials.
export function paymentMethods(): PaymentMethods {
  return {
    stripe: !!(
      process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim()
    ),
    paypal: !!(
      process.env.PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim() &&
      process.env.PAYPAL_WEBHOOK_ID?.trim() &&
      ["sandbox", "live"].includes(process.env.PAYPAL_ENV || "sandbox")
    ),
  };
}
export function requirePaymentProvider(provider: PaymentProvider) {
  if (!paymentMethods()[provider])
    throw new ProductError(
      503,
      `${provider === "stripe" ? "Card" : "PayPal"} payment could not be started. Please request a placement quote so the team can confirm payment arrangements.`,
    );
}
export function paypalBase() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}
export function paymentOrigin() {
  let url: URL;
  try {
    url = new URL(process.env.NEXTAUTH_URL || process.env.SITE_URL || "");
  } catch {
    throw new ProductError(
      503,
      "The checkout return URL has not been configured.",
    );
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        local &&
        process.env.NODE_ENV !== "production"
      ))
  )
    throw new ProductError(503, "Checkout requires a secure site URL.");
  return url.origin;
}
