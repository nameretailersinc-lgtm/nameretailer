import { priceBreakdown, priceCsv, priceReportReady } from "@/lib/commerce/price-breakdown";
export async function GET() {
  const data = await priceBreakdown().catch(() => null);
  if (!data || !priceReportReady(data)) return new Response("Dated catalogue price tables are unavailable.", { status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  return new Response(priceCsv(data), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="guest-post-prices-${data.asOf!.slice(0, 10)}.csv"`, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
