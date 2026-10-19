"use client";
import { PlacementInquiry } from "@/components/inquiries/placement-inquiry";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CreditCard,
  FilePlus2,
  FileText,
  Headphones,
  Pencil,
  RotateCw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import {
  DeskHeader,
  DeskHeading,
  PublicationIdentity,
} from "@/components/account/desk";
import styles from "@/components/account/desk.module.css";
import type { UserSummary } from "@/lib/cms/types";
import type {
  CartSelection,
  CartView,
  PlacementOptions,
} from "@/lib/commerce/cart-types";
import {
  CustomerShell,
  CustomerFeedback,
  CustomerRequestError,
  customerRequest,
  customerMutation,
  customerError,
} from "@/components/account/shared";
import { PlacementForm, usd } from "./placement-form";
import { briefIssue } from "@/lib/commerce/brief-validation";
export function CartPage({ productId }: { productId?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null),
    [cart, setCart] = useState<CartView | null>(null),
    [options, setOptions] = useState<PlacementOptions | null>(null);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const selected = cart?.items.find((item) => item.productId === productId);
  const load = useCallback(async () => {
    const profile = await customerRequest<{ user: UserSummary }>(
      "/api/account/profile/",
    ).catch((cause) => {
      if (cause instanceof CustomerRequestError && cause.status === 401)
        return null;
      throw cause;
    });
    const cart = profile ? await customerRequest<CartView>("/api/cart/") : null;
    let optionError = "";
    const options = productId
      ? await customerRequest<PlacementOptions>(
          `/api/products/${productId}/options/`,
        ).catch((cause) => {
          optionError = customerError(cause);
          return null;
        })
      : null;
    return { user: profile?.user ?? null, cart, options, optionError };
  }, [productId]);
  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setCart(data.cart);
        setOptions(data.options);
        if (data.optionError) setError(data.optionError);
      })
      .catch((cause) => {
        if (active) setError(customerError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);
  async function refresh() {
    try {
      const data = await load();
      setUser(data.user);
      setCart(data.cart);
      setOptions(data.options);
      if (data.optionError) setError(data.optionError);
    } catch (cause) {
      setError(customerError(cause));
    } finally {
      setLoading(false);
    }
  }
  async function save(item: CartSelection) {
    if (!cart) return false;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      setCart(
        await customerMutation<CartView>("/api/cart/", "PUT", {
          version: cart.version,
          item,
        }),
      );
      setMessage(
        "Placement saved to your shortlist.",
      );
      return true;
    } catch (cause) {
      setError(customerError(cause));
      if (
        cause instanceof CustomerRequestError &&
        [401, 409].includes(cause.status)
      )
        await refresh();
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <CustomerShell
      title={productId ? "Prepare Your Placement" : "Your shortlist"}
      className={`${styles.root} ${productId ? styles.preparing : ""}`}
      header={
        productId ? (
          <header className="placement-page-header">
            <div className="placement-page-title">
              <span className="placement-page-icon">
                <FilePlus2 size={38} aria-hidden="true" />
              </span>
              <div>
                <h1>Prepare Your Placement</h1>
                <p>
                  Create a clear and effective brief to publish your article.
                </p>
              </div>
            </div>
            <ol className="placement-progress" aria-label="Placement progress">
              <li aria-current="step">
                <span>1</span>Create Brief
              </li>
              <li>
                <span>2</span>Review
              </li>
              <li>
                <span>3</span>Confirm
              </li>
            </ol>
          </header>
        ) : (
          <DeskHeader
            title="Your shortlist"
            description="Review selected publications and request a quote for your shortlist."
            icon={ShoppingCart}
          >
            <Link
              href="/"
              className={`button button-secondary ${styles.compactButton}`}
            >
              <ArrowLeft size={16} aria-hidden="true" /> Continue browsing
            </Link>
          </DeskHeader>
        )
      }
    >
      <CustomerFeedback error={error} message={message} />
      {loading ? (
        <p role="status">Loading shortlist…</p>
      ) : (
        <>
          {!user && !options && (
            <p>
              <Link
                href={
                  productId
                    ? `/my-account/?returnTo=cart&product=${productId}`
                    : "/my-account/"
                }
              >
                Sign in or create an account
              </Link>{" "}
              to save shortlist. You can inspect a publication’s options before
              signing in.
            </p>
          )}
          {options && (
            <section
              className="placement-preparation"
              aria-label="Configure placement"
            >
              <PlacementForm
                key={`${options.productId}:${options.productVersion}:${cart?.version ?? 0}`}
                options={options}
                initial={selected?.writingWords}
                initialBrief={selected?.brief}
                initialFile={selected?.file}
                busy={busy}
                signedIn={!!user}
                submitLabel="Save and continue"
                onSave={async (item) => {
                  const saved = await save(item);
                  if (saved) router.push("/checkout/");
                  return saved;
                }}
              />
            </section>
          )}
          {cart?.items.length ? (
            <div className={styles.cartLayout}>
              <section
                className={`customer-card ${styles.card} ${styles.savedPanel}`}
                aria-labelledby="saved-placements"
              >
                <DeskHeading
                  icon={ShoppingCart}
                  title={`Saved placements (${cart.items.length})`}
                  id="saved-placements"
                  description="Review your items, edit options, or remove them from shortlist."
                />
                <div className={styles.savedItems}>
                  {cart.items.map((item) => (
                    <article
                      className={`customer-card ${styles.savedItem}`}
                      key={item.productId}
                    >
                      <div className={styles.itemHeading}>
                        <div>
                          <PublicationIdentity domain={item.domain} />
                          <p>
                            {item.writingWords
                              ? `${item.writingWords}-word writing add-on`
                              : "Placement only"}
                          </p>
                        </div>
                        <strong className={styles.itemPrice}>
                          {item.totalCents === null
                            ? "Price unavailable"
                            : usd(item.totalCents)}
                        </strong>
                      </div>
                      <dl className={styles.itemDetails}>
                        <div>
                          <dt>Promoted URL</dt>
                          <dd>
                            {item.brief?.promotedUrl || "Not yet supplied"}
                          </dd>
                        </div>
                        <div>
                          <dt>Keyword / anchor</dt>
                          <dd>{item.brief?.keyword || "Not yet supplied"}</dd>
                        </div>
                        <div>
                          <dt>Link type</dt>
                          <dd>{item.options?.linkType || "Not supplied"}</dd>
                        </div>
                        <div>
                          <dt>Quantity</dt>
                          <dd>1 placement</dd>
                        </div>
                        <div>
                          <dt>Article file</dt>
                          <dd>
                            {item.file ? (
                              <a href={`/api/cart/files/${item.file.id}/`}>
                                Download {item.file.name}
                              </a>
                            ) : item.brief?.fileId ? (
                              "Expired or unavailable"
                            ) : (
                              "No file supplied"
                            )}
                          </dd>
                        </div>
                      </dl>
                      {briefIssue(item, !!item.file) && (
                        <p className="customer-notice">
                          {briefIssue(item, !!item.file)}
                        </p>
                      )}
                      <details>
                        <summary>
                          <FileText size={18} aria-hidden="true" /> View saved
                          article brief{" "}
                          <ChevronDown size={16} aria-hidden="true" />
                        </summary>
                        <p className="cart-article-text">
                          {item.brief?.articleText ||
                            "No article text / writing brief yet."}
                        </p>
                        <p className="cart-article-text">
                          {item.brief?.specialRequirements ||
                            "No special requirements."}
                        </p>
                      </details>
                      {item.status !== "ready" && (
                        <p className="customer-notice">
                          {item.status === "changed"
                            ? "This listing changed. Review its current options and save again to accept them."
                            : "This selection is unavailable. Remove it or choose an available writing option."}
                        </p>
                      )}
                      {item.options && (
                        <details>
                          <summary>
                            <Pencil size={18} aria-hidden="true" /> Review or
                            change article option{" "}
                            <ChevronDown size={16} aria-hidden="true" />
                          </summary>
                          <PlacementForm
                            key={`${cart.version}:${item.options.productVersion}:${item.writingWords}`}
                            options={item.options}
                            initial={
                              item.options.writingOptions.some(
                                (option) => option.words === item.writingWords,
                              )
                                ? item.writingWords
                                : 0
                            }
                            busy={busy}
                            signedIn
                            initialBrief={item.brief}
                            initialFile={item.file}
                            onSave={save}
                          />
                        </details>
                      )}
                      <div className={styles.itemActions}>
                        <button
                          className={`button button-secondary ${styles.compactButton} ${styles.dangerButton}`}
                          disabled={busy}
                          aria-label={`Remove ${item.domain || "unavailable publication"}`}
                          onClick={async () => {
                            setBusy(true);
                            setError("");
                            setMessage("");
                            try {
                              setCart(
                                await customerMutation<CartView>(
                                  "/api/cart/",
                                  "DELETE",
                                  {
                                    version: cart.version,
                                    productId: item.productId,
                                  },
                                ),
                              );
                              setMessage("Placement removed.");
                            } catch (cause) {
                              setError(customerError(cause));
                              if (
                                cause instanceof CustomerRequestError &&
                                [401, 409].includes(cause.status)
                              )
                                await refresh();
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          <Trash2 size={15} aria-hidden="true" /> Remove
                          placement
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <aside className={styles.cartAside} aria-label="Shortlist summary">
                <section className={`customer-card ${styles.card}`}>
                  <DeskHeading icon={CreditCard} title="Shortlist summary" />
                  <dl className={styles.summaryDetails}>
                    <div>
                      <dt>Placements</dt>
                      <dd>{cart.items.length}</dd>
                    </div>
                    <div>
                      <dt>Subtotal</dt>
                      <dd>
                        {cart.totalCents === null
                          ? "Review selections"
                          : usd(cart.totalCents)}
                      </dd>
                    </div>
                  </dl>
                  <p className={styles.total}>
                    <span>Total (USD)</span>
                    <strong>
                      {cart.totalCents === null
                        ? "Review unavailable or changed selections first"
                        : usd(cart.totalCents)}
                    </strong>
                  </p>
                  <PlacementInquiry productIds={cart.items.map(item => item.productId)} label="Request quote for shortlist" />
                  <p className={styles.hint}>
                    Coupons are not connected yet. No discount, fee or tax
                    calculation is implied by this preview total.
                  </p>
                </section>
                <section
                  className={`customer-card ${styles.card} ${styles.helpCard}`}
                >
                  <DeskHeading
                    icon={Headphones}
                    title="Need help with your placement?"
                  />
                  <p>
                    Review the publication requirements and your article brief
                    before payment.
                  </p>
                  <Link
                    href="/contact/"
                    className={`button button-secondary ${styles.compactButton}`}
                  >
                    Contact support <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </section>
              </aside>
            </div>
          ) : !options ? (
            <section className="customer-empty">
              <Image
                src="/01_guest_post_checklist.png"
                width={730}
                height={550}
                sizes="220px"
                alt=""
              />
              <div>
                <h2>No saved placements yet</h2>
                <p>
                  Choose a publication in the marketplace and review its article
                  options.
                </p>
                <Link href="/" className="button button-secondary">
                  Browse publications
                </Link>
              </div>
            </section>
          ) : null}
        </>
      )}
      <div className={styles.cartUtilities}>
        <div>
          <strong>
            {cart?.totalCents != null
              ? `Shortlist total: ${usd(cart.totalCents)}`
              : "Review your placement details"}
          </strong>
          <p>
            Save your brief and review current prices before continuing to
            placement inquiries.
          </p>
        </div>
        <button
          className={`button button-secondary ${styles.compactButton}`}
          disabled={busy || loading}
          onClick={() => {
            setError("");
            void refresh();
          }}
        >
          <RotateCw size={16} aria-hidden="true" /> Refresh shortlist and prices
        </button>
      </div>
    </CustomerShell>
  );
}
