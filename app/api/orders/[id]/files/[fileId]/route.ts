import { accountAuthenticated } from "@/lib/account";
import { downloadOrderFile } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const GET = (
  request: Request,
  context: { params: Promise<{ id: string; fileId: string }> },
) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    const { id, fileId } = await context.params;
    return downloadOrderFile(actor, id, fileId);
  });
