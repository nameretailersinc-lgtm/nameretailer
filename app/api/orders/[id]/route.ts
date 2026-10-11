import { json } from "@/lib/api";
import { accountAuthenticated } from "@/lib/account";
import { getOrder } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const GET = (
  request: Request,
  context: { params: Promise<{ id: string }> },
) =>
  productHandle(async () =>
    json(
      await getOrder(
        await accountAuthenticated(request),
        (await context.params).id,
      ),
    ),
  );
