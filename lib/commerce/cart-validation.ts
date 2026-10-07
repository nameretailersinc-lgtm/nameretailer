import { z } from "zod";
import { placementBriefSchema } from "./brief-validation";
const version = z
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER - 1);
export const cartSelectionSchema = z
  .object({
    productId: z.uuid(),
    productVersion: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    writingWords: z.union([
      z.literal(0),
      z.literal(500),
      z.literal(750),
      z.literal(1000),
    ]),
    brief: placementBriefSchema.optional(),
  })
  .strict();
export const cartPutSchema = z
  .object({ version, item: cartSelectionSchema })
  .strict();
export const cartDeleteSchema = z
  .object({ version, productId: z.uuid() })
  .strict();
