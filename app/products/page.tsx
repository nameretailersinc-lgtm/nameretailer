import { Suspense } from "react";
import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace/marketplace";
export const metadata: Metadata = {
  title: "Guest-post marketplace",
  description:
    "Browse publisher listings by topic, location, language, placement price and supplied metrics.",
  robots: { index: false, follow: false },
};
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main id="main" tabIndex={-1}>
          <p>Loading marketplace…</p>
        </main>
      }
    >
      <Marketplace />
    </Suspense>
  );
}
