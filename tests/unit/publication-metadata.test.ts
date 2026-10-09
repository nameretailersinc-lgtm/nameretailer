import { beforeEach, expect, it, vi } from "vitest";
import type { PublicProduct } from "@/lib/commerce/types";

const mocks = vi.hoisted(() => ({ profile: vi.fn() }));
vi.mock("@/lib/commerce/publication-profiles", () => ({
  publicationProfile: mocks.profile,
  relatedProfiles: vi.fn(),
}));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("@/components/site/information-page", () => ({
  InformationShell: vi.fn(),
}));
vi.mock("@/components/cart/buy-placement", () => ({ BuyPlacement: vi.fn() }));
vi.mock("@/lib/commerce/catalogue-summary", () => ({
  catalogueSummary: vi.fn(),
}));
import { generateMetadata } from "@/app/publication/[domain]/page";

const listing: PublicProduct = {
  id: "aabbccdd-1111-2222-3333-444444444444",
  domain: "https://example.com",
  category: "Business",
  country: "United States",
  language: "English",
  priceCents: 15000,
  currency: "USD",
  status: "active",
  metrics: {
    dr: null,
    da: null,
    traffic: null,
    spamScore: null,
    tf: null,
    ur: null,
    referringDomains: null,
    backlinks: null,
  },
  linkType: "",
  turnaround: "",
  requirements: "",
  version: 1,
  createdAt: "2026-10-10T00:00:00.000Z",
  updatedAt: "2026-10-10T00:00:00.000Z",
};
const props = {
  params: Promise.resolve({ domain: "example-com" }),
  searchParams: Promise.resolve({}),
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.profile.mockResolvedValue(listing);
});

it("gives ordinary listings a canonical internal page with noindex, follow", async () => {
  const metadata = await generateMetadata(props);
  expect(metadata.alternates?.canonical).toBe(
    "https://nameretailer.com/publication/example-com/",
  );
  expect(metadata.robots).toEqual({ index: false, follow: true });
  expect(metadata.description).toContain("$150.00");
  expect(metadata.description).not.toMatch(/null|undefined|0 monthly visits/);
});

it("retains index eligibility for complete profiles and noindex for facets", async () => {
  mocks.profile.mockResolvedValue({
    ...listing,
    metrics: {
      ...listing.metrics,
      dr: 70,
      da: 60,
      traffic: 900_000,
      spamScore: 2,
    },
  });
  expect((await generateMetadata(props)).robots).toEqual({
    index: true,
    follow: true,
  });
  expect(
    (
      await generateMetadata({
        ...props,
        searchParams: Promise.resolve({ q: "example" }),
      })
    ).robots,
  ).toEqual({ index: false, follow: true });
});

it("uses a section listing's distinct URL and keeps it noindex", async () => {
  mocks.profile.mockResolvedValue({
    ...listing,
    domain: "https://example.com/blog/",
  });
  const metadata = await generateMetadata({
    ...props,
    params: Promise.resolve({ domain: "example-com", listing: listing.id }),
  });
  expect(metadata.alternates?.canonical).toBe(
    `https://nameretailer.com/publication/example-com/${listing.id}/`,
  );
  expect(metadata.robots).toEqual({ index: false, follow: true });
});

it("returns not found for a listing that is no longer available", async () => {
  mocks.profile.mockResolvedValue(null);
  await expect(generateMetadata(props)).rejects.toThrow("NOT_FOUND");
});
