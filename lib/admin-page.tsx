import { redirect } from "next/navigation";
import { currentUser } from "./auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { canAccess } from "./security/permissions";
import type { Collection } from "./cms/types";
export async function AdminPage({
  children,
  adminOnly = false,
  collection,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  collection?: Collection;
}) {
  const user = await currentUser();
  if (!user) redirect("/admin/login/");
  if (user.role === "customer") redirect("/admin/login/?error=AccessDenied");
  if (
    (adminOnly && user.role !== "admin") ||
    (collection && !canAccess(user, collection))
  )
    return (
      <AdminShell user={user}>
        <section>
          <h1>Access restricted</h1>
          <p>Your role cannot access this area.</p>
        </section>
      </AdminShell>
    );
  return <AdminShell user={user}>{children}</AdminShell>;
}
