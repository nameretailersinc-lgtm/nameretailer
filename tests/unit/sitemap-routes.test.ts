import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ files: vi.fn() }));
vi.mock("@/lib/seo/sitemap-files", async (original) => ({
  ...(await original<typeof import("@/lib/seo/sitemap-files")>()),
  sitemapFiles: mocks.files,
}));
import { GET as index } from "@/app/sitemap.xml/route";
import { GET as child } from "@/app/sitemaps/[file]/route";
const request = new Request("https://nameretailer.com/sitemaps/static-0.xml");
beforeEach(() => {
  mocks.files.mockReset();
});

it("serves canonical XML index and child URLs without fabricated dates", async () => {
  mocks.files.mockResolvedValue({
    "static-0.xml": [{ url: "https://nameretailer.com/" }],
  });
  const response = await index();
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("application/xml");
  expect(await response.text()).toContain(
    "https://nameretailer.com/sitemaps/static-0.xml",
  );
  const part = await child(request, {
    params: Promise.resolve({ file: "static-0.xml" }),
  });
  const xml = await part.text();
  expect(part.status).toBe(200);
  expect(xml).toContain("<loc>https://nameretailer.com/</loc>");
  expect(xml).not.toContain("lastmod");
});

it("uses retryable uncached 503 responses when sitemap data is unavailable", async () => {
  mocks.files.mockRejectedValue(new Error("Database unavailable"));
  for (const response of [
    await index(),
    await child(request, { params: Promise.resolve({ file: "static-0.xml" }) }),
  ]) {
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(response.headers.get("cache-control")).toBeNull();
  }
});

it("returns real 404 responses for malformed and nonexistent sitemap files", async () => {
  mocks.files.mockResolvedValue({});
  for (const file of ["not-a-sitemap.xml", "static-99.xml"])
    expect(
      (await child(request, { params: Promise.resolve({ file }) })).status,
    ).toBe(404);
});
