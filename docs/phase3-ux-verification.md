# Phase 3 UX, accessibility and regression verification

Prepared 2026-10-05. The owner approved the CMS scaffold and selected MongoDB; no embedded PostgreSQL/PGlite fixtures are used. This phase does not activate public content migration, redirects or commerce. Production WCAG conformance is not asserted.

## Test scope and isolation

The suite in `tests/e2e/` uses actual Auth.js sessions and actual CMS APIs. Private credentials are loaded from ignored `.local/e2e.json`, created by the orchestrator's isolated MongoDB fixture bootstrap. The helper refuses a non-`_test` database name or a non-loopback URL. The running server must separately use that same dedicated test database; reading a fixture file alone cannot prove server isolation. Cached test sessions in ignored `.local/qa-sessions/` avoid exhausting the genuine login rate limiter across worker restarts; the limiter remains enabled. No credentials, connection strings, reset tokens or mail bodies are printed. The default Playwright reporter (`scripts/qa/safe-reporter.ts`) prints names, statuses and totals without failure request headers. Failure traces/results and the HTML report remain ignored local artifacts and may contain sensitive test session data.

Fixtures are explicitly test-only: fresh draft titles/slugs, a synthetic reset account, a one-pixel image and redirect configuration. The suite does not delete existing databases or modify owner accounts. It does change records and settings inside the dedicated test database. Public paths are probed to verify draft privacy and that Phase 3 stored redirects remain inactive.

## Planned and implemented coverage

API regression specs cover anonymous/customer denial, per-actor CSRF and cross-origin mutation rejection, author ownership/publication restrictions, editor/admin boundaries, private draft preview/noindex/cache headers, optimistic version conflicts, revision restoration, publication/sanitization, literal search/sort/pagination, image decoding/alt/optimized outputs, atomic redirect validation/inactive matching, settings/users/export restrictions, generic reset responses, single-use reset and old-session revocation.

The 17 UI cases use inspected component labels and controls: login/error/password-manager input; actual draft save, Ctrl+S, publish, private preview and revision restore; FAQ persistence; a 21-record searchable/sortable/paginated list; informative/decorative media decisions; invalid/valid redirect CSV; settings persistence and unsaved-navigation protection; user search/edit/sort, exact audit-action filtering, taxonomy and menu ordering; editing a duplicate without overwriting its source; a bounded dashboard warning preview; and a readable, keyboard-scrollable mobile content table. The template suite scans 19 staff screens at 320, 375 and 1280px (57 screen/width combinations), plus three anonymous authentication/reset screens at those same widths (nine combinations), for **66 template/viewport checks**.

## Evidence and current status

The first stable production-mode API/UI run on loopback port 3003 passed **28 cases with one intentional skip** in 4.7 minutes. The skipped development-only local-mail workflow had passed separately on the isolated development server; production deliberately prohibits local mail capture and, with no configured SMTP, its fail-closed 503/non-enumeration test passed. Production private preview HTML was verified `private, no-store`, noindex and inaccessible to customers/foreign authors. Concurrent cross-demotion allowed only one privileged mutation and preserved the primary test administrator. All 66 template/viewport checks passed associated labels, one H1/main landmark, noindex, document-level reflow and targeted axe rules; this is not a complete WCAG conformance assessment.

Visual inspection of the initial screenshots revealed P2 usability issues not caught by axe: crushed mobile table title columns and an unbounded dashboard warning list. The final implementation provides a named, focusable horizontal-scroll region, an 820px minimum table width and a 260px minimum title column. Dashboard warnings are limited to ten with the actual total and a Review content link. Final screenshots were visually inspected and accepted: the dashboard showed 10 of 376 warnings, and mobile content titles remained readable without document-level overflow.

Ten final screenshots (dashboard, content list, blank editor, media and redirects at 375 and 1280px) remain in ignored `.local/qa-layout/`. Representative captures:

- [Mobile content list](../.local/qa-layout/cms-ui-admin-template-sema-2a640--all-staff-screens-at-375px/admin-content-375.png)
- [Desktop dashboard](../.local/qa-layout/cms-ui-admin-template-sema-54981-all-staff-screens-at-1280px/admin-1280.png)

