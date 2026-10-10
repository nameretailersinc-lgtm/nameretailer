import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  rows: vi.fn(),
  imports: vi.fn(),
}));
vi.mock("@/lib/commerce/products", () => ({
  productStore: async () => ({
    products: { find: mocks.find, findOne: mocks.findOne },
    imports: { find: () => ({ toArray: mocks.imports }) },
  }),
}));
import {
  publicationProfile,
  profileSitemapEntries,
} from "@/lib/commerce/publication-profiles";

const listing = {
  id: "aabbccdd-1111-2222-3333-444444444444",
  domain: "https://0000yic.com",
  category: "Business",
  metrics: { dr: 12, da: 9, traffic: null, spamScore: null },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.imports.mockResolvedValue([{ _id: "committed-batch" }]);
  mocks.rows.mockResolvedValue([]);
  mocks.findOne.mockResolvedValue(null);
  mocks.find.mockImplementation(() => {
    const cursor = { sort: () => cursor, maxTimeMS: () => cursor, toArray: mocks.rows };
    return cursor;
  });
});

it("resolves ordinary listings using active and committed-import visibility", async () => {
  mocks.rows.mockResolvedValue([listing]);
  expect(await publicationProfile("0000yic-com")).toEqual(listing);
  const filter = mocks.find.mock.calls[0][0].$and[0];
  expect(filter).toEqual({
    status: "active",
    $or: [
      { importId: { $exists: false } },
      { importId: { $in: ["committed-batch"] } },
    ],
  });
  expect(mocks.find.mock.calls[0][1].projection).not.toHaveProperty("source");
  expect(await publicationProfile("missing-com")).toBeNull();
});

it("requires a section listing ID to match both its host and section path", async () => {
  const section = { ...listing, domain: "https://example.com/blog/" };
  mocks.findOne.mockResolvedValue(section);
  expect(await publicationProfile("example-com", section.id)).toEqual(section);
  expect(mocks.findOne.mock.calls[0][0]).toMatchObject({
    id: section.id,
    status: "active",
    $or: [
      { importId: { $exists: false } },
      { importId: { $in: ["committed-batch"] } },
    ],
  });
  expect(await publicationProfile("other-com", section.id)).toBeNull();
  mocks.findOne.mockResolvedValue({
    ...section,
    domain: "https://example.com",
  });
  expect(await publicationProfile("example-com", section.id)).toBeNull();
});

it("rejects invalid route parameters without querying the database", async () => {
  expect(await publicationProfile("example.*")).toBeNull();
  expect(await publicationProfile("example-com", "../bad")).toBeNull();
  expect(mocks.find).not.toHaveBeenCalled();
  expect(mocks.findOne).not.toHaveBeenCalled();
});

it("keeps ordinary and section listings out of the profile sitemap", async () => {
  const strong = {
    ...listing,
    domain: "https://artnews.com",
    metrics: { dr: 80, da: 75, traffic: 900_000, spamScore: 2 },
  };
  mocks.rows.mockResolvedValue([
    listing,
    strong,
    { ...strong, domain: "https://artnews.com/blog/" },
  ]);
  expect(await profileSitemapEntries()).toEqual([]);
  expect(mocks.find.mock.calls[0][0]).toMatchObject({
    status: "active",
    "metrics.traffic": { $gte: 500_000 },
    "metrics.dr": { $gte: 60 },
  });
});
