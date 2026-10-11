"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, CreditCard, ArrowRight } from "lucide-react";
import {
  CustomerShell,
  CustomerFeedback,
  CustomerRequestError,
  customerRequest,
  customerMutation,
  customerError,
} from "@/components/account/shared";
import type { OrderView, OrderSummary } from "@/lib/commerce/payment-types";
import { fulfillmentLabels } from "@/lib/commerce/payment-types";
import { usd } from "./placement-form";
import styles from "./payments.module.css";

export function PaymentResult() {
  const pollCount = useRef(0);
  const [order, setOrder] = useState<OrderView | null>(null);
  const [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  const [anonymous, setAnonymous] = useState(false),
    [cancelled, setCancelled] = useState(false);
  const refresh = useCallback(async (cancel: boolean) => {
    const query = new URLSearchParams(window.location.search);
    const id = query.get("order") || "";
    if (!/^[a-f0-9]{64}$/.test(id)) {
      setError(
        "This order link is invalid. Open your order history to find your payment.",
      );
      setBusy(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = cancel
        ? await customerRequest<OrderView>(`/api/orders/${id}/`)
        : await customerMutation<OrderView>(
            "/api/checkout/payments/confirm/",
            "POST",
            {
              orderId: id,
              ...(query.get("token") ? { token: query.get("token") } : {}),
            },
          );
      setOrder(data);
    } catch (cause) {
      if (cause instanceof CustomerRequestError && cause.status === 401)
        setAnonymous(true);
      else setError(customerError(cause));
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    const cancel =
      new URLSearchParams(window.location.search).get("cancelled") === "1";
    setCancelled(cancel);
    void refresh(cancel);
  }, [refresh]);
  useEffect(() => {
    if (
      !order ||
      order.status !== "pending" ||
      cancelled ||
      error ||
      pollCount.current >= 6
    )
      return;
    pollCount.current += 1;
    const timer = window.setTimeout(() => void refresh(false), 5000);
    return () => clearTimeout(timer);
  }, [order, cancelled, error, refresh]);
  const paid = order?.status === "paid";
  return (
    <CustomerShell
      title={
        paid
          ? "Payment received"
          : cancelled
            ? "Checkout paused"
            : "Payment status"
      }
    >
      <CustomerFeedback error={error} />
      {anonymous ? (
        <section className="customer-card">
          <h2>Sign in to view this order</h2>
          <p>Your order and billing details are private.</p>
          <Link href="/my-account/" className="button button-primary">
            Sign in
          </Link>
        </section>
      ) : order ? (
        <section className={`customer-card ${styles.receipt}`}>
          <div className={styles.status}>
            <span>
              {paid ? <CheckCircle2 size={32} /> : <Clock3 size={32} />}
            </span>
            <div>
              <h2>
                {paid
                  ? "Thank you for your order"
                  : cancelled
                    ? "You returned from checkout"
                    : order.status === "pending"
                      ? "Awaiting payment confirmation"
                      : "Payment was not completed"}
              </h2>
              <p>
                {paid
                  ? "Your placement briefs have been saved for processing. Keep this receipt for your records."
                  : "You can check the status below or return to checkout to continue."}
              </p>
            </div>
          </div>
          <dl className={styles.details}>
            <div>
              <dt>Order number</dt>
              <dd className={styles.orderId}>{order.id}</dd>
            </div>
            <div>
              <dt>Payment method</dt>
              <dd>
                {order.provider === "stripe" ? "Card via Stripe" : "PayPal"}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {order.status === "paid"
                  ? `Paid · ${fulfillmentLabels[order.fulfillmentStatus || "queued"]}`
                  : order.status}
              </dd>
            </div>
            <div>
              <dt>Total paid / payable</dt>
              <dd className={styles.total}>{usd(order.totalCents)} USD</dd>
            </div>
            {order.paidAt && (
              <div>
                <dt>Payment date</dt>
                <dd>{new Date(order.paidAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>
          <h3>Your placements</h3>
          <div className={styles.placements}>
            {order.items.map((item) => (
              <article key={item.productId}>
                <div>
                  <strong>{item.domain}</strong>
                  <p>
                    {item.writingWords
                      ? `${item.writingWords}-word writing package`
                      : "Customer-supplied article"}
                  </p>
                  <p>{item.brief?.promotedUrl}</p>
                  {order.publishedPlacements
                    ?.filter(
                      (placement) => placement.productId === item.productId,
                    )
                    .map((placement) => (
                      <p key={placement.url}>
                        <a
                          href={placement.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View published placement
                        </a>
                      </p>
                    ))}
                  {item.file && (
                    <a href={`/api/orders/${order.id}/files/${item.file.id}/`}>
                      Download {item.file.name}
                    </a>
                  )}
                </div>
                <strong>{usd(item.totalCents!)}</strong>
              </article>
            ))}
          </div>
          <div className="customer-actions">
            {!paid && (
              <>
                <button
                  disabled={busy}
                  className="button button-primary"
                  onClick={() => void refresh(false)}
                >
                  {busy ? "Checking…" : "Check payment status"}
                </button>
                <Link href="/checkout/" className="button button-secondary">
                  Return to checkout
                </Link>
              </>
            )}
            <Link
              href="/my-account/orders/"
              className="button button-secondary"
            >
              Your orders
            </Link>
            <Link href="/" className="button button-secondary">
              Browse publications <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : busy ? (
        <p role="status">Checking your payment…</p>
      ) : (
        <Link href="/my-account/orders/" className="button button-primary">
          Your orders
        </Link>
      )}
    </CustomerShell>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null),
    [error, setError] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  useEffect(() => {
    let active = true;
    customerRequest<OrderSummary[]>("/api/orders/")
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((cause) => {
        if (active) {
          if (cause instanceof CustomerRequestError && cause.status === 401)
            setAnonymous(true);
          else setError(customerError(cause));
        }
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <CustomerShell title="Your orders">
      <p>View your recent payment attempts and placement receipts.</p>
      <CustomerFeedback error={error} />
      {anonymous ? (
        <Link href="/my-account/" className="button button-primary">
          Sign in to view your orders
        </Link>
      ) : !orders ? (
        !error && <p role="status">Loading your orders…</p>
      ) : !orders.length ? (
        <section className="customer-card">
          <CreditCard size={32} />
          <h2>No orders yet</h2>
          <p>
            Your placement orders will appear here after you start checkout.
          </p>
          <Link href="/cart/" className="button button-primary">
            View your cart
          </Link>
        </section>
      ) : (
        <div className={styles.history}>
          {orders.map((order) => (
            <Link
              className={`customer-card ${styles.historyCard}`}
              key={order.id}
              href={`/checkout/return/?order=${order.id}`}
            >
              <span className={styles.method}>
                <CreditCard size={22} />
              </span>
              <div>
                <strong>
                  {order.placementCount}{" "}
                  {order.placementCount === 1 ? "placement" : "placements"}
                </strong>
                <p>
                  {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                  {order.provider === "stripe" ? "Card" : "PayPal"}
                </p>
                <small>Order {order.id.slice(0, 12)}</small>
              </div>
              <div>
                <strong className={styles.total}>
                  {usd(order.totalCents)}
                </strong>
                <p className={styles[order.status]}>{order.status}</p>
                {order.status === "paid" && (
                  <small>
                    {fulfillmentLabels[order.fulfillmentStatus || "queued"]}
                  </small>
                )}
              </div>
              <ArrowRight size={20} />
            </Link>
          ))}
        </div>
      )}
    </CustomerShell>
  );
}
