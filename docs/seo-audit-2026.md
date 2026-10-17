# NameRetailer SEO audit — Sprint 1, October 18, 2026

## Scope and release boundary

This sprint audits the existing production marketplace and implements technical SEO repairs. It preserves the App Router, MongoDB records, public URLs, redirects, authentication, checkout, administration and Flutter API contracts. No production content was edited and no deployment was performed. Later commercial, editorial and tool phases remain a prioritized backlog, not completed work.

The installed Next.js 16.3.8 guides for robots, sitemaps, metadata, route handlers and notFound were read before implementation. Existing uncommitted `reports/live-indexability.json`, `Chart.csv` and `Metadata.csv` were preserved. The attached request supersedes older project planning assumptions; the project is an existing marketplace, not a rebuild.

## Architecture inspected

| Area | Implementation and implications |
|---|---|
| Catalogue and homepage | `app/page.tsx`, `ServerMarketplace`, client marketplace hydrated with server inventory; `publicProductPage` caches reads for 60 seconds with stale-on-error fallback. `/products/` is an existing 301 to `/`. |
| Directories | Eight explicit entries in `lib/site/directories.ts`; real inventory and country/niche/budget guidance. Filters open the main marketplace. No automatic country/category URL generation. |
| Range pages | `lib/commerce/marketplace-ranges.ts`, `app/[tool]/page.tsx`; path-defined bounds, inventory-dependent index eligibility and unique guidance. |
| Publication details | Root and section listing routes; active/committed inventory only. Ordinary listings are noindex; eligible, sufficiently complete profiles can index and enter publication sitemaps. This later owner-approved policy supersedes older no-profile plans. |
| Pricing | `/guest-post-prices/`, `/guides/guest-post-cost/`, budget and price directories use actual catalogue statistics; dates and data availability gate indexability. |
| Editorial | Code-managed buyer/domain guides plus MongoDB-managed blog posts, categories and authors. The explicit existing blog indexing approval policy is preserved; generic CMS flags must not be assumed to override that policy. |
| Metadata/schema | Shared `pageMetadata`, `facetMetadata`, canonical origin, JSON-LD builders, verified-author constraints and structured-data checks. Canonical origin is `https://nameretailer.com`; trailing slashes are configured. |
| Sitemap | Existing index and static/hubs/content/publications child groups; deduplication, count/byte splitting, XML escaping, content dates, CMS revision-aware process cache and 300-second HTTP cache. |
| Commerce/admin/mobile | Separate account, cart, order, payment, admin and mobile API handlers. Provider availability is gated by server configuration. Public planning copy does not establish that live payments work. No payment or order was submitted. |
| Tools | Existing local text/image/markup/domain tools, shortlist comparison, catalogue DR lookup, protected server URL inspection. The existing inspector validates domains, pins public IPv4 resolution, rechecks redirects and limits time/size; tool routes enforce origin/input/rate limits. No licensed live DA/DR/traffic provider was established. |
| QA | Vitest, Playwright, SEO SSR/URL/link/redirect/metadata/JSON-LD/hygiene/health scripts, isolated test-database guards and standalone packaging checks. |

## Production evidence

The new read-only [HTTP/XML report](../reports/seo-sprint1-live.json) records its own timestamp and actual responses. It parses sitemap XML with Python's XML parser, rejects unexpected namespaces/origins and queries/fragments, and inspects responses without following redirects. It does not measure Google's index or validate rankings.

The index and four children returned HTTP 200 and valid XML: static 50, hubs 34, content 77 and publication profiles 569, totalling **730 distinct canonical URLs**. All 730 returned 200 with self canonicals and no meta/header noindex. No duplicate sitemap URLs were found. This supports keeping the current sitemap system. It does not prove that every historical URL or all 56,005 listing details have been crawled.

