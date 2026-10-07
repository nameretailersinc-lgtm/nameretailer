# Customer screen consistency

2026-10-06 continuation after the owner reported inconsistencies and asked to check [nameretailer.com](https://nameretailer.com/). This supersedes the shared-layout details and captures in the earlier reference report; it does not activate checkout, public migration or deployment.

## Live-site comparison

The web reader timed out on the home page. A read-only Chrome review then returned HTTP 200 and captured the public storefront at 375, 820 and 1280px under ignored `.local/live-storefront-review/`. The current WordPress home is a guest-post inventory marketplace with tools, account/cart navigation and a large menu of metric segments. The 1280px capture shows the large navigation clipped at the right edge. A document-overflow check alone did not detect that clipping, so rebuild tests now inspect individual link bounds and overlaps too.

The supplied newer paper/mint reference direction remains the rebuild's visual basis. This review does not revert to WordPress styling, restore overlapping segment pages or assume its order/payment/email-verification features are implemented locally. The local home remains a landing page linked to real catalog views. No live sign-in, form submission, cart mutation, purchase or settings change occurred. Source screenshots are observations, not a complete live-site audit or proof that checkout succeeds.

## Causes and corrections

| Inconsistency                                                                        | Correction                                                                                                                                     |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Account/cart/reset pages still used the old publication-desk header and small footer | All nine customer routes use `SiteHeader`/`SiteFooter`, the same mark, navigation and contact/address; account/cart active links are indicated |
| Home suppressed the announcement bar shown on other routes                           | Same announcement bar everywhere; the home band no longer repeats the community-size statement                                                 |
| Main, header, footer and topbar used different breakpoint gutters                    | Shared `--site-gutter` and 1180px maximum-width tokens; component edges align at every tested width                                            |
| Page-title fonts/sizes differed unintentionally between templates                    | One responsive page-title token and serif family across all routes; card/form headings remain compact UI text                                  |
| Between 800 and 1000px navigation could crowd the brand/actions                      | Two-row tablet navigation through 1000px; explicit clipped/overlapping-link assertions                                                         |
| Tablet publication table and multi-column cards were too compressed                  | Publication cards through 1100px, full comparison table above it; two-column feature/process/footer layouts on tablets                         |
| Link arrows dropped below their labels                                               | Decorative link SVGs stay inline; button glyphs remain aligned                                                                                 |

The article may naturally wrap onto more lines than a short tool title. Different page contents are not forced into identical heights, and UI headings retain their semantic hierarchy. Shared chrome, horizontal alignment, typography and usable breakpoints are the consistency contract.

## Verification

The initial new consistency suite passes **all 8 cases** under `.local/qa-consistency-initial/`: nine routes at six widths (320, 375, 768, 820, 1024, 1280px), six breakpoint edges (800/801, 1000/1001, 1100/1101), and a real tablet filtering/shortlist/account/cart-navigation journey. That is 54 route/viewport checks plus six boundary states, not 54 separate tests. Each route/viewport asserts one H1/main, noindex, common title/brand/header measurements, header/main/footer gutter alignment, no clipped or overlapping navigation, targeted axe A/AA checks and keyboard skip-link focus.

Full TypeScript, ESLint, 182 unit tests in 13 files and the optimized standalone build pass. An initial build caught a TypeScript error in the newly added test's rectangle serialization; explicit typed bounds fixed it before browser testing. This was a test-source compile failure, not a passing build.

The final artifact passes **50 unique browser/API cases across two invocations**, with no failures or skips: 47 under `.local/qa-consistency-regression/`, then the three registration-heavy account/cart cases under `.local/qa-consistency-account-security/`. The 47-case run includes the eight new consistency cases, five account/cart cases, seven product API cases, nine product-browser cases, eight marketplace/metric-view design cases and ten landing/guide/tool cases. The separate three verify strict registration, customer assignment, duplicate/honeypot behavior, cart ownership and CSRF-purpose isolation, concurrency/stale writes, changed/archived totals, and browser registration/reset states. Registration limits remain enabled. This is not a single 50-case invocation, and the initial eight repeat checks do not increase the unique-case count. Earlier 42-case evidence remains historical.

Reviewed current screenshots include [mobile account](../.local/qa-consistency-regression/customer-consistency-share-7a539--across-all-routes-at-375px/my-account-375.png), [tablet catalog](../.local/qa-consistency-regression/customer-consistency-share-44732--across-all-routes-at-820px/products-820.png), [tablet cart](../.local/qa-consistency-regression/customer-consistency-share-44732--across-all-routes-at-820px/cart-820.png), and [1024px home](../.local/qa-consistency-regression/customer-consistency-share-258ed-across-all-routes-at-1024px/home-1024.png). These are ignored local QA artifacts; the supplied evidence images remain unchanged. The test server was stopped after verification.

## Boundaries

All local integration writes use synthetic `_test` MongoDB records. The original `.env`, owner export/public images, 56,005 draft products, WordPress data and live configuration are unchanged. Auth/session/CSRF/pricing/cart services are not modified by this visual fix. Private pages retain nonce CSP, no-store and noindex. Supporting client proof remains deferred. No reservations, orders, payments, DNS/cutover or deployment occurred.

The checks do not certify pixel identity, full WCAG conformance, all assistive technologies, all zoom/browser settings, CWV targets or launch readiness. Tablet widths are now explicitly checked; future template changes must preserve these invariants.
