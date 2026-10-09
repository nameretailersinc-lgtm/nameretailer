# SEO audit implementation notes

Inspected 2026-10-09 before implementation. Working tree clean. `/mobile` is excluded.

- App Router, Next.js 16.3.8. Read installed Server/Client Components, connection, metadata, redirects, robots and sitemap guides.
- `/`, `/products/`, `/guest-post-by-dr/` and metric/price routes use client Marketplace with empty initial state and effect-based API loading. Niche directories already query on the server, but names have no links. `/guest-posting-sites/` shows directory links and counts only.
- MongoDB queries in `lib/commerce/products.ts` expose active products from committed imports. Preserve public visibility, APIs, auth, cart and checkout. USD prices use cents; missing metrics are unavailable.
- Metric/price definitions: `lib/commerce/marketplace-ranges.ts`. Niche/country/budget definitions: `lib/site/directories.ts`. `50k-to-500k` actually filters 50,000â€“100,000. Under-$50 directory overlaps price-0-to-50.
- Root layout supplies homepage OG/Twitter values to other routes. `/products/` canonical points home. Existing robots/sitemap/schema helpers need extensions.
- Config uses trailing slashes and standalone output. Proxy CSP is private-route-only. Requested redirects must specify 301 (Next permanent:true defaults to 308).
- Blog posts/categories are in MongoDB, with source seeds in `lib/blog/`. About already uses the new stack but needs factual copy. Legacy inventories: `docs/existing-site-audit.csv`, `docs/data/crawl.json`, `docs/redirect-map.csv`.
- No Search Console, backlink or approved policy evidence supplied. Do not manufacture claims, authors, policies, dates or catalogue values. Historical gated recommendations are inputs; this request authorizes relevant redirects and consolidation.

## Phase record

Results will be appended after each phase.

### Phase 1 â€” crawlability

Marketplace pages now fetch the public catalogue per request before rendering, share query normalization with the browser, and start with 20 rows. Niche rows have publication links; the directory hub includes 20 publications. Request-time rendering keeps prices fresh without caching private fields. `check:ssr` starts a production server and inspects script-free raw HTML across every range and niche route. Build passed; lint passed with one pre-existing unused import warning in `/home/` (removed when that route is consolidated).

### Phase 2 â€” canonical URLs and indexing

`/products/` had identical listings and supporting content to `/`; consolidate with a 301. `/home/` redirects to `/`, `/contact-us/` to `/contact/`. Internal home links now use `/`. Parameter views canonicalize to the clean page and use noindex,follow; nonempty fixed-size page-only pagination uses its own canonical and remains indexable. Robots excludes private and internal filter/search URLs while permitting assets and AI crawlers. Pagination is deliberately crawlable so its indexing directives can be read. Policies and the useful linked HTML sitemap use noindex. XML sitemap omits redirects/private/status pages and uses real CMS dates. Clean blog category routes resolve actual CMS categories, with 301s from old ID filters. Facet unit tests and build/lint passed; production URL checks are included in final verification.

### Phase 3 â€” legacy URLs

Implemented 87 explicit 301 sources from the supplied examples and local WordPress inventory. REDIRECT_MAP.md records destinations/reasons; nearest-hub cases are flagged in OWNER_DECISIONS.md. Legal availability stubs were added early so policy redirect targets return 200, with noindex and no invented legal text. About already renders through Next components; factual copy is addressed in Phase 6. Build and lint passed; check:redirects verifies every source and each distinct target.

### Phase 4 — metadata and route names

Route metadata now completes matching OG/Twitter titles, descriptions and page-specific image alt text. Root homepage social fields were removed. Titles are capped at 60 and descriptions at 155 characters. DA/traffic/high-end DR/price slugs use consistent names; old slugs return 301, including the 50k-to-500k typo. Navigation tools are deduplicated by canonical slug. Build/lint and 51 relevant unit tests passed; check:meta passed across 148 public pages with unique titles/descriptions, one canonical and matching social tags.


### Phase 5 — useful programme directories

Inventoried all ranges and niches in DIRECTORY_INVENTORY.md. Consolidated under-50 into price-0-to-50; distinct ranges and audience intents remain, with shared inclusive boundaries documented. Each retained directory displays statistics across all visible active listings: count, full price range/median, top listing countries/topics and an actual supplied updatedAt. No measurement date is inferred. Threshold is MIN_DIRECTORY_LISTINGS=5; smaller/unknown directories are excluded from the sitemap and use noindex,follow. Statistics share active/committed-import visibility with the API. Added request-time metadata boundaries to prevent build-time database queries. Corrected build/lint and median/threshold tests passed.


### Phase 6 — trust and attribution

Removed the unsupported 10,000+ band and unused testimonial placeholders. Public copy describes ordering/payment availability plainly; buyer FAQ covers prices, scope, formats, metrics, disclosure, turnaround and unpublished replacement terms. About uses only supplied marketplace/name/address/email facts, with code TODOs for registration/team details. Legal noindex notices are linked in the footer. CMS has optional reviewer fields; visible blog attribution uses verified active records, with real updatedAt and unknown-identity notices. Static buying guide records its actual source revision timestamp; original publication/author/reviewer remain owner decisions. Normalized internal marketplace links, and corrected unsupported country/audience and image-acceptance assumptions. Build/lint and 122 existing CMS/content/tool tests passed.

