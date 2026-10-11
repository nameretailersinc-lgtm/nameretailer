import type { Metadata } from "next";
import { OrdersPage } from "@/components/cart/payment-result";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <OrdersPage />;
}
