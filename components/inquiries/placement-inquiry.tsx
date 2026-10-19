"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useShortlist } from "@/components/marketplace/shortlist";

function InquiryDialog({
  productIds,
  onClose,
}: {
  productIds: string[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/inquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, productIds }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Please check your details and try again.",
        );
      setSuccess(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="placement-dialog reference-site inquiry-dialog"
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
      }}
    >
      <header className="placement-dialog-header">
        <h2 id={`${id}-title`}>Request a placement</h2>
        <button
          className="button button-secondary"
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Close placement inquiry"
        >
          Close
        </button>
      </header>
      <div className="placement-dialog-body">
        {success ? (
          <p role="status">{success}</p>
        ) : (
          <form className="inquiry-form" onSubmit={submit}>
            {productIds.length > 0 && (
              <p>
                Your request includes {productIds.length} selected publication
                {productIds.length === 1 ? "" : "s"}.
              </p>
            )}
            <label htmlFor={`${id}-name`}>
              Name
              <input
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                maxLength={120}
                required
              />
            </label>
            <label htmlFor={`${id}-email`}>
              Email
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>
            <label htmlFor={`${id}-url`}>
              Website URL
              <input
                id={`${id}-url`}
                name="websiteUrl"
                type="url"
                placeholder="https://"
                maxLength={2048}
                required
              />
            </label>
            <label htmlFor={`${id}-anchor`}>
              Target keyword / anchor
              <input
                id={`${id}-anchor`}
                name="anchor"
                maxLength={250}
                required
              />
            </label>
            <label htmlFor={`${id}-budget`}>
              Budget (include currency)
              <input
                id={`${id}-budget`}
                name="budget"
                placeholder="e.g. USD 200, including writing"
                maxLength={120}
                required
              />
            </label>
            <label htmlFor={`${id}-message`}>
              Message
              <textarea
                id={`${id}-message`}
                name="message"
                minLength={5}
                maxLength={4000}
                rows={4}
                required
              />
            </label>
            <div className="inquiry-honeypot" aria-hidden="true">
              <label>
                Leave this blank
                <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {error && <p role="alert">{error}</p>}
            <p>
              We’ll confirm publisher fit, scope and pricing by email.{" "}
              <Link href="/privacy/">How we use your details</Link>.
            </p>
            <button
              type="submit"
              className="button button-primary"
              disabled={busy}
            >
              {busy ? "Sending…" : "Send placement request"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}

export function PlacementInquiry({
  productIds = [],
  label = "Request this placement",
}: {
  productIds?: string[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="button button-primary placement-buy"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open &&
        createPortal(
          <InquiryDialog
            productIds={productIds}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}

export function ShortlistInquiry() {
  const { items } = useShortlist();
  return items.length ? (
    <PlacementInquiry
      productIds={items.map((item) => item.id)}
      label="Request quote for shortlist"
    />
  ) : null;
}
