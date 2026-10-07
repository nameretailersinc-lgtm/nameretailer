"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Field, Input, Feedback } from "./primitives";
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main id="main" tabIndex={-1} className="auth-page">
      <Link className="wordmark" href="/">
        Name Retailer
      </Link>
      <section className="auth-card">
        <p className="eyebrow">Editorial workspace</p>
        <h1>Sign in</h1>
        <p className="muted">Use your workspace account to manage content.</p>
        <Feedback error={error} />
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
              });
              if (result?.ok) {
                router.push("/admin/");
                router.refresh();
              } else
                setError(
                  "Unable to sign in. Check your email and password, then try again.",
                );
            } catch {
              setError("Sign-in is temporarily unavailable. Please retry.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Email">
            <Input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <Input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <label className="check">
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
            />
            Show password
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p>
          <Link href="/admin/forgot-password/">Forgot your password?</Link>
        </p>
      </section>
    </main>
  );
}
