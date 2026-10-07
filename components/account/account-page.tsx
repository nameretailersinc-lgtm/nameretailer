"use client";
import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import type { UserSummary } from "@/lib/cms/types";
import {
  CustomerShell,
  CustomerFeedback,
  CustomerRequestError,
  customerError,
  customerRequest,
  customerMutation,
} from "./shared";

export function AccountPage({ productId }: { productId?: string }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const cartUrl = productId
    ? `/cart/?product=${encodeURIComponent(productId)}`
    : "/cart/";
  useEffect(() => {
    let active = true;
    customerRequest<{ user: UserSummary }>("/api/account/profile/")
      .then((data) => {
        if (active) {
          setUser(data.user);
          setName(data.user.name);
        }
      })
      .catch((cause) => {
        if (
          active &&
          !(cause instanceof CustomerRequestError && cause.status === 401)
        )
          setError(customerError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <CustomerShell title="My account">
      <CustomerFeedback error={error} message={message} />
      {loading ? (
        <p role="status">Loading your account…</p>
      ) : user ? (
        <section className="customer-card">
          <h2>Your account details</h2>
          <p>Signed in as {user.email}.</p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              setMessage("");
              try {
                const data = await customerMutation<{ user: UserSummary }>(
                  "/api/account/profile/",
                  "PATCH",
                  { name },
                );
                setUser(data.user);
                setMessage("Account details saved.");
              } catch (cause) {
                setError(customerError(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label htmlFor="account-name">Name</label>
            <input
              id="account-name"
              autoComplete="name"
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button className="button button-primary" disabled={busy}>
              {busy ? "Saving…" : "Save account details"}
            </button>
          </form>
          <div className="customer-actions">
            <Link className="button button-secondary" href={cartUrl}>
              View your cart
            </Link>
            <button
              className="button button-secondary"
              onClick={() => void signOut({ callbackUrl: "/my-account/" })}
            >
              Sign out
            </button>
          </div>
          <Link href="/my-account/forgot-password/">Reset your password</Link>
        </section>
      ) : (
        <section className="customer-card">
          <h2>
            {register
              ? "Create your customer account"
              : "Sign in to your account"}
          </h2>
          <p>
            Browse and compare without signing in. An account lets you save a
            planning cart; it does not place an order.
          </p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              setBusy(true);
              setError("");
              setMessage("");
              try {
                if (register) {
                  const { token } = await customerRequest<{ token: string }>(
                    "/api/account/registration-csrf/",
                  );
                  const website = String(
                    new FormData(form).get("website") || "",
                  );
                  const data = await customerRequest<{ message: string }>(
                    "/api/account/register/",
                    {
                      method: "POST",
                      headers: { "x-csrf-token": token },
                      body: JSON.stringify({ name, email, password, website }),
                    },
                  );
                  setMessage(data.message);
                  setRegister(false);
                  setPassword("");
                } else {
                  const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                    callbackUrl: productId ? cartUrl : "/my-account/",
                  });
                  if (!result?.ok || result.error)
                    throw new Error(
                      "Sign-in failed. Check your email and password, or try again later.",
                    );
                  window.location.assign(productId ? cartUrl : "/my-account/");
                }
              } catch (cause) {
                setError(customerError(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            {register && (
              <>
                <label htmlFor="register-name">Name</label>
                <input
                  id="register-name"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <div className="customer-honeypot" aria-hidden="true">
                  <label htmlFor="register-website">
                    Leave this field empty
                  </label>
                  <input
                    id="register-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
              </>
            )}
            <label htmlFor="account-email">Email</label>
            <input
              id="account-email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor="account-password">Password</label>
            <input
              id="account-password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={register ? 12 : undefined}
              maxLength={256}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {register && (
              <p className="customer-hint">
                Use 12–256 characters. Pasting and password managers are
                supported. This account does not subscribe you to marketing.
              </p>
            )}
            <button className="button button-primary" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            </button>
          </form>
          <div className="customer-actions">
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => {
                setRegister(!register);
                setError("");
                setMessage("");
                setPassword("");
              }}
            >
              {register
                ? "Already have an account? Sign in"
                : "Create a customer account"}
            </button>
            <Link href="/my-account/forgot-password/">
              Forgot your password?
            </Link>
          </div>
        </section>
      )}
    </CustomerShell>
  );
}
