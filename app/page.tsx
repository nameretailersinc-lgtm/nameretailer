import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Marketplace } from "@/components/marketplace/marketplace";
import { LandingExplore } from "@/components/site/directory-page";
export const metadata: Metadata = {
  title: { absolute: "Guest Posting Sites & Marketplace | Name Retailer" },
  description:
    "Compare guest posting sites by niche, country, DA, DR, traffic and price, then shortlist publishers and plan placements with Name Retailer.",
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
      <Marketplace>
        <LandingExplore />
      </Marketplace>
    </Suspense>
  );
}
