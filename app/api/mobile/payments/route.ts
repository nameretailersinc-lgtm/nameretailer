import { body, json } from "@/lib/api";
import { accountMutationLimit } from "@/lib/account";
import { mobileAuthenticated } from "@/lib/mobile-auth";
import { startPayment } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const runtime = "nodejs";
export const POST = (request: Request) =>
  productHandle(async () => {
    const actor = await mobileAuthenticated(request);
    await accountMutationLimit(actor, "payments");
    return json(await startPayment(actor, await body(request)), 201);
  });
