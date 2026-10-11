import { z } from "zod";
import { randomUUID } from "node:crypto";
import { ApiError, body, handle, json } from "@/lib/api";
import { getDb } from "@/lib/db";
import { optionalMobileIdentity } from "@/lib/mobile-auth";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  domain: z.string().trim().max(255).optional().default(""),
  message: z.string().trim().min(5).max(2000),
  phone: z.string().trim().max(50).optional().default(""),
});

export const POST = (request: Request) =>
  handle(async () => {
    const raw = await body(request);
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      throw new ApiError(422, parsed.error.issues[0]?.message || "Invalid inquiry data.");
    }

    const identity = await optionalMobileIdentity(request);
    const db = await getDb();
    const collection = db.collection("cms_leads");

    const record = {
      id: randomUUID(),
      ...parsed.data,
      userId: identity?.id ?? null,
      source: "mobile-app",
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(record);

    return json({
      success: true,
      message: "Thank you for your inquiry. Our team will review your placement request and respond shortly.",
    });
  });
