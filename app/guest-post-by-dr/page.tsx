import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Marketplace } from "@/components/marketplace/marketplace";
export const metadata: Metadata = {
  title: "Guest post sites by Domain Rating",
  description:
    "Compare active guest-post publications by supplied Domain Rating, audience fit and USD placement price, then shortlist sites that match your campaign.",
};
export default async function Page() {
  await connection();
  return (
    <Suspense
      fallback={
        <main id="main" tabIndex={-1}>
          <p>Loading marketplace…</p>
        </main>
      }
    >
      <Marketplace metricView />
    </Suspense>
  );
}
