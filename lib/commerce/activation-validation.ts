import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { authSecret } from "@/lib/security/secret";
import { productInputSchema } from "./validation";
import type { Product } from "./types";
export const activationScopeSchema = z
  .object({
    importId: z.uuid(),
    limit: z.number().int().min(1).max(500).default(100),
  })
  .strict();
export const activationCommitSchema = activationScopeSchema
  .extend({
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    count: z.number().int().min(1).max(500),
    expires: z.number().int().positive(),
    signature: z.string().regex(/^[a-f0-9]{64}$/),
    confirmation: z.literal("ACTIVATE REVIEWED LISTINGS"),
    acknowledgeUnverifiedMetrics: z.literal(true),
  })
  .strict();
export function validActivationProduct(product: Product) {
  if (
    product.status !== "draft" ||
    !Number.isSafeInteger(product.version) ||
    product.version < 1
  )
    return false;
  const input = Object.fromEntries(
    Object.keys(productInputSchema.shape).map((key) => [
      key,
      product[key as keyof Product],
    ]),
  );
  const parsed = productInputSchema.safeParse(input);
  return parsed.success && parsed.data.domain === product.domain;
}
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "_id")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
}
export function activationDigest(importId: string, products: Product[]) {
  return createHash("sha256")
    .update(
      JSON.stringify(
        canonical({
          importId,
          products: [...products].sort((a, b) => a.id.localeCompare(b.id)),
        }),
      ),
    )
    .digest("hex");
}
export type ActivationProof = {
  importId: string;
  limit: number;
  sha256: string;
  count: number;
  expires: number;
};
export function signActivation(proof: ActivationProof, actorId: string) {
  const secret = authSecret();
  if (!secret) throw new Error("Authentication secret is not configured.");
  return createHmac("sha256", secret)
    .update(`products:activate:${actorId}:${JSON.stringify(proof)}`)
    .digest("hex");
}
export function validActivationProof(
  proof: ActivationProof,
  signature: string,
  actorId: string,
) {
  if (
    !/^[a-f0-9]{64}$/.test(signature) ||
    proof.expires < Date.now() ||
    proof.expires > Date.now() + 15 * 60 * 1000
  )
    return false;
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(signActivation(proof, actorId), "hex"),
  );
}
