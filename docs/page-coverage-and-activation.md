# Missing pages and reviewed inventory activation

Historical preparation report. The owner subsequently authorized activation: all 56,005 imported publications are now active. The 60 new articles, 28 tools, and outstanding verification are documented in [the current implementation report](catalog-blog-tools.md). The preparation-only language below describes the earlier stage.

2026-10-06. Owner request: restore missing customer destinations, beginning with [the existing About page](https://nameretailer.com/about/), and prepare bulk activation for imported products. Preparing activation is not treated as permission to publish the entire import. The original WordPress site and private `.env` are unchanged.

## What was missing

The earlier slice implemented the landing/catalog, accounts/cart, one draft guide and one working tool. It did not include the company/support pages, tools directory, service/resource hubs or old blog archive. The live About page confirms the broader navigation groups in the owner's screenshots. Its old marketing copy contains unsubstantiated exclusivity/results language and inconsistent legal-name spelling; these are not copied into new approved business claims. Its footer also contains a terms link to another site's theme demo. That link is not a valid rebuild legal policy.

## New routes

| Route                      | Actual scope                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/about/`                  | Original marketplace-focused company introduction using confirmed offer and contact details                        |
| `/contact/`                | Confirmed email/address and a real mailto link; no pretend form or response-time promise                           |
| `/how-it-works/`           | Working browsing, comparison and planning-cart steps; upcoming checkout clearly identified                         |
| `/help-center/`            | Browsing/account/cart assistance and links to actual support destinations                                          |
| `/faq/`                    | Expandable answers about inventory, pricing, metric provenance and preview limits                                  |
| `/services/`               | Placement and optional writing scope; no unsupported custom-quote or order submission                              |
| `/guides/`                 | Directory of available draft/process resources, without invented authors/dates                                     |
| `/blog/`                   | Explicit archive-migration status and related resources, not fabricated blog entries                               |
| `/seo-tools/`              | Tool directory: word counter available, remaining entries visibly planned; duplicate DR-checker menu entry removed |
| `/guest-post-marketplace/` | DA/DR/traffic/price navigation using the real catalog's supported filters and sorts                                |
| `/policies/`               | Policy-readiness status, explicitly not legal terms, a privacy policy or a refund guarantee                        |
| `/site-map/`               | Human-readable directory of working routes, not public XML sitemap/redirect activation                             |

All new routes use the same customer header/footer, typography, responsive gutters and public artwork. Main navigation now reaches Tools, Guides, About and Help hubs; the footer includes company/support destinations and the page directory. All routes remain noindex. These information pages are currently repository-backed, not a completed CMS-driven public-content migration. This does not reproduce the old clipped nested-menu layout.

Still outstanding: actual blog article/author migration, the planned tool implementations and provider access, legacy metric-range URLs and redirect review, approved legal/privacy/refund/copyright/community policies, community features, checkout/payment/invoicing and order tracking. A directory or status page is not counted as implementing those features. No theme-demo policies, fake articles, provider responses, reviews, verification claims or growth results are published.

## Bulk activation workflow

The new **Bulk activation — reviewed imports only** panel at `/admin/products/` requires a completed import ID. Default batch size is 100; the server permits 1–500. It displays every candidate in that batch, not a small sample. An inventory link scopes admin browsing to the same import.

1. Enter the completed import ID and choose the batch size.
2. Preview the exact draft listings, prices, classifications and missing metric counts. This does not change products.
3. Review the full batch, acknowledge that metrics remain owner-supplied and type `ACTIVATE REVIEWED LISTINGS`.
4. Explicitly activate that batch. Preview again before activating another batch.

The preview is signed, actor-bound and valid for 15 minutes. Its fingerprint covers the exact candidate data, including private writing tiers, without returning raw source fields. Confirmation requires admin authentication, same-origin and signed CSRF, strict schema and rate limits. The server rechecks active admin status, committed import, draft status, validation and fingerprint inside the shared transaction. Changed data, forged/expired proof, stale versions or incomplete confirmation fail closed. Status/version/timestamp changes and the audit record commit atomically; active/archived records and unrelated imports are untouched. Successful activation enables catalog visibility, not checkout or publisher verification. Replaying the same proof cannot activate the next batch.

This bounded workflow intentionally does not perform one enormous transaction over 56,005 listings. Each batch is a separate reviewed operation. A production activation should follow owner review of publisher availability, current prices and placement requirements; stored schema validation alone does not establish those facts.

## Owner import preparation

Read-only command:

```text
npm run products:activation-preview -- 06cd8282-0dda-411f-becf-2a8c081d693f 100
```

There is deliberately no commit option in this command. The current report found **56,005 draft products, zero invalid normalized drafts, 74 excluded original CSV rows, and 267,176 missing metric cells**. The first proposed batch contains 100 listings; its review fingerprint is `97d9113ef483fd5d4d34bd61a2e66ab47cf55705a5d94fa835062f07f26e164d`. No owner products were activated. These are stored-data checks, not independent publisher verification or proof of current availability. The admin must create a fresh signed preview before activation; the CLI fingerprint alone cannot authorize a write.

## Verification

Full TypeScript, ESLint, **191 unit tests in 14 files**, and optimized standalone packaging pass. The first TypeScript check found a MongoDB collection-ID type annotation missing in the new read-only CLI; it was corrected before the passing build. Packaging removed only a generated standalone environment copy and preserved the original `.env` and supplied assets.

**61 unique browser/API cases pass across two invocations**, with no failures or skips:

- The first candidate passed 53 cases under ignored `.local/qa-page-coverage-activation/`: eight customer-consistency, seven information-page, four activation, seven product API, nine product browser, eight marketplace-design and ten reference-template cases.
- Screenshot/source review then corrected the new shared information-hero's reserved dimensions to match each supplied asset, added missing FAQ/directory metadata descriptions, and extended activation-preview checks to mobile/tablet widths. The final build passes again.
- The final artifact passed 27 cases under ignored `.local/qa-page-coverage-final/`: eight account/cart, eight customer-consistency, seven information-page and four activation cases. This rechecks every changed page and the exact activation UI, plus account isolation, registration, CSRF-purpose separation, reset states and save/update/remove journeys. The repeated 19 cases do not add to the unique count; this is not one 61-case invocation. Other catalog/reference services are unchanged by the final hero/metadata corrections and retain the first run's evidence.

The six-width loops cover **126 route/viewport states**: nine existing customer routes and twelve new routes at 320, 375, 768, 820, 1024 and 1280px. These are not 126 separate tests. Six breakpoint boundary states are also checked. Assertions cover one H1/main, noindex, loaded public artwork with matching intrinsic/reserved aspect ratios on the new routes, aligned header/main/footer gutters, no document overflow or clipped/overlapping navigation, targeted axe A/AA checks, real directory destinations and FAQ interaction. The final activation UI also reflows at 320, 375, 820 and 1280px with an exact synthetic preview and targeted axe checks.

Activation tests verify denied anonymous/editor/author/customer access, same-origin and CSRF protection, literal acknowledgement/confirmation, forged count rejection, read-only product preview, exact bounded activation, preserved private source and missing metrics, version increments, replay rejection, admin import filtering, changed-price/version rejection of the entire preview, and the browser confirmation flow. Unit checks additionally cover scope bounds, fingerprint stability and private-writing-price changes, actor binding, expiry and malformed proof. These do not claim exhaustive transaction fault injection or every security scenario.

Reviewed first-candidate captures include desktop About and mobile tools. Reviewed final captures include [tablet About](../.local/qa-page-coverage-final/information-pages-informat-04fa6--chrome-and-reflow-at-820px/about-820.png) and [mobile activation preview](../.local/qa-page-coverage-final/product-activation-admin-r-af20b-firmation-before-activation/activation-preview-375.png). A [final mobile tools capture](../.local/qa-page-coverage-final/information-pages-informat-eaedb--chrome-and-reflow-at-375px/seo-tools-375.png) is also available. Captures are ignored local QA artifacts, not changes to the supplied public artwork.

All integration mutations use synthetic records in the guarded `_test` database, never the owner import. Fresh synthetic accounts were used for the final run; normal registration, login, activation and import limits stayed enabled. The loopback test server was stopped after verification. Earlier consistency reports remain historical evidence, not automatically evidence for these new routes or the activation endpoint.

No deployment, WordPress mutation, data activation in the owner database, purchase, payment or migration cutover occurred. The bounded checks do not certify full WCAG conformance, pixel identity, all browsers/zoom states, performance targets, exhaustive security or launch readiness.
