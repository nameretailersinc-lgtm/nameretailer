import "dotenv/config";
import { randomUUID } from "node:crypto";
import { setupDatabase, store } from "../../lib/db";
import { hashPassword } from "../../lib/security/password";
import { z } from "zod";
const email = z.email().parse(process.argv[2]?.toLowerCase());
const name = z
  .string()
  .min(1)
  .max(150)
  .parse(process.argv[3] || "Site administrator");
if (!process.env.ADMIN_BOOTSTRAP_PASSWORD) {
  console.error(
    "Set ADMIN_BOOTSTRAP_PASSWORD privately, then run npm run admin:create -- email name. No default password exists.",
  );
  process.exit(1);
}
try {
  await setupDatabase();
  const { users } = await store();
  if (await users.findOne({ email }))
    throw new Error(
      "Account already exists. Use password reset rather than overwriting it.",
    );
  const now = new Date().toISOString();
  await users.insertOne({
    id: randomUUID(),
    name,
    email,
    role: "admin",
    active: true,
    passwordHash: await hashPassword(process.env.ADMIN_BOOTSTRAP_PASSWORD),
    sessionVersion: 1,
    createdAt: now,
    updatedAt: now,
  });
  console.log(
    "Admin account created. Remove ADMIN_BOOTSTRAP_PASSWORD from your environment.",
  );
  process.exit(0);
} catch (error) {
  console.error(
    "Admin creation failed:",
    error instanceof Error ? error.name : "UnknownError",
    "(details redacted)",
  );
  process.exit(1);
}
