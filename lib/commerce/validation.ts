import { z } from "zod";
import { isIP } from "node:net";
import type { ProductInput } from "./types";

/** Publisher URLs are identities, not arbitrary URLs or server-side fetch targets. */
export function normalizeProductDomain(value: string): string {
  const raw = value.trim();
  if (!raw || /[\s\\\u0000-\u001f\u007f]/u.test(raw))
    throw new Error("Enter a public domain without whitespace or backslashes.");
  if (raw.includes("?") || raw.includes("#") || raw.includes("@"))
    throw new Error(
      "Domain must not include credentials, query parameters or fragments.",
    );
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw))
    throw new Error("Only HTTP(S) domains are accepted.");
  if (
    raw.startsWith("/") ||
    (/^https?:\/\//i.test(raw) && !/^https?:\/\/[^/]/i.test(raw))
  )
    throw new Error(
      "Use a hostname or a complete HTTP(S) URL, not a protocol-relative or malformed URL.",
    );
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  // Reject even an explicitly written default port; URL.port normalizes :443 away.
  const authority = raw.replace(/^https?:\/\//i, "").split("/")[0];
  if (authority.includes(":"))
    throw new Error("Domain must not contain a port or IP address.");
  if (url.search || url.hash || url.username || url.password)
    throw new Error(
      "Publisher URL must not include credentials, queries or fragments.",
    );
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (
    isIP(hostname) ||
    hostname.length > 253 ||
    !hostname.includes(".") ||
    hostname.endsWith(".") ||
    /\.(localhost|local|internal|invalid|test|example)$/i.test(hostname) ||
    hostname
      .split(".")
      .some(
        (label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label),
      ) ||
    !/^[a-z][a-z0-9-]*$/i.test(hostname.split(".").at(-1) ?? "")
  )
    throw new Error(
      "Enter a valid public DNS hostname, not a local name or IP address.",
    );
  const originalPath = raw.replace(/^https?:\/\//i, "").slice(authority.length);
  if (originalPath.split("/").some((part) => /^(?:\.|%2e){1,2}$/i.test(part)))
    throw new Error("Publisher path must not contain dot-navigation segments.");
  if (
    /%(?![a-f0-9]{2})/i.test(url.pathname) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i.test(url.pathname)
  )
    throw new Error(
      "Publisher path contains an invalid or unsafe percent escape.",
    );
  const pathname = url.pathname.replace(
    /%([a-f0-9]{2})/gi,
    (match, hex: string) => {
      const decoded = String.fromCharCode(parseInt(hex, 16));
      return /[a-z0-9_~.-]/i.test(decoded) ? decoded : match.toUpperCase();
    },
  );
  return `https://${hostname}${pathname === "/" ? "" : pathname}`;
}

const plainText = (max: number) =>
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
const score = z.number().int().min(0).max(100).nullable();
const count = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable();
export const productInputSchema = z
  .object({
    externalId: plainText(128).min(1).nullable().default(null),
    domain: z
      .string()
      .max(2048)
      .transform((value, context) => {
        try {
          return normalizeProductDomain(value);
        } catch (error) {
          context.addIssue({
            code: "custom",
            message: error instanceof Error ? error.message : "Invalid domain.",
          });
          return z.NEVER;
        }
      }),
    language: plainText(160).default(""),
    country: plainText(160).default(""),
    category: plainText(200).default(""),
    priceCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    currency: z.literal("USD").default("USD"),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    metrics: z
      .object({
        da: score,
        dr: score,
        tf: score,
        ur: score,
        traffic: count,
        referringDomains: count,
        backlinks: count,
        spamScore: score,
      })
      .strict(),
    linkType: plainText(500).default(""),
    turnaround: plainText(200).default(""),
    requirements: plainText(10000).default(""),
  })
  .strict();

export function validateProduct(input: unknown): ProductInput {
  return productInputSchema.parse(input);
}

/** Exact decimal-to-cents conversion: never multiply binary floating-point prices. */
export function parseUsdCents(value: string): number {
  const raw = value.trim();
  if (!/^\d{1,16}(?:\.\d{1,2})?$/.test(raw))
    throw new Error(
      "Price must be an unsigned USD decimal with at most two fractional digits.",
    );
  const [whole, fraction = ""] = raw.split(".");
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (cents <= 0n || cents > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error(
      "Price must be positive and within the supported integer-cent range.",
    );
  return Number(cents);
}
