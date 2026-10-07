import { notFound } from "next/navigation";
import { AdminPage } from "@/lib/admin-page";
import { RecordList } from "@/components/admin/record-list";
import { collections, type Collection } from "@/lib/cms/types";
export default async function Page({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  if (!collections.includes(collection as Collection)) notFound();
  return (
    <AdminPage collection={collection as Collection}>
      <RecordList key={collection} collection={collection as Collection} />
    </AdminPage>
  );
}
