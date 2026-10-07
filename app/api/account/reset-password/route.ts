import { createHash } from "node:crypto";
import { ApiError, body, handle, json } from "@/lib/api";
import { sameOrigin } from "@/lib/security/csrf";
import { clientAddress, rateLimit } from "@/lib/security/rate-limit";
import { hashPassword } from "@/lib/security/password";
import { store, userTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
export const POST = (request: Request) =>
  handle(async () => {
    if (!sameOrigin(request))
      throw new ApiError(403, "Invalid request origin.");
    if (
      !(await rateLimit(
        `reset-use:${clientAddress(request.headers)}`,
        20,
        3600,
      ))
    )
      throw new ApiError(429, "Too many attempts. Try again later.");
    const { token, password } = z
      .object({
        token: z.string().min(32).max(100),
        password: z.string().min(12).max(256),
      })
      .parse(await body(request));
    const { db, users } = await store();
    const digest = createHash("sha256").update(token).digest("hex");
    const passwordHash = await hashPassword(password);
    await userTransaction(async (session) => {
      const reset = await db
        .collection<{ userId: string; digest: string; expiresAt: Date }>(
          "cms_resets",
        )
        .findOneAndDelete(
          { digest, expiresAt: { $gt: new Date() } },
          { session },
        );
      if (!reset)
        throw new ApiError(
          422,
          "This reset link is invalid or expired. Request a new one.",
        );
      const changed = await users.updateOne(
        { id: reset.userId, active: true },
        {
          $set: { passwordHash, updatedAt: new Date().toISOString() },
          $inc: { sessionVersion: 1 },
        },
        { session },
      );
      if (!changed.modifiedCount)
        throw new ApiError(
          422,
          "This reset link is invalid or expired. Request a new one.",
        );
      await logAudit(
        reset.userId,
        "password.reset",
        "users",
        reset.userId,
        "",
        session,
      );
    });
    return json({
      data: { message: "Password updated. Sign in with your new password." },
    });
  });
