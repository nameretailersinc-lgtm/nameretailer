# Technical audit

Scope: existing Next.js 16.3.8 App Router application, MongoDB-backed inventory/CMS, proxy.ts, standalone deployment. Relevant installed Next.js metadata, caching, sitemap, robots and icon documentation was read before changes. There was no pre-existing working-tree diff at baseline.

Routes: marketplace / and /page/[page]; registered /[tool] directory, metric and tool routes; publication root/section identities; guides, CMS blog and blog categories; static company/legal pages; private account/cart/checkout/admin; API/media routes; robots, llms and XML sitemap handlers. No new landing pages or business routes were added.

Public robots permits HTML and required resources; private routes remain restricted. API/private responses retain X-Robots-Tag noindex. The preferred origin is fixed HTTPS non-www. Query controls use clean canonicals and noindex; the site-map query policy had its noindex accidentally overwritten by base metadata and was corrected. Existing pagination policy was preserved. Unknown missing URLs retain true 404 responses. No bot-specific page content, crawl-frequency manipulation or AdsBot blocking was introduced.

The five priority canonicals were already correct in production. The production issue was eligibility/data rendering, not a demonstrated canonical conflict. No blanket canonical rewrite was performed. Directory metadata and XML now use the same scoped data and thresholds. A failed sitemap read propagates to the existing uncached 503/Retry-After handler instead of caching a partial list.

Public catalogue reads are server-side, with process-local TTL/in-flight caching. Directory aggregates now filter active, committed, clean USD inventory inside MongoDB, retain full-match counts/price distributions, and return only displayed rows plus selected subtopic rows. Price reporting transfers grouped numeric inputs instead of full publication documents. Stale-while-revalidate keeps established public data available during refresh; original read deadlines and disclosure limitations remain.

Structured data uses existing visible Article, FAQ, CollectionPage and breadcrumb components. No fabricated rating, review, author or FAQ was added. The article's actual revision date and matching sitemap date are 2026-10-20; the preserved vetting guide's existing date is unchanged. Automatic build-time lastmod was not introduced. JSON-LD parsing and repository schema checks apply to sampled rendered pages, not Google rich-result eligibility.

Favicon: existing ICO is valid, returns 200, and matches the existing NR brand design. No authorized advertising publisher IDs or current missing WordPress media references were found. No fake advertising files or image replacements were created.

Coverage: see priority-pages-audit.csv and sitemap-validation.csv for actual HTTP versus source-only checks. All 10655 eligible profiles have unique generated titles/descriptions, but none has reviewed publisher editorial content in the captured database. Missing fields remain explicit. No publication was automatically removed or noindexed as a reaction to GSC non-selection.

Production-only unknowns: active Nginx/CDN configuration, TLS/host normalization across every hostname, verified crawler identity, logs, cache-hit rates, long-run 429/5xx incidence and Google-selected canonicals. Docker/Compose and deployment documentation were inspected; no production configuration, credentials or deployment was changed. Existing broad redirects beyond the reviewed examples need historical-content equivalence review.
