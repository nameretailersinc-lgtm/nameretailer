import { z } from "zod";
import type { CartSelection } from "./cart-types";
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (value) =>
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value) &&
        !/<\/?[a-z!][^>]*>/i.test(value),
      "Use plain text without HTML or control characters.",
    );
export const promotedUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .transform((value, ctx) => {
    try {
      if (
        !/^https?:\/\//i.test(value) ||
        /[\s\\\u0000-\u001f\u007f]/u.test(value)
      )
        throw new Error();
      const url = new URL(value);
      const host = url.hostname;
      if (
        url.username ||
        url.password ||
        url.port ||
        !host.includes(".") ||
        !/^[a-z0-9.-]+$/i.test(host) ||
        /^[\d.]+$/.test(host) ||
        /\.(localhost|local|internal|invalid|test|example)$/i.test(host) ||
        host.endsWith(".") ||
        host
          .split(".")
          .some(
            (label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label),
          )
      )
        throw new Error();
      return url.href;
    } catch {
      ctx.addIssue({
        code: "custom",
        message:
          "Enter a complete public HTTP(S) destination URL, without credentials or a port.",
      });
      return z.NEVER;
    }
  });
export const placementBriefSchema = z
  .object({
    promotedUrl: promotedUrlSchema,
    keyword: text(200).min(1, "Enter the keyword or anchor text."),
    specialRequirements: text(4000).default(""),
    articleText: text(40000).default(""),
    fileId: z.uuid().nullable().default(null),
  })
  .strict();
export function briefIssue(item: CartSelection, fileAvailable: boolean) {
  if (!item.brief)
    return "Add the destination URL, keyword and article details.";
  if (item.brief.fileId && !fileAvailable)
    return "Your article file expired or is unavailable. Upload it again.";
  if (!item.writingWords && !item.brief.articleText && !fileAvailable)
    return "Supply your article as text or upload an available article file.";
  if (item.writingWords && !item.brief.articleText)
    return "Add an article brief for the selected writing package.";
  return null;
}
