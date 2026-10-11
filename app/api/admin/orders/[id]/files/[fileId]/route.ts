import { accountAuthenticated } from "@/lib/account";
import { downloadAdminOrderFile } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const runtime = "nodejs";
export const GET = (
  request: Request,
  context: { params: Promise<{ id: string; fileId: string }> },
) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    const { id, fileId } = await context.params;
    return downloadAdminOrderFile(actor, id, fileId);
  });
