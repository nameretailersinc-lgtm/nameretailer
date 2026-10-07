import { getDb, transaction, userTransaction } from "@/lib/db";
import { freshAccount, type AccountIdentity } from "@/lib/account";
import { logAudit } from "@/lib/audit";
import { attachArticleFiles, cartView, savedOwnCart } from "./cart";
import { checkoutIssues, checkoutPutSchema } from "./checkout-validation";
import { ProductError } from "./errors";
import type { CheckoutDraft, CheckoutView } from "./checkout-types";
interface SavedDraft extends Omit<CheckoutDraft, "expiresAt"> {
  _id: string;
  expiresAt: Date;
}
async function drafts() {
  return (await getDb()).collection<SavedDraft>("commerce_checkout_drafts");
}
function publicDraft(saved: SavedDraft | null): CheckoutDraft | null {
  if (!saved) return null;
  const {
    version,
    cartVersion,
    billing,
    notes,
    paymentPreference,
    updatedAt,
    expiresAt,
  } = saved;
  return {
    version,
    cartVersion,
    billing,
    notes,
    paymentPreference,
    updatedAt,
    expiresAt: expiresAt.toISOString(),
  };
}
export async function getCheckout(
  actor: AccountIdentity,
): Promise<CheckoutView> {
  return transaction(async (session) => {
    await freshAccount(actor, session);
    const cart = await attachArticleFiles(
      await cartView(await savedOwnCart(actor, session), session),
      actor,
      session,
    );
    const saved = await (
      await drafts()
    ).findOne({ _id: actor.id, expiresAt: { $gt: new Date() } }, { session });
    return {
      cart,
      draft: publicDraft(saved),
      issues: checkoutIssues(cart),
      paymentAvailable: false,
      orderSubmissionAvailable: false,
    };
  });
}
export async function putCheckout(
  actor: AccountIdentity,
  raw: unknown,
): Promise<CheckoutView> {
  const input = checkoutPutSchema.parse(raw);
  const collection = await drafts();
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return userTransaction(async (session) => {
    await freshAccount(actor, session);
    const cart = await attachArticleFiles(
      await cartView(await savedOwnCart(actor, session), session),
      actor,
      session,
    );
    if (cart.version !== input.cartVersion)
      throw new ProductError(
        409,
        "Your cart changed. Reload checkout before saving.",
      );
    const issues = checkoutIssues(cart);
    if (issues.length) throw new ProductError(422, issues.join(" "));
    const saved = await collection.findOne({ _id: actor.id }, { session });
    const active =
      saved && saved.expiresAt.getTime() > Date.now() ? saved : null;
    if ((active?.version ?? 0) !== input.version)
      throw new ProductError(
        409,
        "Your checkout draft changed. Reload before saving.",
      );
    const next: SavedDraft = {
      ...input,
      _id: actor.id,
      version: input.version + 1,
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000),
    };
    if (saved)
      await collection.replaceOne(
        { _id: actor.id, version: saved.version },
        next,
        { session },
      );
    else await collection.insertOne(next, { session });
    await logAudit(
      actor.id,
      "checkout.draft.save",
      "checkout-drafts",
      actor.id,
      "No order or payment created.",
      session,
    );
    return {
      cart,
      draft: publicDraft(next),
      issues: [],
      paymentAvailable: false,
      orderSubmissionAvailable: false,
    };
  });
}
export async function deleteCheckout(actor: AccountIdentity) {
  return userTransaction(async (session) => {
    await freshAccount(actor, session);
    await (await drafts()).deleteOne({ _id: actor.id }, { session });
    await logAudit(
      actor.id,
      "checkout.draft.delete",
      "checkout-drafts",
      actor.id,
      "",
      session,
    );
    return { removed: true };
  });
}
