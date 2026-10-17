import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ page: vi.fn() }));
vi.mock("@/lib/commerce/public-page", () => ({
  publicProductPage: mocks.page,
}));
vi.mock("@/lib/commerce/catalogue-summary", () => ({
  catalogueSummary: async () => null,
}));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
// These presentation modules are irrelevant to route status and load browser CSS.
vi.mock("@/components/marketplace/marketplace", () => ({
  Marketplace: vi.fn(),
}));
vi.mock("@/components/site/chrome", () => ({
  SiteHeader: vi.fn(),
  SiteFooter: vi.fn(),
}));
vi.mock("@/components/site/homepage", () => ({
  HomepageHero: vi.fn(),
  HomepageCatalogHeading: vi.fn(),
  HomepageSections: vi.fn(),
}));
vi.mock("@/components/site/directory-page", () => ({
  DirectoryPage: vi.fn(),
  DirectoryLinks: vi.fn(),
}));
vi.mock("@/components/tools/presentation", () => ({
  ToolHero: vi.fn(),
  ToolSteps: vi.fn(),
  ToolsNext: vi.fn(),
  ToolsShell: vi.fn(),
}));
vi.mock("@/components/tools/workspace", () => ({ ToolWorkspace: vi.fn() }));
vi.mock("@/components/tools/readiness-guide", () => ({
  ReadinessGuide: vi.fn(),
}));

import { generateMetadata as ratingMetadata } from "@/app/guest-post-by-dr/page";
import { generateMetadata as rangeMetadata } from "@/app/[tool]/page";
import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import { marketplaceRanges } from "@/lib/commerce/marketplace-ranges";

beforeEach(() => {
  mocks.page.mockReset();
  mocks.page.mockResolvedValue({ page: 10000, data: [], total: 1 });
});

it("rejects nonexistent DR and range result pages before metadata is sent", async () => {
  const searchParams = Promise.resolve({ page: "10000" });
  await expect(ratingMetadata({ searchParams })).rejects.toThrow("NOT_FOUND");
  await expect(
    rangeMetadata({
      params: Promise.resolve({ tool: marketplaceRanges[0].slug }),
      searchParams,
    }),
  ).rejects.toThrow("NOT_FOUND");
});

it("also rejects empty pagination during server rendering", async () => {
  await expect(
    ServerMarketplace({
      searchParams: Promise.resolve({ page: "10000" }),
      metricView: true,
    }),
  ).rejects.toThrow("NOT_FOUND");
});

it("keeps empty filter results on page one as a usable noindex search state", async () => {
  mocks.page.mockResolvedValue({ page: 1, data: [], total: 0 });
  const metadata = await ratingMetadata({
    searchParams: Promise.resolve({ category: "no-match" }),
  });
  expect(metadata.robots).toEqual({ index: false, follow: true });
  expect(metadata.alternates?.canonical).toBe(
    "https://nameretailer.com/guest-post-by-dr/",
  );
});

it("retains self-canonical indexing for nonempty DR pagination", async () => {
  mocks.page.mockResolvedValue({
    page: 2,
    data: [{ id: "existing-publisher" }],
    total: 21,
  });
  const metadata = await ratingMetadata({
    searchParams: Promise.resolve({ page: "2" }),
  });
  expect(metadata.robots).toEqual({ index: true, follow: true });
  expect(metadata.alternates?.canonical).toBe(
    "https://nameretailer.com/guest-post-by-dr/?page=2",
  );
});
