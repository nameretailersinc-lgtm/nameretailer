import { body, json } from "@/lib/api";
import { accountMutationLimit } from "@/lib/account";
import { mobileAuthenticated } from "@/lib/mobile-auth";
import { getCart, putCart, deleteCart } from "@/lib/commerce/cart";
import { productHandle } from "@/lib/commerce/http";

export const GET = (request: Request) =>
  productHandle(async () => {
    const actor = await mobileAuthenticated(request);
    return json(await getCart(actor));
  });

export const PUT = (request: Request) =>
  productHandle(async () => {
    const actor = await mobileAuthenticated(request);
    await accountMutationLimit(actor, "cart");
    return json(await putCart(actor, await body(request)));
  });

export const DELETE = (request: Request) =>
  productHandle(async () => {
    const actor = await mobileAuthenticated(request);
    await accountMutationLimit(actor, "cart");
    return json(await deleteCart(actor, await body(request)));
  });
