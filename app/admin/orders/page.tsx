import { AdminPage } from "@/lib/admin-page";
import { Orders } from "@/components/admin/orders";
export default function Page() {
  return (
    <AdminPage adminOnly>
      <Orders />
    </AdminPage>
  );
}
