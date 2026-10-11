import { createHash } from "node:crypto";
import { z } from "zod";
import type { Binary, ClientSession, Filter } from "mongodb";
import { getDb, transaction, userTransaction } from "@/lib/db";
import { freshAccount, type AccountIdentity } from "@/lib/account";
import { logAudit } from "@/lib/audit";
import { ProductError } from "./errors";
import { requirePaymentProvider } from "./payment-config";
import {
  createProviderSession,
  confirmProviderPayment,
  validatePaymentTotal,
  type PaymentSnapshot,
  type VerifiedPayment,
} from "./payment-providers";
import type {
  OrderView,
  OrderSummary,
  AdminOrderSummary,
  AdminOrderView,
  PaymentRedirect,
} from "./payment-types";

interface SavedOrder extends Omit<OrderView, "id"> {
  _id: string;
  ownerId: string;
  cartVersion: number;
  draftVersion: number;
  live: boolean;
  termsAcceptedAt: string;
  remoteId?: string;
  approvalUrl?: string;
  paymentReference?: string;
  internalNotes?: string;
}
interface OrderFile {
  _id: string;
  orderId: string;
  fileId: string;
  ownerId: string;
  name: string;
  bytes: Binary;
  expiresAt?: Date;
}
interface SavedDraftRecord {
  _id: string;
  version: number;
  cartVersion: number;
  expiresAt: Date;
  paymentPreference: string;
  billing: OrderView["billing"];
  notes: string;
}
const orderIdSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const startPaymentSchema = z
  .object({
    cartVersion: z.number().int().nonnegative(),
    draftVersion: z.number().int().positive(),
    provider: z.enum(["stripe", "paypal"]),
    termsAccepted: z.literal(true),
  })
  .strict();
export const confirmPaymentSchema = z
  .object({ orderId: orderIdSchema, token: z.string().max(100).optional() })
  .strict();
const fulfillmentStatusSchema = z.enum([
  "queued",
  "processing",
  "on_hold",
  "completed",
]);
export const updateOrderSchema = z
  .object({
    version: z
      .number()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER - 1),
    fulfillmentStatus: fulfillmentStatusSchema,
    internalNotes: z
      .string()
      .trim()
      .max(4000)
      .refine(
        (value) =>
          !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value),
        "Use plain-text internal notes.",
      ),
    publishedPlacements: z
      .array(
        z
          .object({
            productId: z.uuid(),
            url: z
              .url()
              .max(2000)
              .refine((value) => {
                const url = new URL(value);
                return (
                  ["https:", "http:"].includes(url.protocol) &&
                  !url.username &&
                  !url.password
                );
              }, "Use a public HTTP or HTTPS publication URL."),
          })
          .strict(),
      )
      .max(50),
  })
  .strict();
