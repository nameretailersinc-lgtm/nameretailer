import { json } from "@/lib/api";
import { mobileAuthenticated } from "@/lib/mobile-auth";
import { getOrder } from "@/lib/commerce/payments";
import { productHandle } from "@/lib/commerce/http";
export const GET = (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) =>
  productHandle(async () =>
    json(await getOrder(await mobileAuthenticated(request), (await params).id)),
  );
