import assert from "node:assert/strict";
import { publicRedirects } from "../../lib/seo/public-redirects";
const legacyRedirects = publicRedirects();
import { withProductionServer } from "./server";
await withProductionServer(async (base) => {
  const targets = new Set<string>();
  for (const { source, destination } of legacyRedirects) {
    const response = await fetch(base + source, {
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
    });
    assert.equal(response.status, 301, `${source}: expected 301`);
    const location = new URL(response.headers.get("location")!, base);
    assert.equal(
      location.pathname,
      destination,
      `${source}: wrong destination`,
    );
    targets.add(destination);
  }
  for (const target of targets)
    assert.equal(
      (
        await fetch(base + target, {
          redirect: "manual",
          signal: AbortSignal.timeout(60000),
        })
      ).status,
      200,
      `${target}: target must return 200 without a redirect chain`,
    );
  console.log(
    `${legacyRedirects.length} redirects return 301; ${targets.size} distinct targets return 200.`,
  );
});
