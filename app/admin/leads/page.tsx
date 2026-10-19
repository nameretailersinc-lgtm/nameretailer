import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AdminPage } from "@/lib/admin-page";
import { getDb } from "@/lib/db";

export default async function Page() {
  const user = await currentUser();
  if (!user || user.role !== "admin") redirect("/admin/login/");
  const leads = await (await getDb()).collection("cms_leads").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(200).toArray();
  return <AdminPage adminOnly><section><h1>Placement inquiries</h1><p>Latest 200 requests. Notification status records the SMTP result.</p>
    {!leads.length && <p>No inquiries yet.</p>}
    {leads.map(lead => <article className="admin-card" key={String(lead.id)}>
      <h2>{String(lead.name || "Inquiry")}</h2><p>{String(lead.email || "")} · {String(lead.createdAt || "")}</p>
      <dl>{["id", "websiteUrl", "domain", "anchor", "budget", "message", "source", "notification"].filter(key => lead[key]).map(key => <div key={key}><dt>{key}</dt><dd style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{String(lead[key])}</dd></div>)}</dl>
      {Array.isArray(lead.placements) && <ul>{lead.placements.map((item: { id: string; domain: string; priceCents: number }) => <li key={item.id}>{item.domain} · USD {(item.priceCents / 100).toFixed(2)} · {item.id}</li>)}</ul>}
    </article>)}
  </section></AdminPage>;
}
