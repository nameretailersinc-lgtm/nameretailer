import { json } from "@/lib/api";
import { productHandle } from "@/lib/commerce/http";
import { handlePaypalEvent } from "@/lib/commerce/payments";
import {
  rawPaymentWebhook,
  verifyPaypalSignature,
} from "@/lib/commerce/payment-providers";
import { ProductError } from "@/lib/commerce/errors";
export const runtime = "nodejs";
export const POST = (request: Request) =>
  productHandle(async () => {
    let event: unknown;
    try {
      event = JSON.parse(await rawPaymentWebhook(request));
    } catch (error) {
      if (error instanceof ProductError) throw error;
      throw new ProductError(400, "Invalid webhook JSON.");
    }
    await verifyPaypalSignature(event, request.headers);
    await handlePaypalEvent(event);
    return json({ received: true });
  });
