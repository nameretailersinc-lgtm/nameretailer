import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { withProductionServer } from "./server";
import { sitemapUrlset } from "./sitemap";
await withProductionServer(async (base) => {
  console.log(
    "Health report " +
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Karachi",
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date()),
  );
  const xml = await sitemapUrlset(base);
  console.log("Sitemap URLs: " + [...xml.matchAll(/<loc>/g)].length);
  for (const script of ["check:health", "check:redirects"]) {
    const child = spawn(
      process.execPath,
      [
        fileURLToPath(
          new URL("../../node_modules/tsx/dist/cli.mjs", import.meta.url),
        ),
        script === "check:health"
          ? "scripts/seo/check-health.ts"
          : "scripts/seo/check-redirects.ts",
      ],
      {
        env: { ...process.env, SEO_BASE_URL: base },
        stdio: "inherit",
        windowsHide: true,
      },
    );
    const code = await new Promise((resolve) => child.on("exit", resolve));
    if (code !== 0) process.exitCode = 1;
  }
});
