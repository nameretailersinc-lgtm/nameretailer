# SEO prelaunch and migration checklist

Prepared 2026-10-05. This is a future execution checklist, not evidence of a finished build. All checks remain open. Owners: orchestrator coordinates gates; SEO handles routing/metadata/content graph; engineering handles runtime/security; owner supplies business evidence/exports; UX/Design verify visible content and accessibility.

## Before schema and content migration

- [ ] Obtain owner approval for the design/planning phase before Phase 3 scaffold.
- [ ] Obtain full listing CSV and verify stable IDs, true availability, price/billing/duration, provider names and measured dates; withhold 56,000+ claim unless confirmed/computed.
- [ ] Record confirmed legal/company identity, actual contact terms, author credentials, approved social profiles, editorial/vetting process and real policies.
- [ ] Obtain WordPress/WooCommerce export and media manifest; record whether customers/orders/passwords migrate and validate account recovery/ownership strategy.
- [ ] Request GSC page/query export and backlinks; review every semantic redirect/retirement proposal using available evidence. Record missing history, back up the source and require approved activation plus relevant replacement readiness; preserve materially uncertain routes pending resolution.
- [ ] Confirm meaning of six monthly routes and `/permanent/`; preserve routes pending answer. Confirm private `/link-details/*` requirements separately from indexability.
- [ ] Verify provider licenses, quotas and tool metric definitions. DR requires Ahrefs provenance or explicitly limited own-inventory data; never rename another provider metric as DR.
- [ ] Build exact verified ID/media/product mappings. Unresolved system rules stay pending; no guessed query IDs, media filenames, author identities or wildcard homepage redirects.

## Routing and discovery on staging

- [ ] Run `python scripts/audit/validate_redirect_plan.py`; require 166 exact unique audit URLs, valid statuses, no chain/loop/unknown survivor. A planning pass does not authorize activation.
- [ ] Create approved activation manifest with reviewer/evidence/destination readiness for each active 301/410; exclude pending monthly/detail and unmet gates.
- [ ] Test every activated source over GET and HEAD, including HTTP/www/case/slash variants, actual 301 status and a single final 200 hop; no claim based on `permanent: true` (308).
- [ ] Verify approved 410 routes return 410 without Location; unmatched pages 404 with useful search/recovery, never 200 soft 404.
- [ ] Confirm custom-login, account/orders, cart, checkout and product compatibility preserve buyer intent; no SEO rule redirects commerce/API mutation or payment callbacks.
- [ ] Spot-check verified `?p=ID`, old author/date/category/pagination and upload-asset mappings; verify old media versions actually load or redirect to equivalent files.
- [ ] Verify every public template has unique server-rendered metadata/title/description, absolute canonical, OG/Twitter image and one H1; no unsupported claims.
- [ ] Verify arbitrary filters/search use normalized self-canonical/noindex follow; tracking-only canonical is clean; indexable paginated pages self-canonical with real crawlable links, not page 1 canonical.
- [ ] Confirm conditional niche/country/language pages meet full-inventory/demand/content gates before publication; no per-domain indexable pages.
- [ ] Crawl the complete public graph: contextual inbound links for each indexable route, old links replaced with final targets, breadcrumbs/related/pillar links useful, no broken links.
- [ ] Check sitemap only lists published canonical indexable 200 pages with true lastmod; exclude filters/private/drafts/redirects/errors; verify split files/index if used.
- [ ] Check robots syntax, sitemap location, per-crawler public permissions and repeated private-path restrictions in specific bot groups.
- [ ] Verify noindex pages remain fetchable when noindex removal is needed; document crawl visibility tradeoff for private-route disallow. Auth/ownership prevent data exposure regardless of robots.
- [ ] Check cached public HTML for leaked customer/cart state; private routes authenticated as needed and `Cache-Control: private, no-store`.
- [ ] Check staging/preview access controls and noindex; ensure staging environment controls cannot accidentally remain on production indexable pages.

## Structured data, content and user experience

