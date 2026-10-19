import { z } from "zod";
import { randomUUID } from "node:crypto";
import { ApiError, body, handle, json } from "@/lib/api";
import { getDb } from "@/lib/db";
import { optionalMobileIdentity } from "@/lib/mobile-auth";
import { clientAddress, rateLimit } from "@/lib/security/rate-limit";
import { sendInquiryMail } from "@/lib/mail";
import { INQUIRY_SUCCESS } from "@/lib/inquiries";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  domain: z.string().trim().max(255).optional().default(""),
  message: z.string().trim().min(5).max(2000),
  phone: z.string().trim().max(50).optional().default(""),
  companyWebsite: z.string().max(500).optional().default(""),
});

export const POST = (request: Request) =>
  handle(async () => {
    const raw = await body(request);
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      throw new ApiError(
        422,
        parsed.error.issues[0]?.message || "Invalid inquiry data.",
      );
    }
    if (parsed.data.companyWebsite)
      return json({ success: true, message: INQUIRY_SUCCESS });
    if (
      !(await rateLimit(
        `inquiry:address:${clientAddress(request.headers)}`,
        30,
        3600,
      )) ||
      !(await rateLimit(`inquiry:email:${parsed.data.email}`, 5, 3600))
    )
      throw new ApiError(429, "Too many requests. Please try again later.");

    const identity = await optionalMobileIdentity(request);
    const db = await getDb();
    const collection = db.collection("cms_leads");

    const { companyWebsite: _honeypot, ...details } = parsed.data;
    void _honeypot;
    const record = {
      id: randomUUID(),
      ...details,
      userId: identity?.id ?? null,
      source: "mobile-app",
      createdAt: new Date().toISOString(),
      notification: "pending",
    };

    await collection.insertOne(record);
    let notification = "not-configured";
    try {
      notification = (await sendInquiryMail({
        ...record,
        websiteUrl: record.domain,
        anchor: "",
        budget: "",
        placements: [],
      }))
        ? "sent"
        : "not-configured";
    } catch {
      notification = "failed";
    }
    await collection
      .updateOne({ id: record.id }, { $set: { notification } })
      .catch(() => {
        console.error(
          "Mobile inquiry saved; notification status update failed.",
        );
      });

    return json({
      success: true,
      message: INQUIRY_SUCCESS,
    });
  });
