import { z } from "zod";
import { json } from "@/lib/api";
import { ProductError } from "@/lib/commerce/errors";
import { productHandle } from "@/lib/commerce/http";
import { availableProduct } from "@/lib/commerce/products";
import { placementOptions } from "@/lib/commerce/pricing";
export const GET = (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) =>
  productHandle(async () => {
    const id = z.uuid().parse((await params).id);
    const product = await availableProduct(id);
    if (!product) throw new ProductError(404, "This placement is unavailable.");
    return json(placementOptions(product));
  });
