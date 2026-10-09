import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Marketplace } from "@/components/marketplace/marketplace";
export const metadata: Metadata = {
  title: { absolute: "Guest Post Marketplace and Prices | Name Retailer" },
  description:
    "Browse guest-post publisher listings by topic, location, language, price and metrics, then plan your placements with Name Retailer.",
  alternates: { canonical: "https://nameretailer.com/" },
};
// The marketplace is the landing page. /home/ keeps the original home page.
export default async function Root() {
  await connection();
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
