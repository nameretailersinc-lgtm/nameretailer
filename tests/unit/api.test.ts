import { describe, it, expect } from "vitest";
import { body, ApiError, json } from "@/lib/api";
describe("API boundaries", () => {
  it("accepts genuine JSON bodies", async () => {
    expect(
      await body(
        new Request("http://localhost/api", {
          method: "POST",
          body: JSON.stringify({ title: "Test" }),
        }),
      ),
    ).toEqual({ title: "Test" });
  });
  it("rejects malformed JSON", async () => {
    await expect(
      body(
        new Request("http://localhost/api", {
          method: "POST",
          body: "not json",
        }),
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("limits declared bodies before reading", async () => {
    await expect(
      body(
        new Request("http://localhost/api", {
          method: "POST",
          body: "{}",
          headers: { "content-length": "3000000" },
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("limits actual streamed bytes without trusting Content-Length", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(2_000_001));
        controller.close();
      },
    });
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);
    await expect(body(request)).rejects.toMatchObject({ status: 413 });
  });
  it("never caches private JSON responses", () => {
    const response = json({ data: {} });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(new ApiError(403, "Denied").status).toBe(403);
  });
});
