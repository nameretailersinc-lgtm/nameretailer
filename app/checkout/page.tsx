import type { Metadata } from "next";
import { CheckoutPage } from "@/components/cart/checkout-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Secure checkout",
  description:
    "Review your placement details and pay securely with Stripe or PayPal.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CheckoutPage />;
}
