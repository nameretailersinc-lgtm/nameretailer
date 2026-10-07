import "dotenv/config";
import { getDb } from "../../lib/db";
import {
  activationDigest,
  activationScopeSchema,
  validActivationProduct,
} from "../../lib/commerce/activation-validation";
import type { Product } from "../../lib/commerce/types";
// Read-only operator report. There is intentionally no commit flag in this command.
try {
  const { importId, limit } = activationScopeSchema.parse({
    importId: process.argv[2],
    limit: Number(process.argv[3] || 100),
  });
  const db = await getDb();
  const batch = await db
    .collection<{
      _id: string;
      status: string;
      count: number;
      excluded: number;
    }>("commerce_imports")
    .findOne(
      { _id: importId },
      { projection: { status: 1, count: 1, excluded: 1 } },
    );
  if (!batch || batch.status !== "committed")
    throw new Error("Completed import required.");
  const firstBatch: Product[] = [];
  let drafts = 0,
    invalid = 0,
    missingMetricCells = 0;
  const cursor = db
    .collection<Product>("commerce_products")
    .find({ importId, status: "draft" }, { projection: { _id: 0 } })
    .sort({ id: 1 });
  for await (const row of cursor) {
    drafts++;
    if (!validActivationProduct(row)) invalid++;
    missingMetricCells += Object.values(row.metrics).filter(
      (value) => value === null,
    ).length;
    if (firstBatch.length < limit) firstBatch.push(row);
  }
  console.log(
    JSON.stringify(
      {
        mode: "READ_ONLY_PREVIEW",
        importId,
        committedImportCount: batch.count,
        excludedSourceRows: batch.excluded,
        remainingDrafts: drafts,
        invalidDrafts: invalid,
        missingMetricCells,
        proposedFirstBatch: firstBatch.length,
        firstBatchSha256: activationDigest(importId, firstBatch),
        activated: 0,
        note: "Review and explicitly confirm exact batches in /admin/products/. Metrics remain owner-supplied; no orders or payments enabled.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
} catch {
  console.error(
    "Activation preview failed. Check the import ID and database configuration; sensitive details omitted.",
  );
  process.exit(1);
}
