import { body, json } from "@/lib/api";
import { accountAuthenticated, accountMutationLimit } from "@/lib/account";
import {
  getCheckout,
  putCheckout,
  deleteCheckout,
} from "@/lib/commerce/checkout";
import { productHandle } from "@/lib/commerce/http";
export const GET = (request: Request) =>
  productHandle(async () =>
    json(await getCheckout(await accountAuthenticated(request))),
  );
export const PUT = (request: Request) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "checkout-draft");
    return json(await putCheckout(actor, await body(request)));
  });
export const DELETE = (request: Request) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "checkout-draft");
    return json(await deleteCheckout(actor));
  });
