import { beforeEach, expect, it, vi } from "vitest";
import { cachedAsync, clearTtlCache } from "@/lib/cache/ttl";

beforeEach(() => clearTtlCache());

it("shares one load between concurrent callers and then serves the cache", async () => {
  const load = vi.fn(async () => "value");
  const options = { ttlMs: 1000 };
  const results = await Promise.all([
    cachedAsync("a", options, load),
    cachedAsync("a", options, load),
  ]);
  expect(results).toEqual(["value", "value"]);
  await cachedAsync("a", options, load);
  expect(load).toHaveBeenCalledTimes(1);
});

it("falls back to the stale value when a refresh fails", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const options = { ttlMs: 0, staleOnErrorMs: 60_000 };
  await cachedAsync("b", options, async () => "good");
  await expect(
    cachedAsync("b", options, async () => {
      throw new Error("db down");
    }),
  ).resolves.toBe("good");
});

it("throws when there is nothing to fall back to, and on timeout", async () => {
  await expect(
    cachedAsync("c", { ttlMs: 1000 }, async () => {
      throw new Error("db down");
    }),
  ).rejects.toThrow("db down");
  await expect(
    cachedAsync(
      "d",
      { ttlMs: 1000, timeoutMs: 20 },
      () => new Promise<string>(() => {}),
    ),
  ).rejects.toThrow(/Timed out/);
});
