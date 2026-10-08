import { Suspense } from "react";
import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace/marketplace";
export const metadata: Metadata = {
  title: "Guest-Post Marketplace: Publisher Listings and Prices",
  description:
    "Browse guest-post publisher listings by topic, location, language, placement price and supplied metrics, then plan your placements and content with Name Retailer.",
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
