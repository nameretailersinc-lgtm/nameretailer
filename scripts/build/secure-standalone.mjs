import { access, cp, readdir, unlink } from "node:fs/promises";
import path from "node:path";
const workspace = process.cwd();
const dist = path.resolve(workspace, process.env.NEXT_BUILD_DIR || ".next");
if (!dist.startsWith(workspace + path.sep))
  throw new Error("Build output must remain inside the workspace.");
const output = path.join(dist, "standalone");
// Next explicitly copies loaded .env files independently of file-tracing exclusions.
// Remove only generated deployment copies; never edit/delete the owner's original.
let removed = 0;
for (const name of [
  ".env",
  ".env.production",
  ".env.local",
  ".env.production.local",
]) {
  const target = path.resolve(output, name);
  if (path.dirname(target) !== output)
    throw new Error("Invalid generated environment target.");
  try {
    await unlink(target);
    removed++;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
const entries = await readdir(output);
const forbidden = [
  ".local",
  ".npm-cache",
  "docs",
  "tests",
  "uploads",
  "test-results",
  "playwright-report",
];
if (entries.some((name) => name.startsWith(".env") || forbidden.includes(name)))
  throw new Error(
    "Private workspace files unexpectedly entered the deployment artifact.",
  );
await access(path.join(output, "server.js"));
await cp(path.join(dist, "static"), path.join(output, ".next", "static"), {
  recursive: true,
});
await cp(path.join(workspace, "public"), path.join(output, "public"), {
  recursive: true,
});
console.log(
  `Standalone verified: ${removed} generated environment copies removed; original environment preserved; client assets included.`,
);
