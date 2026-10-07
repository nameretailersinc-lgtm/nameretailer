import { json } from "@/lib/api";
import { listProducts } from "@/lib/commerce/products";
import { productHandle } from "@/lib/commerce/http";
export const GET = (request: Request) =>
  productHandle(async () =>
    json(await listProducts(new URL(request.url).searchParams)),
  );
