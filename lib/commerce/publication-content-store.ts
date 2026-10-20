import { getDb, userTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { invalidateTtlCache } from "@/lib/cache/ttl";
import { productStore } from "./products";
import { ProductError } from "./errors";
import { publicationContentInput, type PublicationContent } from "./publication-content";
import { activePublicationFilter } from "./publication-profiles";
import { publicProduct } from "./public-product";
import { publicationEditorialBrief } from "./publication-presentation";

export async function savePublicationContent(id: string, raw: unknown, actorId: string) {
  const { version, ...input } = publicationContentInput.parse(raw);
  const saved = await userTransaction(async (session) => {
    const db = await getDb();
    if (!(await db.collection("cms_users").findOne({ id: actorId, active: true, role: "admin" }, { session })))
      throw new ProductError(403, "Only an active administrator can review publication content.");
    const { products } = await productStore();
    const visible = await activePublicationFilter();
    const product = await products.findOne({ $and: [{ id }, { $or: visible.$or }] }, { session });
    if (!product) throw new ProductError(404, "Publication not found.");
    if (product.version !== version) throw new ProductError(409, "This publication changed. Reload before saving its profile.");
    const now = new Date().toISOString();
    const content: PublicationContent = { ...input, domain: product.domain,
      ...(input.state === "reviewed" ? { reviewedBy: actorId, reviewedAt: now } : {}),
    };
    const result = await products.updateOne({ id, version }, { $set: { publicationContent: content, updatedAt: now }, $inc: { version: 1 } }, { session });
    if (!result.modifiedCount) throw new ProductError(409, "This publication changed. Reload before saving its profile.");
    await logAudit(actorId, `publication.content.${input.state}`, "products", id, "Source-backed profile content updated", session);
    return { domain: product.domain, publicationContent: content, version: version + 1, brief: publicationEditorialBrief(publicProduct({ ...product, publicationContent: content, version: version + 1, updatedAt: now })) };
  });
  invalidateTtlCache("indexable-publication-profiles");
  invalidateTtlCache("indexable-publication-links");
  return saved;
}
