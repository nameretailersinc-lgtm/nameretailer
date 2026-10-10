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

# Phase 4 — canonical architecture

Restored the budget directory and permanently redirected the duplicate price page to it. DA, DR, traffic and price bands use distinct inclusive boundaries; old names resolve directly to the final names. Marketplace navigation targets `/`. `redirects.config` is a generated, tested manifest of the actual redirect source. Updated internal hub links.

Validation: lint, typecheck, production build and 407 unit tests passed. Phase 3 runtime verification also passed: server-rendered publication rows on the home and all hub templates; 710 public URLs returned 200.

# Phase 5 — route metadata and sharing images

Added reproducible 1200 × 630 PNG cards for home, hub, guide and article templates. Page metadata supplies complete bounded sharing fields and canonical URLs. Generic article artwork no longer overrides the full-size card; explicitly supplied CMS artwork remains supported.

Validation: lint, typecheck, production build and 411 unit tests passed. An initial build picked up prematurely staged phase 6 files; they were isolated and all four checks rerun successfully before this commit.

