import { PasswordReset } from "@/components/admin/password-reset";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PasswordReset token={token || ""} />;
}
