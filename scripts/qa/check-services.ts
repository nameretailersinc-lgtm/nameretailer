import dotenv from "dotenv";
import { resetMailAvailable, verifySmtp } from "../../lib/mail";
import {
  paymentMethods,
  paymentOrigin,
  paypalBase,
} from "../../lib/commerce/payment-config";

dotenv.config({ quiet: true });
const methods = paymentMethods();
const present = (key: string) => Boolean(process.env[key]?.trim());
function missing(keys: string[]) {
  return keys.filter((key) => !present(key));
}
function errorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    /^[A-Z0-9_]+$/.test(error.code)
  )
    return error.code;
  return "CONNECTION_FAILED";
}
async function checkMail() {
  if (process.env.MAIL_TRANSPORT !== "smtp")
    return {
      enabled: resetMailAvailable(),
      transport: process.env.MAIL_TRANSPORT || "unset",
      smtpVerified: false,
    };
  if (!resetMailAvailable())
    return {
      enabled: false,
      smtpVerified: false,
      missing: missing(["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"]),
    };
  try {
    await verifySmtp();
    return { enabled: true, smtpVerified: true };
  } catch (error) {
    return { enabled: true, smtpVerified: false, errorCode: errorCode(error) };
  }
}
async function checkPaypal() {
  const environment = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
  if (!methods.paypal)
    return {
      enabled: false,
      environment,
      missing: missing([
        "PAYPAL_CLIENT_ID",
        "PAYPAL_CLIENT_SECRET",
        "PAYPAL_WEBHOOK_ID",
      ]),
    };
  try {
    const credentials = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID!.trim()}:${process.env.PAYPAL_CLIENT_SECRET!.trim()}`,
    ).toString("base64");
    const response = await fetch(`${paypalBase()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      return {
        enabled: true,
        environment,
        credentialsVerified: false,
        status: response.status,
      };
    const data = (await response.json()) as { access_token?: unknown };
    if (typeof data.access_token !== "string")
      return {
        enabled: true,
        environment,
        credentialsVerified: false,
        errorCode: "INVALID_RESPONSE",
      };
    const webhook = await fetch(
      `${paypalBase()}/v1/notifications/webhooks/${encodeURIComponent(process.env.PAYPAL_WEBHOOK_ID!.trim())}`,
      {
        headers: { Authorization: `Bearer ${data.access_token}` },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!webhook.ok)
      return {
        enabled: true,
        environment,
        credentialsVerified: true,
        webhookVerified: false,
        status: webhook.status,
      };
    const configured = (await webhook.json()) as {
      url?: unknown;
      event_types?: { name?: string }[];
    };
    const expectedOrigin = new URL(process.env.SITE_URL || paymentOrigin())
      .origin;
    const target =
      typeof configured.url === "string" ? new URL(configured.url) : null;
    const webhookMatchesSite =
      target?.protocol === "https:" &&
      target.origin === expectedOrigin &&
      target.pathname.replace(/\/$/, "") === "/api/payments/paypal/webhook";
    const events = new Set(configured.event_types?.map((event) => event.name));
    const required = [
      "CHECKOUT.ORDER.APPROVED",
      "PAYMENT.CAPTURE.COMPLETED",
      "PAYMENT.CAPTURE.PENDING",
      "PAYMENT.CAPTURE.DENIED",
    ];
    return {
      enabled: true,
      environment,
      credentialsVerified: true,
      webhookVerified: true,
      webhookMatchesSite,
      webhookEventsReady:
        events.has("*") || required.every((name) => events.has(name)),
    };
  } catch (error) {
    return {
      enabled: true,
      environment,
      credentialsVerified: false,
      errorCode: errorCode(error),
    };
  }
}
async function checkStripe() {
  if (!methods.stripe)
    return {
      enabled: false,
      missing: missing(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]),
    };
  try {
    const response = await fetch("https://api.stripe.com/v1/account", {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!.trim()}`,
      },
      signal: AbortSignal.timeout(15000),
    });
    return {
      enabled: true,
      credentialsVerified: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      enabled: true,
      credentialsVerified: false,
      errorCode: errorCode(error),
    };
  }
}
let returnOriginValid = false;
try {
  paymentOrigin();
  returnOriginValid = true;
} catch {
  /* Report availability only. */
}
// Authentication checks only. No email, payment, capture or order is created.
const [smtp, paypal, stripe] = await Promise.all([
  checkMail(),
  checkPaypal(),
  checkStripe(),
]);
console.log(
  JSON.stringify({ smtp, paypal, stripe, returnOriginValid }, null, 2),
);
if (
  (process.env.MAIL_TRANSPORT === "smtp" && !smtp.smtpVerified) ||
  (methods.paypal &&
    (!paypal.credentialsVerified ||
      !paypal.webhookVerified ||
      !paypal.webhookMatchesSite ||
      !paypal.webhookEventsReady)) ||
  (methods.stripe && !stripe.credentialsVerified)
)
  process.exitCode = 1;
