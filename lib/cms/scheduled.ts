import { randomUUID } from "node:crypto";
import { store, recordTransaction } from "@/lib/db";
import { validateRecord } from "./validation";
import { logAudit } from "@/lib/audit";
import { invalidate } from "./invalidation";
export async function publishScheduled() {
  const { records, revisions } = await store();
  const now = new Date().toISOString();
  const due = await records
    .find(
      {
        collection: "content",
        status: "scheduled",
        "data.scheduledAt": { $lte: now },
      },
      { projection: { _id: 0 } },
    )
    .limit(100)
    .toArray();
  let published = 0;
  let skipped = 0;
  for (const old of due) {
    try {
      const changed = await recordTransaction(async (session) => {
        const all = await records
          .find({}, { projection: { _id: 0 }, session })
          .toArray();
        const input = validateRecord(
          "content",
          {
            ...old,
            status: "published",
            data: {
              ...old.data,
              publishedAt: old.data.publishedAt || now,
              scheduledAt: null,
            },
          },
          all,
          old.id,
        );
        const next = {
          ...old,
          ...input,
          version: old.version + 1,
          updatedAt: now,
        };
        const result = await records.replaceOne(
          { id: old.id, version: old.version, status: "scheduled" },
          next,
          { session },
        );
        if (!result.modifiedCount) return false;
        await revisions.insertOne(
          {
            id: randomUUID(),
            recordId: old.id,
            version: old.version,
            snapshot: old,
            actorId: "scheduled-publisher",
            createdAt: now,
          },
          { session },
        );
        await logAudit(
          "scheduled-publisher",
          "content.publish.scheduled",
          "content",
          old.id,
          "",
          session,
        );
        return true;
      });
      if (changed) {
        invalidate("content", old.slug);
        published++;
      } else skipped++;
    } catch {
      skipped++;
      await logAudit(
        "scheduled-publisher",
        "content.schedule.blocked",
        "content",
        old.id,
        "Publication validation failed; review the scheduled content.",
      );
    }
  }
  return { published, skipped };
}
