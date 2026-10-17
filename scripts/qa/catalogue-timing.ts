import "dotenv/config";
import { getDb } from "../../lib/db";
import {
  listProducts,
  publicProductStatistics,
} from "../../lib/commerce/products";

// Read-only. Output only timings/counts and error codes, never connection strings.
const started = performance.now();
try {
  const db = await getDb();
  await db.command({ ping: 1 });
  console.log(
    JSON.stringify({
      stage: "connect",
      ms: Math.round(performance.now() - started),
    }),
  );
  for (let sample = 1; sample <= 3; sample++) {
    for (const [stage, run] of [
      [
        "page",
        () =>
          listProducts(new URLSearchParams("sort=domain&page=1&pageSize=20")),
      ],
      ["statistics", () => publicProductStatistics(new URLSearchParams())],
    ] as const) {
      const before = performance.now();
      const result = await run();
      console.log(
        JSON.stringify({
          stage,
          sample,
          ms: Math.round(performance.now() - before),
          total: result.total,
        }),
      );
    }
  }
  process.exit(0);
} catch (error) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "UNAVAILABLE";
  console.error(
    JSON.stringify({
      stage: "failed",
      code: /^[A-Z0-9_]+$/.test(code) ? code : "UNAVAILABLE",
      ms: Math.round(performance.now() - started),
    }),
  );
  process.exit(1);
}
