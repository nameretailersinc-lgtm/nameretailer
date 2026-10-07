"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FilePlus2 } from "lucide-react";
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
        "Placement saved to your planning cart. No order has been placed.",
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
      title={productId ? "Prepare Your Placement" : "Your shopping cart"}
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
        ) : undefined
      }
    >
      <CustomerFeedback error={error} message={message} />
      {loading ? (
        <p role="status">Loading your cart…</p>
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
              to save your cart. You can inspect a publication’s options before
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
            <section aria-labelledby="saved-placements">
              <h2 id="saved-placements">
                Saved placements ({cart.items.length})
              </h2>
              <div className="customer-cart-items">
                {cart.items.map((item) => (
                  <article className="customer-card" key={item.productId}>
                    <h3>{item.domain || "Unavailable publication"}</h3>
                    <p>
                      {item.writingWords
                        ? `${item.writingWords}-word writing add-on`
                        : "Placement only"}{" "}
                      ·{" "}
                      {item.totalCents === null
                        ? "Price unavailable"
                        : usd(item.totalCents)}
                    </p>
                    <dl className="cart-brief-details">
                      <div>
                        <dt>Promoted URL</dt>
                        <dd>{item.brief?.promotedUrl || "Not yet supplied"}</dd>
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
                      <summary>View saved article brief</summary>
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
                        <summary>Review or change article option</summary>
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
                    <button
                      className="button button-secondary"
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
                      Remove placement
                    </button>
                  </article>
                ))}
              </div>
              <p className="customer-price">
                Cart total:{" "}
                {cart.totalCents === null
                  ? "Review unavailable or changed selections first"
                  : usd(cart.totalCents)}
              </p>
              <div className="cart-checkout-actions">
                <Link href="/products/" className="button button-secondary">
                  Continue browsing
                </Link>
                {cart.totalCents !== null &&
                cart.items.every((item) => !briefIssue(item, !!item.file)) ? (
                  <Link href="/checkout/" className="button button-primary">
                    Proceed to checkout review
                  </Link>
                ) : (
                  <p>
                    Complete each brief and review changed prices to continue.
                  </p>
                )}
              </div>
              <p className="customer-hint">
                Coupons are not connected yet. No discount, fee or tax
                calculation is implied by this preview total.
              </p>
            </section>
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
                <Link href="/products/" className="button button-secondary">
                  Browse publications
                </Link>
              </div>
            </section>
          ) : null}
        </>
      )}
      <div className="cart-page-utilities">
        <button
          className="button button-secondary"
          disabled={busy || loading}
          onClick={() => {
            setError("");
            void refresh();
          }}
        >
          Refresh cart and prices
        </button>
        <p className="customer-hint">
          Save your brief and review server-calculated prices. Final order
          submission and Stripe / PayPal payments are not yet connected.
        </p>
      </div>
    </CustomerShell>
  );
}
