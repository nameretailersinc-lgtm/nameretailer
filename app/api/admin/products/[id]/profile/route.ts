import { authenticated, body, json } from "@/lib/api";
import { productHandle } from "@/lib/commerce/http";
import { productStore } from "@/lib/commerce/products";
import { ProductError } from "@/lib/commerce/errors";
import { savePublicationContent } from "@/lib/commerce/publication-content-store";
import { validPublicationListingId } from "@/lib/commerce/publication-pages";
import { activePublicationFilter } from "@/lib/commerce/publication-profiles";
import { publicProduct } from "@/lib/commerce/public-product";
import { publicationEditorialBrief } from "@/lib/commerce/publication-presentation";
type Context = { params: Promise<{ id: string }> };
async function listingId(context: Context) {
  const { id } = await context.params;
  if (!validPublicationListingId(id)) throw new ProductError(404, "Publication not found.");
  return id;
}
export const GET = (request: Request, context: Context) => productHandle(async () => {
  await authenticated(request, true);
  const id = await listingId(context);
  const visible = await activePublicationFilter();
  const product = await (await productStore()).products.findOne({ $and: [{ id }, { $or: visible.$or }] }, { projection: { _id: 0, source: 0 } });
  if (!product) throw new ProductError(404, "Publication not found.");
  return json({ data: { domain: product.domain, version: product.version, publicationContent: product.publicationContent || null, brief: publicationEditorialBrief(publicProduct(product)) } });
});
export const PATCH = (request: Request, context: Context) => productHandle(async () => {
  const actor = await authenticated(request, true);
  return json({ data: await savePublicationContent(await listingId(context), await body(request), actor.id) });
});
