import { authenticated, body, json } from "@/lib/api";
import { createProduct, listProducts } from "@/lib/commerce/products";
import { productHandle } from "@/lib/commerce/http";
export const GET = (request: Request) =>
  productHandle(async () => {
    await authenticated(request, true);
    return json(await listProducts(new URL(request.url).searchParams, true));
  });
export const POST = (request: Request) =>
  productHandle(async () => {
    const user = await authenticated(request, true);
    return json(
      { data: await createProduct(await body(request), user.id) },
      201,
    );
  });
