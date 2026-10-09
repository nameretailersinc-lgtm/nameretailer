"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CreditCard, FileText, ShieldCheck } from "lucide-react";
import {
  CustomerShell,
  CustomerFeedback,
  CustomerRequestError,
  customerError,
  customerMutation,
  customerRequest,
} from "@/components/account/shared";
import type { CheckoutView } from "@/lib/commerce/checkout-types";
import type { BillingDetails } from "@/lib/commerce/checkout-validation";
import { checkoutPutSchema } from "@/lib/commerce/checkout-validation";
import { countryCodes } from "@/lib/commerce/countries";
import { usd } from "./placement-form";

const emptyBilling: BillingDetails = {
  email: "",
  firstName: "",
  lastName: "",
  country: "",
  street: "",
  apartment: "",
  city: "",
  region: "",
  postalCode: "",
  phone: "",
};
const countries = countryCodes
  .map((code) => ({
    code,
    name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));
const billingFields: {
  key: Exclude<keyof BillingDetails, "country">;
  label: string;
  autoComplete: string;
  max: number;
  required?: boolean;
  type?: string;
}[] = [
  {
    key: "email",
    label: "Billing email",
    autoComplete: "email",
    max: 254,
    required: true,
    type: "email",
  },
  {
    key: "firstName",
    label: "First name",
    autoComplete: "given-name",
    max: 100,
    required: true,
  },
  {
    key: "lastName",
    label: "Last name",
    autoComplete: "family-name",
    max: 100,
    required: true,
  },
  {
    key: "street",
    label: "Street address",
    autoComplete: "address-line1",
    max: 200,
    required: true,
  },
  {
    key: "apartment",
    label: "Apartment, suite or unit",
    autoComplete: "address-line2",
    max: 200,
  },
  {
    key: "city",
    label: "Town / city",
    autoComplete: "address-level2",
    max: 100,
    required: true,
  },
  {
    key: "region",
    label: "State / province / region",
    autoComplete: "address-level1",
    max: 100,
  },
  {
    key: "postalCode",
    label: "Postcode / ZIP",
    autoComplete: "postal-code",
    max: 30,
  },
  { key: "phone", label: "Phone", autoComplete: "tel", max: 50, type: "tel" },
];
export function CheckoutPage() {
  const [view, setView] = useState<CheckoutView | null>(null);
  const [billing, setBilling] = useState<BillingDetails>(emptyBilling);
  const [notes, setNotes] = useState(""),
    [payment, setPayment] = useState<"stripe" | "paypal">("stripe");
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [anonymous, setAnonymous] = useState(false);
  function apply(data: CheckoutView) {
    setView(data);
    setBilling(data.draft?.billing || emptyBilling);
    setNotes(data.draft?.notes || "");
    setPayment(data.draft?.paymentPreference || "stripe");
  }
  useEffect(() => {
    let active = true;
    customerRequest<CheckoutView>("/api/checkout/")
      .then((data) => {
        if (active) apply(data);
      })
      .catch((cause) => {
        if (active) {
          if (cause instanceof CustomerRequestError && cause.status === 401)
            setAnonymous(true);
          else setError(customerError(cause));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function reload() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      apply(await customerRequest<CheckoutView>("/api/checkout/"));
    } catch (cause) {
      setError(customerError(cause));
    } finally {
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!view) return;
    const input = {
      version: view.draft?.version || 0,
      cartVersion: view.cart.version,
      billing,
      notes,
      paymentPreference: payment,
    };
    const parsed = checkoutPutSchema.safeParse(input);
    setError("");
    setMessage("");
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(" "),
      );
      return;
    }
    setBusy(true);
    try {
      apply(
        await customerMutation<CheckoutView>(
          "/api/checkout/",
          "PUT",
          parsed.data,
        ),
      );
      setMessage(
        "Checkout draft saved privately for 7 days. No order has been placed and no payment has been charged.",
      );
    } catch (cause) {
      setError(customerError(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <CustomerShell title="Checkout review">
      <nav className="commerce-steps" aria-label="Placement progress">
        <Link href="/">1 · Publication</Link>
        <Link href="/cart/">2 · Brief & cart</Link>
        <span aria-current="step">3 · Checkout review</span>
      </nav>
      <p className="customer-notice">
        <ShieldCheck size={20} aria-hidden="true" /> Preview: save your billing
        details and review your placement briefs. Stripe and PayPal are selected
        for integration but not connected. No order, payment or reservation is
        created.
      </p>
      <CustomerFeedback error={error} message={message} />
      {loading ? (
        <p role="status">Loading your checkout…</p>
      ) : anonymous ? (
        <div className="customer-card">
          <h2>Sign in to continue</h2>
          <p>Your cart and checkout draft are private to your account.</p>
          <Link
            className="button button-primary"
            href="/my-account/?returnTo=cart"
          >
            Sign in to review your cart
          </Link>
        </div>
      ) : (
        view && (
          <>
            <div className="customer-actions">
              <Link href="/cart/" className="button button-secondary">
                Back to cart
              </Link>
              <button
                className="button button-secondary"
                disabled={busy}
                onClick={() => void reload()}
              >
                Reload draft and current prices
              </button>
            </div>
            {!!view.issues.length && (
              <section
                className="customer-error"
                aria-label="Checkout requirements"
              >
                <h2>Before you continue</h2>
                <ul>
                  {view.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
                <Link href="/cart/">Complete your placement briefs</Link>
              </section>
            )}
            {view.draft && view.draft.cartVersion !== view.cart.version && (
              <p className="customer-notice">
                Your cart changed after this billing draft was saved. Review the
                latest details and save again.
              </p>
            )}
            <div className="checkout-grid">
              <form className="checkout-form customer-card" onSubmit={save}>
                <h2>
                  <FileText size={22} aria-hidden="true" /> Billing information
                </h2>
                <p className="customer-hint">
                  Required fields are marked *. Postal code and region may not
                  apply in every country. This is a draft, not an invoice.
                </p>
                <fieldset disabled={busy} className="checkout-fields">
                  {billingFields.map((field) => (
                    <div key={field.key}>
                      <label htmlFor={`billing-${field.key}`}>
                        {field.label}
                        {field.required ? " *" : " (optional)"}
                      </label>
                      <input
                        id={`billing-${field.key}`}
                        name={field.key}
                        type={field.type || "text"}
                        required={field.required}
                        autoComplete={field.autoComplete}
                        maxLength={field.max}
                        value={billing[field.key]}
                        onChange={(event) =>
                          setBilling((old) => ({
                            ...old,
                            [field.key]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div className="billing-country">
                    <label htmlFor="billing-country">Country / region *</label>
                    <select
                      id="billing-country"
                      required
                      autoComplete="country"
                      value={billing.country}
                      onChange={(event) =>
                        setBilling((old) => ({
                          ...old,
                          country: event.target.value,
                        }))
                      }
                    >
                      <option value="">Choose your country</option>
                      {countries.map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="billing-notes">
                    <label htmlFor="order-notes">Order notes (optional)</label>
                    <textarea
                      id="order-notes"
                      rows={4}
                      maxLength={4000}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Notes for your placement; do not include payment details."
                    />
                  </div>
                </fieldset>
                <fieldset className="checkout-payments" disabled={busy}>
                  <legend>
                    <CreditCard size={20} aria-hidden="true" /> Preferred
                    payment method
                  </legend>
                  <label>
                    <input
                      type="radio"
                      name="paymentPreference"
                      checked={payment === "stripe"}
                      onChange={() => setPayment("stripe")}
                    />{" "}
                    Debit / credit card via Stripe{" "}
                    <small>Not connected yet</small>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentPreference"
                      checked={payment === "paypal"}
                      onChange={() => setPayment("paypal")}
                    />{" "}
                    PayPal <small>Not connected yet</small>
                  </label>
                </fieldset>
                <p className="customer-hint">
                  Do not enter card numbers here. Draft billing details expire
                  after 7 days. Approved terms, refunds and final fees/taxes are
                  required before payment can be enabled.
                </p>
                <button
                  className="button button-primary"
                  disabled={busy || !!view.issues.length}
                >
                  {busy ? "Saving…" : "Save checkout draft"}
                </button>
                {view.draft && (
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError("");
                      setMessage("");
                      try {
                        await customerMutation("/api/checkout/", "DELETE", {});
                        apply(
                          await customerRequest<CheckoutView>("/api/checkout/"),
                        );
                        setMessage("Saved billing draft removed.");
                      } catch (cause) {
                        setError(customerError(cause));
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Delete saved billing draft
                  </button>
                )}
              </form>
              <aside
                className="checkout-summary customer-card"
                aria-labelledby="order-summary"
              >
                <h2 id="order-summary">Your placement details</h2>
                {view.cart.items.map((item) => (
                  <article key={item.productId}>
                    <h3>{item.domain || "Unavailable publication"}</h3>
                    <dl className="cart-brief-details">
                      <div>
                        <dt>Promoted URL</dt>
                        <dd>{item.brief?.promotedUrl || "Missing"}</dd>
                      </div>
                      <div>
                        <dt>Keyword</dt>
                        <dd>{item.brief?.keyword || "Missing"}</dd>
                      </div>
                      <div>
                        <dt>Article option</dt>
                        <dd>
                          {item.writingWords
                            ? `${item.writingWords}-word writing package`
                            : "Link only"}
                        </dd>
                      </div>
                      <div>
                        <dt>Link type</dt>
                        <dd>{item.options?.linkType || "Not supplied"}</dd>
                      </div>
                      <div>
                        <dt>Placement</dt>
                        <dd>
                          {item.placementCents === null
                            ? "Unavailable"
                            : usd(item.placementCents)}
                        </dd>
                      </div>
                      <div>
                        <dt>Writing</dt>
                        <dd>
                          {item.writingCents === null
                            ? "Unavailable"
                            : usd(item.writingCents)}
                        </dd>
                      </div>
                      <div>
                        <dt>File</dt>
                        <dd>
                          {item.file ? (
                            <a href={`/api/cart/files/${item.file.id}/`}>
                              Download {item.file.name}
                            </a>
                          ) : (
                            "None"
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>Item total</dt>
                        <dd>
                          {item.totalCents === null
                            ? "Unavailable"
                            : usd(item.totalCents)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
                <p className="checkout-total">
                  <span>Preview subtotal (USD)</span>
                  <strong>
                    {view.cart.totalCents === null
                      ? "Review cart"
                      : usd(view.cart.totalCents)}
                  </strong>
                </p>
                <p className="customer-hint">
                  No coupon, tax or additional fee calculation is configured.
                  This is not a final payable total.
                </p>
                <button className="button button-primary" disabled>
                  Place order · payments not connected
                </button>
              </aside>
            </div>
          </>
        )
      )}
    </CustomerShell>
  );
}
