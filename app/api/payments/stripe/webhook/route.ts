import { json } from "@/lib/api";
import { productHandle } from "@/lib/commerce/http";
import { handleStripeEvent } from "@/lib/commerce/payments";
import {
  rawPaymentWebhook,
  verifyStripeSignature,
} from "@/lib/commerce/payment-providers";
import { ProductError } from "@/lib/commerce/errors";
export const runtime = "nodejs";
export const POST = (request: Request) =>
  productHandle(async () => {
    const raw = await rawPaymentWebhook(request);
    verifyStripeSignature(raw, request.headers.get("stripe-signature"));
    let event: unknown;
    try {
      event = JSON.parse(raw);
    } catch {
      throw new ProductError(400, "Invalid webhook JSON.");
    }
    await handleStripeEvent(event);
    return json({ received: true });
  });
