import { AdminPage } from "@/lib/admin-page";
import { currentUser } from "@/lib/auth";
import { getRecord } from "@/lib/cms/service";
import { sanitizeBody } from "@/lib/cms/content";
import { redirect, notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/admin/login/");
  if (user.role === "customer") redirect("/admin/login/?error=AccessDenied");
  let record;
  try {
    record = await getRecord("content", (await params).id, user);
  } catch (error) {
    if (error instanceof ApiError && [403, 404].includes(error.status))
      notFound();
    throw error;
  }
  return (
    <AdminPage>
      <section className="container">
        <p className="eyebrow">
          Private preview · {record.status} · not indexed
        </p>
        <h1>{record.title}</h1>
        <article
          className="prose"
          dangerouslySetInnerHTML={{
            __html: sanitizeBody(String(record.data.body || "")),
          }}
        />
      </section>
    </AdminPage>
  );
}
