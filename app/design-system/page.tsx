import { AdminPage } from "@/lib/admin-page";
import { DesignGallery } from "@/components/design-gallery";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <AdminPage>
      <DesignGallery />
    </AdminPage>
  );
}
