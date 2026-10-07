import type { ClientSession } from "mongodb";
import { getDb, userTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { productStore } from "./products";
import { ProductError } from "./errors";
import {
  activationCommitSchema,
  activationScopeSchema,
  activationDigest,
  validActivationProduct,
  signActivation,
  validActivationProof,
} from "./activation-validation";
async function candidates(
  importId: string,
  limit: number,
  session?: ClientSession,
) {
  const { imports, products } = await productStore();
  if (
    !(await imports.findOne(
      { _id: importId, status: "committed" },
      { session, projection: { _id: 1 } },
    ))
  )
    throw new ProductError(404, "Choose a completed import batch.");
  return products
    .find({ importId, status: "draft" }, { session, projection: { _id: 0 } })
    .sort({ id: 1 })
    .limit(limit)
    .toArray();
}
export async function previewActivation(raw: unknown, actorId: string) {
  const { importId, limit } = activationScopeSchema.parse(raw);
  const rows = await candidates(importId, limit);
  const { products } = await productStore();
  const remainingDrafts = await products.countDocuments({
    importId,
    status: "draft",
  });
  const invalid = rows.filter((row) => !validActivationProduct(row)).length;
  const proof = {
    importId,
    limit,
    sha256: activationDigest(importId, rows),
    count: rows.length,
    expires: Date.now() + 15 * 60 * 1000,
  };
  return {
    ...proof,
    signature: signActivation(proof, actorId),
    remainingDrafts,
    invalid,
    canActivate: rows.length > 0 && invalid === 0,
    rows: rows.map(
      ({
        id,
        domain,
        version,
        priceCents,
        currency,
        country,
        language,
        category,
        metrics,
      }) => ({
        id,
        domain,
        version,
        priceCents,
        currency,
        country,
        language,
        category,
        missingMetrics: Object.values(metrics).filter((value) => value === null)
          .length,
      }),
    ),
  };
}
export async function commitActivation(raw: unknown, actorId: string) {
  const { importId, limit, sha256, count, expires, signature } =
    activationCommitSchema.parse(raw);
  const proof = { importId, limit, sha256, count, expires };
  if (!validActivationProof(proof, signature, actorId))
    throw new ProductError(
      409,
      "The activation preview expired or is invalid. Preview again.",
    );
  return userTransaction(async (session) => {
    if (
      !(await (
        await getDb()
      )
        .collection("cms_users")
        .findOne(
          { id: actorId, role: "admin", active: true },
          { session, projection: { _id: 1 } },
        ))
    )
      throw new ProductError(
        403,
        "Only an active administrator can activate products.",
      );
    if (!validActivationProof(proof, signature, actorId))
      throw new ProductError(
        409,
        "The activation preview expired. Preview again.",
      );
    const rows = await candidates(importId, limit, session);
    if (rows.length !== count || activationDigest(importId, rows) !== sha256)
      throw new ProductError(
        409,
        "The selected listings changed. Preview again before activation.",
      );
    if (rows.some((row) => !validActivationProduct(row)))
      throw new ProductError(
        422,
        "Resolve invalid listing data before activation.",
      );
    const { products } = await productStore();
    const result = await products.bulkWrite(
      rows.map((row) => ({
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
      { session, ordered: true },
    );
    if (result.modifiedCount !== count)
      throw new ProductError(
        409,
        "A listing changed. No batch activation was committed; preview again.",
      );
    await logAudit(
      actorId,
      "products.activate.reviewed",
      "products",
      importId,
      `${count} listings activated; preview ${sha256}. Metrics remain owner-supplied, not independently verified.`,
      session,
    );
    return { activated: count, importId };
  });
}
