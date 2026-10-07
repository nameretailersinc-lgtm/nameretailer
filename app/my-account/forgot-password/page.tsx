import type { Metadata } from "next";
import { CustomerPasswordReset } from "@/components/account/password-reset";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CustomerPasswordReset />;
}