Production `/robots.txt` returned 200 and advertised the correct sitemap. Its public filter disallows matched the local implementation before repair. Representative category, country and sort queries returned 200, a clean homepage canonical and `noindex, follow`. `/page/2/` returned 200 with an indexable self canonical. `/products/` redirected directly to `/`; unknown routes and malformed sitemap filenames returned 404. `/guest-post-by-dr/?page=10000` returned **200 with noindex**, confirming an empty-pagination status defect. A separate live probe checks the existing `/dr-50-plus/?page=10000` range URL.

The raw response for `/guest-posting-sites/` contains both fallback and resolved headings from streaming. A raw count alone is not proof of two visible H1s; verify the rendered DOM before treating this as a content defect.

`Metadata.csv` labels the user-supplied export as “Discovered - currently not indexed”; `Chart.csv` ends with 112 affected pages on October 12. These are historical aggregate artifacts, not live GSC access or a list of affected URLs. Their relationship to the 730 currently served sitemap URLs is unknown. No Search Console property, current coverage, impressions, clicks or Google-selected canonicals were invented.

## Confirmed findings and implemented repairs

| Priority | Evidence | Change |
|---|---|---|
| P1 | Public query disallows prevent crawlers from reading the existing noindex/canonical metadata. Both source and production show this combination. | Removed public filter disallows; private/admin/account/checkout/API restrictions remain. Parameter states still receive noindex and clean canonicals. |
| P1 | DR/range metadata and shared SSR lacked an empty later-page 404 guard; the DR production probe returned 200. | Added `notFound()` in metadata and SSR for empty result pages after page one. Empty page-one searches remain usable and noindex. |
| P1 | Pagination constructed from normalized range queries repeated fixed min/max bounds; existing unit expectations explicitly encoded these redundant URLs. Shared facet policy then marked linked pages noindex. | `marketplaceHref` removes path-owned bounds while retaining user filters. Clean range pagination links now point to `?page=N`. |
| P2 | Following every temporary filtered pagination link expands query crawling after allowing noindex discovery. | Added `rel=nofollow` to transient pagination links; clean catalogue/range pagination stays followed. This is a crawl hint, not an access guarantee. Monitor logs before further crawl restrictions. |
| P2 | Initial build attempted sitemap evaluation and retried after a 60-second timeout. | Explicit request-time configuration for index and child sitemap handlers prevents build-time inventory snapshots. Existing runtime XML generation, cache and 503/Retry-After behavior remain. |
| P2 | The inbound-link sample from all sitemap pages found the retained broad traffic page and 64 eligible profiles with no incoming links in that sample. This is a discovery gap, not proof that no external/paginated link exists. | Added the broad traffic page and every XML-eligible profile to the HTML site map, using the same active/committed profile source. Ordinary noindex listings are not added. |

