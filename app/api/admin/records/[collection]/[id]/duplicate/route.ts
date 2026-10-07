import { authenticated, handle, json } from "@/lib/api";
import { collectionName, duplicateRecord } from "@/lib/cms/service";
export const POST = (
  request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
) =>
  handle(async () => {
    const { collection, id } = await context.params;
    return json(
      {
        data: await duplicateRecord(
          collectionName(collection),
          id,
          await authenticated(request),
        ),
      },
      201,
    );
  });
