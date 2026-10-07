# Phase 3b first-slice verification

Prepared 2026-10-06 against the approved [marketplace contract](phase3b-contract.md). Scope is product inventory, staged CSV imports, admin product management and guest browse/filter/shortlist comparison. Customer registration, cart, orders, checkout and payment integration are not implemented or verified by this slice. Public SEO migration and deployment are not approved by this report.

## Isolation and evidence

The new Playwright suites use actual Auth.js sessions, MongoDB writes and product APIs on production-mode loopback port 3003. Existing private helpers reject non-loopback targets and database names without `_test`; the orchestrator separately launched the server against the isolated test database. Synthetic QA hosts, topics, prices, CSV rows and fixture users only were used. Tests do not upload or import the owner's real CSV, modify owner inventory or delete databases. Successful test-created records remain in the dedicated test database.

Ignored `.local/e2e.json` and `.local/qa-sessions/` hold credentials and sessions. The privacy-safe default reporter prints statuses without request cookies. Traces, HTML reports and screenshots remain ignored local artifacts; do not publish them without reviewing sensitive synthetic session data.

## Implemented checks

`tests/e2e/products-api.spec.ts` has seven cases:

- Anonymous and author/editor/customer denial for admin inventory, creation, editing and CSV import; per-actor CSRF and foreign-origin rejection.
- Canonical HTTPS/host normalization while preserving meaningful path case; integer-cent prices; unique publisher URLs/external IDs; different same-host paths; stale-version conflicts and archive updates.
- Active-only public products/facets, excluded drafts/archived topics, real counts, literal search, combined country/language/topic/metric/budget filters, stable sorting and server pagination.
- Full 25-header multipart CSV preview; SHA-256 binding; exact decimal prices and legacy-zero/unavailable normalization; default draft commit; reimport conflict; private source and import provenance absent from public responses; no individual product pages.
- Invalid-row exclusion only with explicit acceptance; fatal structural rejection even when valid-row acceptance is supplied.
- Whole visible-batch rollback on an existing URL collision, including a preceding staged row; the manually created source record retains its price and version.

`tests/e2e/products-ui.spec.ts` has nine cases:

- Guest topic/domain search, shareable URL filters, sort, server pagination, reload persistence, removable chips and empty/reset states using 21 real synthetic products.
- Four-item shortlist limit, truthful unavailable values and snapshot/provenance notices, keyboard removal and skip-to-main focus.
- Deliberately intercepted inventory failure with no fabricated results and real retry recovery. This one case simulates a 503; other inventory flows use real APIs.
- Admin manual draft creation, exact-price editing and explicit activation; draft absent from the guest API.
- Actual CSV preview/sample, replacement-file review invalidation and confirmed draft import; explicit invalid-row quarantine and disabled fatal-structure commit.
- Three viewport cases at 320, 375 and 1280px. Each checks guest results, guest comparison, admin inventory and admin add form: **12 template/state/viewport checks** for associated native labels, one main/H1, noindex, no document-level horizontal overflow and targeted axe WCAG A/AA rules.

## Findings and limitations

Source review found one P2 mismatch: Search publications promised “domain or topic” while the backend initially searched only domains. The orchestrator added escaped-literal domain-or-category matching; the actual category-only browser journey verifies the promised behavior. No source edits were made by QA.

Initial failures were retained and diagnosed as test assumptions: legacy CSV IDs must be positive decimal integers, the Next route announcer is separate from main error feedback, and the shared API helper uses a trailing slash that the initial error-simulation interception omitted. The fixtures, alert scope and interception URL were corrected without weakening product assertions. Initial results were ten passing/five failing cases; a corrected run and a targeted error-state rerun provide the final evidence recorded below.

This is not a complete WCAG conformance assessment: full screen-reader journeys, 200% zoom, Lighthouse, target-size/focus-obscuring review, Core Web Vitals and production public SEO remain later work. No metrics are independently verified; imports and activation are not vetting claims. The separate [live pricing inspection](live-commerce-pricing-review.md) confirms the intended legacy writing-tier mapping, but its server-priced purchase workflow and operational policy still require the next Phase 3b work and owner decisions.

## Final results

**All 16 unique first-slice cases passed: seven API and nine UI, with no skips.** The corrected complete run passed 15 cases and retained the single error-simulation interception failure; after matching the canonical trailing-slash URL, that case passed its targeted rerun. These are combined results, not a claimed single 16-pass invocation. All 12 template/state/viewport checks passed on the production artifact. Scoped QA ESLint and full TypeScript checking passed after the final test changes; the new test files and this report were formatted.

Visual review confirmed readable guest mobile label/value cards, the desktop table and comparison snapshots, and the responsive admin add form with a contained inventory scroll region. Four final synthetic-data screenshots remain under ignored `.local/qa-phase3b-final/`:

- [Guest browse/comparison at 375px](../.local/qa-phase3b-final/products-ui-first-slice-ma-d4132-s-and-targeted-axe-at-375px/products-375.png)
- [Admin inventory/add form at 375px](../.local/qa-phase3b-final/products-ui-first-slice-ma-d4132-s-and-targeted-axe-at-375px/admin-products-375.png)
- [Guest browse/comparison at 1280px](../.local/qa-phase3b-final/products-ui-first-slice-ma-22cf6--and-targeted-axe-at-1280px/products-1280.png)
- [Admin inventory/add form at 1280px](../.local/qa-phase3b-final/products-ui-first-slice-ma-22cf6--and-targeted-axe-at-1280px/admin-products-1280.png)

No unresolved blocking product defect was established by these checks. The first slice is ready for owner review, not a declaration that the full Phase 3b commerce phase is complete. In particular, no real checkout or payment was attempted, and QA does not attest independently to the owner's full-dataset import counts or metric accuracy.

```powershell
$env:TEST_BASE_URL='http://localhost:3003'
$env:TEST_RESET_MAIL_CAPTURE='false'
.\node_modules\node\bin\node.exe .\node_modules\@playwright\test\cli.js test tests/e2e/products-api.spec.ts tests/e2e/products-ui.spec.ts --output=.local/qa-phase3b-final
.\node_modules\node\bin\node.exe .\node_modules\@playwright\test\cli.js test tests/e2e/products-ui.spec.ts --grep 'inventory load error' --output=.local/qa-phase3b-error-retry
```
