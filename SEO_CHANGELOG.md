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

# Phase 6 — split sitemaps and shared indexing gate

Replaced the single URL set with an XML sitemap index and bounded static, hub, content and publication parts. Crawl checks traverse the index. Profile metadata and sitemap inclusion share eligibility based on audience fields, price, substantial distinct text and the existing metric threshold. Thin profiles remain internal detail pages with noindex,follow. Added INDEXING_POLICY.md and omitted unfinished terms and the noindex policy hub from the sitemap.

Validation: typecheck, build and 413 unit tests passed. Lint passed with two unused-import warnings in crawl scripts; those imports are cleaned up in phase 7.

# Phase 7 — structured-data validation

Moved existing owner-confirmed organization facts to shared configuration. Added validation of emitted JSON-LD shapes and restrictions on publication offers and unsupported ratings. Runtime checks parse every block and compare schema with visible breadcrumbs, internal listing links, FAQ text and article dates. Fixed the relative-link and nested-WebSite assertions and removed unused crawl imports.

Validation: lint, typecheck, production build and 415 unit tests passed.

# Phase 8 — About and editorial identity

About now explains catalogue sourcing, supplied metrics, editorial disclosure, placement planning, and the existing company/contact configuration. Real configured authors and dates render where supplied; missing identities remain in TODO_CONTENT.md. Concurrent homepage edits exposed a missing icon import and stylesheet; both were restored without replacing the design work.

Validation: lint, typecheck, production build and 415 unit tests passed after correcting those build errors. About source was included in the concurrent workspace commits; this checkpoint records the completed checks.

# Phase 9 — dated catalogue reports and niche guidance

Added /guest-post-prices/ with real median/percentile prices by niche, DA/DR and country, traffic-data coverage, explicit methodology and refresh behavior. Added distinct 40–60 word niche introductions, sourcing FAQs and guide links. Added the guest-post-versus-sponsored-post guide without inventing an author or publication date. Aggregates use the required owner-supplied disclosure and a real catalogue update date; missing dates suppress summaries. Metadata avoids undated statistical claims.

Validation: lint, typecheck, production build and 418 unit tests passed.

# Phase 10 — blog audit and research links

Recorded ten existing noindex technical/migration articles in CONTENT_AUDIT.md with explicit rewrite criteria. Replaced obsolete public-site development-status claims while preserving CMS history and URLs. Added article-to-hub/report links and changed SEO Guides to the clean technical-SEO category URL. Existing hub and guide links cover the remaining directions.

Validation: lint, typecheck, production build and 419 unit tests passed.

# Phase 11 — accurate tool labels

Renamed the catalogue-only score tool to Catalogue Domain Rating lookup and the structural JSON-LD aid to JSON-LD structure checker. Preserved established URLs and existing licensed AMP validation. Descriptions state the actual data source and validation scope.

Validation: lint, typecheck, production build and 419 unit tests passed.

# Phase 12 — client loading and performance budgets

Deferred the rich placement editor until its dialog is opened. Added median mobile Lighthouse budgets for home and three major hubs, with TBT labelled as a lab proxy rather than INP. Preserved server-rendered paginated rows and existing bounded image/font settings. The first audit exposed an inverse budget redirect in the owner CSV; corrected it and added shared redirect-chain protection and regression tests. Performance results will be recorded after the final production build.

Validation: lint, typecheck, production build and 422 unit tests passed after the redirect fix. Source changes were included in concurrent commit 072fb6a; this checkpoint records the completed checks.


# Owner decision — index published blog articles

On 2026-10-10, the owner explicitly requested indexing all published blog articles and approved the technical/migration articles discussed in phase 10. Removed the blog-only exclusions and Technical SEO category restriction and restored their sitemap inclusion. Private/unpublished records and faceted URL controls retain their separate policies. Validation is included in the next phase checkpoint.

# Phase 13 — consent, events and published-blog indexing

GA4 loads only after an explicit analytics consent choice and a configured measurement ID. Withdrawal disables events and clears accessible analytics cookies. Publication views, successful plan additions, shortlist changes, filter use and accepted registration requests use allowlisted parameters without personal details or search query values. Cookie preferences, Search Console verification configuration and a dated daily health-report command are available. MEASUREMENT.md documents event definitions and deployment requirements. Contact submission remains an integration item because the current Contact page sends email links and has no form submission endpoint.

The owner's published-blog indexing approval is implemented in metadata and sitemap eligibility, including the Technical SEO category. This permits indexing; Google indexing still requires deployment and crawling.

Validation: lint, typecheck, production build and all 425 unit tests passed. The first run exposed a cookie-policy expectation that omitted the newly consented analytics cookie; the expectation was updated and all four checks rerun. Source changes were included in concurrent commit 47e1023; this checkpoint records the completed checks.
