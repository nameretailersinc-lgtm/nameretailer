import { body, json } from "@/lib/api";
import { accountAuthenticated, accountMutationLimit } from "@/lib/account";
import { getCart, putCart, deleteCart } from "@/lib/commerce/cart";
import { productHandle } from "@/lib/commerce/http";
export const GET = (request: Request) =>
  productHandle(async () =>
    json(await getCart(await accountAuthenticated(request))),
  );
export const PUT = (request: Request) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "cart");
    return json(await putCart(actor, await body(request)));
  });
export const DELETE = (request: Request) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "cart");
    return json(await deleteCart(actor, await body(request)));
  });
