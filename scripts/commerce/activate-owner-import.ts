import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, open } from "node:fs/promises";
import path from "node:path";
import { getDb, userTransaction } from "../../lib/db";
import { logAudit } from "../../lib/audit";
import {
  activationDigest,
  validActivationProduct,
} from "../../lib/commerce/activation-validation";
import type { Product } from "../../lib/commerce/types";
const args = process.argv.slice(2);
const importId = args
  .find((value) => value.startsWith("--import-id="))
  ?.slice(12);
const expected = Number(
  args.find((value) => value.startsWith("--expected="))?.slice(11),
);
const approved = args.find((value) => value.startsWith("--sha256="))?.slice(9);
try {
  if (
    !importId ||
    !/^[a-f0-9-]{36}$/.test(importId) ||
    !Number.isSafeInteger(expected) ||
    expected < 1
  )
    throw new Error("Exact import ID and expected count required.");
  const db = await getDb();
  if (
    !(await db
      .collection<{ _id: string; status: string }>("commerce_imports")
      .findOne({ _id: importId, status: "committed" }))
  )
    throw new Error("Completed import required.");
  const products = db.collection<Product>("commerce_products");
  const rows = await products
    .find({ importId, status: "draft" }, { projection: { _id: 0 } })
    .sort({ id: 1 })
    .toArray();
  if (
    rows.length !== expected ||
    rows.some((row) => !validActivationProduct(row))
  )
    throw new Error("Unexpected count or invalid listing. Nothing activated.");
  const sha256 = activationDigest(importId, rows);
  if (!args.includes("--commit")) {
    console.log(
      JSON.stringify({
        mode: "PREVIEW",
        importId,
        count: rows.length,
        sha256,
        activated: 0,
      }),
    );
    process.exit(0);
  }
  if (approved !== sha256)
    throw new Error("Review fingerprint mismatch. Preview again.");
  const operationId = randomUUID();
  const backupDirectory = path.resolve(
    ".local",
    "activation-backups",
    operationId,
  );
  await mkdir(backupDirectory, { recursive: true });
  const backup = await open(
    path.join(backupDirectory, "products.jsonl"),
    "wx",
    0o600,
  );
  try {
    for (const row of rows) await backup.write(JSON.stringify(row) + "\n");
  } finally {
    await backup.close();
  }
  const manifest = {
    operationId,
    importId,
    count: expected,
    sha256,
    createdAt: new Date().toISOString(),
    reason: "Owner explicitly requested all imported publications visible.",
    backup: "products.jsonl",
  };
  await writeFile(
    path.join(backupDirectory, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    { flag: "wx", mode: 0o600 },
  );
  let activated = 0;
  for (let start = 0; start < rows.length; start += 500) {
    const batch = rows.slice(start, start + 500);
    await userTransaction(async (session) => {
      const current = await products
        .find(
          { id: { $in: batch.map((row) => row.id) }, importId },
          { session, projection: { _id: 0 } },
        )
        .toArray();
      if (
        activationDigest(importId, current) !==
        activationDigest(importId, batch)
      )
        throw new Error(
          "A listing changed; operation stopped before this batch.",
        );
      const result = await products.bulkWrite(
        batch.map((row) => ({
          updateOne: {
            filter: {
              id: row.id,
              importId,
              status: "draft",
              version: row.version,
            },
            update: {
              $set: {
                status: "active" as const,
                updatedAt: new Date().toISOString(),
              },
              $inc: { version: 1 },
            },
          },
        })),
        { ordered: true, session },
      );
      if (result.modifiedCount !== batch.length)
        throw new Error("Batch conflict; transaction not committed.");
      await logAudit(
        "owner-authorized-cli",
        "products.activate.owner-approved",
        "products",
        importId,
        `Operation ${operationId}; batch ${start / 500 + 1}; ${batch.length} products. Metrics remain owner-supplied.`,
        session,
      );
    });
    activated += batch.length;
    if (activated % 5000 === 0 || activated === expected)
      console.log(JSON.stringify({ activated, expected }));
  }
  const active = await products.countDocuments({ importId, status: "active" });
  const drafts = await products.countDocuments({ importId, status: "draft" });
  await writeFile(
    path.join(backupDirectory, "completed.json"),
    JSON.stringify({ active, drafts, completedAt: new Date().toISOString() }),
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    JSON.stringify({
      mode: "COMMITTED",
      operationId,
      active,
      drafts,
      backupDirectory,
      ordersCreated: 0,
    }),
  );
  process.exit(0);
} catch {
  console.error(
    "Owner activation stopped. Sensitive details omitted. Earlier completed batches, if any, remain active; inspect audit and the private activation backup before retrying.",
  );
  process.exit(1);
}
