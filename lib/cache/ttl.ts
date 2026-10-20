type Entry = { value: unknown; storedAt: number };
type Store = {
  entries: Map<string, Entry>;
  inflight: Map<string, Promise<unknown>>;
};
const globals = globalThis as typeof globalThis & { ttlCache?: Store };
const store: Store = (globals.ttlCache ??= {
  entries: new Map(),
  inflight: new Map(),
});
const maxEntries = 500;

export type TtlOptions = {
  /** Serve from cache without recomputing for this long. */
  ttlMs: number;
  /** After ttl, a failed refresh may still return the previous value for this long. */
  staleOnErrorMs?: number;
  /** Return an eligible stale value immediately while one shared refresh runs. */
  staleWhileRevalidate?: boolean;
  /** Abort waiting on the loader after this long (the loader itself may need maxTimeMS). */
  timeoutMs?: number;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, key: string) {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Timed out after ${timeoutMs}ms: ${key}`)),
      timeoutMs,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Process-local cache for expensive public reads (catalogue aggregates, listings).
 * Concurrent callers share one load; a failed refresh falls back to the last good
 * value instead of surfacing a gateway error. Each server instance keeps its own copy.
 */
export async function cachedAsync<T>(
  key: string,
  options: TtlOptions,
  load: () => Promise<T>,
): Promise<T> {
  // Test servers mutate the catalogue between requests and need fresh reads.
  if (process.env.PUBLIC_CACHE_DISABLED === "1")
    return withTimeout(load(), options.timeoutMs ?? 20000, key);
  const now = Date.now();
  const hit = store.entries.get(key);
  if (hit && now - hit.storedAt < options.ttlMs) return hit.value as T;
  const serveWhileRefreshing =
    options.staleWhileRevalidate &&
    hit &&
    now - hit.storedAt < (options.staleOnErrorMs ?? 0);
  const pending = store.inflight.get(key);
  if (pending)
    return serveWhileRefreshing ? (hit.value as T) : (pending as Promise<T>);
  const loading = withTimeout(load(), options.timeoutMs ?? 20000, key)
    .then((value) => {
      // A publishing mutation may have invalidated this load while it ran.
      if (store.inflight.get(key) !== loading) return value;
      store.entries.delete(key);
      store.entries.set(key, { value, storedAt: Date.now() });
      while (store.entries.size > maxEntries)
        store.entries.delete(store.entries.keys().next().value as string);
      return value;
    })
    .catch((error) => {
      if (hit && now - hit.storedAt < (options.staleOnErrorMs ?? 0)) {
        console.warn(`Serving stale cache for ${key}:`, error);
        return hit.value as T;
      }
      throw error;
    })
    .finally(() => {
      if (store.inflight.get(key) === loading) store.inflight.delete(key);
    });
  store.inflight.set(key, loading);
  if (serveWhileRefreshing) {
    void loading.catch(() => {});
    return hit.value as T;
  }
  return loading;
}

export function clearTtlCache() {
  store.entries.clear();
  store.inflight.clear();
}

export function invalidateTtlCache(key: string) {
  store.entries.delete(key);
  store.inflight.delete(key);
}
