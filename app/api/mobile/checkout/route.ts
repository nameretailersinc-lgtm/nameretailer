import { body, json } from "@/lib/api";
import { accountMutationLimit } from "@/lib/account";
import { mobileAuthenticated } from "@/lib/mobile-auth";
import { getMobileCheckout, putMobileCheckout } from "@/lib/mobile-checkout";
import { deleteCheckout } from "@/lib/commerce/checkout";
import { productHandle } from "@/lib/commerce/http";

export const GET = (request: Request) =>
  productHandle(async () => {
    const actor = await mobileAuthenticated(request);
    return json(await getMobileCheckout(actor));
  });

export const PUT = (request: Request) =>
  productHandle(async () => {
    const actor = await mobileAuthenticated(request);
    await accountMutationLimit(actor, "checkout");
    return json(await putMobileCheckout(actor, await body(request)));
  });

export const DELETE = (request: Request) => productHandle(async () => {
  const actor = await mobileAuthenticated(request);
  await accountMutationLimit(actor, 'checkout');
  return json(await deleteCheckout(actor));
});
