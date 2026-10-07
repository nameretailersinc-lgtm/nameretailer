import { authenticated, body, handle, json } from "@/lib/api";
import { collectionName, createRecord, listRecords } from "@/lib/cms/service";
type Context = { params: Promise<{ collection: string }> };
export const GET = (request: Request, context: Context) =>
  handle(async () =>
    json(
      await listRecords(
        collectionName((await context.params).collection),
        request,
        await authenticated(request),
      ),
    ),
  );
export const POST = (request: Request, context: Context) =>
  handle(async () =>
    json(
      {
        data: await createRecord(
          collectionName((await context.params).collection),
          await body(request),
          await authenticated(request),
        ),
      },
      201,
    ),
  );