async function orders() {
  return (await getDb()).collection<SavedOrder>("commerce_orders");
}
let indexes: Promise<unknown> | undefined;
async function setupPayments() {
  if (!indexes)
    indexes = (async () => {
      const db = await getDb();
      await Promise.all([
        db
          .collection("commerce_orders")
          .createIndex({ ownerId: 1, createdAt: -1 }),
        db.collection("commerce_orders").createIndex(
          { provider: 1, remoteId: 1 },
          {
            unique: true,
            partialFilterExpression: { remoteId: { $type: "string" } },
          },
        ),
        db
          .collection("commerce_order_files")
          .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
    })();
  try {
    await indexes;
  } catch (error) {
    indexes = undefined;
    throw error;
  }
}
function orderView(order: SavedOrder): OrderView {
  const {
    _id: id,
    provider,
    status,
    totalCents,
    currency,
    items,
    billing,
    notes,
    createdAt,
    paidAt,
  } = order;
  return {
    id,
    provider,
    status,
    totalCents,
    currency,
    items,
    billing,
    notes,
    createdAt,
    paidAt,
    version: order.version || 1,
    fulfillmentStatus: order.fulfillmentStatus || "queued",
    publishedPlacements: order.publishedPlacements || [],
  };
}
function snapshot(order: SavedOrder): PaymentSnapshot {
  return {
    id: order._id,
    provider: order.provider,
    totalCents: order.totalCents,
    billingEmail: order.billing.email,
    createdAt: order.createdAt,
    live: order.live,
    items: order.items.map((item) => ({
      domain: item.domain!,
      totalCents: item.totalCents!,
      writingWords: item.writingWords,
    })),
  };
}
export async function startPayment(
  actor: AccountIdentity,
  raw: unknown,
): Promise<PaymentRedirect> {
  const input = startPaymentSchema.parse(raw);
  requirePaymentProvider(input.provider);
  await setupPayments();
  const id = createHash("sha256")
    .update(`${actor.id}:${input.cartVersion}`)
    .digest("hex");
  const collection = await orders();
  const order = await userTransaction(async (session) => {
    await freshAccount(actor, session);
    const existing = await collection.findOne(
      { _id: id, ownerId: actor.id },
      { session },
    );
    if (existing) return existing;
    // Read prices, availability, briefs and billing from authenticated server state.
    const { attachArticleFiles, cartView, savedOwnCart } =
      await import("./cart");
    const { checkoutIssues } = await import("./checkout-validation");
    const cart = await attachArticleFiles(
      await cartView(await savedOwnCart(actor, session), session),
      actor,
      session,
    );
    if (cart.version !== input.cartVersion)
      throw new ProductError(
        409,
        "Your cart changed. Reload checkout before paying.",
      );
    const issues = checkoutIssues(cart);
    if (issues.length) throw new ProductError(422, issues.join(" "));
    validatePaymentTotal(cart.totalCents!);
    const draft = await (
      await getDb()
    )
      .collection<SavedDraftRecord>("commerce_checkout_drafts")
      .findOne(
        {
          _id: actor.id,
          version: input.draftVersion,
          cartVersion: input.cartVersion,
          expiresAt: { $gt: new Date() },
        },
        { session },
      );
    if (!draft || draft.paymentPreference !== input.provider)
      throw new ProductError(
        409,
        "Save your current billing information and payment method before paying.",
      );
    const now = new Date().toISOString();
    const saved: SavedOrder = {
      _id: id,
      ownerId: actor.id,
      provider: input.provider,
      status: "pending",
      currency: "USD",
      totalCents: cart.totalCents!,
      items: cart.items,
      billing: draft.billing,
      notes: draft.notes,
      cartVersion: cart.version,
      draftVersion: draft.version,
      createdAt: now,
      paidAt: null,
      version: 1,
      fulfillmentStatus: "queued",
      publishedPlacements: [],
      termsAcceptedAt: now,
      live:
        input.provider === "stripe"
          ? process.env.STRIPE_SECRET_KEY!.trim().startsWith("sk_live_") ||
            process.env.STRIPE_SECRET_KEY!.trim().startsWith("rk_live_")
          : process.env.PAYPAL_ENV === "live",
    };
    // Draft uploads expire after seven days. Keep an independent order copy so a
    // successful payment does not lose its article when the planning file expires.
    const db = await getDb();
    for (const item of cart.items) {
      if (!item.file) continue;
      const file = await db
        .collection<{
          _id: string;
          ownerId: string;
          name: string;
          bytes: Binary;
          expiresAt: Date;
        }>("commerce_article_files")
        .findOne(
          {
            _id: item.file.id,
            ownerId: actor.id,
            expiresAt: { $gt: new Date() },
          },
          { session },
        );
      if (!file)
        throw new ProductError(
          422,
          "An article file expired. Return to your cart and upload it again.",
        );
      await db.collection<OrderFile>("commerce_order_files").insertOne(
        {
          _id: `${id}:${file._id}`,
          orderId: id,
          fileId: file._id,
          ownerId: actor.id,
          name: file.name,
          bytes: file.bytes,
          expiresAt: new Date(Date.now() + 7 * 86400000),
        },
        { session },
      );
    }
    await collection.insertOne(saved, { session });
    await logAudit(
      actor.id,
      "order.create",
      "orders",
      id,
      `${saved.provider}; USD ${(saved.totalCents / 100).toFixed(2)}; awaiting payment.`,
      session,
    );
    return saved;
  });
  if (order.status === "paid")
    return { orderId: id, url: `/checkout/return/?order=${id}` };
  if (order.provider !== input.provider)
    throw new ProductError(
      409,
      `This cart already has a ${order.provider === "stripe" ? "card" : "PayPal"} payment attempt. Continue with that method to avoid a duplicate payment.`,
    );
  if (order.status !== "pending")
    throw new ProductError(
      409,
      "This payment attempt has ended. Update your cart to start a new checkout.",
    );
  const live =
    order.provider === "stripe"
      ? /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY!.trim())
      : process.env.PAYPAL_ENV === "live";
  if (order.live !== live)
    throw new ProductError(
      409,
      "This payment attempt belongs to a different payment environment.",
    );
  // Never reuse an idempotency key outside the providers' retention windows.
  if (Date.now() - new Date(order.createdAt).getTime() > 3600000) {
    if (order.remoteId)
      await settleOrder(
        order,
        await confirmProviderPayment(snapshot(order), order.remoteId),
      );
    const current = await collection.findOne({ _id: id });
    if (current?.status === "paid")
      return { orderId: id, url: `/checkout/return/?order=${id}` };
    throw new ProductError(
      409,
      "This checkout link has expired. Check your order status before updating your cart to try again.",
    );
  }
  if (order.approvalUrl) return { orderId: id, url: order.approvalUrl };
  const remote = await createProviderSession(snapshot(order));
  await collection.updateOne(
    {
      _id: id,
      status: "pending",
      $or: [{ remoteId: { $exists: false } }, { remoteId: remote.id }],
    },
    { $set: { remoteId: remote.id, approvalUrl: remote.url } },
  );
  return { orderId: id, url: remote.url };
}
async function settleOrder(order: SavedOrder, verified: VerifiedPayment) {
  if (verified.status === "pending") return;
  await userTransaction(async (session) => {
    const collection = await orders();
    const current = await collection.findOne({ _id: order._id }, { session });
    if (!current || current.status === "paid") return;
    if (verified.status !== "paid") {
      await collection.updateOne(
        { _id: order._id, status: "pending" },
        { $set: { status: verified.status } },
        { session },
      );
      return;
    }
    const paidAt = new Date().toISOString();
    await collection.updateOne(
      { _id: order._id, status: { $ne: "paid" } },
      {
        $set: {
          status: "paid",
          paidAt,
          paymentReference: verified.reference,
          version: (current.version || 1) + 1,
        },
      },
      { session },
    );
    const db = await getDb();
    await db
      .collection<OrderFile>("commerce_order_files")
      .updateMany(
        { orderId: order._id },
        { $unset: { expiresAt: "" } },
        { session },
      );
    // Leave any newer planning cart untouched. Its revision protects other tabs.
    await db
      .collection<{
        _id: string;
        version: number;
        items: unknown[];
        updatedAt: string;
      }>("commerce_carts")
      .updateOne(
        { _id: order.ownerId, version: order.cartVersion },
        { $set: { items: [], updatedAt: paidAt }, $inc: { version: 1 } },
        { session },
      );
    await db
      .collection<SavedDraftRecord>("commerce_checkout_drafts")
      .deleteOne(
        { _id: order.ownerId, version: order.draftVersion },
        { session },
      );
    await logAudit(
      order.ownerId,
      "order.paid",
      "orders",
      order._id,
      `${order.provider}; ${verified.reference}`,
      session,
    );
  });
}
export async function confirmPayment(actor: AccountIdentity, raw: unknown) {
  const input = confirmPaymentSchema.parse(raw);
  const order = await transaction(async (session) => {
    await freshAccount(actor, session);
    const saved = await (
      await orders()
    ).findOne({ _id: input.orderId, ownerId: actor.id }, { session });
    if (!saved) throw new ProductError(404, "Order not found.");
    return saved;
  });
  if (order.status === "paid") return orderView(order);
  if (!order.remoteId)
    throw new ProductError(
      409,
      "Checkout is still being prepared. Retry from checkout.",
    );
  if (
    order.provider === "paypal" &&
    input.token !== undefined &&
    input.token !== order.remoteId
  )
    throw new ProductError(
      400,
      "This PayPal approval does not match your order.",
    );
  await settleOrder(
    order,
    await confirmProviderPayment(
      snapshot(order),
      order.remoteId,
      order.provider === "paypal",
    ),
  );
  return getOrder(actor, order._id);
}
export async function getOrder(actor: AccountIdentity, id: string) {
  orderIdSchema.parse(id);
  return transaction(async (session) => {
    await freshAccount(actor, session);
    const order = await (
      await orders()
    ).findOne({ _id: id, ownerId: actor.id }, { session });
    if (!order) throw new ProductError(404, "Order not found.");
    return orderView(order);
  });
}
function orderSummary(order: SavedOrder): OrderSummary {
  return {
    id: order._id,
    provider: order.provider,
    status: order.status,
    totalCents: order.totalCents,
    currency: order.currency,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    placementCount: order.items.length,
    fulfillmentStatus: order.fulfillmentStatus || "queued",
  };
}
export async function listOrders(
  actor: AccountIdentity,
): Promise<OrderSummary[]> {
  return transaction(async (session) => {
    await freshAccount(actor, session);
    return (
      await (
        await orders()
      )
        .find(
          { ownerId: actor.id },
          { session, projection: { billing: 0, notes: 0, "items.brief": 0 } },
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()
    ).map(orderSummary);
  });
}
export async function downloadOrderFile(
  actor: AccountIdentity,
  id: string,
  fileId: string,
) {
  return readOrderFile(actor, id, fileId, false);
}
export async function downloadAdminOrderFile(
  actor: AccountIdentity,
  id: string,
  fileId: string,
) {
  return readOrderFile(actor, id, fileId, true);
}
async function freshPaymentAdmin(
  actor: AccountIdentity,
  session: ClientSession,
) {
  if ((await freshAccount(actor, session)).role !== "admin")
    throw new ProductError(
      403,
      "You do not have permission to view customer orders.",
    );
}
export async function listAdminOrders(
  actor: AccountIdentity,
  search: URLSearchParams,
) {
  const input = z
    .object({
      page: z.coerce.number().int().min(1).max(100000).default(1),
      status: z.enum(["pending", "paid", "failed", "expired"]).optional(),
      fulfillment: fulfillmentStatusSchema.optional(),
      q: z.string().trim().max(254).default(""),
    })
    .parse(Object.fromEntries(search));
  return transaction(async (session) => {
    await freshPaymentAdmin(actor, session);
    const collection = await orders();
    const filter: Filter<SavedOrder> = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.fulfillment ? { fulfillmentStatus: input.fulfillment } : {}),
    };
    if (input.q) {
      const literal = input.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { _id: { $regex: literal, $options: "i" } },
        { "billing.email": { $regex: literal, $options: "i" } },
      ];
    }
    const rows = await collection
      .find(filter, { session, projection: { notes: 0, "items.brief": 0 } })
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * 20)
      .limit(20)
      .toArray();
    const total = await collection.countDocuments(filter, { session });
    const data: AdminOrderSummary[] = rows.map((order) => ({
      ...orderSummary(order),
      billingEmail: order.billing.email,
      live: order.live,
    }));
    return { data, total, page: input.page };
  });
}
export async function getAdminOrder(
  actor: AccountIdentity,
  id: string,
): Promise<AdminOrderView> {
  orderIdSchema.parse(id);
  return transaction(async (session) => {
    await freshPaymentAdmin(actor, session);
    const order = await (await orders()).findOne({ _id: id }, { session });
    if (!order) throw new ProductError(404, "Order not found.");
    return {
      ...orderView(order),
      live: order.live,
      paymentReference: order.paymentReference || null,
      internalNotes: order.internalNotes || "",
    };
  });
}
export async function updateAdminOrder(
  actor: AccountIdentity,
  id: string,
  raw: unknown,
): Promise<AdminOrderView> {
  orderIdSchema.parse(id);
  const input = updateOrderSchema.parse(raw);
  return userTransaction(async (session) => {
    await freshPaymentAdmin(actor, session);
    const collection = await orders();
    const order = await collection.findOne({ _id: id }, { session });
    if (!order) throw new ProductError(404, "Order not found.");
    if ((order.version || 1) !== input.version)
      throw new ProductError(
        409,
        "This order changed. Reload its details before saving.",
      );
    if (order.status !== "paid")
      throw new ProductError(
        409,
        "Only verified paid orders can be processed.",
      );
    const ids = new Set(
      input.publishedPlacements.map((item) => item.productId),
    );
    if (
      ids.size !== input.publishedPlacements.length ||
      input.publishedPlacements.some(
        (item) =>
          !order.items.some(
            (placement) => placement.productId === item.productId,
          ),
      )
    )
      throw new ProductError(
        422,
        "Published URLs must belong to distinct placements in this order.",
      );
    if (
      input.fulfillmentStatus === "completed" &&
      ids.size !== order.items.length
    )
      throw new ProductError(
        422,
        "Add a published URL for every placement before completing the order.",
      );
    const next = { ...order, ...input, version: input.version + 1 };
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          fulfillmentStatus: next.fulfillmentStatus,
          publishedPlacements: next.publishedPlacements,
          internalNotes: next.internalNotes,
          version: next.version,
        },
      },
      { session },
    );
    await logAudit(
      actor.id,
      "order.fulfillment.update",
      "orders",
      id,
      `${order.fulfillmentStatus || "queued"} → ${next.fulfillmentStatus}; ${ids.size} published placements.`,
      session,
    );
    return {
      ...orderView(next),
      live: next.live,
      paymentReference: next.paymentReference || null,
      internalNotes: next.internalNotes || "",
    };
  });
}
async function readOrderFile(
  actor: AccountIdentity,
  id: string,
  fileId: string,
  admin: boolean,
) {
  orderIdSchema.parse(id);
  z.uuid().parse(fileId);
  return transaction(async (session) => {
    if (admin) await freshPaymentAdmin(actor, session);
    else await freshAccount(actor, session);
    const file = await (
      await getDb()
    )
      .collection<OrderFile>("commerce_order_files")
      .findOne(
        {
          orderId: id,
          fileId,
          ...(!admin ? { ownerId: actor.id } : {}),
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        },
        { session },
      );
    if (!file) throw new ProductError(404, "Order file not found.");
    return new Response(new Uint8Array(file.bytes.buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  });
}
export async function handleStripeEvent(raw: unknown) {
  const event = z
    .object({
      type: z.string(),
      data: z.object({
        object: z
          .object({
            id: z.string(),
            metadata: z.object({ orderId: z.string().optional() }).optional(),
          })
          .passthrough(),
      }),
    })
    .parse(raw);
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
    ].includes(event.type)
  )
    return;
  const id = event.data.object.metadata?.orderId;
  if (!id || !orderIdSchema.safeParse(id).success) return;
  const order = await (await orders()).findOne({ _id: id, provider: "stripe" });
  if (!order)
    throw new ProductError(
      503,
      "Order is not available yet. Retry this event.",
    );
  if (order.remoteId && order.remoteId !== event.data.object.id)
    throw new ProductError(409, "Stripe session does not match the order.");
  const { verifyStripeSession } = await import("./payment-providers");
  await settleOrder(
    order,
    verifyStripeSession(
      snapshot(order),
      event.data.object.id,
      event.data.object,
    ),
  );
}
export async function handlePaypalEvent(raw: unknown) {
  const event = z
    .object({
      event_type: z.string(),
      resource: z
        .object({
          id: z.string(),
          custom_id: z.string().optional(),
          purchase_units: z
            .array(z.object({ custom_id: z.string().optional() }))
            .optional(),
          supplementary_data: z
            .object({
              related_ids: z.object({ order_id: z.string().optional() }),
            })
            .optional(),
        })
        .passthrough(),
    })
    .parse(raw);
  if (
    ![
      "CHECKOUT.ORDER.APPROVED",
      "PAYMENT.CAPTURE.COMPLETED",
      "PAYMENT.CAPTURE.PENDING",
      "PAYMENT.CAPTURE.DENIED",
    ].includes(event.event_type)
  )
    return;
  const remoteId =
    event.event_type === "CHECKOUT.ORDER.APPROVED"
      ? event.resource.id
      : event.resource.supplementary_data?.related_ids.order_id;
  if (!remoteId) return;
  let order = await (await orders()).findOne({ provider: "paypal", remoteId });
  // Approval can arrive before the create response has stored the remote ID.
  // Reconcile signed events carrying our custom ID through PayPal's API.
  if (!order) {
    const id =
      event.resource.custom_id || event.resource.purchase_units?.[0]?.custom_id;
    if (!id || !orderIdSchema.safeParse(id).success) return;
    order = await (await orders()).findOne({ _id: id, provider: "paypal" });
    if (!order)
      throw new ProductError(
        503,
        "Order is not available yet. Retry this event.",
      );
    if (order.remoteId && order.remoteId !== remoteId)
      throw new ProductError(
        409,
        "PayPal order does not match the payment attempt.",
      );
  }
  if (order.status === "paid") return;
  await settleOrder(
    order,
    await confirmProviderPayment(
      snapshot(order),
      remoteId,
      event.event_type === "CHECKOUT.ORDER.APPROVED",
    ),
  );
}
