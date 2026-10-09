import type { Metadata } from "next";
import { CheckoutPage } from "@/components/cart/checkout-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Checkout review",
  description:
    "Prepare private billing details and review your placement plan. Saving billing information does not submit an order or authorize a payment.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CheckoutPage />;
}
