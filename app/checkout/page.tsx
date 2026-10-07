import type { Metadata } from "next";
import { CheckoutPage } from "@/components/cart/checkout-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Checkout review",
  description:
    "Prepare private billing details and review publication placement briefs. Payments are not connected in this preview.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CheckoutPage />;
}