Google explains that a crawler must be allowed to fetch a page to see its [noindex rule](https://developers.google.com/search/docs/crawling-indexing/block-indexing). Its [faceted-navigation guidance](https://developers.google.com/crawling/docs/faceted-navigation) also recommends controlling crawl expansion. This sprint uses discoverable noindex, nofollow transient pagination, a finite curated landing-page list and sitemap exclusion together. Revisit robots blocking only with evidence about indexed query variants and crawl load.

No canonical mismatch, sitemap redirect or accidental noindex was found among the 730 sampled sitemap destinations. No redirect migration, URL rename or new landing page was needed in this sprint. No broad soft-404, historical orphan or production performance clearance is claimed.

## Validation

Final command results and limitations are recorded in the verification addendum below. The new tests exercise empty pagination, normal nonempty pagination, noindex filter states, range URL normalization, robots visibility and sitemap HTTP success/failure responses. Existing unit coverage includes account, mobile checkout, payments, CMS permissions, URL inspection and SEO tools.

Use an isolated `_test` database for mutation-based browser suites. Never run account/order/admin fixture mutations against the production database. Public catalogue-backed smoke checks are read-only. A sandbox database connection timed out; an approved external read-only retry succeeded. This is an environment restriction, not evidence that production MongoDB is down.

## Sprint 2+ backlog and acceptance gates

1. **Commercial pages:** refine the homepage agency/small-business marketplace intent; retain the directory hub as navigation and pricing guide as informational. Use the [keyword map](seo-keyword-map.md) before changing copy. No managed outreach, white-label, link-building service or paid-link ranking promises.
2. **Directories:** validate exact Finance, Real Estate and UK inventory counts and field quality, then prepare distinct useful directories only if inventory supports them. The current Travel/Lifestyle directory owns travel intent; do not add a synonym page. Add more crawlable hub links where the graph demonstrates gaps.
3. **Marketplace:** measure query/aggregate times, cold/warm cache behavior and production mobile interactions before optimization. Exercise search, all supported filters, reset, sort, back/refresh, bounds, empty/error/loading states, shortlist and publisher details. Keep the current shared URL filters and supplied-data labels.
4. **Content:** improve existing evaluation, traffic, pricing, paid-link and budget guides before adding overlapping articles. Check GSC query/page overlap before merges. Preserve authorship and real modification dates; use verified sources and add Article/BreadcrumbList only where visible attribution qualifies.
5. **Tools:** existing shortlist and domain-length tools need no replacement. Add a budget calculator with real USD placement/writing inputs and transparent arithmetic. A data-based pricing estimator must use sufficient actual inventory and disclose sample/date. Meta-length, UTM and pasted-HTML link-attribute tools are possible next steps. External status inspection should reuse reviewed SSRF defenses.
6. **Licensed metrics:** evaluate provider licensing, attribution, quotas/cost, caching, timestamps, secret handling and error paths for Moz/Ahrefs/traffic data. Until a legitimate provider is available, keep catalogue lookups explicitly owner-supplied and do not publish a promised live checker.

Each later phase needs code, relevant tests and a separate result report before advancing. No new tool or commercial page is presented as implemented here.

## Production deployment instructions — owner-controlled

Review the focused diff and final validation first. Pushing to `main` currently triggers the repository's SSH deployment job automatically, so do not push/merge merely to save these changes. This task has not deployed anything.

After release authorization, use the existing tested CI/container process, preserve the VPS `.env` and uploads, and validate environment syntax with `docker compose config --quiet`. Run the normal build/quality checks; deploy using the existing release workflow, then verify `/robots.txt`, `/sitemap.xml` and every advertised child. Check clean homepage, `/page/2/`, a niche/country directory, pricing, a profile, a guide and a tool. Check filtered noindex, clean range pagination and actual 404s for out-of-range pages. Verify authentication, saved plans and enabled payment-provider flows in the appropriate test environment before any checkout availability claim. Keep the previous image/release for rollback.

Rerun `python scripts/seo/audit-sprint1.py --output reports/seo-sprint1-after-deployment.json` after release; compare with the predeployment report. Clear any upstream robots/XML cache if it outlives the configured cache period. Build success does not prove a deployed configuration or payment flow.

## Search Console manual verification

- Verify the correct `https://nameretailer.com/` or domain property; retain an unfiltered export and timestamp. Confirm `GOOGLE_SITE_VERIFICATION` if the property uses the HTML method.
- Sitemaps: submit/inspect `/sitemap.xml`; verify successful reads and all four current child files. Compare discovered counts with actual XML, not an assumed indexing target.
- URL Inspection and live test: `/`, `/page/2/`, `/guest-posting-sites/`, `/technology-guest-posting-sites/`, `/guest-posting-sites-usa/`, `/guest-posting-sites-under-50/`, `/guest-post-prices/`, `/guides/guest-post-cost/`, `/guides/vet-a-guest-post-site/` and one actual profile URL from the report. Record crawl allowed, page fetch, rendered listings, declared/selected canonical, indexing allowed and last crawl.
- Query variants: inspect `/?category=Technology`, `/?country=United+States`, `/?sort=priceAsc` and a combined filter after deployment. Confirm bots can fetch noindex; do not request indexing for them.
- Page Indexing: export actual examples for “Discovered - currently not indexed”, “Crawled - currently not indexed”, blocked by robots, noindex, duplicate/alternate canonical, soft 404 and server error. Compare the 112 historical exclusions with exact current URLs before claiming a fix.
- Inspect `/guest-post-by-dr/?page=10000` and `/dr-50-plus/?page=10000` with live tests after deployment; expect 404. Do not submit these as indexable URLs.
- Performance: export 16 months of queries/pages/countries/devices; prioritize relevant US commercial queries, then UK/Canada/Australia/UAE. Compare 28-day periods with seasonal context. Ads competition is not organic difficulty.
- Review Crawl Stats, CWV, HTTPS, enhancements, Manual Actions and Security Issues. Check server logs for filtered crawl growth. Rich Results Test representative visible Article/Breadcrumb/Organization/SoftwareApplication graphs; syntax validation alone is not rich-result eligibility.
- Request indexing only for a small set of improved important canonical pages. Track qualified enquiries/saved plans and actual enabled orders separately from impressions and clicks.

## 30 / 60 / 90 day plan

| Period | Work and measure |
|---|---|
| Days 1–30 | Release validated technical fixes with approval; monitor 404/5xx, robots/XML fetches and filter crawling. Obtain exact GSC examples and keyword metrics. Baseline qualified enquiries, saved plans, country/device search demand and mobile CWV. Improve the existing homepage/pricing/evaluation cluster. |
| Days 31–60 | Add only inventory-supported UK/Finance/Real Estate directories; expand existing guides with original examples and real sources. Ship a tested budget calculator, measure search/database latency and mobile filter use, and verify the actual purchase/enquiry path. |
| Days 61–90 | Compare like-for-like search and conversion cohorts; resolve proven cannibalization, refresh stale inventory and improve pages with impressions but weak relevance/conversion. Add provider-backed tools only after licensing/quota/security acceptance; review crawl load and internal discovery again. |

## Verification addendum

Executed checks, including failures, are listed below. Ignored local logs under `.local/sprint1-*` retain diagnostic detail; public report artifacts contain no private sessions or keys.

| Check | Executed result |
|---|---|
| Final production build | Passed, including TypeScript, all 137 generated static pages and secure standalone packaging. Explicit dynamic sitemap routes no longer incur the initial build-time sitemap retry. |
| Final TypeScript / ESLint | Both passed. |
| Unit regression | 55 files, 572 tests passed. An earlier sitemap failure-path test had a hook returning a rejected mock function; the hook was corrected and the complete suite reran successfully. |
| Live XML/HTTP/canonical/noindex audit | 730 distinct sitemap destinations, all 200, self-canonical and index-allowed; zero duplicate sitemap URLs. Strict XML parses for the index and four child files. Raw streaming-H1 warning was checked in the rendered browser. |
| Local XML/HTTP/canonical/noindex audit | 730 URLs passed; canonical URL set equals production. DR/range empty later pages now return 404; page-one empty query stays 200/noindex. [Local report](../reports/seo-sprint1-local.json). |
| SSR catalogue check | Passed all registered catalogue/range/directory routes twice; 20 initial marketplace rows or 25 directory rows include server-rendered publication links and prices. |
| URL policy checker | Passed redirects, clean pagination canonicals, public filter noindex visibility, categories, robots and sitemap exclusions. Stale expectations for the already-indexable HTML site map were corrected in the checker, not by changing the working page's indexing. |
| Internal links | 730 sitemap source URLs and 1,893 distinct internal links returned 200 without redirects. This run preceded the HTML site-map additions; all added destination URLs were already in that validated sitemap set. Final browser test confirms every eligible publication XML URL has an HTML site-map link. |
| Legacy redirects | 125 aliases returned 301, with 51 distinct final targets returning 200. |
| Keyword-map validation | 734 unique canonical assignments, all with “Not supplied” volumes. Local/production canonical URL sets match. No duplicate titles/descriptions or title/description length violations among the 730 local sitemap rows. |
| First public browser run | 8 passed: four domain-resource/tool tests plus four Sprint 1 tests. Includes 320/768/1280px domain resources with axe, and 375/1280px important marketplace/guide/tool pages, canonicals, one visible H1, no overflow, JSON-LD parsing and real pagination. |
| Final focused browser run | 8 passed, 1 failed. All five Sprint 1 tests passed, including the new site-map/profile coverage; account controls and two mocked planning/payment receipt tests passed. The old placement-editor test calls textarea `setSelectionRange()` on the current rich-text editor and fails before its save step. This is an unchanged legacy test mismatch, not a verified payment failure. Mocked receipts are not proof of actual provider processing. |
| Isolated DB regression run | 20 passed, 4 failed, 7 skipped. Passing cases include account security/cart APIs, CMS permissions/publication/media/settings/export behavior and marketplace pagination/back/refresh/sort/reset. Two old browser checks expect removed “Place order”/“Your account details” controls; reset-token delivery expects mail despite the launcher disabling mail; the placement suite requires port 3003 and initially refused port 3260. None was suppressed or reported passed. |
| Placement API rerun on required isolated port | Passed the real API ownership, file format/private downloads, billing drafts and stale price/cart guard test on port 3003. No real payment, customer email or production record mutation. The other skipped browser cases in the earlier run were not rerun. |
| Metadata / JSON-LD / hygiene broad validators | Final results recorded below when complete. |
| Diff whitespace | `git diff --check` passed; normal Windows LF/CRLF notices are not whitespace errors. |

Release limitations: actual provider payment/fulfilment and live reset mail remain unverified; older UI regression specs need alignment with the current UI before a full green release suite can be claimed. No new field CWV/Lighthouse result was measured. GSC indexing and Google-selected canonicals still require the manual checklist. Missing Keyword Planner files prevent numeric volume mapping; external metric tools still require a legitimate provider. These limits are not reasons to fabricate results or deploy automatically.

## Changed files

| Purpose | Files |
|---|---|
| Crawl/index policy | `app/robots.ts`, `app/[tool]/page.tsx`, `app/guest-post-by-dr/page.tsx`, `components/marketplace/server-marketplace.tsx` |
| Canonical pagination and crawl hints | `lib/commerce/marketplace-url.ts`, `components/marketplace/marketplace.tsx` |
| Sitemaps and discovery | `app/sitemap.xml/route.ts`, `app/sitemaps/[file]/route.ts`, `app/site-map/page.tsx` |
| Regression coverage/checker policy | `tests/unit/marketplace-url.test.ts`, `tests/unit/marketplace-empty-pagination.test.ts`, `tests/unit/sitemap-routes.test.ts`, `tests/e2e/seo-sprint1.spec.ts`, `scripts/seo/check-urls.ts` |
| Reproducible audit/mapping | `scripts/seo/audit-sprint1.py`, `scripts/seo/build-keyword-map.py`, `reports/seo-sprint1-live.json`, `reports/seo-sprint1-local.json`, `docs/seo-keyword-inventory-2026.csv` |
| Reports | `docs/seo-audit-2026.md`, `docs/seo-keyword-map.md` |
| Framework-generated build output | `next-env.d.ts` now references production build route types, as generated by Next.js |

The pre-existing change to `reports/live-indexability.json` and untracked user exports `Chart.csv`/`Metadata.csv` are not part of this implementation. No dependency, font, payment, authentication, database schema, mobile or admin production code was changed. No new landing page or SEO tool was added in this technical sprint. The concrete new marketplace behavior is cleaner range pagination, actual later-page 404s, bounded filtered pagination and better profile discovery. Long-tail phrases in the keyword map are assignments/briefs for later content work, not a claim that new commercial copy has already shipped.
