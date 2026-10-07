import { randomUUID } from "node:crypto";
import { ApiError, authenticated, body, handle, json } from "@/lib/api";
import { store, recordTransaction } from "@/lib/db";
import { parseRedirectCsv, validateRedirects } from "@/lib/cms/redirects";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import type { CmsRecord } from "@/lib/cms/types";
import { validateRecord } from "@/lib/cms/validation";
export const POST = (request: Request) =>
  handle(async () => {
    const user = await authenticated(request, true);
    const input = z
      .object({ csv: z.string().min(1).max(1000000) })
      .parse(await body(request));
    const { records } = await store();
    let parsed;
    try {
      parsed = parseRedirectCsv(input.csv);
      if (parsed.length > 1000)
        throw new Error("Import at most 1,000 redirects at once.");
      validateRedirects([
        ...(await records.find({ collection: "redirects" }).toArray()),
        ...parsed,
      ]);
    } catch (error) {
      throw new ApiError(
        422,
        error instanceof Error ? error.message : "Invalid redirect CSV.",
      );
    }
    const data = await recordTransaction(async (session) => {
      const existing = await records
        .find({}, { projection: { _id: 0 }, session })
        .toArray();
      const batch: CmsRecord[] = [];
      const now = new Date().toISOString();
      try {
        for (const row of parsed) {
          const normalized = validateRecord("redirects", row, [
            ...existing,
            ...batch,
          ]);
          batch.push({
            ...normalized,
            id: randomUUID(),
            collection: "redirects",
            ownerId: user.id,
            version: 1,
            createdAt: now,
            updatedAt: now,
          });
        }
      } catch (error) {
        throw new ApiError(
          422,
          error instanceof Error ? error.message : "Invalid redirect CSV.",
        );
      }
      if (batch.length)
        await records.insertMany(batch, { ordered: true, session });
      await logAudit(
        user.id,
        "redirect.import",
        "redirects",
        "",
        `${batch.length} rows; no public activation in Phase 3`,
        session,
      );
      return batch;
    });
    return json({ data, count: data.length }, 201);
  });
