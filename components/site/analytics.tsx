"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/lib/analytics/events";
export function AnalyticsPreferences() {
  const consent = useSyncExternalStore(
    consentSubscribe,
    getConsent,
    serverConsent,
  );
  if (!analyticsConfigured) return null;
  return (
    <section
      className="analytics-preferences"
      aria-label="Analytics preferences"
    >
      <p>
        Optional analytics helps us understand catalogue use. Your choice is{" "}
        {consent === "granted"
          ? "accepted"
          : consent === "denied"
            ? "declined"
            : "unset"}
        .
      </p>
      <button type="button" onClick={() => setConsent("granted")}>
        Accept analytics
      </button>
      <button type="button" onClick={() => setConsent("denied")}>
        Decline analytics
      </button>
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
  const lastView = useRef("");
  useEffect(() => {
    if (consent !== "granted") {
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
  }, [consent, path]);
  if (!analyticsConfigured) return null;
  return (
    <>
      {consent === "granted" && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
          strategy="afterInteractive"
        />
      )}
      {consent === "unknown" && (
        <aside className="analytics-consent" aria-label="Optional analytics">
          <p>
            Allow optional analytics to help us understand how the marketplace
            is used? <Link href="/cookies/">Cookie information</Link>
          </p>
          <AnalyticsPreferences />
        </aside>
      )}
    </>
  );
}
