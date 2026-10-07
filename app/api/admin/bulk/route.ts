import { ApiError, authenticated, body, handle, json } from "@/lib/api";
import {
  collectionName,
  getRecord,
  validated,
  invalidate,
} from "@/lib/cms/service";
import { store, recordTransaction } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { logAudit } from "@/lib/audit";
import { canEdit, canPublish } from "@/lib/security/permissions";
import { z } from "zod";
export const POST = (request: Request) =>
  handle(async () => {
    const user = await authenticated(request);
    const input = z
      .object({
        collection: z.string(),
        ids: z.array(z.string().uuid()).min(1).max(100),
        action: z.enum(["publish", "archive", "delete"]),
      })
      .parse(await body(request));
    const collection = collectionName(input.collection);
    if (
      input.action === "publish" &&
      (!canPublish(user) || collection !== "content")
    )
      throw new ApiError(403, "Only editors and admins can publish content.");
    const old = await Promise.all(
      input.ids.map((id) => getRecord(collection, id, user)),
    );
    if (old.some((record) => !canEdit(user, record)))
      throw new ApiError(
        403,
        "You cannot change one or more selected records.",
      );
    const data = await recordTransaction(async (session) => {
      const { records, revisions } = await store();
      const result = [];
      for (const record of old) {
        const validatedInput = await validated(
          collection,
          {
            ...record,
            status: input.action === "publish" ? "published" : "archived",
          },
          record.id,
          session,
        );
        if (
          collection === "content" &&
          validatedInput.status === "published" &&
          !validatedInput.data.publishedAt
        )
          validatedInput.data.publishedAt = new Date().toISOString();
        const next = {
          ...record,
          ...validatedInput,
          version: record.version + 1,
          updatedAt: new Date().toISOString(),
        };
        const changed = await records.replaceOne(
          { id: record.id, version: record.version },
          next,
          { session },
        );
        if (!changed.modifiedCount)
          throw new ApiError(
            409,
            "A selected record changed elsewhere. Reload and retry. No bulk changes were saved.",
          );
        await revisions.insertOne(
          {
            id: randomUUID(),
            recordId: record.id,
            version: record.version,
            snapshot: record,
            actorId: user.id,
            createdAt: next.updatedAt,
          },
          { session },
        );
        await logAudit(
          user.id,
          `bulk.${input.action}`,
          collection,
          record.id,
          "",
          session,
        );
        result.push(next);
      }
      return result;
    });
    for (const record of data) invalidate(collection, record.slug);
    return json({ data });
  });
