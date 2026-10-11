import { json } from "@/lib/api";
import { mobileAuthenticated } from "@/lib/mobile-auth";
import { listOrders } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const GET = (request: Request) =>
  productHandle(async () =>
    json(await listOrders(await mobileAuthenticated(request))),
  );
