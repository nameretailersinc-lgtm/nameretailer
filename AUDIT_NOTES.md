# SEO audit implementation notes

Inspected 2026-10-09 before implementation. Working tree clean. `/mobile` is excluded.

- App Router, Next.js 16.3.8. Read installed Server/Client Components, connection, metadata, redirects, robots and sitemap guides.
- `/`, `/products/`, `/guest-post-by-dr/` and metric/price routes use client Marketplace with empty initial state and effect-based API loading. Niche directories already query on the server, but names have no links. `/guest-posting-sites/` shows directory links and counts only.
- MongoDB queries in `lib/commerce/products.ts` expose active products from committed imports. Preserve public visibility, APIs, auth, cart and checkout. USD prices use cents; missing metrics are unavailable.
- Metric/price definitions: `lib/commerce/marketplace-ranges.ts`. Niche/country/budget definitions: `lib/site/directories.ts`. `50k-to-500k` actually filters 50,000–100,000. Under-$50 directory overlaps price-0-to-50.
- Root layout supplies homepage OG/Twitter values to other routes. `/products/` canonical points home. Existing robots/sitemap/schema helpers need extensions.
- Config uses trailing slashes and standalone output. Proxy CSP is private-route-only. Requested redirects must specify 301 (Next permanent:true defaults to 308).
- Blog posts/categories are in MongoDB, with source seeds in `lib/blog/`. About already uses the new stack but needs factual copy. Legacy inventories: `docs/existing-site-audit.csv`, `docs/data/crawl.json`, `docs/redirect-map.csv`.
- No Search Console, backlink or approved policy evidence supplied. Do not manufacture claims, authors, policies, dates or catalogue values. Historical gated recommendations are inputs; this request authorizes relevant redirects and consolidation.

## Phase record

Results will be appended after each phase.

### Phase 1 — crawlability

Marketplace pages now fetch the public catalogue per request before rendering, share query normalization with the browser, and start with 20 rows. Niche rows have publication links; the directory hub includes 20 publications. Request-time rendering keeps prices fresh without caching private fields. `check:ssr` starts a production server and inspects script-free raw HTML across every range and niche route. Build passed; lint passed with one pre-existing unused import warning in `/home/` (removed when that route is consolidated).

### Phase 2 — canonical URLs and indexing

`/products/` had identical listings and supporting content to `/`; consolidate with a 301. `/home/` redirects to `/`, `/contact-us/` to `/contact/`. Internal home links now use `/`. Parameter views canonicalize to the clean page and use noindex,follow; nonempty fixed-size page-only pagination uses its own canonical and remains indexable. Robots excludes private and internal filter/search URLs while permitting assets and AI crawlers. Pagination is deliberately crawlable so its indexing directives can be read. Policies and the useful linked HTML sitemap use noindex. XML sitemap omits redirects/private/status pages and uses real CMS dates. Clean blog category routes resolve actual CMS categories, with 301s from old ID filters. Facet unit tests and build/lint passed; production URL checks are included in final verification.
