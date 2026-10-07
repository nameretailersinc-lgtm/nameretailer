import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";
import { z } from "zod";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "My account",
  description: "Manage your Name Retailer customer account.",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; returnTo?: string }>;
}) {
  const query = await searchParams;
  const parsed = z.uuid().safeParse(query.product);
  return (
    <AccountPage
      productId={
        query.returnTo === "cart" && parsed.success ? parsed.data : undefined
      }
    />
  );
}
