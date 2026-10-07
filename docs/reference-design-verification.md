# Reference-template verification

Historical artifact note: the subsequent [customer consistency review](customer-consistency-review.md) unifies account/cart/reset chrome, page-title/gutter tokens and tablet breakpoints. The earlier counts and captures below remain evidence for their own builds, not the later shared-layout revision.

2026-10-06. Scope: latest owner PNG references, public artwork, dedicated landing/catalog/metric/guide/tool routes, and regression of the implemented account/cart slice. See [implementation and deliberate reference differences](reference-design-implementation.md).

## Checks and execution history

- Latest full unit suite: **182 passed, 13 files**. This includes six local counter checks and account/cart/registration-purpose/visibility/schema/pricing checks.
- Full TypeScript, ESLint and optimized standalone build pass. `public/` is packaged; generated environment copies are excluded without changing the original `.env`.
- Initial reference run: **38 passed, 4 failed** under ignored `.local/qa-reference-final/`. Three failures identified the dark marketplace inquiry's eyebrow contrast; one identified an ambiguous header link/filter input label. Source fixes restore contrast and give the header navigation its own accessible name. These failures are preserved, not counted as passing evidence.
- Corrected production-mode invocation: **42 passed, zero failures/skips**, under `.local/qa-reference-polished/`. Eight account/cart cases, seven product API, nine product UI, eight marketplace/DR design, ten home/guide/tool cases. No protections were disabled.
- Subsequent screenshot review identified oversized marketplace benefit headings due to an inherited editorial H2 style. Scoped marketplace CSS now uses compact14px UI headings and removes the large benefit-card surfaces to better follow the reference. A new regression assertion requires that14px computed size. This is a final UI-only change, not an account/cart/API change.

The typography follow-up passed **all27 affected UI cases**, without failures/skips, under `.local/qa-reference-release/`. This rechecks nine product UI, eight marketplace/metric-view and ten home/guide/tool cases against that rebuilt artifact.

A further full-page review moved the unchanged metric-source explanation from the narrow filter sidebar to a mint panel directly beneath the results, made its heading compact, and restored the reference's amber preview notice. A placement assertion verifies the explanation stays with the results and retains its missing-date caveat. Only public marketplace markup/CSS changed; account/cart services, APIs and private styling did not. The final rebuilt marketplace artifact passed **all17 affected marketplace/product UI cases**, without failures/skips, under `.local/qa-reference-marketplace-final/`. Earlier captures are not substituted for that final marketplace artifact.

There are **42 unique browser/API cases verified in this continuation**, not42+27+17 different cases. The42-case corrected run establishes account/cart and API behavior; the27-case follow-up rechecks affected public templates; the17-case final follow-up rechecks the later marketplace-only change. The latter change does not touch the home/guide/tool/private account/cart implementations. These runs cover33 distinct responsive route/template/state checks without multiplying duplicate executions. No claim is made that all42 cases ran together after the last visual change.

## Current visual evidence

Root visually reviewed desktop home/guide/tool and the final full-page Domain Rating view, plus mobile home/tool and the earlier responsive catalog captures. Images are real captures of the app, not the supplied PNG references. Captures use synthetic QA inventory; they are not screenshots of real available publishers. Home/guide/tool images below come from the27-pass follow-up and are unaffected by the later marketplace-only selectors/markup.

- [Home desktop](../.local/qa-reference-release/reference-templates-home-r-51d9e-eflows-accessibly-at-1280px/home-1280-viewport.png), [mobile](../.local/qa-reference-release/reference-templates-home-r-0a0e6-reflows-accessibly-at-375px/home-375-viewport.png)
- [Draft guide desktop](../.local/qa-reference-release/reference-templates-guide--aaa80-eflows-accessibly-at-1280px/guide-1280-viewport.png), [mobile](../.local/qa-reference-release/reference-templates-guide--4864f-reflows-accessibly-at-375px/guide-375-viewport.png)
- [Word counter desktop](../.local/qa-reference-release/reference-templates-word-c-419d5-eflows-accessibly-at-1280px/word-counter-1280.png), [mobile](../.local/qa-reference-release/reference-templates-word-c-bdb40-reflows-accessibly-at-375px/word-counter-375-viewport.png)
- [Final Domain Rating view](../.local/qa-reference-marketplace-final/marketplace-design-referen-41b45-accessible-reflow-at-1280px/domain-rating-1280.png)
- [Final products desktop](../.local/qa-reference-marketplace-final/marketplace-design-referen-11345-accessible-reflow-at-1280px/products-1280-viewport.png)

Each matching directory retains full-page/viewport captures. The guide/tool/landing checks restore scroll position and remove the test-created main focus ring before capturing; keyboard focus behavior is still asserted beforehand. Public images are eagerly loaded for screenshots and checked for real natural dimensions. Reports and trace diagnostics stay in ignored local artifacts; generated trace JavaScript is not application source and is excluded from lint.

The root-owned QA server was stopped after verification. Full source lint, TypeScript,182-unit suite and standalone build pass after the final code changes. No unresolved blocking test defect remains within this bounded scope; pixel-identical matching and launch readiness are not claimed.

## Bounded behavior covered

At320,375 and1280px: one main/H1, noindex, no document horizontal overflow, labeled controls, keyboard skip-to-main, native guide/tool/help disclosures and targeted axe A/AA checks. Catalog and DR views use actual isolated active rows, URL filtering/sorting/pagination, four-item comparisons, truthful missing metrics, empty/load-error recovery and visible desktop comparison controls. Owner draft count is not used as live availability.

Landing links go to real routes and do not pretend to subscribe users or publish client endorsements. The guide is visibly draft, its four contents anchors resolve, and source links point to Google's official policies and Ahrefs' DR definition. The counter's example, live Unicode counts, paragraphs, clipboard summary and Clear/focus work; the input marker is absent from outgoing POST bodies and local/session storage. Clipboard output contains counts but no user text.

Account/cart coverage includes registration/same-origin/purpose-bound CSRF, role and owner-field rejection, duplicate account preservation, active/committed-only option privacy, integer cents and unavailable add-ons, concurrency/stale versions, session invalidation, owner isolation and changed/unavailable aggregate-total blocking. Customer registration does not verify email ownership. SMTP is unconfigured and fails closed. See [account/cart evidence](account-cart-verification.md).

## Safety and limitations

All database mutations target synthetic records in the guarded `_test` MongoDB database. Fresh synthetic fixture users avoid accumulating per-admin quotas; actual rate limits remain enabled. The localhost3003 QA server is not a deployment. Original reference PNGs, public assets, `.env`, owner CSV, real56,005 draft listings, WordPress site, DNS and production configuration remain unchanged. No order, reservation, payment, live listing activation or redirect cutover occurred.

The final layouts intentionally adapt the agency sample's text/unsupported actions and replace illustrative inventory with actual catalog behavior. Proof remains pending where exact client/quote/result/verification details are missing. This is not an automated pixel-diff certification, full WCAG audit, manual assistive-technology/zoom assessment, CWV/Lighthouse benchmark, penetration test, payment-provider validation or Phase4/launch approval.
