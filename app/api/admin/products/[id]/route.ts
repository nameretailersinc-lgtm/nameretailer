import { authenticated, body, json } from "@/lib/api";
import { updateProduct } from "@/lib/commerce/products";
import { productHandle } from "@/lib/commerce/http";
export const PATCH = (
  request: Request,
  context: { params: Promise<{ id: string }> },
) =>
  productHandle(async () => {
    const user = await authenticated(request, true);
    const { id } = await context.params;
    return json({
      data: await updateProduct(id, await body(request), user.id),
    });
  });
