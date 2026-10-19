"use client";
import { trackEvent } from "@/lib/analytics/events";
import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bookmark,
  CreditCard,
  Headphones,
  LockKeyhole,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Zap,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  Layers,
} from "lucide-react";
import { DeskHeader, DeskHeading } from "./desk";
import styles from "./desk.module.css";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <CustomerShell
      title="My account"
      className={styles.root}
      header={
        !loading && !user ? (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">
              <Home size={14} aria-hidden="true" /> Home
            </Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span>My account</span>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">
              {register ? "Create account" : "Sign in"}
            </span>
          </nav>
        ) : (
          <DeskHeader
            title="My account"
            description="Manage your profile, saved placements, orders and account access."
            icon={UserRound}
          />
        )
      }
    >
      <CustomerFeedback error={error} message={message} />
      {loading ? (
        <p role="status">Loading your account…</p>
      ) : user ? (
        <div className={styles.accountLayout}>
          <nav
            className={`customer-card ${styles.card} ${styles.accountNav}`}
            aria-label="Account navigation"
          >
            <a href="#account-details" aria-current="page">
              <UserRound size={19} aria-hidden="true" /> Account details
            </a>
            <Link href="/my-account/orders/">
              <ShoppingBag size={19} aria-hidden="true" /> Orders
            </Link>
            <Link href={cartUrl}>
              <Bookmark size={19} aria-hidden="true" /> Saved placements
            </Link>
            <Link href="/checkout/">
              <CreditCard size={19} aria-hidden="true" /> Billing & checkout
            </Link>
            <a href="#account-security">
              <ShieldCheck size={19} aria-hidden="true" /> Security
            </a>
            <button
              onClick={() => void signOut({ callbackUrl: "/my-account/" })}
            >
              <LogOut size={19} aria-hidden="true" /> Sign out
            </button>
          </nav>
          <div className={styles.accountColumn}>
            <section
              className={`customer-card ${styles.card}`}
              aria-labelledby="account-details"
            >
              <DeskHeading
                icon={UserRound}
                title="Account details"
                id="account-details"
                description="Update your personal information and account settings."
              />
              <form
                className={styles.profileForm}
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
                <label htmlFor="profile-email">Email address</label>
                <div className={styles.fieldControl}>
                  <Mail size={17} aria-hidden="true" />
                  <input
                    id="profile-email"
                    type="email"
                    value={user.email}
                    readOnly
                  />
                </div>
                <label htmlFor="account-name">Name</label>
                <div className={styles.fieldControl}>
                  <UserRound size={17} aria-hidden="true" />
                  <input
                    id="account-name"
                    autoComplete="name"
                    required
                    maxLength={120}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <button
                  className={`button button-primary ${styles.compactButton}`}
                  disabled={busy}
                >
                  <Save size={16} aria-hidden="true" />{" "}
                  {busy ? "Saving…" : "Save account details"}
                </button>
              </form>
            </section>
            <section
              className={`customer-card ${styles.card}`}
              aria-labelledby="account-security"
            >
              <DeskHeading
                icon={ShieldCheck}
                title="Security & access"
                id="account-security"
                description="Keep your account safe and secure."
              />
              <div className={styles.securityRow}>
                <LockKeyhole size={24} aria-hidden="true" />
                <div>
                  <strong>Password</strong>
                  <p>Request a password reset link for your account.</p>
                </div>
                <Link
                  href="/my-account/forgot-password/"
                  className={`button button-secondary ${styles.compactButton}`}
                >
                  Reset your password
                </Link>
              </div>
            </section>
          </div>
          <div className={styles.accountColumn}>
            <section
              className={`customer-card ${styles.card}`}
              aria-labelledby="quick-actions"
            >
              <DeskHeading
                icon={Zap}
                title="Quick actions"
                id="quick-actions"
              />
              <div className={styles.quickActions}>
                <Link href={cartUrl}>
                  <ShoppingCart size={21} aria-hidden="true" />
                  <span>
                    <strong>View your shortlist</strong>
                    <small>Manage selected placements</small>
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/my-account/orders/">
                  <ShoppingBag size={21} aria-hidden="true" />
                  <span>
                    <strong>Your orders</strong>
                    <small>Track payments and placements</small>
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/checkout/">
                  <CreditCard size={21} aria-hidden="true" />
                  <span>
                    <strong>Billing & checkout</strong>
                    <small>Review your billing draft</small>
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/my-account/forgot-password/">
                  <ShieldCheck size={21} aria-hidden="true" />
                  <span>
                    <strong>Account security</strong>
                    <small>Reset your password</small>
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>
            <section
              className={`customer-card ${styles.card}`}
              aria-labelledby="account-overview"
            >
              <DeskHeading
                icon={Bookmark}
                title="Account overview"
                id="account-overview"
              />
              <dl className={styles.summaryDetails}>
                <div>
                  <dt>Member since</dt>
                  <dd>
                    {Number.isNaN(Date.parse(user.createdAt))
                      ? "Not available"
                      : new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        }).format(new Date(user.createdAt))}
                  </dd>
                </div>
                <div>
                  <dt>Account status</dt>
                  <dd>{user.active ? "Active" : "Inactive"}</dd>
                </div>
              </dl>
            </section>
            <section
              className={`customer-card ${styles.card} ${styles.helpCard}`}
            >
              <DeskHeading icon={Headphones} title="Need help?" />
              <p>
                Have a question about your account, orders or placements? Get in
                touch with our team.
              </p>
              <Link
                href="/contact/"
                className={`button button-secondary ${styles.compactButton}`}
              >
                <Mail size={16} aria-hidden="true" /> Contact support
              </Link>
            </section>
          </div>
        </div>
      ) : (
        <div className={styles.authLayout}>
          <div className={styles.authIntro}>
            <h1>My account</h1>
            <p>
              Manage your profile, saved placements, orders and account access.
            </p>
            <div className={styles.authBenefits}>
              <div>
                <span>
                  <LockKeyhole size={25} aria-hidden="true" />
                </span>
                <div>
                  <strong>Private planning</strong>
                  <p>Your shortlist and billing drafts belong to your account.</p>
                </div>
              </div>
              <div>
                <span>
                  <Layers size={25} aria-hidden="true" />
                </span>
                <div>
                  <strong>Manage your activity</strong>
                  <p>View orders and return to your saved placement briefs.</p>
                </div>
              </div>
              <div>
                <span>
                  <Bookmark size={25} aria-hidden="true" />
                </span>
                <div>
                  <strong>Pick up where you left off</strong>
                  <p>Prepare your content and review publication options.</p>
                </div>
              </div>
              <div>
                <span>
                  <CreditCard size={25} aria-hidden="true" />
                </span>
                <div>
                  <strong>Review before payment</strong>
                  <p>Confirm placement details and prices before checkout.</p>
                </div>
              </div>
            </div>
            <Image
              src="/tools/12_secure_folder_illustration.png"
              width={520}
              height={280}
              sizes="(max-width: 900px) 320px, 440px"
              alt=""
              className={styles.authArt}
            />
          </div>
          <section
            className={`customer-card ${styles.card} ${styles.authCard}`}
          >
            <DeskHeading
              icon={UserRound}
              title={
                register
                  ? "Create your customer account"
                  : "Sign in to your account"
              }
              description="Browse, shortlist and request a placement without signing in. Your inquiry goes to the team for a quote."
            />
            <form
              className={styles.profileForm}
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
                        body: JSON.stringify({
                          name,
                          email,
                          password,
                          website,
                        }),
                      },
                    );
                    trackEvent("sign_up", {
                      method: "email",
                      registration_state: "request_accepted",
                    });
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
                    window.location.assign(
                      productId ? cartUrl : "/my-account/",
                    );
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
                  <div className={styles.fieldControl}>
                    <UserRound size={17} aria-hidden="true" />
                    <input
                      id="register-name"
                      autoComplete="name"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
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
              <div className={styles.fieldControl}>
                <Mail size={18} aria-hidden="true" />
                <input
                  id="account-email"
                  type="email"
                  autoComplete="username"
                  required
                  maxLength={254}
                  value={email}
                  placeholder="you@example.com"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <label htmlFor="account-password">Password</label>
              <div
                className={`${styles.fieldControl} ${styles.passwordControl}`}
              >
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="account-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={register ? "new-password" : "current-password"}
                  minLength={register ? 12 : undefined}
                  maxLength={256}
                  required
                  value={password}
                  placeholder={
                    register ? "Create your password" : "Enter your password"
                  }
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              {register && (
                <p className="customer-hint">
                  Use 12–256 characters. Pasting and password managers are
                  supported. This account does not subscribe you to marketing.
                </p>
              )}
              <button
                className={`button button-primary ${styles.payButton}`}
                disabled={busy}
              >
                {busy
                  ? "Please wait…"
                  : register
                    ? "Create account"
                    : "Sign in"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
            <div className={styles.authActions}>
              <button
                className={styles.authSwitch}
                disabled={busy}
                onClick={() => {
                  setRegister(!register);
                  setError("");
                  setMessage("");
                  setPassword("");
                  setShowPassword(false);
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
        </div>
      )}
    </CustomerShell>
  );
}
