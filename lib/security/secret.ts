import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
export function authSecret() {
  if (process.env.NEXTAUTH_SECRET) {
    if (process.env.NEXTAUTH_SECRET.length < 32)
      throw new Error("NEXTAUTH_SECRET must contain at least 32 characters.");
    return process.env.NEXTAUTH_SECRET;
  }
  if (process.env.NODE_ENV === "production") return undefined; // Build is allowed; login fails closed without configuration.
  const folder = path.resolve(".local");
  const file = path.join(folder, "auth-secret");
  mkdirSync(folder, { recursive: true });
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    try {
      writeFileSync(file, randomBytes(48).toString("base64url"), {
        flag: "wx",
        mode: 0o600,
      });
    } catch {}
    return readFileSync(file, "utf8").trim();
  }
}
