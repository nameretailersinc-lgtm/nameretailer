import { authenticated, handle, json } from "@/lib/api";
import { collectionName, getRecord } from "@/lib/cms/service";
import { store } from "@/lib/db";
export const GET = (
  request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
) =>
  handle(async () => {
    const { collection, id } = await context.params;
    const user = await authenticated(request);
    await getRecord(collectionName(collection), id, user);
    return json({
      data: await (
        await store()
      ).revisions
        .find({ recordId: id }, { projection: { _id: 0 } })
        .sort({ version: -1 })
        .limit(100)
        .toArray(),
    });
  });
