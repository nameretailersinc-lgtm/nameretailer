import { it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ product: vi.fn(), batch: vi.fn() }));
vi.mock("@/lib/db", () => ({
  getDb: async () => ({
    collection: (name: string) => ({
      findOne: name === "commerce_products" ? mocks.product : mocks.batch,
    }),
  }),
  userTransaction: vi.fn(),
}));
import { availableProduct } from "@/lib/commerce/products";
it("options/cart only read active listings and hide staging/failed imports", async () => {
  mocks.product.mockResolvedValue({
    id: "product",
    status: "active",
    importId: "staged",
  });
  mocks.batch.mockResolvedValue(null);
  expect(await availableProduct("product")).toBeNull();
  expect(mocks.product.mock.calls[0][0]).toEqual({
    id: "product",
    status: "active",
  });
  expect(mocks.batch.mock.calls[0][0]).toEqual({
    _id: "staged",
    status: "committed",
  });
  mocks.batch.mockResolvedValue({ _id: "staged", status: "committed" });
  expect((await availableProduct("product"))?.id).toBe("product");
  mocks.product.mockResolvedValue(null);
  expect(await availableProduct("missing-or-draft")).toBeNull();
});
