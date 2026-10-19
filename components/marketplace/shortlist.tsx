"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/admin/primitives";
import { createShortlistStore } from "@/lib/commerce/shortlist";
import type { PublicProduct } from "@/lib/commerce/types";
import { trackEvent } from "@/lib/analytics/events";

type Store = ReturnType<typeof createShortlistStore>;
const Context = createContext<Store | null>(null);
function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("Shortlist controls require their provider");
  return store;
}
function trackedToggle(store: Store, product: PublicProduct) {
  const action = store.toggle(product);
  if (action) trackEvent("shortlist", { product_id: product.id, action });
}
export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createShortlistStore);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useShortlist() {
  const store = useStore();
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    ...snapshot,
    clear: store.clear,
    toggle: (product: PublicProduct) => trackedToggle(store, product),
  };
}
/** Subscribe each listing to its own highlight, without rerendering the catalogue. */
export function ShortlistListing({
  as,
  productId,
  className,
  children,
}: {
  as: "tr" | "article";
  productId: string;
  className?: string;
  children: ReactNode;
}) {
  const store = useStore();
  const selected = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().items.some((item) => item.id === productId),
    () => false,
  );
  const Element = as;
  return (
    <Element className={className} data-shortlisted={selected || undefined}>
      {children}
    </Element>
  );
}
export function ShortlistButton({
  product,
  showLabel = false,
}: {
  product: PublicProduct;
  showLabel?: boolean;
}) {
  const store = useStore();
  const selection = useSyncExternalStore(
    store.subscribe,
    () => {
      const { items } = store.getSnapshot();
      return (
        (items.some((item) => item.id === product.id) ? 1 : 0) |
        (items.length >= 4 ? 2 : 0)
      );
    },
    () => 0,
  );
  const selected = !!(selection & 1);
  const label = selected ? "Remove from shortlist" : "Shortlist";
  return (
    <Button
      variant="secondary"
      className="marketplace-bookmark"
      aria-label={label}
      title={label}
      aria-pressed={selected}
      disabled={!!(selection & 2) && !selected}
      onClick={() => trackedToggle(store, product)}
    >
      <Bookmark
        size={18}
        aria-hidden="true"
        fill={selected ? "currentColor" : "none"}
      />
      {showLabel && <span className="marketplace-bookmark-label">{label}</span>}
    </Button>
  );
}
