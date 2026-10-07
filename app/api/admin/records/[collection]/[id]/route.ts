import { authenticated, body, handle, json } from "@/lib/api";
import {
  collectionName,
  getRecord,
  updateRecord,
  archiveRecord,
} from "@/lib/cms/service";
type Context = { params: Promise<{ collection: string; id: string }> };
export const GET = (request: Request, context: Context) =>
  handle(async () => {
    const { collection, id } = await context.params;
    return json({
      data: await getRecord(
        collectionName(collection),
        id,
        await authenticated(request),
      ),
    });
  });
export const PATCH = (request: Request, context: Context) =>
  handle(async () => {
    const { collection, id } = await context.params;
    const user = await authenticated(request);
    return json({
      data: await updateRecord(
        collectionName(collection),
        id,
        await body(request),
        user,
      ),
    });
  });
export const DELETE = (request: Request, context: Context) =>
  handle(async () => {
    const { collection, id } = await context.params;
    return json({
      data: await archiveRecord(
        collectionName(collection),
        id,
        await authenticated(request),
      ),
    });
  });
