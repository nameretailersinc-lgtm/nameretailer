import { afterEach, beforeEach, expect, it, vi } from "vitest";
const stored = new Map<string, string>();
const gtag = vi.fn();
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA4_ID", "G-TEST1234");
  stored.clear();
  gtag.mockClear();
  vi.stubGlobal("window", {
    gtag,
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
  });
  vi.stubGlobal("document", {
    cookie: "",
    referrer: "https://example.org/?email=secret@example.com",
  });
  vi.stubGlobal("location", {
    origin: "https://nameretailer.com",
    pathname: "/publication/example-com/",
    hostname: "nameretailer.com",
    search: "?q=private@example.com",
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("blocks custom analytics until explicit consent and again after withdrawal", async () => {
  const events = await import("@/lib/analytics/events");
  events.trackEvent("publication_view");
  expect(gtag).not.toHaveBeenCalled();
  events.setConsent("granted");
  events.initializeAnalytics();
  events.trackEvent("publication_view");
  expect(gtag.mock.calls.filter((call) => call[0] === "event")).toHaveLength(1);
  events.setConsent("denied");
  events.trackEvent("publication_view");
  expect(gtag.mock.calls.filter((call) => call[0] === "event")).toHaveLength(1);
});
it("keeps personal input and query strings out of event payloads", async () => {
  const events = await import("@/lib/analytics/events");
  expect(
    events.safeEventParameters({
      email: "secret@example.com",
      q: "secret",
      filter_fields: "q,country,email",
      product_id: "not-an-id",
      action: "add",
    }),
  ).toEqual({ action: "add", filter_fields: "country,q" });
  events.setConsent("granted");
  events.initializeAnalytics();
  events.trackEvent("filter_use", { filter_fields: "q" });
  const payload = gtag.mock.calls.find((call) => call[0] === "event")?.[2];
  expect(payload).toMatchObject({
    page_location: "https://nameretailer.com/publication/example-com/",
    page_referrer: "https://example.org",
  });
  expect(JSON.stringify(payload)).not.toContain("secret");
  expect(events.publicAnalyticsPath("/my-account/")).toBe(false);
});
