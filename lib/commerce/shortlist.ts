import type { PublicProduct } from "./types";
import { publicationHost } from "./publication-pages";

export function createShortlistStore() {
  const initial = { items: [] as PublicProduct[], status: "" };
  let snapshot = initial;
  const listeners = new Set<() => void>();
  function update(items: PublicProduct[], status: string) {
    snapshot = { items, status };
    for (const listener of listeners) listener();
  }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    toggle(product: PublicProduct): "add" | "remove" | undefined {
      const name = publicationHost(product.domain, false) || product.domain;
      if (snapshot.items.some((item) => item.id === product.id)) {
        update(
          snapshot.items.filter((item) => item.id !== product.id),
          `${name} removed from your shortlist.`,
        );
        return "remove";
      }
      if (snapshot.items.length >= 4) {
        update(
          snapshot.items,
          "Your shortlist is limited to four publications. Remove one to add another.",
        );
        return;
      }
      update([...snapshot.items, product], `${name} added to your shortlist.`);
      return "add";
    },
    clear() {
      update([], "Shortlist cleared.");
    },
  };
}