- [ ] Confirm JSON-LD types match visible page content, stable IDs and real entity/author/date/source data; no invented reviews, AggregateRating, prices or credentials.
- [ ] Run [Rich Results Test](https://search.google.com/test/rich-results) against public staging URLs (if accessible) or HTML, then live production samples: `/`, `/guest-post-by-dr/`, `/how-to-buy-links/`, `/content-writing-services/`, `/about/` and any genuine single-offer page. Save results and resolve applicable errors; lack of a supported type is not a general schema failure.
- [ ] Run [Schema.org validator](https://validator.schema.org/) for FAQPage, HowTo, Service, CollectionPage/ItemList, WebApplication and other general types; compare questions/answers/steps with visible content.
- [ ] Confirm FAQ rich results ended May 7, 2026, HowTo rich results deprecated 2023 and sitelinks search box removed 2024; UI/admin copy promises none of these features.
- [ ] Review answer blocks/definitions/steps/FAQs for actual helpfulness and citations; review paid-link claims and disclosure/qualification guidance; no word-count filler.
- [ ] Validate every tool's real computation/provider output, privacy/limits/errors and accessibility; unfinished tools excluded from index/sitemap rather than fabricated results.
- [ ] Verify llms files contain only approved public content; exclude private/draft data; document experimental convention and no Google ranking effect.
- [ ] Verify informative image alt text, explicit decorative alt, dimensions and AVIF/WebP handling; review mobile table/card, headings/TOC, keyboard/focus and WCAG 2.2 AA with UX.
- [ ] Meet mobile Lighthouse 95+ targets with representative marketplace/article/tool/checkout templates; record device/network/config and variance. Check LCP<2.5s and CLS<0.1 in lab; field INP<200ms needs real user monitoring.
- [ ] Verify consent-aware analytics/pixels and no blocking third-party scripts; evaluate only on eligible consent states.
- [ ] Run meaningful unit tests for metadata, sitemap, robots, exact matching/status and JSON-LD builders; Playwright checks publish/revalidation, sitemap, representative redirects, unauthorized private access and redacted 404 logging.

## Launch day (after tested build and approved cutover)

- [ ] Back up content, DB, media and original routes; verify restore and rollback/cutover plan, DNS/TLS/origin routing and source system preservation.
- [ ] Verify ownership of the canonical Search Console property; confirm verification IDs/DNS; no Change of Address tool for this same-domain platform rebuild.
- [ ] Remove production-only staging noindex/auth restrictions from public pages; retain private-route protections; inspect live HTML/meta and robots immediately.
- [ ] Submit canonical sitemap in [Search Console](https://search.google.com/search-console/); inspect `/`, main metric hub, buyer guide and service canonical/indexing state with URL Inspection.
- [ ] Live redirect spot checks: `/guest-post-marketplace/`, `/da40toda50/`, `/dr-20-to-50/`, `/compress-image`, `http://www.nameretailer.com/`, a reviewed archive and any approved 410. Check exact 301/410 final behavior only for approved active rows; otherwise verify preserved source.
- [ ] Confirm known monthly/detail/cart/account/checkout routes retain expected behavior; check existing bookmarks and payment return links without private-data disclosure.
- [ ] Fetch live sitemap/robots/llms/media and repeat Rich Results Test live samples; inspect server/WAF crawler failures and 5xx immediately.
- [ ] Record pre/post launch baselines where data exists; document missing baseline rather than inventing percentage uplift/loss.

## First 30 days after launch

- [ ] Daily first week: watch 5xx, 404 spikes, crawler access, payment/account failures, broken media and unexpected redirects; resolve relevant missing routes individually.
- [ ] Weekly: review GSC indexing/canonical/sitemap/rich-result reports and query/page organic performance; compare like dates/devices/countries, recognizing indexing lag and seasonality.
- [ ] Review field Core Web Vitals/CrUX or privacy-appropriate RUM; verify mobile INP once sufficient field data exists rather than substituting Lighthouse for field evidence.
- [ ] Review sampled AI citations/referrals as incomplete observations; report no guaranteed GEO rankings or attributable gain from llms files.
- [ ] At 30 days: review losses/gains and customer conversion issues, adjust evidence-backed content/links, keep useful 301s for at least a year and preserve rollback evidence.
