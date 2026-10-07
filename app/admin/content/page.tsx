import { AdminPage } from "@/lib/admin-page";
import { RecordList } from "@/components/admin/record-list";
export default function Page() {
  return (
    <AdminPage>
      <RecordList collection="content" />
    </AdminPage>
  );
}
