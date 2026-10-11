"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api, mutation, errorMessage } from "./api";
import {
  PageHeading,
  Panel,
  Button,
  Field,
  Select,
  Input,
  Textarea,
  Feedback,
  Loading,
  Empty,
  date,
} from "./primitives";
import type {
  AdminOrderSummary,
  AdminOrderView,
  FulfillmentStatus,
} from "@/lib/commerce/payment-types";
import { fulfillmentLabels } from "@/lib/commerce/payment-types";
import { usd } from "@/components/cart/placement-form";

export function Orders() {
  const [loadedResult, setResult] = useState<{
    requestKey: string;
    data: AdminOrderSummary[];
    total: number;
  } | null>(null);
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("paid"),
    [reload, setReload] = useState(0);
  const [fulfillmentFilter, setFulfillmentFilter] = useState(""),
    [q, setQ] = useState(""),
    [query, setQuery] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentStatus>("queued"),
    [internalNotes, setInternalNotes] = useState(""),
    [urls, setUrls] = useState<Record<string, string>>({}),
    [success, setSuccess] = useState("");
  const [order, setOrder] = useState<AdminOrderView | null>(null),
    [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const requestUrl = `/api/admin/orders/?page=${page}${status ? `&status=${status}` : ""}${fulfillmentFilter ? `&fulfillment=${fulfillmentFilter}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  const requestKey = `${requestUrl}:${reload}`;
  const result =
    loadedResult?.requestKey === requestKey ? loadedResult : null;
  useEffect(() => {
    let active = true;
    api<{ data: AdminOrderSummary[]; total: number }>(requestUrl)
      .then((data) => {
        if (active) {
          setResult({ ...data, requestKey });
          setError("");
        }
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [requestUrl, requestKey]);
  function apply(data: AdminOrderView) {
    setOrder(data);
    setFulfillment(data.fulfillmentStatus);
    setInternalNotes(data.internalNotes);
    setUrls(
      Object.fromEntries(
        data.publishedPlacements.map((placement) => [
          placement.productId,
          placement.url,
        ]),
      ),
    );
  }
  async function view(id: string) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      apply(await api<AdminOrderView>(`/api/admin/orders/${id}/`));
      requestAnimationFrame(() =>
        document
          .getElementById("admin-order-details")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!order) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      apply(
        await mutation<AdminOrderView>(
          `/api/admin/orders/${order.id}/`,
          "PATCH",
          {
            version: order.version,
            fulfillmentStatus: fulfillment,
            internalNotes,
            publishedPlacements: order.items.flatMap((item) =>
              urls[item.productId]?.trim()
                ? [
                    {
                      productId: item.productId,
                      url: urls[item.productId].trim(),
                    },
                  ]
                : [],
            ),
          },
        ),
      );
      setSuccess(
        "Order progress saved. The customer can view its status and published URLs.",
      );
      setReload((value) => value + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Placement orders"
        description="Review verified payments, billing details and placement briefs for processing."
        actions={
          <Button
            variant="secondary"
            onClick={() => setReload((value) => value + 1)}
          >
            Refresh orders
          </Button>
        }
      />
      <Feedback error={error} success={success} />
      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(q.trim());
          setPage(1);
        }}
      >
        <Field label="Search order or billing email">
          <Input
            type="search"
            value={q}
            maxLength={254}
            onChange={(event) => setQ(event.target.value)}
          />
        </Field>
        <Field label="Payment status">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
              setOrder(null);
            }}
          >
            <option value="">All attempts</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </Select>
        </Field>
        <Field label="Order progress">
          <Select
            value={fulfillmentFilter}
            onChange={(event) => {
              setFulfillmentFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All progress</option>
            {Object.entries(fulfillmentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Button>Search orders</Button>
      </form>
      {!result ? (
        !error && <Loading />
      ) : result.data.length ? (
        <div
          className="table-container"
          tabIndex={0}
          role="region"
          aria-label="Placement orders"
        >
          <table>
            <caption>{result.total} payment attempts</caption>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Billing email</th>
                <th scope="col">Placements</th>
                <th scope="col">Total (USD)</th>
                <th scope="col">Payment</th>
                <th scope="col">Progress</th>
                <th scope="col">Created</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((row) => (
                <tr key={row.id}>
                  <th scope="row">
                    {row.id.slice(0, 12)}
                    {!row.live && <p className="small">Test payment</p>}
                  </th>
                  <td className="wrap-anywhere">{row.billingEmail}</td>
                  <td>{row.placementCount}</td>
                  <td>{usd(row.totalCents)}</td>
                  <td>
                    {row.status}
                    <p className="small">
                      {row.provider === "stripe" ? "Stripe" : "PayPal"}
                    </p>
                  </td>
                  <td>
                    {row.status === "paid"
                      ? fulfillmentLabels[row.fulfillmentStatus]
                      : "Awaiting payment"}
                  </td>
                  <td>{date(row.createdAt)}</td>
                  <td>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void view(row.id)}
                      aria-label={`View order ${row.id.slice(0, 12)}`}
                    >
                      View order
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No payment attempts match this status.</Empty>
      )}
      <div className="pagination">
        <p>
          Page {page} of {Math.max(1, Math.ceil((result?.total || 0) / 20))}
        </p>
        <div className="actions">
          <Button
            variant="secondary"
            disabled={page === 1 || !result}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!result || page * 20 >= result.total}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {order && (
        <section id="admin-order-details" aria-label="Order details">
          <Panel title={`Order ${order.id.slice(0, 12)}`}>
            <p className="wrap-anywhere">Order number: {order.id}</p>
            <p>
              <strong>
                {order.status} · {usd(order.totalCents)} USD · {order.provider}
              </strong>
              {!order.live && " · Test payment"}
            </p>
            <p className="wrap-anywhere">
              Payment reference: {order.paymentReference || "Awaiting payment"}
            </p>
            <h3>Billing</h3>
            <p>
              {order.billing.firstName} {order.billing.lastName}
              <br />
              {order.billing.email}
              <br />
              {order.billing.street} {order.billing.apartment}
              <br />
              {order.billing.city} {order.billing.region}{" "}
              {order.billing.postalCode}
              <br />
              {order.billing.country} · {order.billing.phone}
            </p>
            {order.notes && (
              <p className="wrap-anywhere">Order notes: {order.notes}</p>
            )}
            <h3>Placement briefs</h3>
            {order.items.map((item) => (
              <Panel key={item.productId} title={item.domain || "Publication"}>
                <p>
                  {usd(item.totalCents!)} ·{" "}
                  {item.writingWords
                    ? `${item.writingWords}-word writing package`
                    : "Customer-supplied article"}
                </p>
                <p className="wrap-anywhere">
                  Promoted URL: {item.brief?.promotedUrl}
                  <br />
                  Keyword: {item.brief?.keyword}
                  <br />
                  Requirements: {item.brief?.specialRequirements || "None"}
                </p>
                {item.brief?.articleText && (
                  <p
                    className="wrap-anywhere"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {item.brief.articleText}
                  </p>
                )}
                {item.file && (
                  <a
                    href={`/api/admin/orders/${order.id}/files/${item.file.id}/`}
                  >
                    Download {item.file.name}
                  </a>
                )}
              </Panel>
            ))}
            <form onSubmit={save}>
              <h3>Manage order progress</h3>
              <p className="small muted">
                Progress updates are available after verified payment. Internal
                notes stay private; published URLs are visible to the customer.
              </p>
              <fieldset disabled={busy || order.status !== "paid"}>
                <Field label="Fulfillment status">
                  <Select
                    value={fulfillment}
                    onChange={(event) =>
                      setFulfillment(event.target.value as FulfillmentStatus)
                    }
                  >
                    {Object.entries(fulfillmentLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Internal notes">
                  <Textarea
                    value={internalNotes}
                    maxLength={4000}
                    rows={4}
                    onChange={(event) => setInternalNotes(event.target.value)}
                  />
                </Field>
                {order.items.map((item) => (
                  <Field
                    key={item.productId}
                    label={`Published URL for ${item.domain}`}
                    hint="Add the live placement URL. Every placement needs a URL before completion."
                  >
                    <Input
                      type="url"
                      maxLength={2000}
                      value={urls[item.productId] || ""}
                      onChange={(event) =>
                        setUrls((value) => ({
                          ...value,
                          [item.productId]: event.target.value,
                        }))
                      }
                    />
                  </Field>
                ))}
                <Button>Save order progress</Button>
              </fieldset>
            </form>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void view(order.id)}
            >
              Reload order details
            </Button>
            <Button variant="secondary" onClick={() => setOrder(null)}>
              Close order details
            </Button>
          </Panel>
        </section>
      )}
    </>
  );
}
