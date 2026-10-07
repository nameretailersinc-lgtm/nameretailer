import { randomUUID } from "node:crypto";
import { store } from "./db";
import type { ClientSession } from "mongodb";
export async function logAudit(
  actorId: string,
  action: string,
  collection = "",
  recordId = "",
  detail = "",
  session?: ClientSession,
) {
  await (
    await store()
  ).audit.insertOne(
    {
      id: randomUUID(),
      actorId,
      action,
      collection,
      recordId,
      detail: detail.slice(0, 500),
      createdAt: new Date().toISOString(),
    },
    { session },
  );
}
