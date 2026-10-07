import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/auth", () => ({
  currentIdentity: vi.fn(),
  currentUser: vi.fn(),
}));
vi.mock("@/lib/commerce/products", () => ({ availableProduct: vi.fn() }));
import {
  registrationSchema,
  profileSchema,
  accountSummary,
} from "@/lib/account";
import { cartPutSchema } from "@/lib/commerce/cart-validation";
import { placementOptions, quotePlacement } from "@/lib/commerce/pricing";
import { cartView } from "@/lib/commerce/cart";
import { availableProduct } from "@/lib/commerce/products";
import { csrfToken, validCsrf } from "@/lib/security/csrf";
import type { Product } from "@/lib/commerce/types";
const id = "e67939ad-8f50-41d7-912b-62928b8a1775";
const product: Product = {
  id,
  externalId: null,
  domain: "https://qa-publication.com",
  language: "English",
  country: "",
  category: "",
  priceCents: 12345,
  currency: "USD",
  status: "active",
  metrics: {
    da: null,
    dr: null,
    tf: null,
    ur: null,
    traffic: null,
    referringDomains: null,
    backlinks: null,
    spamScore: null,
  },
  requirements: "",
  linkType: "",
  turnaround: "",
  version: 2,
  createdAt: "",
  updatedAt: "",
  source: {
    Article_Price: "20.01",
    Article_Price_2: "0.00",
    Article_Price_3: "bad",
    Description: "private",
  },
};
describe("account/cart critical boundaries", () => {
  it("normalizes registration email and refuses roles, ownership and weak passwords", () => {
    const input = {
      name: "Buyer",
      email: " Buyer@Example.com ",
      password: "Test-only long password",
      website: "",
    };
    expect(registrationSchema.parse(input).email).toBe("buyer@example.com");
    for (const extra of [
      { role: "admin" },
      { active: true },
      { userId: "other" },
    ])
      expect(registrationSchema.safeParse({ ...input, ...extra }).success).toBe(
        false,
      );
    expect(
      registrationSchema.safeParse({ ...input, password: "short" }).success,
    ).toBe(false);
    expect(
      registrationSchema.safeParse({ ...input, name: "<img>" }).success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({ name: "Buyer", email: "other@example.com" })
        .success,
    ).toBe(false);
  });
  it("strips credentials and session internals from profile output", () => {
    const data = {
      id,
      name: "Buyer",
      email: "buyer@example.com",
      role: "customer" as const,
      active: true,
      createdAt: "",
      sessionVersion: 3,
      passwordHash: "private",
      _id: "private",
    };
    expect(Object.keys(accountSummary(data)).sort()).toEqual([
      "active",
      "createdAt",
      "email",
      "id",
      "name",
      "role",
    ]);
  });
  it("uses exact placement-plus-writing cents and no raw export data", () => {
    const options = placementOptions(product);
    expect(options.writingOptions).toEqual([{ words: 500, priceCents: 2001 }]);
    expect(quotePlacement(options, 500)).toEqual({
      placementCents: 12345,
      writingCents: 2001,
      totalCents: 14346,
    });
    expect(quotePlacement(options, 0).totalCents).toBe(12345);
    expect(() => quotePlacement(options, 750)).toThrow(/unavailable/);
    expect(JSON.stringify(options)).not.toMatch(
      /private|source|externalId|Article_Price/,
    );
  });
  it.each(["", "0", "-1", "1e2", "1.005", "NaN", "9007199254740992.00"])(
    "rejects unavailable/unsafe writing amount %s",
    (amount) => {
      expect(
        placementOptions({ ...product, source: { Article_Price: amount } })
          .writingOptions,
      ).toEqual([]);
    },
  );
  it("offers placement only for manual products and rejects unsafe combinations", () => {
    expect(
      placementOptions({ ...product, source: undefined }).writingOptions,
    ).toEqual([]);
    expect(
      placementOptions({
        ...product,
        priceCents: Number.MAX_SAFE_INTEGER,
        source: { Article_Price: "0.01" },
      }).writingOptions,
    ).toEqual([]);
    expect(() => placementOptions({ ...product, priceCents: 0 })).toThrow();
  });
  it("refuses browser price, quantity, owner, unsupported options and unsafe versions", () => {
    const input = {
      version: 0,
      item: { productId: id, productVersion: 2, writingWords: 500 },
    };
    expect(cartPutSchema.safeParse(input).success).toBe(true);
    for (const extra of [{ totalCents: 1 }, { ownerId: id }, { quantity: 10 }])
      expect(
        cartPutSchema.safeParse({ ...input, item: { ...input.item, ...extra } })
          .success,
      ).toBe(false);
    expect(cartPutSchema.safeParse({ ...input, ownerId: id }).success).toBe(
      false,
    );
    expect(cartPutSchema.safeParse({ ...input, version: -1 }).success).toBe(
      false,
    );
    expect(
      cartPutSchema.safeParse({
        ...input,
        item: { ...input.item, writingWords: 250 },
      }).success,
    ).toBe(false);
  });
  it("recomputes live prices and blocks totals on changed or unavailable items", async () => {
    vi.mocked(availableProduct).mockResolvedValue(product);
    const saved = {
      version: 4,
      items: [{ productId: id, productVersion: 2, writingWords: 500 as const }],
    };
    expect((await cartView(saved)).totalCents).toBe(14346);
    vi.mocked(availableProduct).mockResolvedValue({
      ...product,
      version: 3,
      priceCents: 15000,
    });
    const changed = await cartView(saved);
    expect(changed.items[0].status).toBe("changed");
    expect(changed.items[0].totalCents).toBe(17001);
    expect(changed.totalCents).toBeNull();
    vi.mocked(availableProduct).mockResolvedValue(null);
    const unavailable = await cartView(saved);
    expect(unavailable.items[0].options).toBeNull();
    expect(unavailable.totalCents).toBeNull();
    expect(unavailable.checkoutAvailable).toBe(false);
  });
  it("does not substitute placement-only for a no-longer-available writing selection", async () => {
    vi.mocked(availableProduct).mockResolvedValue({
      ...product,
      source: undefined,
    });
    const view = await cartView({
      version: 1,
      items: [{ productId: id, productVersion: 2, writingWords: 500 }],
    });
    expect(view.items[0].status).toBe("unavailable");
    expect(view.items[0].totalCents).toBeNull();
    expect(view.totalCents).toBeNull();
  });
  it("rejects noncanonical and nonfinite signed-CSRF forms", () => {
    process.env.NEXTAUTH_SECRET = "QA-secret-not-production-".repeat(3);
    const token = csrfToken({ id });
    expect(validCsrf(token, { id })).toBe(true);
    expect(validCsrf(`${token}zz`, { id })).toBe(false);
    expect(validCsrf(token.replace(/\.\d+\./, ".NaN."), { id })).toBe(false);
    expect(validCsrf(token, { id: "other" })).toBe(false);
    const registration = csrfToken({ id }, "registration");
    expect(validCsrf(registration, { id }, "registration")).toBe(true);
    expect(validCsrf(registration, { id })).toBe(false);
    expect(validCsrf(token, { id }, "registration")).toBe(false);
  });
});
