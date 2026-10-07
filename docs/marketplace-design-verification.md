# Reference-led marketplace refresh verification

Historical report for the earlier home-as-catalog/code-native-artifact. The later account/cart and five-reference/public-image continuation is covered by [current reference-template verification](reference-design-verification.md); the earlier counts and screenshots below are not substituted for that build.

Prepared 2026-10-06. Scope is the authorized visual refresh of the existing Phase 3b guest marketplace at `/` and `/products/`, following [the refresh brief](marketplace-design-refresh.md). The three latest owner-supplied reference images were inspected for layout intent; they are references, not evidence of the working app.

## Claims and test isolation

Name Retailer's name, email and address are confirmed. The exact “Trusted by 10,000+ marketers” line is owner-confirmed and permitted; it is not an independently measured figure or the active publication count. Client/logo permissions, exact testimonials, growth periods/sources and publisher-review details remain pending. Sample Premier branding, quotations and numerical growth results must not become asserted Name Retailer evidence.

The new smoke suite uses the existing protected fixture helpers, synthetic product rows and production-mode loopback port 3003 against the orchestrator's isolated `_test` MongoDB database. It never activates owner inventory, uploads the owner CSV, changes production settings or launches a server. The standard privacy-safe reporter leaves sensitive diagnostics, test credentials, sessions and screenshots in ignored local artifacts.

## Verification scope

`tests/e2e/marketplace-design.spec.ts` contains eight bounded cases:

- Both `/` and `/products/` at 320, 375 and 1280px: actual API inventory, correct marketplace identity, noindex, claim scope, associated labels, one H1/main, contained horizontal overflow, working hero/section anchors/help links, no pretend checkout/account navigation and targeted axe A/AA rules. Explicit layout regressions require mobile metric-context text widths of at least 180px at 320px / 200px at 375px, and both the desktop Compare heading and shortlist action inside the visible table region at 1280px.
- Real unmatched query, truthful zero results and filter reset.
- Keyboard hero action with genuine inventory scroll/hash, skip-to-main focus and native buyer FAQ/filter disclosures. The first FAQ's upcoming-commerce answer must become visible on Enter and close again on Enter.

Fresh full-page and viewport screenshots at 375 and 1280px are recorded in ignored local output directories. The nine existing product browser cases and seven API cases are also run against the refreshed artifact: genuine URL filtering/sort/pagination/empty/retry, four-item comparison, admin creation/edit/activation, CSV review/default draft commit/explicit quarantine/fatal rejection, permissions/CSRF, cents/versions/uniqueness, private data and atomic collision rollback.

## Execution status

The orchestrator authorized one original browser-test selector maintenance change: the pending-commerce notice assertion now targets `.marketplace-stage-notice`, retaining its actual wording and visibility requirements. The new native FAQ truthfully repeats the same phrase, so an unscoped text locator would be ambiguous.

The initial production-mode run found a homepage metadata defect: `/` had the browser title “Guest-post marketplace” without the business name because the root layout's title template does not apply to its own same-level page metadata. The orchestrator corrected the homepage to an explicit branded absolute title. The run was deliberately interrupted for that rebuild; it is not presented as completed regression evidence.

Two initial mobile failures were a test selector assumption: the first email link was the intentionally hidden compact-header CTA. The test now verifies the actual visible “Ask a placement question” inquiry CTA and its exact mailto destination. No mobile source defect was established by that assertion. The original metadata requirement, responsive/axe assertions and inventory workflows remain unchanged.

A corrected candidate then passed all 24 cases. Screenshot review nevertheless found two P2 layout issues beyond the targeted axe/reflow checks: mobile `.marketplace-metric-callout` flex layout compressed its text column, and the desktop table's minimum width hid Compare beyond the right edge at 1280px. The orchestrator authorized scoped CSS fixes and the explicit width/right-edge regression assertions above. This candidate pass is historical evidence, not proof of the subsequent CSS correction.

Fresh isolated fixture users were prepared for the final run, avoiding the genuine per-admin CSV rate limit across repeat full runs; the limiter remained enabled. Earlier Phase 3b reports describe the prior artifact, not this visual revision.

## Final evidence

The CSS-corrected production artifact passed **all 24 cases in one clean invocation**, with **zero failures and zero skips**: eight refreshed-design cases, nine existing product browser cases and seven product API cases. This includes **18 executed responsive template/state checks**: six refreshed route/width checks plus twelve existing guest comparison/admin inventory/form state checks. These are not multiplied by earlier reruns.

Both routes retain the branded title, noindex, single H1/main and owner-reported trust-note caveat. Hero navigation scrolls to actual inventory, section/help links resolve, FAQ and filters work with Enter, actual draft/import privacy and admin protections remain intact, and guest filtering/pagination/shortlist use real isolated product data. The mobile text-width and desktop right-edge regressions passed on both routes. No unresolved blocking defect was established within this scope.

Final full-page mobile/desktop screenshots were visually inspected by QA and the orchestrator: the mobile metric callout has a readable text column and stacked link, while desktop shows all seven inventory columns and the shortlist action. Serif headline, paper/mint cards, split publication-desk illustration, buyer steps, green inquiry section and Name Retailer footer are present; these are newly implemented interface elements, not copied sample customer proof.

Primary final captures:

- [Home at 375px](../.local/qa-marketplace-design-polished/marketplace-design-referen-c8655--accessible-reflow-at-375px/home-375.png)
- [Home at 1280px](../.local/qa-marketplace-design-polished/marketplace-design-referen-4ed71-accessible-reflow-at-1280px/home-1280.png)
- [Products at 375px](../.local/qa-marketplace-design-polished/marketplace-design-referen-07030--accessible-reflow-at-375px/products-375.png)
- [Products at 1280px](../.local/qa-marketplace-design-polished/marketplace-design-referen-11345-accessible-reflow-at-1280px/products-1280.png)

Each directory also contains the corresponding `-viewport.png` first-screen capture. Existing regression screenshots for guest comparison/admin forms are in the same ignored final output tree. Initial interrupted evidence remains in `.local/qa-marketplace-design/`; the pre-polish candidate remains in `.local/qa-marketplace-design-final/`. Neither is substituted for the polished final screenshots.

```powershell
$env:TEST_BASE_URL='http://localhost:3003'
$env:TEST_RESET_MAIL_CAPTURE='false'
.\node_modules\node\bin\node.exe .\node_modules\@playwright\test\cli.js test tests/e2e/marketplace-design.spec.ts tests/e2e/products-ui.spec.ts tests/e2e/products-api.spec.ts --output=.local/qa-marketplace-design-polished
```

Scoped QA lint and full TypeScript checking passed after the final test edits. The orchestrator separately reports the final production build, full application lint and 160 unit tests passing. The refreshed browse slice is ready for owner review; supporting details for the remaining proof sections are still required before those sections are populated. No owner inventory activation, DNS change, live publication or payment occurred in QA.

Complete assistive-technology journeys, 200% zoom, Lighthouse/CWV, public SEO migration and production deployment remain outside this bounded smoke check. Customer registration, cart, orders and payments are still upcoming in the visual slice.
