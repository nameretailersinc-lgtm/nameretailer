import type { Metadata } from "next";
import { z } from "zod";
import { CartPage } from "@/components/cart/cart-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your shopping cart",
  description:
    "Review placement briefs, article packages and current USD prices before preparing checkout. Payments are not connected in this preview.",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const parsed = z.uuid().safeParse((await searchParams).product);
  return (
    <CartPage
      key={parsed.success ? parsed.data : "cart"}
      productId={parsed.success ? parsed.data : undefined}
    />
  );
}
