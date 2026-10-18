# Sprint 2 — existing commercial pages and buyer guidance

October 18, 2026. This phase continues the [technical audit](seo-audit-2026.md) and implements the [keyword map](seo-keyword-map.md). It changes existing routes and preserves the marketplace, accounts, saved plans, checkout/provider configuration, CMS, mobile APIs and redirects. No new URL, publisher inventory, metric, testimonial or service offering is created. Nothing is deployed by this task.

## Implemented changes

| Canonical | Distinct intent and resulting content |
|---|---|
| `/` | Guest post marketplace for SEO agencies, with an explicit small-business use case. New title/H1, real niche/price/traffic filter context, agency shortlist example, existing budget-directory links and clearer supplied-metric/country caveats. |
| `/guest-post-prices/` | Guest post pricing by niche. The actual dated inventory distributions remain unchanged. Added a four-step comparison process, placement-versus-total-budget explanation and links to scope/evaluation guidance. Scrollable price tables gain keyboard focus, region roles and labels. |
| `/how-to-buy-links/` | How to choose guest posting websites. Added an answer-first introduction, industry discovery step, SaaS and budget research examples, audience-evidence checks and links to the separate vetting, traffic and cost guides. The existing URL and anchored sections remain. |
| `/guides/guest-post-cost/` | How much a guest post costs. Added a clearly labeled hypothetical $45 + $20 + $10 = $75 example, affordable-site selection, guest-post-versus-insertion scope and links to the existing budget worksheet. Hypothetical inputs are not publisher prices or market estimates. Removed an unsupported claim that prices necessarily rise with audience/authority. |
| `/guides/da-vs-dr-and-traffic/` | How to interpret DA, DR and publisher traffic. Added organic versus total visits/page views, provider/date/domain-scope evidence and a hypothetical SaaS relevance decision. Country fields and large traffic numbers do not prove actual audience location or useful readers. |
| `/guides/vet-a-guest-post-site/` | How to evaluate guest post publishers. Added topical-relevance checks, a practical review record and explicit pause/reject decisions. This is deeper due diligence, distinct from the selection workflow. |

The three substantially revised buyer guides, selection page and price guidance have a real October 18 content update date. The price page shows that editorial date separately from the catalogue observation date; its sitemap lastmod uses the later actual editorial/listing update. Existing original publication dates/authors are retained; no new reviewer or claim of author review is fabricated. The selection page still has no invented Article author or publication date. Existing qualified guide Article and breadcrumb markup follows visible dates/content. Guide price tables now retain cents instead of rounding every displayed amount to a whole dollar.

## Keywords and internal links

Primary intents remain assigned to one canonical each. Supporting phrases integrated naturally include “guest posting sites with prices”, “guest post marketplace with niche filters”, “how to find guest posting opportunities by industry”, “how to compare guest post prices”, “affordable guest posting websites”, “how to evaluate guest post publishers”, “guest posting sites with organic traffic” and “guest post cost vs niche edit cost”. Traffic language explicitly explains that an unspecified supplied number is not verified organic traffic.

The homepage links to SaaS, up-to-$50, price data, cost and evaluation resources. Selection links to the directory hub, SaaS/budget directories, evaluation, metrics, report and cost guide. The three buyer guides gain specific related-resource lists, including the existing budget worksheet instead of a competing budgeting article. The price report links back to evaluation, cost and the budget directory.

No managed outreach, white-label link-building service, guaranteed ranking, verified audience or live third-party checker is advertised. Price statistics still come from `priceBreakdown`/`catalogueSummary`; absent data does not become invented averages. No calculator is represented as implemented. Existing niche/country directories stay intact; UK/Finance/Real Estate proposals still require their inventory/content acceptance checks.

## Evidence and sources

