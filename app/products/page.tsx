import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Marketplace } from "@/components/marketplace/marketplace";
export const metadata: Metadata = {
  title: "Guest Post Marketplace and Prices",
  description:
    "Browse guest-post publisher listings by topic, location, language, price and metrics, then plan your placements with Name Retailer.",
  alternates: { canonical: "https://nameretailer.com/" },
};
// Render on the server per request so headings and links are in the HTML,
// instead of bailing out to client-only rendering for useSearchParams.
export default async function ProductsPage() {
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
