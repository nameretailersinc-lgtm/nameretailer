import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/scheduled", () => ({
  publishScheduled: vi.fn(async () => ({ published: 1, skipped: 0 })),
}));
import { publishScheduled } from "@/lib/cms/scheduled";
import { POST } from "@/app/api/cron/publish/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("scheduled cron authorization", () => {
  it("rejects an unconfigured secret", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const response = await POST(
      new Request("http://localhost/api/cron/publish", { method: "POST" }),
    );
    expect(response.status).toBe(401);
    expect(publishScheduled).not.toHaveBeenCalled();
  });

  it("rejects equal-character-length tokens with different UTF-8 byte lengths", async () => {
    vi.stubEnv("CRON_SECRET", "a".repeat(32));
    const response = await POST(
      new Request("http://localhost/api/cron/publish", {
        method: "POST",
        headers: { authorization: `Bearer ${"é".repeat(32)}` },
      }),
    );
    expect(response.status).toBe(401);
    expect(publishScheduled).not.toHaveBeenCalled();
  });

  it("runs only for the configured strong bearer token", async () => {
    const secret = "isolated-unit-cron-secret-not-production";
    vi.stubEnv("CRON_SECRET", secret);
    const response = await POST(
      new Request("http://localhost/api/cron/publish", {
        method: "POST",
        headers: { authorization: `Bearer ${secret}` },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { published: 1, skipped: 0 },
    });
    expect(publishScheduled).toHaveBeenCalledOnce();
  });
});
