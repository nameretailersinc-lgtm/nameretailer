import { json } from "@/lib/api";
import { productFacets } from "@/lib/commerce/products";
import { productHandle } from "@/lib/commerce/http";
export const GET = () =>
  productHandle(async () => json({ data: await productFacets() }));
