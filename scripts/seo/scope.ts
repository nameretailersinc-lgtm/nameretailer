/** Optional explicit publication sampling; default project checks remain exhaustive. */
export function publicationAuditScope(paths: string[]): string[] {
  const raw = process.env.SEO_PUBLICATION_SAMPLE;
  if (!raw) return paths;
  const limit = Number(raw);
  if (!Number.isSafeInteger(limit) || limit < 1)
    throw new Error("SEO_PUBLICATION_SAMPLE must be a positive integer");
  const profiles = paths.filter((path) => path.startsWith("/publication/"));
  const chosen = new Set(
    Array.from(
      { length: Math.min(limit, profiles.length) },
      (_, i) =>
        profiles[
          Math.floor((i * profiles.length) / Math.min(limit, profiles.length))
        ],
    ),
  );
  console.log(
    `Explicit publication sample: ${chosen.size}/${profiles.length}; all supplied non-publication routes retained.`,
  );
  return paths.filter(
    (path) => !path.startsWith("/publication/") || chosen.has(path),
  );
}
