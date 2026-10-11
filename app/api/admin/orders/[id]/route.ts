import { body, json } from "@/lib/api";
import { accountAuthenticated, accountMutationLimit } from "@/lib/account";
import { getAdminOrder, updateAdminOrder } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const GET = (
  request: Request,
  context: { params: Promise<{ id: string }> },
) =>
  productHandle(async () =>
    json(
      await getAdminOrder(
        await accountAuthenticated(request),
        (await context.params).id,
      ),
    ),
  );
export const PATCH = (
  request: Request,
  context: { params: Promise<{ id: string }> },
) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "order-management");
    return json(
      await updateAdminOrder(
        actor,
        (await context.params).id,
        await body(request),
      ),
    );
  });
