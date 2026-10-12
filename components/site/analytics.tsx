"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Cookie } from "lucide-react";
import styles from "./analytics.module.css";
import {
  analyticsId,
  analyticsConfigured,
  getConsent,
  serverConsent,
  consentSubscribe,
  setConsent,
  initializeAnalytics,
  disableAnalytics,
  trackEvent,
  publicAnalyticsPath,
  type Consent,
} from "@/lib/analytics/events";

const hydrationSubscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

function ConsentActions({
  consent,
  ready,
}: {
  consent: Consent;
  ready: boolean;
}) {
  return (
    <div className={styles.actions}>
      <button
        className={`${styles.action} ${styles.decline}`}
        type="button"
        disabled={!ready}
        aria-pressed={consent === "denied"}
        onClick={() => setConsent("denied")}
      >
        Decline analytics
      </button>
      <button
        className={`${styles.action} ${styles.accept}`}
        type="button"
        disabled={!ready}
        aria-pressed={consent === "granted"}
        onClick={() => setConsent("granted")}
      >
        Accept analytics
      </button>
    </div>
  );
}

export function AnalyticsPreferences() {
  const consent = useSyncExternalStore(
    consentSubscribe,
    getConsent,
    serverConsent,
  );
  const ready = useSyncExternalStore(
    hydrationSubscribe,
    clientReady,
    serverReady,
  );
  return (
    <section
      id="analytics-preferences"
      className={`analytics-preferences ${styles.preferences}`}
      aria-label="Analytics preferences"
    >
      <div className={styles.headingRow}>
        <span className={styles.icon} aria-hidden="true">
          <Cookie size={22} />
        </span>
        <h2 className={styles.heading}>Analytics preferences</h2>
      </div>
      <p className={styles.description}>
        {analyticsConfigured
          ? "Choose whether to allow optional analytics. It helps us understand how the marketplace is used."
          : "Optional analytics is off on this site."}
      </p>
      {analyticsConfigured && (
        <>
          <p className={styles.status} role="status" aria-live="polite">
            {consent !== "unknown" && <Check size={15} aria-hidden="true" />}
            {consent === "granted"
              ? "Analytics accepted. You can change your choice below."
              : consent === "denied"
                ? "Analytics declined. You can change your choice below."
                : "Optional analytics stays off until you accept."}
          </p>
          <ConsentActions consent={consent} ready={ready} />
        </>
      )}
      <p className={styles.note}>
        Essential cookies keep sign-in and forms working with either choice.
      </p>
    </section>
  );
}
export function Analytics() {
  const consent = useSyncExternalStore(
    consentSubscribe,
    getConsent,
    serverConsent,
  );
  const path = usePathname();
  const ready = useSyncExternalStore(
    hydrationSubscribe,
    clientReady,
    serverReady,
  );
  const privateWorkspace = /^\/(?:admin|design-system)(?:\/|$)/.test(path);
  const lastView = useRef("");
  useEffect(() => {
    if (privateWorkspace || consent !== "granted") {
      disableAnalytics();
      lastView.current = "";
      return;
    }
    if (!analyticsConfigured) return;
    initializeAnalytics();
    if (path && publicAnalyticsPath(path) && lastView.current !== path) {
      trackEvent("page_view");
      if (path.startsWith("/publication/")) trackEvent("publication_view");
      lastView.current = path;
    }
  }, [consent, path, privateWorkspace]);
  if (!analyticsConfigured || privateWorkspace) return null;
  return (
    <>
      {consent === "granted" && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
          strategy="afterInteractive"
        />
      )}
      {ready && consent === "unknown" && (
        <aside
          className={`analytics-consent ${styles.banner}`}
          aria-label="Optional analytics"
        >
          <div className={styles.headingRow}>
            <span className={styles.icon} aria-hidden="true">
              <Cookie size={22} />
            </span>
            <h2 className={styles.heading}>Your privacy, your choice</h2>
          </div>
          <p className={styles.description}>
            We use optional analytics to understand how the marketplace is used.
            Choose whether to allow it.
          </p>
          <ConsentActions consent={consent} ready={ready} />
          <p className={styles.note}>
            Change your choice anytime in{" "}
            <Link href="/cookies/#analytics-preferences">
              Cookie preferences
            </Link>
            .
          </p>
        </aside>
      )}
    </>
  );
}
