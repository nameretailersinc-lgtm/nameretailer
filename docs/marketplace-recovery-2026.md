# Marketplace filter validation and search recovery

October 18, 2026. The owner authorized continuing marketplace improvements after the three specialist directories. This phase fixes two reproduced browser problems in the existing catalogue. Concurrent navigation, guide and blog edits remain outside this task's review.

## Behavior changes

Entering a minimum placement price of $200 and a maximum of $50 previously changed the URL to an invalid query and replaced usable inventory with an API error. The filter form now checks price, DA, DR and traffic bounds before changing the URL. A conflicting range receives a native validation message at the editable field; current listings remain visible. Editing a numeric field clears the custom message so a corrected range can be submitted. Fixed bounds from curated range URLs participate in the comparison: on `/price-200-plus/`, an editable maximum of $100 is checked against the fixed $200.01 minimum. Existing server validation remains authoritative for direct requests.

A failed search previously stored its error independently of the query. Pressing Back could therefore show that old failure over the preceding search's cached results while its new request was pending. Errors now carry the normalized query that produced them and are displayed only for that query. Existing abort/cancellation, result matching and retry behavior remain in place. No database, product API, checkout, account, admin or payment behavior was changed.

Implementation: `components/marketplace/filter-validation.ts` and small changes in `components/marketplace/marketplace.tsx`. Browser regressions are in `tests/e2e/marketplace-recovery.spec.ts`. Installed Next.js client-component and native-history documentation was reviewed before implementation. The existing `pushState` integration and canonical URL helpers are retained.

## Verification

Both problems were reproduced against the prior local production build. The first reproduction of the Back test selected the framework's route announcer as well as the application alert; the selector was corrected to `main` and the actual stale application error was then confirmed. The final Back regression holds the replacement request open, so a fast network success cannot hide the bug.

- Separate `.next-seo` production build passed compilation, TypeScript, 140 generated pages and secure standalone packaging.
- Full unit suite passed: **57 files / 579 tests**.
- Focused ESLint and standalone TypeScript passed.
- Browser outcomes are recorded in [the validation artifact](../reports/marketplace-recovery-validation.json), covering invalid/corrected prices at 375px and 1280px, Back recovery, curated bounds, all metric/traffic pairs, mobile shortlist limits/removal, retry and delayed-response cancellation.

All seven browser scenarios passed across the final executions: six passed in the combined run; the retry/race case passed in a focused rerun after fixing its test-only comparison of whole-cell `innerText` against differently concatenated text. The final assertion compares the publication link consistently and explicitly awaits cancellation of the obsolete request. Application code did not change after the successful production build. Final TypeScript includes the corrected browser test.

The browser checks read actual inventory. Network failure/race responses are intercepted inside the test browser and never written to the catalogue. The shortlist is local UI state; no cart, order or account mutation is involved. Native browser validation is supplemented by a main-content axe check and mobile overflow assertions. These checks do not establish field Core Web Vitals, search ranking gains or a full commerce release.

No deployment, push or merge was performed by this task. Other agent changes in the shared build are not independently certified by this report. Further marketplace work should start from measured search/filter response time and publisher-detail journeys; existing external payment/mail and Search Console release checks remain separate.
