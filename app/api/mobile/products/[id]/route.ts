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
    const { id } = await params;
    const validatedId = z.uuid().parse(id);
    const product = await availableProduct(validatedId);
    if (!product) throw new ProductError(404, "This domain placement is unavailable.");

    let options = null;
    try {
      options = placementOptions(product);
    } catch {
      // options remains null if calculation fails
    }

    return json({
      product,
      options,
    });
  });
