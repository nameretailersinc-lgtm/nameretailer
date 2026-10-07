"use client";
import { useState } from "react";
import Link from "next/link";
import {
  CustomerShell,
  CustomerFeedback,
  customerError,
  customerRequest,
} from "./shared";
export function CustomerPasswordReset({ token }: { token?: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  return (
    <CustomerShell
      title={token ? "Choose a new password" : "Reset your password"}
    >
      <CustomerFeedback error={error} message={message} />
      <section className="customer-card">
        <p>
          {token
            ? "Choose a password of 12–256 characters. Your existing sessions will be signed out."
            : "Enter your account email to request a private reset link."}
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget,
              data = new FormData(form);
            setError("");
            setMessage("");
            if (token && data.get("password") !== data.get("confirm")) {
              setError("The passwords do not match.");
              return;
            }
            setBusy(true);
            try {
              await customerRequest(
                token
                  ? "/api/account/reset-password/"
                  : "/api/account/forgot-password/",
                {
                  method: "POST",
                  body: JSON.stringify(
                    token
                      ? { token, password: data.get("password") }
                      : { email: data.get("email") },
                  ),
                },
              );
              setMessage(
                token
                  ? "Your password has been reset. You can now sign in."
                  : "If an eligible account exists, a reset link will be sent. Check your inbox.",
              );
              form.reset();
            } catch (cause) {
              setError(customerError(cause));
            } finally {
              setBusy(false);
            }
          }}
        >
          {token ? (
            <>
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={256}
                required
              />
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={256}
                required
              />
            </>
          ) : (
            <>
              <label htmlFor="reset-email">Account email</label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
            </>
          )}
          <button className="button button-primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : token
                ? "Reset password"
                : "Send reset link"}
          </button>
        </form>
        <Link href="/my-account/">Back to sign in</Link>
      </section>
    </CustomerShell>
  );
}
