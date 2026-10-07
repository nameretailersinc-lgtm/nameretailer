import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { setupDatabase, store } from "../../lib/db";
import { hashPassword } from "../../lib/security/password";
import type { Role } from "../../lib/cms/types";
// Never drop databases, reuse production data or overwrite owner accounts.
const database = process.env.MONGODB_TEST_DB || "nameretailer_cms_test";
if (!/_test(?:_|$)/.test(database))
  throw new Error("Test database name must contain _test.");
process.env.MONGODB_DB = database;
try {
  await setupDatabase();
  const { users } = await store();
  const runId = randomUUID().slice(0, 8);
  const credentials: Record<
    string,
    { email: string; password: string; id: string }
  > = {};
  for (const role of ["admin", "editor", "author", "customer"] as Role[]) {
    const password = randomBytes(24).toString("base64url");
    const id = randomUUID();
    const email = `qa-${role}-${runId}@example.invalid`;
    const now = new Date().toISOString();
    await users.insertOne({
      id,
      name: `QA ${role} (test only)`,
      email,
      role,
      active: true,
      passwordHash: await hashPassword(password),
      sessionVersion: 1,
      createdAt: now,
      updatedAt: now,
    });
    credentials[role] = { email, password, id };
  }
  await mkdir(".local", { recursive: true });
  await writeFile(
    ".local/e2e.json",
    JSON.stringify({ database, runId, ...credentials }, null, 2),
    { mode: 0o600 },
  );
  console.log(
    "Isolated MongoDB test fixtures created. Credentials stored privately in .local/e2e.json; no production content changed.",
  );
  process.exit(0);
} catch (error) {
  console.error(
    "Test setup failed:",
    error instanceof Error ? error.name : "UnknownError",
    "(details redacted)",
  );
  process.exit(1);
}
