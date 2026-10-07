import type { ClientSession } from "mongodb";
import { getDb, transaction, userTransaction } from "@/lib/db";
import { freshAccount, type AccountIdentity } from "@/lib/account";
import { logAudit } from "@/lib/audit";
import { availableProduct } from "./products";
import { placementOptions, quotePlacement } from "./pricing";
import { ProductError } from "./errors";
import { cartDeleteSchema, cartPutSchema } from "./cart-validation";
import type { CartSelection, CartItem, CartView } from "./cart-types";
import { ownArticleFile } from "./article-files";
interface SavedCart {
  _id: string;
  version: number;
  items: CartSelection[];
  updatedAt: string;
}
async function carts() {
  return (await getDb()).collection<SavedCart>("commerce_carts");
}
// MongoDB's unique _id is the authenticated owner; no client-selected owner or cart ID.
async function savedCart(
  actor: AccountIdentity,
  session: ClientSession,
): Promise<SavedCart> {
  return (
    (await (await carts()).findOne({ _id: actor.id }, { session })) || {
      _id: actor.id,
      version: 0,
      items: [],
      updatedAt: "",
    }
  );
}
export async function savedOwnCart(
  actor: AccountIdentity,
  session: ClientSession,
) {
  return savedCart(actor, session);
}
export async function attachArticleFiles(
  view: CartView,
  actor: AccountIdentity,
  session: ClientSession,
) {
  for (const item of view.items) {
    item.file = item.brief?.fileId
      ? await ownArticleFile(actor, item.brief.fileId, session)
      : null;
  }
  return view;
}
export async function cartView(
  saved: Pick<SavedCart, "items" | "version">,
  session?: ClientSession,
): Promise<CartView> {
  const items: CartItem[] = [];
  for (const selection of saved.items) {
    const product = await availableProduct(selection.productId, session);
    let options: CartItem["options"] = null;
    let quote: ReturnType<typeof quotePlacement> | null = null;
    if (product) {
      try {
        options = placementOptions(product);
        quote = quotePlacement(options, selection.writingWords);
      } catch (error) {
        if (!(error instanceof ProductError)) throw error;
      }
    }
    const status = !quote
      ? "unavailable"
      : product!.version !== selection.productVersion
        ? "changed"
        : "ready";
    items.push({
      ...selection,
      domain: product?.domain ?? null,
      placementCents: quote?.placementCents ?? null,
      writingCents: quote?.writingCents ?? null,
      totalCents: quote?.totalCents ?? null,
      status,
      options,
    });
  }
  const sum = items.reduce((total, item) => total + (item.totalCents ?? 0), 0);
  const totalCents =
    items.every((item) => item.status === "ready") && Number.isSafeInteger(sum)
      ? sum
      : null;
  return {
    version: saved.version,
    currency: "USD",
    items,
    totalCents,
    checkoutAvailable: false,
  };
}
export async function getCart(actor: AccountIdentity) {
  return transaction(async (session) => {
    await freshAccount(actor, session);
    return attachArticleFiles(
      await cartView(await savedCart(actor, session), session),
      actor,
      session,
    );
  });
}
async function writeCart(
  actor: AccountIdentity,
  version: number,
  change: (
    items: CartSelection[],
    session: ClientSession,
  ) => Promise<CartSelection[]>,
) {
  return userTransaction(async (session) => {
    await freshAccount(actor, session);
    const saved = await savedCart(actor, session);
    if (version !== saved.version)
      throw new ProductError(409, "Your cart changed. Reload before saving.");
    const items = await change(saved.items, session);
    const next: SavedCart = {
      _id: actor.id,
      items,
      version: saved.version + 1,
      updatedAt: new Date().toISOString(),
    };
    const view = await cartView(next, session);
    // Prevent totals overflowing even if every individual listing fits the safe range.
    if (
      view.items.every((item) => item.status === "ready") &&
      view.totalCents === null
    )
      throw new ProductError(
        422,
        "Your cart total exceeds the supported price range. Remove a placement.",
      );
    if (saved.version === 0) await (await carts()).insertOne(next, { session });
    else {
      const result = await (
        await carts()
      ).replaceOne({ _id: actor.id, version }, next, { session });
      if (!result.modifiedCount)
        throw new ProductError(409, "Your cart changed. Reload before saving.");
    }
    await logAudit(
      actor.id,
      "cart.update",
      "carts",
      actor.id,
      `${items.length} placement selections.`,
      session,
    );
    return attachArticleFiles(view, actor, session);
  });
}
export async function putCart(actor: AccountIdentity, raw: unknown) {
  const { version, item } = cartPutSchema.parse(raw);
  return writeCart(actor, version, async (items, session) => {
    const product = await availableProduct(item.productId, session);
    if (!product) throw new ProductError(404, "This placement is unavailable.");
    if (product.version !== item.productVersion)
      throw new ProductError(
        409,
        "This listing changed. Review its current options before saving.",
      );
    quotePlacement(placementOptions(product), item.writingWords);
    if (
      item.brief?.fileId &&
      !(await ownArticleFile(actor, item.brief.fileId, session))
    )
      throw new ProductError(
        422,
        "This article file expired or is unavailable. Upload it again.",
      );
    const next = items.filter((old) => old.productId !== item.productId);
    if (next.length >= 20)
      throw new ProductError(422, "A cart can hold at most 20 placements.");
    return [...next, item];
  });
}
export async function deleteCart(actor: AccountIdentity, raw: unknown) {
  const { version, productId } = cartDeleteSchema.parse(raw);
  return writeCart(actor, version, async (items) =>
    items.filter((item) => item.productId !== productId),
  );
}
