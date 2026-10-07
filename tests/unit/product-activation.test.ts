import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/security/secret", () => ({
  authSecret: () => "isolated-unit-activation-secret-32characters",
}));
import {
  activationScopeSchema,
  activationCommitSchema,
  activationDigest,
  validActivationProduct,
  signActivation,
  validActivationProof,
} from "@/lib/commerce/activation-validation";
import type { Product } from "@/lib/commerce/types";
const importId = "06cd8282-0dda-411f-becf-2a8c081d693f";
const row: Product = {
  id: "09ac8282-0dda-411f-becf-2a8c081d693f",
  importId,
  version: 1,
  createdAt: "2026-10-06T00:00:00Z",
  updatedAt: "2026-10-06T00:00:00Z",
  externalId: "1",
  domain: "https://qa-activation.com",
  language: "English",
  country: "",
  category: "",
  priceCents: 8500,
  currency: "USD",
  status: "draft",
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
  linkType: "",
  turnaround: "",
  requirements: "",
  source: { Article_Price: "10" },
};
function proof() {
  return {
    importId,
    limit: 100,
    count: 1,
    sha256: activationDigest(importId, [row]),
    expires: Date.now() + 60000,
  };
}
describe("reviewed product activation", () => {
  it("requires one explicit import and bounds the batch", () => {
    expect(activationScopeSchema.parse({ importId }).limit).toBe(100);
    for (const limit of [0, 501, 1.5])
      expect(activationScopeSchema.safeParse({ importId, limit }).success).toBe(
        false,
      );
    expect(activationScopeSchema.safeParse({ importId: "all" }).success).toBe(
      false,
    );
  });
  it("rejects owner/status fields and string batch sizes", () => {
    expect(
      activationScopeSchema.safeParse({ importId, actorId: "someone" }).success,
    ).toBe(false);
    expect(
      activationScopeSchema.safeParse({ importId, limit: "100" }).success,
    ).toBe(false);
  });
  it("accepts valid draft data without inventing missing metrics", () => {
    expect(validActivationProduct(row)).toBe(true);
    expect(row.metrics.dr).toBeNull();
  });
  it("rejects active, malformed, nonpositive and unversioned listings", () => {
    for (const change of [
      { status: "active" },
      { domain: "https://localhost" },
      { priceCents: 0 },
      { version: 0 },
    ])
      expect(validActivationProduct({ ...row, ...change } as Product)).toBe(
        false,
      );
  });
  it("makes digest stable under row and field order", () => {
    const other = { ...row, id: "19ac8282-0dda-411f-becf-2a8c081d693f" };
    expect(activationDigest(importId, [row, other])).toBe(
      activationDigest(importId, [
        other,
        Object.fromEntries(Object.entries(row).reverse()) as unknown as Product,
      ]),
    );
  });
  it("detects changes to prices, versions, private writing tiers and scope", () => {
    const digest = activationDigest(importId, [row]);
    for (const change of [
      { priceCents: 9000 },
      { version: 2 },
      { source: { Article_Price: "20" } },
    ])
      expect(activationDigest(importId, [{ ...row, ...change }])).not.toBe(
        digest,
      );
    expect(activationDigest("another-import", [row])).not.toBe(digest);
  });
  it("binds a signed preview to its actor and exact count/limit/digest", () => {
    const input = proof();
    const signature = signActivation(input, "qa-admin");
    expect(validActivationProof(input, signature, "qa-admin")).toBe(true);
    expect(validActivationProof(input, signature, "other-admin")).toBe(false);
    expect(
      validActivationProof({ ...input, count: 2 }, signature, "qa-admin"),
    ).toBe(false);
    expect(
      validActivationProof({ ...input, limit: 500 }, signature, "qa-admin"),
    ).toBe(false);
  });
  it("rejects expired, excessively future and malformed proofs", () => {
    for (const expires of [Date.now() - 1, Date.now() + 3600000]) {
      const input = { ...proof(), expires };
      expect(
        validActivationProof(
          input,
          signActivation(input, "qa-admin"),
          "qa-admin",
        ),
      ).toBe(false);
    }
    expect(validActivationProof(proof(), "invalid", "qa-admin")).toBe(false);
  });
  it("requires literal confirmation and acknowledgement", () => {
    const input = {
      ...proof(),
      signature: "a".repeat(64),
      confirmation: "ACTIVATE REVIEWED LISTINGS",
      acknowledgeUnverifiedMetrics: true,
    };
    expect(activationCommitSchema.safeParse(input).success).toBe(true);
    expect(
      activationCommitSchema.safeParse({ ...input, confirmation: "yes" })
        .success,
    ).toBe(false);
    expect(
      activationCommitSchema.safeParse({
        ...input,
        acknowledgeUnverifiedMetrics: false,
      }).success,
    ).toBe(false);
    expect(
      activationCommitSchema.safeParse({ ...input, status: "active" }).success,
    ).toBe(false);
  });
});
