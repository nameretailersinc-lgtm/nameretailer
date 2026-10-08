import type { Metadata } from "next";
import { Suspense } from "react";
import { Marketplace } from "@/components/marketplace/marketplace";
import { HomeLanding } from "@/components/site/home";
export const metadata: Metadata = {
  title: { absolute: "Guest Post Marketplace: Compare Sites & Prices | Name Retailer" },
  description:
    "Browse guest-post publisher listings by topic, location, language, placement price and supplied metrics, then plan your placements and content with Name Retailer.",
};
export default function Home() {
  return (
    <Suspense
      fallback={
        <main id="main" tabIndex={-1}>
          <p>Loading marketplace…</p>
        </main>
      }
    >
   <HomeLanding />
    </Suspense>
  );
}
