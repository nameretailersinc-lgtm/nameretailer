# SEO reconnaissance

Inspection date: 2026-10-10 (Asia/Karachi). This document records repository evidence, not verified production behavior or traffic projections.

## Routing and rendering

- Next.js 16.3.8, App Router, React 19, TypeScript, standalone production output. `AGENTS.md` requires consulting the installed Next.js guides before changes.
- `/` renders `ServerMarketplace`, which awaits MongoDB listings and passes the first page into the client `Marketplace` component. Names, metrics and prices are in the initial server HTML. It is dynamic SSR, not an inventory page that depends solely on a browser fetch.
- `publicProductPage()` uses React request memoization plus a 60-second process cache, shared in-flight requests and a one-hour stale-on-error allowance. Catalogue aggregates use a 15-minute cache and one-day stale allowance. Cache loaders have a 20-second timeout; listing MongoDB queries have 15-second timeouts. Cold-cache errors can still escape directory metadata and rendering.
- `/[tool]` dispatches to registered niche/country/budget directories, DA/DR/traffic/price ranges, or tools. Directory pages read matching active inventory server-side; ranges use `ServerMarketplace`. A slug is not automatically a tool or hub: unknown values call `notFound()`.
- `/publication/[domain]/` renders detail pages for visible active root-domain listings. The previously requested internal-link changes are present but uncommitted. Section listings use `/publication/[domain]/[listing]/`. Indexing currently uses a strong-metric subset, independently of detail availability.
- `/home/` and `/products/` have redirect pages; permanent legacy redirects are primarily in `lib/seo/redirect-map.ts`, supplemented by `docs/redirect-map.csv` and CMS redirect records through the proxy.
- Other public families: `/guest-posting-sites/`, `/guest-post-marketplace/`, `/guest-post-by-dr/`, `/guides/` and `/guides/[slug]/`, `/blog/`, `/blog/[slug]/`, `/blog/category/[slug]/`, `/authors/[slug]/`, tool pages and information/legal/support pages. Private families: `/admin/**`, `/my-account/**`, `/cart/`, `/checkout/`, and `/api/**` except the public catalogue endpoints. `/media/[...path]` serves controlled media. `/robots.txt`, `/sitemap.xml`, and `/llms.txt` are generated routes.

## Data and commercial behavior

- Catalogue data is MongoDB `commerce_products`; public queries filter active listings and exclude imports that are not committed. The documented historical import size is 56,005, not a constant to publish as a current count. No API or schema change is needed for the requested SEO work.
- `products.ts` supplies paginated listing reads, directory reads, and full matching-catalogue statistics. Browser filter requests use `/api/products/` and `/api/products/facets/`; initial HTML uses direct server reads. Aggregate date fields must be actual catalogue record timestamps, not invented metric measurement dates.
- Checkout types explicitly declare `paymentAvailable: false` and `orderSubmissionAvailable: false`. Planning, accounts and billing preparation exist; successful paid orders must not be implied by public copy. Auth, cart, payments and their contracts are outside this work.
- Blog content comes from CMS `cms_records`, with seed/source content in `lib/blog` and `scripts/content`. Technical migration articles already have an indexing-policy list, but noindex alone does not hide unfinished copy from visitors. Static buying guides and author data are in `lib/site`.

## Metadata, navigation and policies

- `app/layout.tsx` sets the metadata base, fallback title/description, Search Console/Bing environment verification and Organization JSON-LD. `pageMetadata()` creates route-level title, description, canonical, Open Graph and Twitter fields. `facetMetadata()` controls parameter indexing and pagination. Existing social images are smaller illustrations rather than 1200 × 630 template cards.
- `components/site/chrome.tsx` owns the shared footer/brand; `navigation.tsx` owns interactive navigation and guide links; `marketplace-menu.tsx` reads the range configuration. Existing Terms, Privacy, Cookies and Refund routes must be preserved. Some guide navigation still uses search query strings.
- `app/robots.ts` already blocks private routes and most filter keys while allowing public inventory endpoints. `app/sitemap.ts` is currently one URL set, not an index. Scripts assume that single URL set and must be updated together when splitting it.
- DA, DR, traffic and price bands currently overlap at boundaries. The low-price range duplicates a budget directory and needs one canonical destination. The DA group still uses a DA/PA heading although PA is not supplied.
- Legal/company facts and editorial identities must be consolidated from existing approved source/config evidence. Missing biographies, reviewer approval, real social profiles, analytical access and payment capability go in `TODO_CONTENT.md`.

## Existing checks and worktree ownership

- Available checks: ESLint, TypeScript, Vitest, production build, Playwright, SSR/URL/link/redirect/metadata/JSON-LD/hygiene scripts, inventory/index reports, and Lighthouse collection. Lighthouse currently collects results without enforcing the requested budgets.
- Prior link changes are retained for the appropriate source phase. Untracked `components/site/homepage.tsx` and `homepage.module.css` were already present at this request; they are not part of the prior link change and must not be overwritten or included accidentally in commits.
- Prior verification: internal publication routing passed 18 focused tests, typecheck and production build. Browser QA did not complete: the standalone test API returned 500 and a direct check found zero test listings. This is a verification gap, not evidence of a live catalogue failure.
- Live HTTP health, database reads, CMS copy, Search Console/GA4 and measured mobile performance need independent verification. No deployment, production content mutation or traffic outcome is implied by passing local checks.

## Phase plan

Follow the requested phases 0–14. Preserve existing commerce/auth contracts; replace public unfinished-product copy; configure sourced trust/company/editorial fields; harden public reads; consolidate ranges/redirects; add template metadata cards, a sitemap index and a documented quality gate; complete structured data and useful data/content modules; instrument consent-aware events; enforce measurable checks and record owner-dependent verification separately. Run lint, typecheck, build and tests for each phase and record the actual result in `SEO_CHANGELOG.md` before its commit.
