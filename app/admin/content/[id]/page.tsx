import { AdminPage } from "@/lib/admin-page";
import { ContentEditor } from "@/components/admin/content-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminPage>
      <ContentEditor key={id} id={id} />
    </AdminPage>
  );
}
