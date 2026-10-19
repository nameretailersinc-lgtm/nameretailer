import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { PublicProduct } from "@/lib/commerce/types";
const mocks = vi.hoisted(() => ({ profile: vi.fn() }));
vi.mock("@/lib/commerce/publication-profiles", () => ({
  publicationProfile: mocks.profile,
  publicationIndexable: async () => false,
  relatedProfiles: async () => [],
}));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/lib/commerce/catalogue-summary", () => ({
  catalogueSummary: async () => null,
}));
vi.mock("@/components/site/information-page", () => ({
  InformationShell: ({ children }: { children: React.ReactNode }) =>
    React.createElement("main", null, children),
}));
import Page from "@/app/publication/[domain]/page";
const product: PublicProduct = {
  id: "11111111-1111-4111-8111-111111111111",
  domain: "https://example.com",
  category: "",
  country: "",
  language: "",
  priceCents: 10000,
  currency: "USD",
  status: "active",
  metrics: {
    dr: null,
    da: null,
    traffic: null,
    tf: null,
    ur: null,
    spamScore: null,
    referringDomains: null,
    backlinks: null,
  },
  linkType: "",
  turnaround: "",
  requirements: "",
  version: 1,
  createdAt: "2026-10-01",
  updatedAt: "2026-10-01",
};
beforeEach(() => {
  vi.stubGlobal("React", React);
  mocks.profile.mockResolvedValue(product);
});
afterEach(() => vi.unstubAllGlobals());
const props = {
  params: Promise.resolve({ domain: "example-com" }),
  searchParams: Promise.resolve({}),
};
it("omits headings and paragraphs for missing publisher fields and emits only visible FAQ answers", async () => {
  const html = renderToStaticMarkup(await Page(props));
  expect(html).not.toMatch(
    /Unavailable|unconfirmed|not supplied|Information to confirm|Audience evidence|Editorial requirements for|What is included\?|Exclusions and additional charges|Domain Rating|Domain Authority|Traffic estimate/,
  );
  expect(html).toContain("Request this placement");
  const match = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s,
  )!;
  const schema = JSON.parse(match[1]);
  expect(schema.mainEntity.mainEntity).toHaveLength(1);
  const faq = schema.mainEntity.mainEntity[0];
  expect(html).toContain(faq.name);
  expect(html).toContain(faq.acceptedAnswer.text);
});
it("shows real requirements and zero-valued metrics without adding missing-field boilerplate", async () => {
  mocks.profile.mockResolvedValue({
    ...product,
    requirements: "Send an original article and image permissions.",
    metrics: { ...product.metrics, dr: 0, traffic: 0 },
  });
  const html = renderToStaticMarkup(await Page(props));
  expect(html).toContain("Send an original article and image permissions.");
  expect(html).toContain("Domain Rating");
  expect(html).toContain("Traffic estimate");
  expect(html).not.toContain("Domain Authority");
  expect(html).not.toContain("Unavailable");
});
