"use client";
import { useState } from "react";
import Link from "next/link";
import { mutation, errorMessage } from "./api";
import { Button, Field, Input, Feedback } from "./primitives";
export function PasswordReset({ token }: { token?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  return (
    <main id="main" tabIndex={-1} className="auth-page">
      <Link className="wordmark" href="/admin/login/">
        Name Retailer
      </Link>
      <section className="auth-card">
        <h1>{token ? "Choose a new password" : "Reset your password"}</h1>
        <Feedback error={error} success={success} />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            if (token && password !== confirm) {
              setError(
                "The passwords do not match. Enter the same password in both fields.",
              );
              return;
            }
            setBusy(true);
            try {
              await mutation(
                token
                  ? "/api/account/reset-password"
                  : "/api/account/forgot-password",
                "POST",
                token ? { token, password } : { email },
              );
              setSuccess(
                token
                  ? "Your password has been reset. You can now sign in."
                  : "If an eligible account exists, a reset link will be sent. Check your inbox.",
              );
              setPassword("");
              setConfirm("");
            } catch (cause) {
              setError(errorMessage(cause));
            } finally {
              setBusy(false);
            }
          }}
        >
          {token ? (
            <>
              <Field
                label="New password"
                hint="Use at least 12 characters. Paste and password managers are supported."
              >
                <Input
                  type="password"
                  minLength={12}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field label="Confirm new password">
                <Input
                  type="password"
                  minLength={12}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </Field>
            </>
          ) : (
            <Field label="Account email">
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          )}
          <Button disabled={busy}>
            {busy
              ? "Please wait…"
              : token
                ? "Reset password"
                : "Send reset link"}
          </Button>
        </form>
        <p>
          <Link href="/admin/login/">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}
