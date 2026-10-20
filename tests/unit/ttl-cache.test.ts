import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cachedAsync,
  clearTtlCache,
  invalidateTtlCache,
} from "@/lib/cache/ttl";

beforeEach(() => clearTtlCache());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("does not let an in-flight read repopulate a cache after publishing invalidates it", async () => {
  let finish!: (value: string) => void;
  const pending = cachedAsync(
    "sitemap-files",
    { ttlMs: 1000 },
    () =>
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
  );
  invalidateTtlCache("sitemap-files");
  expect(
    await cachedAsync("sitemap-files", { ttlMs: 1000 }, async () => "new"),
  ).toBe("new");
  finish("old");
  await pending;
  expect(
    await cachedAsync(
      "sitemap-files",
      { ttlMs: 1000 },
      async () => "unexpected",
    ),
  ).toBe("new");
});

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

it("returns expired data immediately while concurrent callers share one background refresh", async () => {
  vi.useFakeTimers();
  const options = {
    ttlMs: 100,
    staleOnErrorMs: 1000,
    staleWhileRevalidate: true,
  };
  await cachedAsync("refresh", options, async () => "old");
  await vi.advanceTimersByTimeAsync(101);
  let finish!: (value: string) => void;
  const load = vi.fn(
    () =>
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
  );
  const first = cachedAsync("refresh", options, load);
  const second = cachedAsync("refresh", options, load);
  let displayed: string | undefined;
  void first.then((value) => {
    displayed = value;
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(displayed).toBe("old");
  expect(await second).toBe("old");
  expect(load).toHaveBeenCalledTimes(1);
  finish("new");
  await vi.advanceTimersByTimeAsync(0);
  expect(await cachedAsync("refresh", options, load)).toBe("new");
  expect(load).toHaveBeenCalledTimes(1);
});

it("retains stale data when a background refresh times out without blocking the request", async () => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const options = {
    ttlMs: 100,
    staleOnErrorMs: 1000,
    timeoutMs: 50,
    staleWhileRevalidate: true,
  };
  await cachedAsync("offline", options, async () => "old");
  await vi.advanceTimersByTimeAsync(101);
  expect(
    await cachedAsync("offline", options, () => new Promise<string>(() => {})),
  ).toBe("old");
  await vi.advanceTimersByTimeAsync(50);
  expect(await cachedAsync("offline", options, async () => "recovered")).toBe(
    "old",
  );
  await vi.advanceTimersByTimeAsync(0);
  expect(await cachedAsync("offline", options, async () => "unexpected")).toBe(
    "recovered",
  );
});

it("waits for fresh data after the maximum permitted stale age", async () => {
  vi.useFakeTimers();
  const options = {
    ttlMs: 100,
    staleOnErrorMs: 1000,
    staleWhileRevalidate: true,
  };
  await cachedAsync("too-old", options, async () => "old");
  await vi.advanceTimersByTimeAsync(1001);
  let finish!: (value: string) => void;
  const pending = cachedAsync(
    "too-old",
    options,
    () =>
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
  );
  let displayed: string | undefined;
  void pending.then((value) => {
    displayed = value;
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(displayed).toBeUndefined();
  finish("fresh");
  expect(await pending).toBe("fresh");
});

it("does not repopulate invalidated data when a background refresh completes", async () => {
  vi.useFakeTimers();
  const options = {
    ttlMs: 100,
    staleOnErrorMs: 1000,
    staleWhileRevalidate: true,
  };
  await cachedAsync("published", options, async () => "old");
  await vi.advanceTimersByTimeAsync(101);
  let finish!: (value: string) => void;
  expect(
    await cachedAsync(
      "published",
      options,
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    ),
  ).toBe("old");
  invalidateTtlCache("published");
  expect(await cachedAsync("published", options, async () => "published")).toBe(
    "published",
  );
  finish("outdated refresh");
  await vi.advanceTimersByTimeAsync(0);
  expect(
    await cachedAsync("published", options, async () => "unexpected"),
  ).toBe("published");
});
