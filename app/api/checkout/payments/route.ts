import { body, json } from "@/lib/api";
import { accountAuthenticated, accountMutationLimit } from "@/lib/account";
import { startPayment } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const runtime = "nodejs";
export const POST = (request: Request) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "payment-create");
    return json(await startPayment(actor, await body(request)));
  });
