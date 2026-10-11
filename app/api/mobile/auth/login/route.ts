import { z } from "zod";
import { ApiError, body, handle, json } from "@/lib/api";
import { store } from "@/lib/db";
import { verifyPassword } from "@/lib/security/password";
import { rateLimit } from "@/lib/security/rate-limit";
import { signMobileToken } from "@/lib/mobile-auth";
import { accountSummary } from "@/lib/account";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(1).max(256),
});

export const POST = (request: Request) =>
  handle(async () => {
    const raw = await body(request);
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ApiError(400, "Please provide a valid email and password.");
    }
    const { email, password } = parsed.data;

    if (
      !(await rateLimit(`login:${email}`, 15, 900)) ||
      !(await rateLimit("login:global", 500, 900))
    ) {
      throw new ApiError(429, "Too many login attempts. Please try again later.");
    }

    const { users } = await store();
    const user = await users.findOne({ email, active: true });

    const dummyHash = `scrypt:${"0".repeat(64)}:${"0".repeat(128)}`;
    const isValid = await verifyPassword(
      password,
      user?.passwordHash || dummyHash,
    );

    if (!user || !isValid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Check customer-friendly scope: admin accounts can authenticate but are scoped
    const token = signMobileToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    });

    return json({
      token,
      user: accountSummary(user),
    });
  });
