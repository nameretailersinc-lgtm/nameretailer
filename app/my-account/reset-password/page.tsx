import type { Metadata } from "next";
import { CustomerPasswordReset } from "@/components/account/password-reset";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token;
  return (
    <CustomerPasswordReset
      token={
        typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token)
          ? token
          : undefined
      }
    />
  );
}
