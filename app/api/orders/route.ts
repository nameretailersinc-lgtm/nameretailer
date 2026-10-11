import { json } from "@/lib/api";
import { accountAuthenticated } from "@/lib/account";
import { listOrders } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const GET = (request: Request) =>
  productHandle(async () =>
    json(await listOrders(await accountAuthenticated(request))),
  );
