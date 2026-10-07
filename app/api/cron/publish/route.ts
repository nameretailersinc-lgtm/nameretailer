import { timingSafeEqual } from "node:crypto";
import { ApiError, handle, json } from "@/lib/api";
import { publishScheduled } from "@/lib/cms/scheduled";
export const POST = (request: Request) =>
  handle(async () => {
    const secret = process.env.CRON_SECRET;
    const provided =
      request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
    const expectedBytes = Buffer.from(secret || "");
    const providedBytes = Buffer.from(provided);
    if (
      !secret ||
      secret.length < 32 ||
      expectedBytes.length !== providedBytes.length ||
      !timingSafeEqual(expectedBytes, providedBytes)
    )
      throw new ApiError(401, "Unauthorized.");
    return json({ data: await publishScheduled() });
  });
