import { ApiError, authenticated, body, handle, json } from "@/lib/api";
import { collectionName, getRecord, updateRecord } from "@/lib/cms/service";
import { store } from "@/lib/db";
import { z } from "zod";
export const POST = (
  request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
) =>
  handle(async () => {
    const { collection, id } = await context.params;
    const user = await authenticated(request);
    const name = collectionName(collection);
    await getRecord(name, id, user);
    const input = z
      .object({
        revisionId: z.string().uuid(),
        version: z.number().int().positive(),
      })
      .parse(await body(request));
    const revision = await (
      await store()
    ).revisions.findOne({ id: input.revisionId, recordId: id });
    if (!revision) throw new ApiError(404, "Revision not found.");
    return json({
      data: await updateRecord(
        name,
        id,
        { ...revision.snapshot, status: "draft", version: input.version },
        user,
      ),
    });
  });
