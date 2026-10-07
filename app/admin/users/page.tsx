import { AdminPage } from "@/lib/admin-page";
import { Users } from "@/components/admin/users";
export default function Page() {
  return (
    <AdminPage adminOnly>
      <Users />
    </AdminPage>
  );
}
