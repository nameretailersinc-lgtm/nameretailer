import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
dotenv.config({ quiet: true });
const workspace = process.cwd();
const fixtures = JSON.parse(await readFile(".local/e2e.json", "utf8"));
if (!/_test(?:_|$)/.test(fixtures.database))
  throw new Error("Only an isolated test database may be used.");
const secret =
  process.env.NEXTAUTH_SECRET ||
  (await readFile(".local/auth-secret", "utf8")).trim();
const port = process.argv[2] || "3003";
if (!/^\d{4,5}$/.test(port)) throw new Error("Use a valid test port.");
const env = {
  ...process.env,
  NODE_ENV: "production",
  PUBLIC_CACHE_DISABLED: "1",
  MONGODB_DB: fixtures.database,
  MONGODB_DNS_SERVERS: process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8",
  NEXTAUTH_URL: `http://localhost:${port}`,
  NEXTAUTH_SECRET: secret,
  PORT: port,
  HOSTNAME: "127.0.0.1",
  MEDIA_ROOT: path.join(workspace, ".local", "test-media"),
  MAIL_TRANSPORT: "disabled",
  SMTP_HOST: "",
};
const child = spawn(
  process.execPath,
  [path.join(workspace, ".next", "standalone", "server.js")],
  { stdio: "inherit", env, windowsHide: true },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code || 0));
