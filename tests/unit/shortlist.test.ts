import { describe, expect, it } from "vitest";
import { createShortlistStore } from "../../lib/commerce/shortlist";
import type { PublicProduct } from "../../lib/commerce/types";

const product = (id: string) =>
  ({ id, domain: `https://${id}.example/` }) as PublicProduct;

describe("visit shortlist", () => {
  it("keeps four unique selections, permits removal at capacity and frees the slot", () => {
    const store = createShortlistStore();
    for (const id of ["a", "b", "c", "d"])
      expect(store.toggle(product(id))).toBe("add");
    expect(store.toggle(product("e"))).toBeUndefined();
    expect(store.getSnapshot().items.map((item) => item.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(store.toggle(product("b"))).toBe("remove");
    expect(store.toggle(product("e"))).toBe("add");
    expect(store.getSnapshot().items.map((item) => item.id)).toEqual([
      "a",
      "c",
      "d",
      "e",
    ]);
  });

  it("isolates separate visits and retains an empty stable server snapshot", () => {
    const first = createShortlistStore();
    const second = createShortlistStore();
    const server = first.getServerSnapshot();
    first.toggle(product("a"));
    expect(first.getServerSnapshot()).toBe(server);
    expect(server.items).toEqual([]);
    expect(second.getSnapshot().items).toEqual([]);
    first.clear();
    expect(first.getSnapshot().items).toEqual([]);
    expect(first.getSnapshot().status).toBe("Shortlist cleared.");
  });
});
