import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { loadCsvRedirects } from "@/lib/seo/redirect-csv";

const write = (body: string) => {
  const file = join(mkdtempSync(join(tmpdir(), "redirects-")), "map.csv");
  writeFileSync(file, body);
  return file;
};
const header = "old_url,new_url,status,notes\n";

it("ignores rows without a destination so unmapped URLs stay 404", () => {
  expect(loadCsvRedirects(write(header + "/old/,,301,pending\n"))).toEqual([]);
});

it("loads mapped rows with quoted notes and defaults to 301", () => {
  expect(
    loadCsvRedirects(write(header + '/old/,/new/,,"a, b"\n/x/,/y/,308,\n')),
  ).toEqual([
    { source: "/old/", destination: "/new/", statusCode: 301 },
    { source: "/x/", destination: "/y/", statusCode: 308 },
  ]);
});

it("rejects off-site destinations and bad statuses", () => {
  expect(() =>
    loadCsvRedirects(write(header + "/a/,https://evil.example/,301,\n")),
  ).toThrow(/on-site/);
  expect(() => loadCsvRedirects(write(header + "/a/,/b/,404,\n"))).toThrow(
    /status/,
  );
});

it("returns nothing when the file is absent", () => {
  expect(loadCsvRedirects("/nonexistent/redirect-map.csv")).toEqual([]);
});

it("parses the committed seed file", () => {
  expect(loadCsvRedirects().length).toBeGreaterThan(50);
});
