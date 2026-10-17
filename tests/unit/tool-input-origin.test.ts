import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/lib/api", () => ({
  ApiError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  body: (request: Request) => request.json(),
}));
vi.mock("@/lib/security/csrf", () => ({ sameOrigin: () => false }));
vi.mock("@/lib/security/rate-limit", () => ({
  clientAddress: () => "local",
  rateLimit: async () => true,
}));
import { toolInput } from "@/lib/tools/server";
afterEach(() => vi.unstubAllEnvs());
const input = (url: string, origin: string) =>
  new Request(url, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ input: "https://example.com/" }),
  });
it("allows matching loopback origins in development", async () => {
  vi.stubEnv("NODE_ENV", "development");
  await expect(
    toolInput(
      input(
        "http://localhost:3000/api/tools/readiness/",
        "http://localhost:3000",
      ),
      "readiness",
    ),
  ).resolves.toBe("https://example.com/");
});
it.each(["production", "development"])(
  "rejects cross-origin requests in %s",
  async (mode) => {
    vi.stubEnv("NODE_ENV", mode);
    await expect(
      toolInput(
        input(
          "http://localhost:3000/api/tools/readiness/",
          "https://evil.example",
        ),
        "readiness",
      ),
    ).rejects.toThrow("Use this tool from the site.");
  },
);
it("does not bypass production origin validation on loopback", async () => {
  vi.stubEnv("NODE_ENV", "production");
  await expect(
    toolInput(
      input(
        "http://localhost:3000/api/tools/readiness/",
        "http://localhost:3000",
      ),
      "readiness",
    ),
  ).rejects.toThrow("Use this tool from the site.");
});
