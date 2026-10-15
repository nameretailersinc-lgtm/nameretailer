# Organic SEO implementation and audit — 2026-10-15

## Scope and evidence

This pass inspected the App Router route inventory, metadata and sitemap code, blog queries/index policy, CMS validation and permissions, cache invalidation, redirect configuration, tool catalogue and server input protection, analytics consent code, guide templates and existing SEO checks. It implements a targeted improvement set; it is not a claim that every phase of the master request has been completed or that rankings have improved.

Existing uncommitted publication-page, publication-profile, HTML site map and related test changes were present at the start and preserved. No production database content was changed and nothing was deployed. Installed Next.js 16.3.8 metadata, sitemap and revalidatePath guides were read before the related code changes.

The actual site is a guest-post publication marketplace with SEO utilities, rather than a domain registrar or a domain-name research service. Existing tool modes distinguish local processing and catalogue lookup. The domain expansion therefore starts with three practical guides, one hub and one genuinely local tool; it does not rename the marketplace or imply registrar capabilities.

## Findings by priority

| Priority | Finding and evidence | Result / next action |
|---|---|---|
| P1 | Article `generateMetadata` spread generic facet metadata over the CMS canonical | Fixed: preserve the validated CMS canonical, apply query noindex separately and retain follow preference |
| P1 | Live blog sitemap query projected only slug/date and included every published post | Fixed: check route syntax, publication state, post type, nonempty sanitized body and self canonical before inclusion |
| P1 | Blog policy explicitly records owner approval to index all published articles on 2026-10-10 | Preserved, including historical robotsIndex=false values. Do not claim the admin noindex field currently controls published blog indexing; resolving that policy requires deliberate product/owner review |
| P1 | CMS invalidation did not clear the separate process-local sitemap cache | Fixed locally for content/category/redirect changes; prevent old in-flight loads from repopulating an invalidated cache. Other processes retain their own copies up to 15 minutes, and HTTP caches up to 300 seconds |
| P1 | The broad local SEO suite received homepage HTTP 500 after a 12-second catalogue load timeout | Full SSR/link/metadata/redirect/schema crawl is not verified. Investigate database connectivity and catalogue query timing before release |
| P1 | No authorized GSC/GA4 reporting dataset or paid keyword dataset was supplied | Positions 8–30, low-CTR opportunities, indexing exclusions, traffic losses and country demand remain unverified |
| P2 | Empty category records were unconditionally added to XML | Fixed: category inclusion now requires a published, nonempty, self-canonical article referencing that category |
| P2 | Comparison tables could scroll at 320px without keyboard focus | Fixed guide and price-table regions with tabIndex, region role and accessible name |
| P2 | No domain naming resources or domain length tool found in the existing guide/tool catalogue | Added a small linked cluster, using existing visual components |
| P2 | Several legacy service redirects describe destinations as the “closest service hub” with former scope unconfirmed | Preserve for now; compare old WordPress content and backlinks against destination intent before changing. No new blanket redirects added |
| P2 | Guide templates are code-managed; CMS articles have their own admin workflow | New guides use existing code-managed guide system. They are not newly editable CMS articles; migrating templates into CMS would require additional work |
| P2 | Historical local performance artifacts show targets were not met | See performance section; do not represent historical numbers as this pass’s improvement |
| P3 | Geographic demand and localized registration differences are not established | Keep English worldwide. No fabricated country landing pages or hreflang |

## Implemented pages and links

- `/domain-names/`: hub with naming, registration and migration decision paths.
- `/domain-length-checker/`: functional browser-only hostname/label length checker; ASCII conversion for IDNs; examples, instructions, methodology, limitations and visible questions.
- `/guides/choose-a-domain-name/`: business/startup/ecommerce shortlist rubric, spoken spelling and recall checks, extension decisions and separate verification steps.
- `/guides/buy-and-register-a-domain-name/`: registration ownership, quote-based renewal worksheet, DNS/email checks and transfer considerations.
- `/guides/domain-name-seo-and-migrations/`: domain ranking myths, extension context, URL mapping, equivalent redirects, canonical consistency and monitoring.

The tools directory links to the hub and checker. The hub links to every domain guide, and the guides link to each other, the hub and checker. Existing HTML site-map guide/tool lists automatically pick up registered entries. XML picks up approved guides and the registered tool; the hub has an explicit static sitemap entry. Existing marketplace design and workflows remain.

Existing blog pages gain canonical/follow handling; existing guide comparison tables gain keyboard access. Existing titles were not rewritten on the basis of invented impressions or rankings. No old ranking URL was renamed or merged in this pass.

