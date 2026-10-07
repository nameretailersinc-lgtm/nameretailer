import { createHash, randomBytes } from "node:crypto";
import { ApiError, body, handle, json } from "@/lib/api";
import { sameOrigin } from "@/lib/security/csrf";
import { clientAddress, rateLimit } from "@/lib/security/rate-limit";
import { store } from "@/lib/db";
import { resetMailAvailable, sendResetMail } from "@/lib/mail";
import { z } from "zod";
export const POST = (request: Request) =>
  handle(async () => {
    if (!sameOrigin(request))
      throw new ApiError(403, "Invalid request origin.");
    const { email } = z
      .object({ email: z.email().max(254) })
      .parse(await body(request));
    if (
      !(await rateLimit(
        `reset:ip:${clientAddress(request.headers)}`,
        20,
        3600,
      )) ||
      !(await rateLimit(`reset:${email.toLowerCase()}`, 3, 3600))
    )
      throw new ApiError(429, "Too many attempts. Try again later.");
    if (!resetMailAvailable())
      throw new ApiError(
        503,
        "Password reset email is not configured. Contact the administrator.",
      );
    const { db, users } = await store();
    const user = await users.findOne({
      email: email.toLowerCase(),
      active: true,
    });
    if (user) {
      const token = randomBytes(32).toString("base64url");
      const digest = createHash("sha256").update(token).digest("hex");
      await db.collection("cms_resets").deleteMany({ userId: user.id });
      await db.collection("cms_resets").insertOne({
        userId: user.id,
        digest,
        expiresAt: new Date(Date.now() + 1800000),
      });
      const origin = new URL(process.env.NEXTAUTH_URL || request.url).origin;
      await sendResetMail(
        user.email,
        `${origin}${user.role === "customer" ? "/my-account" : "/admin"}/reset-password/?token=${token}`,
      );
    }
    return json({
      data: { message: "If that account exists, a reset link has been sent." },
    });
  });
