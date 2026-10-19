import { z } from "zod";
import { randomUUID } from "node:crypto";
import { ApiError } from "./api";
import { getDb } from "./db";
import { activePublicationFilter } from "./commerce/publication-profiles";
import { productStore } from "./commerce/products";
import { sendInquiryMail } from "./mail";

export const INQUIRY_SUCCESS = "Thanks, we'll reply within 1 business day.";
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (value) =>
        !/[\u0000-\u001f\u007f<>]/u.test(value.replace(/[\r\n\t]/g, "")),
      "Use plain text.",
    );
export const inquiryInput = z
  .object({
    name: text(120).min(1),
    email: z
      .string()
      .trim()
      .pipe(z.email().max(254))
      .transform((value) => value.toLowerCase()),
    websiteUrl: z
      .url()
      .max(2048)
      .refine((value) => {
        if (!URL.canParse(value)) return false;
        const url = new URL(value);
        return (
          ["https:", "http:"].includes(url.protocol) &&
          !url.username &&
          !url.password
        );
      }, "Enter an HTTP or HTTPS website URL."),
    anchor: text(250).min(1),
    budget: text(120).min(1),
    message: text(4000).min(5),
    companyWebsite: z.string().max(500).default(""),
    productIds: z.array(z.uuid()).max(50).default([]),
  })
  .strict();

export async function saveInquiry(input: z.infer<typeof inquiryInput>) {
  const ids = [...new Set(input.productIds)];
  const { products } = await productStore();
  const rows = ids.length
    ? await products
        .find(
          {
            $and: [await activePublicationFilter(), { id: { $in: ids } }],
          },
          {
            projection: {
              _id: 0,
              id: 1,
              domain: 1,
              priceCents: 1,
              currency: 1,
            },
          },
        )
        .toArray()
    : [];
  if (rows.length !== ids.length)
    throw new ApiError(
      409,
      "A selected publication has changed. Refresh your shortlist and try again.",
    );
  const { companyWebsite: _honeypot, productIds: _ids, ...details } = input;
  void _honeypot;
  void _ids;
  const record = {
    id: randomUUID(),
    ...details,
    placements: ids.map((id) => {
      const row = rows.find((row) => row.id === id)!;
      return {
        id: row.id,
        domain: row.domain,
        priceCents: row.priceCents,
        currency: row.currency,
      };
    }),
    source: "website",
    status: "new",
    createdAt: new Date().toISOString(),
    notification: "pending",
  };
  const leads = (await getDb()).collection("cms_leads");
  await leads.insertOne(record);
  let notification = "not-configured";
  try {
    notification = (await sendInquiryMail(record)) ? "sent" : "not-configured";
  } catch {
    notification = "failed";
  }
  await leads
    .updateOne({ id: record.id }, { $set: { notification } })
    .catch(() => {
      console.error("Inquiry saved; notification status update failed.");
    });
  return record.id;
}
