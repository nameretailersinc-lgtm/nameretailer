import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { request } from "@playwright/test";
const baseURL = process.env.TEST_BASE_URL || "http://localhost:3003";
let api;
try {
  const data = JSON.parse(await readFile(".local/e2e.json", "utf8"));
  if (
    !/_test(?:_|$)/.test(data.database) ||
    !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)
  )
    throw new Error("Test isolation required.");
  const name = createHash("sha256")
    .update(`${baseURL}:${data.admin.id}`)
    .digest("hex");
  api = await request.newContext({
    baseURL,
    storageState: `.local/qa-sessions/${name}.json`,
  });
  const response = await api.get("/api/admin/csrf/");
  console.log(`Authenticated CSRF status: ${response.status()}`);
  if (response.status() !== 200) process.exitCode = 1;
} catch {
  console.error(
    "Authenticated test health check failed; sensitive diagnostic details redacted.",
  );
  process.exitCode = 1;
} finally {
  await api?.dispose();
}
