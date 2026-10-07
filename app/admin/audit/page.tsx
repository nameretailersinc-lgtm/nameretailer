import { AdminPage } from "@/lib/admin-page";
import { Audit } from "@/components/admin/audit";
export default function Page() {
  return (
    <AdminPage adminOnly>
      <Audit />
    </AdminPage>
  );
}
