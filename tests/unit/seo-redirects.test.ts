import { expect, it } from "vitest";
import { legacyRedirects } from "@/lib/seo/redirect-map";
it("has unique legacy sources, local targets and no chains or self redirects", () => {
  const sources = new Set(legacyRedirects.map((row) => row.source));
  expect(sources.size).toBe(legacyRedirects.length);
  for (const row of legacyRedirects) {
    expect(row.source).toMatch(/^\/.+\/$/);
    expect(row.destination).toMatch(/^\/(?:[^?#]*\/)?$/);
    expect(
      sources.has(row.destination),
      `${row.source} creates a redirect chain`,
    ).toBe(false);
    expect(row.reason.length).toBeGreaterThan(5);
  }
});
