import { afterEach, describe, expect, it, vi } from "vitest";
import { mobileCheckoutView } from "@/lib/mobile-checkout";
import type { CheckoutView } from "@/lib/commerce/checkout-types";

const view = {
  draft: null,
  cart: {
    version: 1,
    currency: "USD",
    items: [{ productId: "test-publication", productVersion: 1, writingWords: 0,
      domain: "https://example.com", placementCents: 1000, writingCents: 0,
      totalCents: 1000, status: "ready", options: null }],
    totalCents: 1000,
    checkoutAvailable: false,
  },
  issues: [],
  paymentAvailable: false,
  orderSubmissionAvailable: false,
  paymentMethods: { stripe: false, paypal: false },
} as CheckoutView;
afterEach(() => vi.unstubAllEnvs());
describe("mobile checkout contract", () => {
  it("advertises complete providers without returning server credentials or changing the source view", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mobile_fixture");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_mobile_fixture");
    vi.stubEnv("PAYPAL_CLIENT_ID", "mobile-fixture");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "mobile-secret-fixture");
    vi.stubEnv("PAYPAL_WEBHOOK_ID", "mobile-hook-fixture");
    vi.stubEnv("PAYPAL_ENV", "sandbox");
    const result = mobileCheckoutView(view);
    expect(result.paymentMethods).toEqual({ stripe: true, paypal: true });
    expect(result.paymentAvailable).toBe(true);
    expect(result.orderSubmissionAvailable).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(
      /sk_test_mobile_fixture|whsec_mobile_fixture|mobile-secret-fixture/,
    );
    expect(view.paymentAvailable).toBe(false);
  });
  it("blocks submission for a changed cart while retaining provider availability", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fixture");
    const result = mobileCheckoutView({
      ...view,
      issues: ["The publication price changed."],
    });
    expect(result.orderSubmissionAvailable).toBe(false);
    expect(result.paymentAvailable).toBe(true);
  });
  it("does not enable payments without credentials", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "");
    const result = mobileCheckoutView(view);
    expect(result.paymentAvailable).toBe(false);
    expect(result.orderSubmissionAvailable).toBe(false);
  });
  it("blocks empty or unavailable carts even if a caller omitted issue messages", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fixture");
    expect(
      mobileCheckoutView({ ...view, cart: { ...view.cart, items: [] } })
        .orderSubmissionAvailable,
    ).toBe(false);
    expect(
      mobileCheckoutView({ ...view, cart: { ...view.cart, totalCents: null } })
        .orderSubmissionAvailable,
    ).toBe(false);
  });
  it("supplies every supported billing country, including those outside the old mobile subset", () => {
    const result = mobileCheckoutView(view);
    expect(result.billingCountries).toContainEqual({
      code: "PK",
      name: "Pakistan",
    });
    expect(result.billingCountries).toContainEqual({
      code: "BR",
      name: "Brazil",
    });
    expect(
      new Set(result.billingCountries.map((country) => country.code)).size,
    ).toBe(result.billingCountries.length);
    expect(result.billingCountries.length).toBeGreaterThan(240);
  });
});
