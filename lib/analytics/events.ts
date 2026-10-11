export const consentKey = "nr-analytics-consent-v1";
export type Consent = "unknown" | "granted" | "denied";
type AnalyticsWindow = Window & {
  nrAnalyticsConsent?: Exclude<Consent, "unknown">;
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};
let initialized = false;
export const analyticsId = process.env.NEXT_PUBLIC_GA4_ID || "";
export const analyticsConfigured = /^G-[A-Z0-9]{4,16}$/.test(analyticsId);
export function getConsent(): Consent {
  if (typeof window === "undefined") return "unknown";
  const choice = analyticsWindow().nrAnalyticsConsent;
  if (choice) return choice;
  try {
    const saved = localStorage.getItem(consentKey);
    return saved === "granted" || saved === "denied" ? saved : "unknown";
  } catch {
    return "unknown";
  }
}
export function consentSubscribe(listener: () => void) {
  const storageChanged = (event: StorageEvent) => {
    if (event.key !== null && event.key !== consentKey) return;
    delete analyticsWindow().nrAnalyticsConsent;
    listener();
  };
  window.addEventListener("nr-consent", listener);
  window.addEventListener("storage", storageChanged);
  return () => {
    window.removeEventListener("nr-consent", listener);
    window.removeEventListener("storage", storageChanged);
  };
}
export const serverConsent = (): Consent => "unknown";
function analyticsWindow() {
  return window as unknown as AnalyticsWindow;
}
function callAnalytics(...args: unknown[]) {
  try {
    analyticsWindow().gtag?.(...args);
  } catch {
    /* A blocked analytics script must not interrupt the site or consent controls. */
  }
}
export function setConsent(value: Exclude<Consent, "unknown">) {
  const state = analyticsWindow();
  state.nrAnalyticsConsent = value;
  state[`ga-disable-${analyticsId}`] = value !== "granted";
  try {
    localStorage.setItem(consentKey, value);
  } catch {
    /* session-only choice */
  }
  // Apply the choice to the UI before any optional analytics or cookie work.
  window.dispatchEvent(new Event("nr-consent"));
  callAnalytics("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  if (value !== "denied") return;
  try {
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.trim().split("=")[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      const host = location.hostname.split(".");
      for (let index = 0; index < host.length - 1; index++)
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${host.slice(index).join(".")}`;
    }
  } catch {
    /* The choice still applies when the browser restricts cookie access. */
  }
}
export function disableAnalytics() {
  if (typeof window === "undefined") return;
  const state = analyticsWindow();
  state[`ga-disable-${analyticsId}`] = true;
  callAnalytics("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
export function initializeAnalytics() {
  if (!analyticsConfigured || getConsent() !== "granted") return;
  const state = analyticsWindow();
  state[`ga-disable-${analyticsId}`] = false;
  if (initialized) return;
  initialized = true;
  state.dataLayer ||= [];
  state.gtag ||= (...args) => state.dataLayer!.push(args);
  callAnalytics("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  callAnalytics("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  callAnalytics("js", new Date());
  callAnalytics("config", analyticsId, {
    send_page_view: false,
    cookie_domain: "none",
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: location.origin + location.pathname,
    page_referrer: safeReferrer(),
  });
}
const eventNames = [
  "page_view",
  "publication_view",
  "add_to_plan",
  "shortlist",
  "filter_use",
  "sign_up",
  "contact_submit",
  "contact_click",
] as const;
export type AnalyticsEvent = (typeof eventNames)[number];
const filterFields = new Set([
  "q",
  "country",
  "language",
  "category",
  "minDa",
  "maxDa",
  "minDr",
  "maxDr",
  "minTraffic",
  "maxTraffic",
  "minPrice",
  "maxPrice",
  "sort",
  "pageSize",
]);
export function safeEventParameters(input: Record<string, unknown>) {
  const output: Record<string, string> = {};
  if (
    typeof input.product_id === "string" &&
    /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(input.product_id)
  )
    output.product_id = input.product_id;
  if (input.action === "add" || input.action === "remove")
    output.action = input.action;
  if (typeof input.filter_fields === "string") {
    const keys = input.filter_fields
      .split(",")
      .filter((key) => filterFields.has(key));
    if (keys.length) output.filter_fields = [...new Set(keys)].sort().join(",");
  }
  if (input.method === "email") output.method = "email";
  if (input.registration_state === "request_accepted")
    output.registration_state = "request_accepted";
  return output;
}
export function safeReferrer() {
  try {
    return document.referrer ? new URL(document.referrer).origin : "";
  } catch {
    return "";
  }
}
export function publicAnalyticsPath(path: string) {
  return !/^\/(?:admin|api|my-account|cart|checkout|custom-login|media)(?:\/|$)/.test(
    path,
  );
}
export function trackEvent(
  name: AnalyticsEvent,
  parameters: Record<string, unknown> = {},
) {
  if (
    typeof window === "undefined" ||
    !analyticsConfigured ||
    getConsent() !== "granted" ||
    !eventNames.includes(name)
  )
    return;
  const state = analyticsWindow();
  if (!state.gtag || state[`ga-disable-${analyticsId}`]) return;
  callAnalytics("event", name, {
    ...safeEventParameters(parameters),
    page_location:
      location.origin +
      (publicAnalyticsPath(location.pathname) ? location.pathname : "/"),
    page_referrer: safeReferrer(),
  });
}
/** Call only after a future contact handler confirms actual delivery. Mail links do not submit forms. */
export const recordContactSubmission = () => trackEvent("contact_submit");
