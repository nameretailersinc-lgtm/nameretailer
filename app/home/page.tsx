import type { Metadata } from "next";
import { Suspense } from "react";
import { Marketplace } from "@/components/marketplace/marketplace";
import { HomeLanding } from "@/components/site/home";
export const metadata: Metadata = {
  title: { absolute: "Guest-post marketplace | Name Retailer" },
  description:
    "Browse publisher listings by topic, location, language, placement price and supplied metrics.",
  robots: { index: false, follow: false },
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
