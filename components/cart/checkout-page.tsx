"use client";
import { PlacementInquiry } from "@/components/inquiries/placement-inquiry";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  FileText,
  Globe2,
  Headphones,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RotateCw,
  Save,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  UserRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  DeskHeader,
  DeskHeading,
  PublicationIdentity,
} from "@/components/account/desk";
import styles from "@/components/account/desk.module.css";
import {
  CustomerShell,
  CustomerFeedback,
  CustomerRequestError,
  customerError,
  customerMutation,
  customerRequest,
} from "@/components/account/shared";
import type { CheckoutView } from "@/lib/commerce/checkout-types";
import type { PaymentRedirect } from "@/lib/commerce/payment-types";
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
const billingIcons: Record<
  Exclude<keyof BillingDetails, "country">,
  LucideIcon
> = {
  email: Mail,
  firstName: UserRound,
  lastName: UserRound,
  street: MapPin,
  apartment: Building2,
  city: Building2,
  region: Store,
  postalCode: MapPin,
  phone: Phone,
};
const flag = (code: string) =>
  /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(
        ...[...code].map((letter) => 127397 + letter.charCodeAt(0)),
      )
    : "";
export function CheckoutPage() {
  const [view, setView] = useState<CheckoutView | null>(null);
  const [billing, setBilling] = useState<BillingDetails>(emptyBilling);
  const [notes, setNotes] = useState(""),
    [payment, setPayment] = useState<"stripe" | "paypal">("stripe");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [anonymous, setAnonymous] = useState(false);
  function apply(data: CheckoutView) {
    setView(data);
    setBilling(data.draft?.billing || emptyBilling);
    setNotes(data.draft?.notes || "");
    const preferred = data.draft?.paymentPreference || "stripe";
    setPayment(
      data.paymentMethods?.[preferred] || !data.paymentAvailable
        ? preferred
        : data.paymentMethods?.stripe
          ? "stripe"
          : "paypal",
    );
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
    const pay =
      (event.nativeEvent as SubmitEvent).submitter instanceof
        HTMLButtonElement &&
      ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)
        .value === "pay";
    if (pay && !termsAccepted) {
      setError("Accept the terms of service and refund policy to continue.");
      return;
    }
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
      const saved = await customerMutation<CheckoutView>(
        "/api/checkout/",
        "PUT",
        parsed.data,
      );
      apply(saved);
      if (pay) {
        const redirect = await customerMutation<PaymentRedirect>(
          "/api/checkout/payments/",
          "POST",
          {
            cartVersion: saved.cart.version,
            draftVersion: saved.draft!.version,
            provider: payment,
            termsAccepted: true,
          },
        );
        window.location.assign(redirect.url);
      } else
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
    <CustomerShell
      title="Secure checkout"
      className={`${styles.root} ${styles.checkoutHeader}`}
      header={
        <DeskHeader
          title="Secure checkout"
          description="Complete your billing and placement details, then continue to your payment provider."
          icon={LockKeyhole}
          checkout
        />
      }
    >
      <div className={styles.securityBanner}>
        <ShieldCheck size={32} aria-hidden="true" />
        <div>
          <strong>Your information stays private</strong>
          <p>
            Payments are handled by Stripe or PayPal. Your card details stay
            with the payment provider.
          </p>
        </div>
        <div className={styles.providerBrands}>
          <small>Payment providers</small>
          <span className={styles.stripe}>stripe</span>
          <span className={styles.paypal}>PayPal</span>
        </div>
      </div>
      <CustomerFeedback error={error} message={message} />
      {loading ? (
        <p role="status">Loading your checkout…</p>
      ) : anonymous ? (
        <div className="customer-card">
          <h2>Sign in to continue</h2>
          <p>Your shortlist and checkout draft are private to your account.</p>
          <Link
            className="button button-primary"
            href="/my-account/?returnTo=cart"
          >
            Sign in to review your shortlist
          </Link>
        </div>
      ) : (
        view && (
          <>
            <div className={`customer-actions ${styles.toolbar}`}>
              <Link
                href="/cart/"
                className={`button button-secondary ${styles.compactButton}`}
              >
                <ArrowLeft size={15} aria-hidden="true" /> Back to shortlist
              </Link>
              <Link
                href="/my-account/orders/"
                className={`button button-secondary ${styles.compactButton}`}
              >
                <ShoppingBag size={15} aria-hidden="true" /> Your orders
              </Link>
              <button
                className={`button button-secondary ${styles.compactButton}`}
                disabled={busy}
                onClick={() => void reload()}
              >
                <RotateCw size={15} aria-hidden="true" /> Reload draft and
                current prices
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
                Your shortlist changed after this billing draft was saved. Review the
                latest details and save again.
              </p>
            )}
            <div className={styles.checkoutGrid}>
              <form
                id="payment-checkout"
                className={`customer-card ${styles.card} ${styles.billingForm}`}
                onSubmit={save}
              >
                <DeskHeading
                  icon={ShoppingBag}
                  title="Billing information"
                  description="Required fields are marked *. Postal code and region may not apply in every country."
                />
                <fieldset disabled={busy} className={styles.fields}>
                  <legend className="sr-only">Billing details</legend>
                  {billingFields.map((field) => {
                    const Icon = billingIcons[field.key];
                    return (
                      <div
                        key={field.key}
                        className={
                          field.key === "email" ? styles.fullField : undefined
                        }
                      >
                        <label htmlFor={`billing-${field.key}`}>
                          {field.label}
                          {field.required ? " *" : " (optional)"}
                        </label>
                        <div className={styles.fieldControl}>
                          <Icon size={17} aria-hidden="true" />
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
                      </div>
                    );
                  })}
                  <div className={styles.fullField}>
                    <label htmlFor="billing-country">Country / region *</label>
                    <div className={styles.fieldControl}>
                      {billing.country ? (
                        <span className={styles.countryFlag} aria-hidden="true">
                          {flag(billing.country)}
                        </span>
                      ) : (
                        <Globe2 size={17} aria-hidden="true" />
                      )}
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
                  </div>
                  <div className={styles.fullField}>
                    <label htmlFor="order-notes">Order notes (optional)</label>
                    <div className={styles.notes}>
                      <textarea
                        id="order-notes"
                        rows={4}
                        maxLength={4000}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Notes for your placement; do not include payment details."
                      />
                      <span className={styles.counter}>
                        {notes.length.toLocaleString()}/4,000
                      </span>
                    </div>
                  </div>
                </fieldset>
                <fieldset className={styles.paymentChoices} disabled={busy}>
                  <legend>
                    <CreditCard size={20} aria-hidden="true" /> Choose your
                    payment method
                  </legend>
                  <p className={styles.hint}>
                    Choose a payment provider. Your payment information is never
                    stored on our servers.
                  </p>
                  <div className={styles.paymentOptions}>
                    <label className={styles.paymentOption}>
                      <input
                        type="radio"
                        name="paymentPreference"
                        checked={payment === "stripe"}
                        disabled={
                          view.paymentAvailable && !view.paymentMethods?.stripe
                        }
                        onChange={() => setPayment("stripe")}
                      />{" "}
                      <CreditCard size={19} aria-hidden="true" />
                      <span>
                        <strong>Debit / credit card via Stripe</strong>
                        <small>
                          {view.paymentMethods?.stripe
                            ? "Secure card checkout"
                            : "Currently unavailable"}
                        </small>
                      </span>
                    </label>
                    <label className={styles.paymentOption}>
                      <input
                        type="radio"
                        name="paymentPreference"
                        checked={payment === "paypal"}
                        disabled={
                          view.paymentAvailable && !view.paymentMethods?.paypal
                        }
                        onChange={() => setPayment("paypal")}
                      />{" "}
                      <span className={styles.paypal} aria-hidden="true">
                        P
                      </span>
                      <span>
                        <strong>PayPal</strong>
                        <small>
                          {view.paymentMethods?.paypal
                            ? "Pay with your PayPal account"
                            : "Currently unavailable"}
                        </small>
                      </span>
                    </label>
                  </div>
                </fieldset>
                <div className={styles.saveActions}>
                  <button
                    className={`button button-primary ${styles.compactButton}`}
                    disabled={busy || !!view.issues.length}
                  >
                    <Save size={16} aria-hidden="true" />{" "}
                    {busy ? "Saving…" : "Save checkout draft"}
                  </button>
                  {view.draft && (
                    <button
                      type="button"
                      className={`button button-secondary ${styles.compactButton} ${styles.dangerButton}`}
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        setError("");
                        setMessage("");
                        try {
                          await customerMutation(
                            "/api/checkout/",
                            "DELETE",
                            {},
                          );
                          apply(
                            await customerRequest<CheckoutView>(
                              "/api/checkout/",
                            ),
                          );
                          setMessage("Saved billing draft removed.");
                        } catch (cause) {
                          setError(customerError(cause));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <Trash2 size={15} aria-hidden="true" /> Delete saved
                      billing draft
                    </button>
                  )}
                </div>
                <p className={styles.hint}>
                  Save your progress and return later. Draft billing details
                  expire after 7 days.
                </p>
              </form>
              <aside
                className={`customer-card ${styles.card}`}
                aria-labelledby="order-summary"
              >
                <DeskHeading
                  icon={ShoppingCart}
                  title="Your placement details"
                  id="order-summary"
                >
                  <Link
                    href="/cart/"
                    className={`button button-secondary ${styles.compactButton}`}
                  >
                    <Pencil size={14} aria-hidden="true" /> Edit placement
                  </Link>
                </DeskHeading>
                {view.cart.items.map((item) => (
                  <article key={item.productId} className={styles.summaryItem}>
                    <PublicationIdentity domain={item.domain} />
                    <dl className={styles.summaryDetails}>
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
                <p className={styles.total}>
                  <span>Total (USD)</span>
                  <strong>
                    {view.cart.totalCents === null
                      ? "Review shortlist"
                      : usd(view.cart.totalCents)}
                  </strong>
                </p>
                <p className={styles.hint}>
                  Includes the selected placement and writing packages. You will
                  confirm this amount with the payment provider.
                </p>
                <label className={`checkout-terms ${styles.terms}`}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    disabled={busy}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                  <span>
                    I agree to the <Link href="/terms/">terms of service</Link>{" "}
                    and <Link href="/refund-policy/">refund policy</Link>.
                  </span>
                </label>
                {!view.paymentAvailable && (
                  <PlacementInquiry productIds={view.cart.items.map(item => item.productId)} label="Request quote for shortlist" />
                )}
                <button
                  form="payment-checkout"
                  type="submit"
                  value="pay"
                  className={`button button-primary ${styles.payButton}`}
                  disabled={
                    busy ||
                    !!view.issues.length ||
                    !view.paymentMethods?.[payment] ||
                    !termsAccepted
                  }
                >
                  <CreditCard size={20} aria-hidden="true" />
                  <span>
                    {busy
                      ? "Preparing checkout…"
                      : `Pay ${view.cart.totalCents === null ? "" : usd(view.cart.totalCents)} with ${payment === "stripe" ? "card" : "PayPal"}`}
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <div className={styles.privacyNote}>
                  <ShieldCheck size={27} aria-hidden="true" />
                  <div>
                    <strong>Payment details stay with your provider</strong>
                    <p>
                      You’ll review and confirm your payment on{" "}
                      {payment === "stripe" ? "Stripe" : "PayPal"} before
                      returning here.
                    </p>
                  </div>
                </div>
                <div className={styles.reassurance}>
                  <div>
                    <Zap size={24} aria-hidden="true" />
                    <strong>Hosted checkout</strong>
                    <p>Continue to your selected payment provider.</p>
                  </div>
                  <div>
                    <ShieldCheck size={24} aria-hidden="true" />
                    <strong>Private details</strong>
                    <p>Your billing draft belongs to your account.</p>
                  </div>
                  <div>
                    <LockKeyhole size={24} aria-hidden="true" />
                    <strong>Clear total</strong>
                    <p>Review the amount before you pay.</p>
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.trustRow}>
              <div>
                <CreditCard size={28} aria-hidden="true" />
                <div>
                  <strong>Hosted payments</strong>
                  <p>Processed by Stripe or PayPal.</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={28} aria-hidden="true" />
                <div>
                  <strong>Private planning</strong>
                  <p>Drafts are saved to your account.</p>
                </div>
              </div>
              <div>
                <Headphones size={28} aria-hidden="true" />
                <div>
                  <strong>Placement support</strong>
                  <p>Help with your brief and order.</p>
                </div>
              </div>
              <div>
                <FileText size={28} aria-hidden="true" />
                <div>
                  <strong>Review your order</strong>
                  <p>Publication, writing and pricing together.</p>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </CustomerShell>
  );
}