The other captures use `admin`, `admin-content`, `admin-content-new`, `admin-media` and `admin-redirects` prefixes with the corresponding width suffix in those same two directories. Original pre-fix captures remain under ignored `test-results/`.

The separate scheduled/CSV suite passed **all three cases in 13.2 seconds** after correcting an import-time provider interoperability defect: the scheduler now imports a pure invalidation helper rather than the authenticated CMS service. It verified missing/invalid cron bearer denial, atomic optional reserved-slug/overlong-title rejection, and the real CLI's transition of a due record from scheduled to published with a genuine publication timestamp, version increment and saved scheduled-state revision. This run explicitly overrode `MONGODB_DB` with the fixture's validated test database. CLI database publication does not prove public ISR cache invalidation outside a Next.js request context; production cache-aware cron/public rendering remains a Phase 4 integration check.

The final targeted production-mode rerun passed **all seven cases**, including search/sort/pagination, both new layout regressions and all **66 template/viewport checks** on the final artifact. It verified a ten-item warning preview with a truthful total, a title column at least 220px wide, keyboard focus and actual ArrowRight horizontal scrolling. Combined evidence is **33 passing cases and one intentional development-mail skip across 34 unique cases**. These totals combine the initial full run, the scheduled suite and the final targeted rerun; they are not claimed as one 34-case invocation. The orchestrator separately reports a passing production build, full lint/typecheck and **82 unit tests**.

An earlier attempt at the final seven-case rerun failed because its production server had been restarted without the approved MongoDB network access: authenticated CSRF returned 500 and the server later became unavailable. This was retained as an infrastructure failure, not silently excluded or addressed by weakening assertions. The orchestrator restarted the unchanged final artifact with approved network access; `scripts/qa/phase3-health.mjs` then confirmed authenticated CSRF 200 before the seven-case passing rerun.

Final targeted command (the test credentials and database selection remain in ignored local fixtures):

```powershell
$env:TEST_BASE_URL='http://localhost:3003'
$env:TEST_RESET_MAIL_CAPTURE='false'
.\node_modules\node\bin\node.exe .\node_modules\@playwright\test\cli.js test tests/e2e/cms-ui.spec.ts --grep 'all staff screens|anonymous login|content list searches|dashboard warning|mobile content table' --output=.local/qa-layout --reporter=./scripts/qa/safe-reporter.ts
```

QA files were formatted, and scoped ESLint plus full TypeScript checking passed after the privacy-safe default reporter change. Phase 3 is ready for owner review; this report does not approve the next phase. Production reset delivery still requires configured SMTP. Complete assistive-technology/zoom journeys, production accessibility, public SEO/rendering and performance remain later verification work.

### Earlier development evidence and corrected regressions

Initial execution against the isolated development server at loopback port 3002: **11 of 12 API tests passed**. The remaining test required `Cache-Control: no-store` on private HTML previews; the development response was `no-cache, must-revalidate`. The production-mode rerun subsequently passed the unchanged strict private/no-store requirement. Draft anonymous denial and public-slug 404 passed before that header assertion. All other API checks passed, including real password reset, single-use token and old-session revocation.

The first five-test UI subset passed settings persistence/unsaved-navigation protection and the three anonymous templates' label/landmark/reflow/targeted-axe checks. Two test selectors were corrected to account for Next.js's route-announcer alert and wrapping native select labels; these are test fixes, not product regressions. The real keyboard check found that the skip link changed the hash without moving focus to the main landmark; Design made the target programmatically focusable and the final production keyboard journey passed. Browser configuration uses installed Chrome with Playwright; no production conformance claim follows from a targeted axe pass.

The media specification conflict is resolved and verified: informative images require meaningful alt; an explicit Decorative choice permits `alt=""`; contradictory decorative/nonempty-alt input is rejected. UI review also found async access to a form's React `currentTarget` after upload, a GIF selector not supported by the upload API, Duplicate actions on unsupported collections, missing Users sort/Audit filter controls and an unfocusable audit scroll region. Source fixes and the related production UI journeys passed. Complete screen-reader journeys, zoom, broader focus visibility, consent/CWV and production accessibility remain later checks.
