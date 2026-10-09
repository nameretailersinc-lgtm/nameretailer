import { expect, it } from "vitest";
import { supportedTrustClaims, trustClaims } from "@/lib/config/trust";
it("ships without numeric or customer-proof claims", () => {
  expect(trustClaims).toEqual([]);
});
it("omits statements that lack a source or a valid observation date", () => {
  const claim = {
    label: "Supplied statement",
    evidenceUrl: "https://example.com/evidence",
    evidenceDate: "2026-01-01",
  };
  expect(
    supportedTrustClaims([
      claim,
      { ...claim, evidenceUrl: "" },
      { ...claim, evidenceDate: "2099-01-01" },
    ]),
  ).toEqual([claim]);
});
