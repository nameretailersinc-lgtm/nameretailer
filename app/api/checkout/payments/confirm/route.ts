import { body, json } from "@/lib/api";
import { accountAuthenticated, accountMutationLimit } from "@/lib/account";
import { confirmPayment } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const runtime = "nodejs";
export const POST = (request: Request) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "payment-confirm");
    return json(await confirmPayment(actor, await body(request)));
  });
