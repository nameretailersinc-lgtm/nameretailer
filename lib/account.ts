import { randomUUID } from "node:crypto";
import type { ClientSession } from "mongodb";
import { z } from "zod";
import { ApiError } from "./api";
import { currentIdentity } from "./auth";
import { store, userTransaction } from "./db";
import { logAudit } from "./audit";
import { hashPassword } from "./security/password";
import { sameOrigin, validCsrf } from "./security/csrf";
import { clientAddress, rateLimit } from "./security/rate-limit";
import type { User, UserSummary } from "./cms/types";

export type AccountIdentity = UserSummary & { sessionVersion: number };
export const accountName = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .refine(
    (value) => !/[<>\u0000-\u001f\u007f]/u.test(value),
    "Use a name without HTML or control characters.",
  );
export const registrationSchema = z
  .object({
    name: accountName,
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    password: z.string().min(12).max(256),
    website: z.string().max(200).default(""),
  })
  .strict();
export const profileSchema = z.object({ name: accountName }).strict();
export const registrationMessage =
  "If this email is eligible, your account is ready. Sign in, or use password reset for an existing account.";

let accountIndexes: Promise<unknown> | undefined;
export async function setupAccounts() {
  if (!accountIndexes) {
    accountIndexes = (async () => {
      const { users, db } = await store();
      await Promise.all([
        users.createIndex({ id: 1 }, { unique: true }),
        users.createIndex({ email: 1 }, { unique: true }),
        db
          .collection("cms_limits")
          .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
    })();
    accountIndexes.catch(() => {
      accountIndexes = undefined;
    });
  }
  await accountIndexes;
}
export function accountSummary(user: UserSummary): UserSummary {
  const { id, name, email, role, active, createdAt } = user;
  return { id, name, email, role, active, createdAt };
}
// Separate from the CMS guard: customer access here confers no CMS permissions.
export async function accountAuthenticated(
  request: Request,
): Promise<AccountIdentity> {
  const user = await currentIdentity();
  if (!user) throw new ApiError(401, "Sign in to continue.");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
    (!sameOrigin(request) ||
      !validCsrf(request.headers.get("x-csrf-token"), user))
  )
    throw new ApiError(
      403,
      "Your security token expired or the request origin is invalid. Reload and try again.",
    );
  return user;
}
export async function freshAccount(
  actor: AccountIdentity,
  session: ClientSession,
) {
  const user = await (
    await store()
  ).users.findOne(
    { id: actor.id, active: true, sessionVersion: actor.sessionVersion },
    { session },
  );
  if (!user) throw new ApiError(401, "Your session expired. Sign in again.");
  return user;
}
export async function accountMutationLimit(
  actor: AccountIdentity,
  scope: string,
) {
  if (!(await rateLimit(`${scope}:${actor.id}`, 120, 3600)))
    throw new ApiError(429, "Too many changes. Try again later.");
}
export async function registerAccount(raw: unknown, request: Request) {
  const input = registrationSchema.parse(raw);
  await setupAccounts();
  if (
    !(await rateLimit(
      `registration:ip:${clientAddress(request.headers)}`,
      20,
      3600,
    )) ||
    !(await rateLimit(`registration:email:${input.email}`, 3, 3600)) ||
    !(await rateLimit("registration:global", 200, 3600))
  )
    throw new ApiError(429, "Too many attempts. Try again later.");
  // Same hash work and outward response for an existing/new address; never replace it.
  const passwordHash = await hashPassword(input.password);
  if (input.website) return;
  await userTransaction(async (session) => {
    const { users } = await store();
    if (await users.findOne({ email: input.email }, { session })) return;
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      role: "customer",
      active: true,
      createdAt: now,
      updatedAt: now,
      passwordHash,
      sessionVersion: 1,
    };
    await users.insertOne(user, { session });
    await logAudit(user.id, "account.register", "users", user.id, "", session);
  });
}
export async function updateOwnProfile(actor: AccountIdentity, raw: unknown) {
  const { name } = profileSchema.parse(raw);
  return userTransaction(async (session) => {
    const user = await freshAccount(actor, session);
    const updatedAt = new Date().toISOString();
    await (
      await store()
    ).users.updateOne(
      { id: actor.id, sessionVersion: actor.sessionVersion, active: true },
      { $set: { name, updatedAt } },
      { session },
    );
    await logAudit(
      actor.id,
      "account.profile.update",
      "users",
      actor.id,
      "",
      session,
    );
    return accountSummary({ ...user, name });
  });
}
