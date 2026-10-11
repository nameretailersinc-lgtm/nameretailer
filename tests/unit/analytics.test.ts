import { afterEach, beforeEach, expect, it, vi } from "vitest";
const stored = new Map<string, string>();
const gtag = vi.fn();
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA4_ID", "G-TEST1234");
  stored.clear();
  gtag.mockReset();
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
it.each(["granted", "denied"] as const)(
  "applies and announces %s even when analytics throws",
  async (choice) => {
    const events = await import("@/lib/analytics/events");
    gtag.mockImplementation(() => {
      // Subscribers must be notified before the failing provider is called.
      expect(window.dispatchEvent).toHaveBeenCalled();
      throw new Error("Analytics blocked");
    });
    expect(() => events.setConsent(choice)).not.toThrow();
    expect(events.getConsent()).toBe(choice);
    expect(stored.get(events.consentKey)).toBe(choice);
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "nr-consent" }),
    );
    expect(() => events.initializeAnalytics()).not.toThrow();
    expect(() => events.trackEvent("page_view")).not.toThrow();
    expect(() => events.disableAnalytics()).not.toThrow();
    vi.resetModules();
    delete (window as Window & { nrAnalyticsConsent?: string })
      .nrAnalyticsConsent;
    const reloaded = await import("@/lib/analytics/events");
    expect(reloaded.getConsent()).toBe(choice);
  },
);
it("declines and notifies subscribers when cookie access is blocked", async () => {
  const events = await import("@/lib/analytics/events");
  vi.stubGlobal("document", {
    get cookie() {
      throw new Error("Cookies blocked");
    },
  });
  expect(() => events.setConsent("denied")).not.toThrow();
  expect(events.getConsent()).toBe("denied");
  expect(window.dispatchEvent).toHaveBeenCalledOnce();
  expect(window["ga-disable-G-TEST1234" as keyof Window]).toBe(true);
});
it("shares the session choice when storage is blocked", async () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("Storage blocked");
    },
    setItem: () => {
      throw new Error("Storage blocked");
    },
  });
  const events = await import("@/lib/analytics/events");
  events.setConsent("denied");
  vi.resetModules();
  const anotherConsumer = await import("@/lib/analytics/events");
  expect(anotherConsumer.getConsent()).toBe("denied");
  expect(window.dispatchEvent).toHaveBeenCalledOnce();
});
it("updates the current choice when another tab changes consent", async () => {
  const events = await import("@/lib/analytics/events");
  const notify = vi.fn();
  const unsubscribe = events.consentSubscribe(notify);
  const storageListener = vi
    .mocked(window.addEventListener)
    .mock.calls.find(([name]) => name === "storage")?.[1];
  if (typeof storageListener !== "function")
    throw new Error("Consent must subscribe to browser storage changes.");
  events.setConsent("granted");
  stored.set(events.consentKey, "denied");
  storageListener(Object.assign(new Event("storage"), { key: "unrelated-setting" }));
  expect(events.getConsent()).toBe("granted");
  expect(notify).not.toHaveBeenCalled();
  storageListener(Object.assign(new Event("storage"), { key: events.consentKey }));
  expect(events.getConsent()).toBe("denied");
  expect(notify).toHaveBeenCalledOnce();
  unsubscribe();
  expect(window.removeEventListener).toHaveBeenCalledWith(
    "storage",
    storageListener,
  );
});
