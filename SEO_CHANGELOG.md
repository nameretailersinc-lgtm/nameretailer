# SEO change log

Dates use Asia/Karachi. Entries describe local source changes and actual checks; they do not assert deployment, indexing or traffic outcomes.

## 2026-10-10 — Phase 0: reconnaissance

- Recorded routing, server rendering, catalogue/cache behavior, metadata, redirects, legal/navigation ownership and existing verification gaps in `RECON.md`.
- Preserved prior internal publication-link work and the separate untracked homepage files.
- Validation: lint, typecheck, production build and all 400 unit tests passed.

## 2026-10-10 — Phase 1: public copy and buyer questions

- Added direct 40–60 word buyer answers with supporting detail for prices, scope, paid-link disclosure, turnaround, supplied metrics, refunds, accounts and placement requests.
- Replaced misleading purchase metadata with planning/request wording. Existing commerce operations, auth and contracts are unchanged.
- Removed public approval labels and missing-identity notices; recorded owner-dependent terms, identities and evidence in `TODO_CONTENT.md`. Existing legal policies and footer links are preserved.
- Corrected historical seed/CMS wording at the presentation boundary without modifying records, IDs, source links or historical slugs. Technical article indexing/content review continues in phase 10.
- Validation: lint, typecheck, production build and all 403 unit tests passed. Check logs are in `.local/seo-checks/phase-1/`.

## 2026-10-10 — Phase 2: sourced trust configuration

- Added a trust-claim configuration with no default numbers or customer endorsements. Statements render only with an HTTPS evidence link and a valid, nonfuture evidence date.
- An empty configuration renders no trust claim; documented owner evidence is required to populate it.
- Validation: lint, typecheck, production build and all 405 unit tests passed.
# Phase 3 — server rendering and hub stability

The first publication page remains server rendered. Hydration reuses that result. Directory queries now have ten-second database limits and a shared stale-capable cache; unavailable statistics produce noindex metadata. The health script covers every registered hub, including thin hubs omitted from the sitemap. Custom build directories retain their static assets.

Validation: lint, typecheck, production build and all 405 unit tests passed. Read-only live-catalogue SSR and hub checks are recorded separately in the final acceptance report.