## Tool accuracy

The checker calculates the ASCII presentation hostname length (253 maximum excluding root dot) and each DNS label (63 maximum), following [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035#section-2.3.4). It rejects URLs, paths, ports, whitespace, malformed labels and IP addresses, supports browser IDNA conversion, and reports original Unicode code-point count separately. It does not use a public suffix list or determine registry eligibility, availability, price, trademark clearance or SEO quality. It makes no lookup request and needs no credentials or public lookup endpoint.

Availability, bulk availability, age and valuation tools are deferred. No authoritative availability provider, tested registry coverage or defensible valuation model was established. RDAP registration data alone is not a registrar purchase offer, and registration age is not website age. Existing catalogue Domain Rating lookup is not a domain availability/age checker.

## Keyword research

See [all 30 candidates](domain-keyword-map-2026-10-15.csv). Each row has exactly one canonical target, intent, action, qualitative priority, observed competition or explicit evidence limitation, and opportunity. Deferred targets do not exist and were not added to sitemaps. Related keywords share a substantial target to avoid near-duplicate pages. A supporting-intent row is not a claim that the page fully satisfies a generator or specialist lookup query.

Monthly volume, difficulty and CPC are **Unverified for all 30**. Best country is also **Unverified**, rather than treating the United States as a measured winner. Start with worldwide English and analyze US, UK, Canada, Australia and Pakistan with real query/country data before localizing.

Search observations on 2026-10-15 were a representative search-engine sample, not a location-controlled Google rank tracker or an exhaustive exact-query SERP study. Some multi-query searches returned only related results; those limits are labeled in the CSV. Examples:

- Naming/store queries: [Shopify’s naming guide](https://www.shopify.com/blog/choose-domain-name), [Wix business domain guide](https://www.wix.com/blog/how-to-choose-business-domain-name), [Hostinger ecommerce guide](https://www.hostinger.com/tutorials/how-to-choose-a-domain-name-for-ecommerce-store/). Established platforms compete here; a worksheet and usable tests are a clearer differentiation than generic lists.
- Registration/history: [ICANN registration process](https://www.icann.org/resources/pages/domain-name-registration-process-2023-11-02-en), [Namecheap expired-domain guidance](https://www.namecheap.com/guru-guides/buy-expired-domains-guidelines/). Dedicated lifecycle/history content needs further research before publication.
- Extension comparisons: [GoDaddy comparison](https://www.godaddy.com/resources/skills/com-vs-net-vs-org) and [Network Solutions comparison](https://www.networksolutions.com/blog/com-vs-net-vs-org/). Technical SEO claims in our guide use Google, rather than competitor assertions.
- Bulk lookup: [NameStation](https://www.namestation.com/domain-search/bulk), [SeekDom](https://seekdom.com/). Interactive intent requires a real data-backed tool.
- Length: [Aback Tools](https://abacktools.com/tools/network/domain-tools/name-compression-tool). The implemented checker offers transparent ASCII/Unicode distinctions; ranking difficulty remains unknown.
- Age: [DomainAgeTracker](https://domainagetracker.com/), [ToolsPivot](https://toolspivot.com/domain-age-checker). Provider scope and registration/site-age distinctions matter.
- Business-name checks: [Shopify](https://www.shopify.com/blog/how-to-check-if-a-business-name-is-taken), [Stripe](https://stripe.com/resources/more/how-to-check-if-a-business-name-is-taken). A global legal-clearance claim would not be justified.

No competitor traffic, rankings, conversion rates or volume figures were inferred.

## Sitemap, canonicals and migration

Approved public-network read-only checks returned HTTP 200 for `/sitemap.xml`, `/robots.txt`, `/sitemaps/static-0.xml`, `/sitemaps/hubs-0.xml` and `/sitemaps/content-0.xml`; sitemap responses had XML content types. These checks establish current live endpoint availability, not that the local changes are deployed or every nested URL is valid.

The existing architecture also supports publication sitemaps, splits by count/bytes, XML escaping, deduplication and meaningful record/guide dates. Robots references the canonical sitemap and protects private/API paths. Canonical origin is fixed to `https://nameretailer.com`; trailing slashes remain configured. Parameter metadata and private headers already exist. Static entries do not fabricate lastmod. CMS updatedAt can include metadata-only updates, so editorial dates still need review.

Complete indexable-URL comparison is **not verified**: CMS articles, categories, inventory-dependent ranges/directories, profiles and pagination depend on live records. Source inventory alone cannot enumerate them. The existing health checker crawls sitemap URLs plus registered hubs; the full check chain stopped at the homepage dependency failure. A complete WordPress export/backlink/log inventory was not available. Existing redirect maps and tests cover known aliases; missing historical URLs, lost metadata, true soft-404 cases and “discovered, not indexed” require crawl/GSC evidence.

Do not redirect unknown deleted pages to unrelated hubs. Google recommends corresponding URL mappings, real 404/410 for removed content without a replacement and monitoring during migrations: [site move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). Sitemaps should contain intended canonical URLs and do not guarantee indexing: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## CMS, security, schema and analytics

CMS validation supports title, description, canonical, body, categories, OG image and publishing state. Canonical input is constrained to the site origin without query/fragment and protected destinations are rejected. Permissions distinguish admin, editor and author; authors edit their own draft/archived content and publication requires admin/editor. Existing tool input protection checks origin/content type and rate limits server requests. These mechanisms were inspected and unit regression tests ran; authenticated CRUD was not revalidated against an isolated database in this pass.

New pages reuse breadcrumb JSON-LD and the established WebApplication builder for the genuinely free checker. No ratings, reviews or author identities were invented. New guides intentionally omit Article markup until actual attribution/publication information is available. Visible common questions do not add FAQ rich-result claims. Browser tests parse page JSON-LD; this is syntax checking, not external Rich Results certification.

Analytics code gates optional tracking on consent, excludes private workspaces and has existing unit tests. That does not verify production GA4 event delivery or Search Console access. No account integration is claimed and no tokens/credentials were printed.

## Validation and performance

- Production build: passed after implementation, including framework TypeScript and standalone packaging checks.
- Typecheck: passed, including the final recheck.
- ESLint: passed.
- Unit tests: 50 files, 527 tests passed after cache-invalidation coverage.
- Initial domain Playwright run: 2 passed, 2 failed. The mobile failure exposed unfocusable scrollable guide tables, which were fixed. The other failure was an overly broad alert locator matching Next’s route announcer, corrected by scoping it to main. Final rerun outcome is recorded below.
- Final domain Playwright rerun: **4 passed** against the rebuilt production server. All five new resources passed reflow, one-H1, canonical/index metadata, JSON-LD parsing and main-content axe checks at 320, 768 and 1280px. Checker interaction and invalid-input handling passed without tool API requests.
- Final unit recheck: **50 files / 527 tests passed**. `git diff --check` passed and CSV parsing confirmed exactly 30 candidate rows.
- Broad `check:seo`: sandbox tsx could not read Windows user information; the approved retry executed but failed at homepage HTTP 500/catalogue timeout before subsequent scripts. No full-crawl pass is claimed.
- Live public robots/sitemap endpoint checks: five HTTP 200 responses, as above.

No new field CWV or Lighthouse measurement was completed. Existing ignored `.local/performance.json` is historical: 2026-10-11 local homepage LCP 4719.752ms, TBT 2344ms, CLS 0. Historical interaction artifacts include homepage maximum observed interaction 776ms; that is not a field INP measurement. Those numbers miss relevant targets and cannot establish improvement from this change. First fix reproducible catalogue response timing; then measure production mobile p75 LCP/INP/CLS and use repeatable lab traces to locate image, script, font and hydration costs. Do not claim target compliance from a successful build.

## 30 / 60 / 90 day plan

1. **Days 1–30:** restore reliable catalogue-backed local checks; run full metadata/link/redirect/schema/sitemap and isolated admin CRUD/permissions suites. Obtain 16-month GSC page/query/country/device exports, indexing examples, analytics conversion definitions and old WordPress/backlink URL inventories. Prioritize actual high-impression queries at positions 8–30 and low CTR before adding content. Validate these changes in staging before deployment.
2. **Days 31–60:** optimize a small evidence-backed set of existing landing pages. Review uncertain service redirects for equivalent intent. Measure mobile CWV and fix measured bottlenecks. Expand domain history/transfer guidance only where demand and source coverage justify it. Evaluate authoritative lookup providers, licensing, quotas and registry coverage before building data-backed tools.
3. **Days 61–90:** compare like-for-like search periods and relevant conversions, including country/device segmentation. Improve pages gaining impressions but missing intent. Add localized equivalents only where meaningful registration/pricing differences and demand exist; then implement reciprocal hreflang. Review cannibalization before adding more clusters. Continue content and data accuracy maintenance without artificial date refreshes.

Outstanding inputs: GSC/GA4 reporting access or exports, keyword metrics, WordPress/WXR and backlink/log inventories, actual editorial attribution for new guides, reliable catalogue database access for end-to-end QA, and data-provider support for deferred tools. Deployment remains outside this task’s authorization.
