import { authenticated, handle, ApiError } from "@/lib/api";
import { store } from "@/lib/db";
import { exportRecords } from "@/lib/cms/exports";
import { collectionName } from "@/lib/cms/service";
import { logAudit } from "@/lib/audit";
export const GET = (request: Request) =>
  handle(async () => {
    const user = await authenticated(request, true);
    const params = new URL(request.url).searchParams;
    const format = params.get("format") || "json";
    if (!["json", "csv", "wxr"].includes(format))
      throw new ApiError(422, "Choose JSON, CSV or WXR.");
    const collection = params.get("collection");
    const records = await (
      await store()
    ).records
      .find(collection ? { collection: collectionName(collection) } : {}, {
        projection: { _id: 0 },
      })
      .toArray();
    const result = exportRecords(records, format as "json" | "csv" | "wxr");
    await logAudit(user.id, "export", collection || "all", "", format);
    return new Response(result.body, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  });
