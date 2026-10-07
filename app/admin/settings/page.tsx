import { AdminPage } from "@/lib/admin-page";
import { Settings } from "@/components/admin/settings";
export default function Page() {
  return (
    <AdminPage adminOnly>
      <Settings />
    </AdminPage>
  );
}
