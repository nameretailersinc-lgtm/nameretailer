import { AdminPage } from "@/lib/admin-page";
import { Products } from "@/components/admin/products";
export default function ProductsPage() {
  return (
    <AdminPage adminOnly>
      <Products />
    </AdminPage>
  );
}
