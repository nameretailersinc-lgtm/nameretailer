import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), findOne: vi.fn(), update: vi.fn(), audit: vi.fn(), invalidate: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: async () => ({ collection: () => ({ findOne: mocks.admin }) }), userTransaction: async (fn: (session: object) => Promise<unknown>) => fn({ testSession: true }) }));
vi.mock("@/lib/commerce/products", () => ({ productStore: async () => ({ products: { findOne: mocks.findOne, updateOne: mocks.update } }) }));
vi.mock("@/lib/commerce/publication-profiles", () => ({ activePublicationFilter: async () => ({ status: "active", $or: [{ importId: { $exists: false } }, { importId: { $in: ["committed"] } }] }) }));
vi.mock("@/lib/audit", () => ({ logAudit: mocks.audit }));
vi.mock("@/lib/cache/ttl", () => ({ invalidateTtlCache: mocks.invalidate }));
import { savePublicationContent } from "@/lib/commerce/publication-content-store";

const raw = { version: 3, state: "reviewed", description: "Synthetic QA description; not real publisher information.", sourceUrl: "https://example.com/editorial", checkedAt: "2026-01-01" };
beforeEach(() => {
  vi.clearAllMocks(); mocks.admin.mockResolvedValue({ id: "admin" }); mocks.update.mockResolvedValue({ modifiedCount: 1 });
  mocks.findOne.mockResolvedValue({ id: "listing", domain: "https://example.com", version: 3, priceCents: 10000, category: "Business", country: "US", language: "English", metrics: {}, currency: "USD", status: "active" });
});

it("records the actual administrator, increments the same product version and audits the transaction", async () => {
  const result = await savePublicationContent("listing", raw, "admin");
  expect(mocks.admin.mock.calls[0][0]).toEqual({ id: "admin", active: true, role: "admin" });
  expect(result.publicationContent).toMatchObject({ domain: "https://example.com", reviewedBy: "admin", state: "reviewed" });
  expect(result.version).toBe(4);
  expect(mocks.update.mock.calls[0][0]).toEqual({ id: "listing", version: 3 });
  expect(mocks.update.mock.calls[0][1].$inc).toEqual({ version: 1 });
  expect(mocks.findOne.mock.calls[0][0].$and[1].$or).toContainEqual({ importId: { $in: ["committed"] } });
  expect(mocks.audit).toHaveBeenCalledWith("admin", "publication.content.reviewed", "products", "listing", expect.any(String), expect.objectContaining({ testSession: true }));
  expect(mocks.invalidate).toHaveBeenCalledWith("indexable-publication-profiles");
});

it("rejects inactive administrators, missing records and stale versions without a write", async () => {
  mocks.admin.mockResolvedValueOnce(null);
  await expect(savePublicationContent("listing", raw, "editor")).rejects.toMatchObject({ status: 403 });
  mocks.findOne.mockResolvedValueOnce(null);
  await expect(savePublicationContent("listing", raw, "admin")).rejects.toMatchObject({ status: 404 });
  await expect(savePublicationContent("listing", { ...raw, version: 2 }, "admin")).rejects.toMatchObject({ status: 409 });
  expect(mocks.update).not.toHaveBeenCalled();
});

it("does not publish or stamp private drafts, and rejects concurrent update conflicts", async () => {
  const result = await savePublicationContent("listing", { version: 3, state: "draft", description: "Private draft." }, "admin");
  expect(result.publicationContent).not.toHaveProperty("reviewedBy");
  expect(result.publicationContent).not.toHaveProperty("reviewedAt");
  mocks.update.mockResolvedValueOnce({ modifiedCount: 0 });
  await expect(savePublicationContent("listing", raw, "admin")).rejects.toMatchObject({ status: 409 });
});
