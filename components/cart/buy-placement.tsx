"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ShoppingCart, X } from "lucide-react";
import type {
  CartSelection,
  CartView,
  PlacementOptions,
} from "@/lib/commerce/cart-types";
import {
  CustomerFeedback,
  CustomerRequestError,
  customerError,
  customerMutation,
  customerRequest,
} from "@/components/account/shared";
import { PlacementForm } from "./placement-form";

function PlacementDialog({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [options, setOptions] = useState<PlacementOptions | null>(null);
  const [cart, setCart] = useState<CartView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const [uploadPending, setUploadPending] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const element = dialog.current;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    let active = true;
    Promise.all([
      customerRequest<PlacementOptions>(`/api/products/${productId}/options/`),
      customerRequest<CartView>("/api/cart/").catch((cause) => {
        if (cause instanceof CustomerRequestError && cause.status === 401)
          return null;
        throw cause;
      }),
    ])
      .then(([option, saved]) => {
        if (active) {
          setOptions(option);
          setCart(saved);
        }
      })
      .catch((cause) => {
        if (active) setError(customerError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      element?.close();
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [productId]);
  async function save(item: CartSelection) {
    if (!cart) return false;
    setBusy(true);
    setError("");
    try {
      setCart(
        await customerMutation<CartView>("/api/cart/", "PUT", {
          version: cart.version,
          item,
        }),
      );
      router.push("/cart/");
      onClose();
      return true;
    } catch (cause) {
      setError(customerError(cause));
      if (cause instanceof CustomerRequestError && cause.status === 409) {
        try {
          const [saved, current] = await Promise.all([
            customerRequest<CartView>("/api/cart/"),
            customerRequest<PlacementOptions>(
              `/api/products/${productId}/options/`,
            ),
          ]);
          setCart(saved);
          setOptions(current);
        } catch (refreshError) {
          setError(customerError(refreshError));
        }
      }
      return false;
    } finally {
      setBusy(false);
    }
  }
  const selected = cart?.items.find((item) => item.productId === productId);
  return (
    <dialog
      ref={dialog}
      className="placement-dialog reference-site customer-site"
      aria-labelledby="placement-dialog-title"
      onCancel={(event) => {
        if (busy || uploadPending) event.preventDefault();
        else onClose();
      }}
      onClick={(event) => {
        if (!busy && !uploadPending && event.target === event.currentTarget)
          onClose();
      }}
    >
      <header className="placement-dialog-header">
        <div>
          <p className="eyebrow">Name Retailer · Content placement</p>
          <h2 id="placement-dialog-title">Create a placement brief</h2>
        </div>
        <button
          type="button"
          disabled={busy || uploadPending}
          className="button button-secondary"
          aria-label="Close placement brief"
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="placement-dialog-body">
        <CustomerFeedback error={error} />
        {loading ? (
          <p role="status">Loading current prices…</p>
        ) : (
          options && (
            <PlacementForm
              key={`${options.productId}:${options.productVersion}`}
              options={options}
              initial={selected?.writingWords}
              initialBrief={selected?.brief}
              initialFile={selected?.file}
              busy={busy}
              signedIn={!!cart}
              onSave={save}
              onPendingChange={setUploadPending}
            />
          )
        )}
      </div>
    </dialog>
  );
}
export function BuyPlacement({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="button button-primary placement-buy"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart size={15} aria-hidden="true" /> Buy now
      </button>
      {open &&
        createPortal(
          <PlacementDialog
            productId={productId}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}
