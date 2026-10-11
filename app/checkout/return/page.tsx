import type { Metadata } from "next";
import { PaymentResult } from "@/components/cart/payment-result";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <PaymentResult />;
}
