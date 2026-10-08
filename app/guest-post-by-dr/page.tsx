import { Suspense } from "react";
import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace/marketplace";
export const metadata: Metadata = {
  title: "Guest post sites by Domain Rating",
  description:
    "Compare active guest-post publications by supplied Domain Rating, audience fit and placement price.",
};
export default function Page() {
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
