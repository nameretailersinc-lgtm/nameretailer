import { ApiError, handle, json } from "@/lib/api";
import { getDb } from "@/lib/db";
import { toolInput } from "@/lib/tools/server";
import { normalizeProductDomain } from "@/lib/commerce/validation";
import type { Product } from "@/lib/commerce/types";
export function POST(request: Request) {
  return handle(async () => {
    const input = await toolInput(request, "rating");
    const lines = input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length || lines.length > 30)
      throw new ApiError(422, "Use 1–30 domains, one per line.");
    let domains: string[];
    try {
      domains = [...new Set(lines.map(normalizeProductDomain))];
    } catch {
      throw new ApiError(
        422,
        "One or more domains are invalid. Use public domain names, not private addresses.",
      );
    }
    const db = await getDb();
    const imports = await db
      .collection<{ _id: string }>("commerce_imports")
      .find({ status: "committed" }, { projection: { _id: 1 } })
      .toArray();
    const records = await db
      .collection<Product>("commerce_products")
      .find(
        {
          domain: { $in: domains },
          status: "active",
          $or: [
            { importId: { $exists: false } },
            { importId: { $in: imports.map((item) => item._id) } },
          ],
        },
        { projection: { _id: 0, domain: 1, "metrics.dr": 1, "metrics.da": 1 } },
      )
      .toArray();
    const byDomain = new Map(records.map((row) => [row.domain, row]));
    return json({
      result:
        "Owner-supplied catalog scores — NOT a live Ahrefs check\nDomain\tDR\tDA\n" +
        domains
          .map((domain) => {
            const row = byDomain.get(domain);
            return `${new URL(domain).hostname}\t${row?.metrics?.dr ?? "Unavailable"}\t${row?.metrics?.da ?? "Unavailable"}${!row ? " · Not in active catalog" : ""}`;
          })
          .join("\n") +
        "\n\nProvider and observation dates are not supplied. Missing values are not zero. Activation is not verification.",
    });
  });
}