Reviewed the installed Next.js metadata guide before changes. The guide facts were checked against primary sources on October 18: [Google paid-link qualification](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links), [Google link-spam policy](https://developers.google.com/search/docs/essentials/spam-policies#link-spam), [Moz's authority scoring guide](https://moz-static.s3.amazonaws.com/products/landing-pages/announcements/Authority_Scoring_Guide.pdf), [Ahrefs Domain Rating](https://ahrefs.com/seo/glossary/domain-rating), and [Ahrefs organic traffic estimation](https://help.ahrefs.com/en/articles/1863206-what-is-organic-traffic-in-ahrefs-and-how-do-we-calculate-it). The Moz PDF is historical; it is used for comparative-metric limitations, not current algorithm/version claims. Selection/budget examples are original explanatory scenarios.

The Sprint 1 per-URL CSV remains a production snapshot. The Sprint 2 browser run writes `reports/seo-sprint2-pages.json` with locally observed titles, descriptions, H1–H3 headings and internal links only after its desktop page checks pass. That file is explicitly local; it is not deployment or Google indexing evidence. No keyword-volume figures or GSC findings were added.

## Files changed

`app/page.tsx`, `components/site/homepage.tsx`, `components/site/directory-page.tsx`, `app/guest-post-prices/page.tsx`, `app/how-to-buy-links/page.tsx`, `lib/site/editorial.ts`, `lib/site/buyer-guides.ts`, `app/guides/[slug]/page.tsx`, `lib/seo/sitemap-entries.ts`, `tests/e2e/seo-sprint2.spec.ts`, `docs/seo-keyword-map.md`, this report and the generated local page inventory. Earlier uncommitted Sprint 1 QA/report changes are preserved separately.

## Verification

| Check | Executed result |
|---|---|
| Production build | Passed: Next.js compile, framework TypeScript, 137 static pages and secure standalone packaging. The sandboxed attempt stalled and was stopped; the first retry correctly refused its still-held build lock. The final retry passed after stopping only the identified old validation process. The existing development server was preserved. |
| Unit tests | **55 files / 573 tests passed**, including existing guide/date, metadata, account, checkout, payment, CMS and mobile API units. No authentication/payment production code changed in this phase. |
| TypeScript / ESLint | **Both final checks passed**, including the new browser regression file. Exact outcomes are recorded in [the validation artifact](../reports/seo-sprint2-validation.json). |
| Focused browser tests | **3 passed / 0 failed** against the rebuilt local production server. Six pages at 375px and 1280px: 12 page/viewport states with main-content axe checks, one visible H1, no document overflow, unique bounded metadata, self canonicals, matching social titles and JSON-LD validation. Existing Article publication dates and actual new modification dates matched visible guide dates. |
| Cost/link/query workflow | The third browser test verifies the hypothetical total and its explicit labeling, HTTP 200 responses for cost-guide internal destinations, navigation to the price report, its visible editorial date and sitemap lastmod, and noindex/clean canonicals for four query variants. These are read-only checks; no account, order or inventory mutation. |
| Content hygiene | All six revised pages passed language, heading, image-alt and image-width checks; source image declarations passed. |
| Page inventory | [Six local page records](../reports/seo-sprint2-pages.json) capture current metadata/headings/internal links. The production CSV remains unchanged. |
| Whitespace | `git diff --check` passed; normal LF/CRLF notices are not errors. |

These are scoped phase checks, not a new full-production crawl or Google rich-result certification. The prior 750-route/Sprint 1 audit and its legacy browser/reset-mail limitations remain historical results. Real payments, fulfillment, reset-mail delivery, field CWV, GSC indexing and rankings were not reverified or claimed. The final changes do not resolve those external release gates.

## Remaining work and release

Reconcile GSC query/page overlap among the journal, selection and evaluation guides before any merge or redirect. No actual cannibalization or ranking improvement is asserted without that dataset. Numeric Keyword Planner files remain unavailable at their earlier paths. These existing guides remain code-managed; CMS records and their author/admin controls were not migrated or overwritten. New editorial review of these revisions is not implied by retained historical attribution.

Next phase: validate niche/country inventory before creating a useful UK/Finance/Real Estate directory; then address measured catalogue/search/mobile bottlenecks, publisher details and comparison/budget functionality in the original order. No paid data tool should be published without a licensed provider.

Release only after review/authorization. Pushing `main` triggers the existing deployment workflow, so this task does not push or merge. Use the existing deployment/environment instructions in the Sprint 1 audit; preserve secrets/uploads and check the six changed canonicals, query noindex, guide dates/schema, internal links and mobile layout after release. Request GSC live inspection for the six canonical URLs, then monitor qualified planning/enquiry actions and like-for-like country/device search data. Keep the existing 30/60/90-day plan; this sprint completes its initial commercial/editorial slice without claiming indexing or ranking gains.
