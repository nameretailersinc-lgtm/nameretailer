import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const id = createHash("sha256").update(`${key}:${bucket}`).digest("hex");
  const limits = (await getDb()).collection<{
    _id: string;
    count: number;
    expiresAt: Date;
  }>("cms_limits");
  let result;
  try {
    result = await limits.findOneAndUpdate(
      { _id: id },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          expiresAt: new Date((bucket + 2) * windowSeconds * 1000),
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      error.code !== 11000
    )
      throw error;
    result = await limits.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 } },
      { returnDocument: "after" },
    );
  }
  return (result?.count || 0) <= limit;
}
export function clientAddress(headers: Headers) {
  return process.env.TRUST_PROXY === "true"
    ? headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"
    : "untrusted";
}
