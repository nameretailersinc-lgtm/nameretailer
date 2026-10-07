import { authenticated, body, handle, json } from "@/lib/api";
import { getDb } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/cms/validation";
import { logAudit } from "@/lib/audit";
export const GET = (request: Request) =>
  handle(async () => {
    await authenticated(request, true);
    return json({ data: await getSettings() });
  });
export const PATCH = (request: Request) =>
  handle(async () => {
    const user = await authenticated(request, true);
    const data = settingsSchema.parse(await body(request));
    await (
      await getDb()
    )
      .collection("cms_settings")
      .updateOne(
        { key: "site" },
        { $set: { data, updatedAt: new Date().toISOString() } },
        { upsert: true },
      );
    await logAudit(user.id, "settings.update", "settings", "site");
    return json({ data });
  });
