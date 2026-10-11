import { json } from "@/lib/api";
import { accountAuthenticated } from "@/lib/account";
import { listAdminOrders } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const GET = (request: Request) =>
  productHandle(async () =>
    json(
      await listAdminOrders(
        await accountAuthenticated(request),
        new URL(request.url).searchParams,
      ),
    ),
  );
