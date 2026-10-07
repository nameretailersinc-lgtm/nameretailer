import { z } from "zod";
import { briefIssue } from "./brief-validation";
import type { CartView } from "./cart-types";
import { countryCodes } from "./countries";
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (value) => !/[<>\u0000-\u001f\u007f]/u.test(value),
      "Use plain text without HTML or control characters.",
    );
export const billingSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    firstName: text(100).min(1),
    lastName: text(100).min(1),
    country: z
      .string()
      .refine((value) => countryCodes.includes(value), "Choose a country."),
    street: text(200).min(1),
    apartment: text(200).default(""),
    city: text(100).min(1),
    region: text(100).default(""),
    postalCode: text(30).default(""),
    phone: text(50).default(""),
  })
  .strict();
export const checkoutPutSchema = z
  .object({
    version: z
      .number()
      .int()
      .min(0)
      .max(Number.MAX_SAFE_INTEGER - 1),
    cartVersion: z
      .number()
      .int()
      .min(0)
      .max(Number.MAX_SAFE_INTEGER - 1),
    billing: billingSchema,
    notes: z
      .string()
      .trim()
      .max(4000)
      .refine(
        (value) =>
          !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value),
        "Use plain-text notes.",
      ),
    paymentPreference: z.enum(["stripe", "paypal"]),
  })
  .strict();
export type BillingDetails = z.infer<typeof billingSchema>;
export function checkoutIssues(cart: CartView) {
  const issues: string[] = [];
  if (!cart.items.length) issues.push("Add a publication to your cart first.");
  if (cart.totalCents === null)
    issues.push("Review changed or unavailable listings in your cart.");
  for (const item of cart.items) {
    const issue = briefIssue(item, !!item.file);
    if (issue) issues.push(`${item.domain || "Publication"}: ${issue}`);
  }
  return issues;
}
