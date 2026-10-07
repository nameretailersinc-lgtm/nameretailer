# Catalog, journal and tools — 2026-10-06

Later placement continuation: the approval service became available again, and current production builds pass. Placement briefs, private uploads and billing-review drafts are implemented and tested in [the placement/checkout report](placement-checkout.md). The historical browser blocker below does not describe a current approval outage. This does not complete the separate broad tools/journal browser suite or implement real payments/orders.

The owner explicitly requested all imported publications visible, 60 additional SEO/AEO/GEO articles and implementation of the `/seo-tools/` directory. This supersedes the historical draft-only state, not the migration/checkout boundaries.

## Inventory

The exact committed import `06cd8282-0dda-411f-becf-2a8c081d693f` now contains **56,005 active publications and zero drafts**. The running localhost:3001 public API confirms total 56,005 with 20 rows on page 1. Inventory is paginated; all 56,005 rows are not rendered or transferred together.

`scripts/commerce/activate-owner-import.ts` requires exact import/count/full preview fingerprint for commit. Full digest: `38ee75ca6c687938e54d5ce130d5e9de80efa9e5a187d9ac439cda7765cec883`. Operation: `e6d76941-c1db-4d45-adb9-9a046882a178`. Original records and manifest were backed up privately before any mutation at `.local/activation-backups/e6d76941-c1db-4d45-adb9-9a046882a178/`; never distribute its raw source content. Activation used fingerprint-rechecked/version-guarded 500-row transactions and audit entries. These are separate transactions; earlier completed batches remain committed if a later batch fails. Recovery must be explicitly authorized and version-guarded to preserve subsequent edits.

No orders were created, the original CSV was unchanged, and 74 excluded rows remain excluded. Activation controls visibility only: supplied metrics remain unverified and undated where source information is absent. There is no new claim of independent publisher review or current availability. Checkout, payments, reservations, orders and fulfillment remain unavailable.

## Sixty new guides

`lib/blog/` contains **60 distinct guides**, ten per cluster: Marketplace, Content, Technical SEO, AEO, GEO and Measurement. Total 14,731 words; minimum 230 per guide including headings. Each has an original direct answer, specific illustrative example, three-step checklist, pitfalls and follow-up answer. Checkable external claims use primary sources; examples are not customer results.

`npm run blog:seed` defaults to a read-only preview; `--commit` performs validated insert-only transactional CMS writes, revisions and audit. Stable IDs prevent duplicates; conflicts or a partial library stop rather than overwrite records. Owner commit inserted 60 posts, six categories and one legitimate organizational author; subsequent preview returned 60 existing and zero inserted. `--test` accepts only the private isolated `_test` fixture. Legacy records overwritten: zero.

Authors can now be actual Person or Organization entities. Name Retailer is the organizational attribution, not an invented staff identity or claimed expert reviewer. The visible journal discloses AI assistance and pending owner editorial review. No expert review date is fabricated. Posts are published **in the noindex rebuild preview**, not released for public search indexing.

`/blog/` provides search, category filtering, 12-card pagination and empty states. `/blog/[slug]/` reads published CMS posts only, sanitizes body, creates contents anchors, shows related reading/sources/actual publication dates and emits escaped BlogPosting JSON-LD with organizational authorship. Titles, descriptions and canonical URLs are distinct. These are new original guides, not a migrated legacy WordPress archive.

## Twenty-eight tools

| Category              | Working operations                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Writing/text (5)      | Existing word counter; four case conversions; grapheme/word/line reversal; token/phrase density; UTF-8 Base64 encode/decode           |
| Images (9)            | JPG→PNG, image→WebP, WebP→PNG, resize/aspect ratio, JPEG/WebP compression, rotation, exact crop, grayscale, inert HTML alt inspection |
| Units (5)             | HEX/RGB(A), configurable PX/REM, length, temperature with absolute-zero check, decimal/binary file sizes                              |
| Markup/sharing (5)    | Escaped Twitter/Open Graph tags; four JSON-LD generators; structural schema checker; official AMP validator                           |
| Research/planning (4) | Uploaded CSV backlink analysis; local keyword brainstorming; active-catalog bulk DR/DA lookup; outreach brief/qualified-link markup   |

Research modes **do not measure live Ahrefs scores, search volume or live backlinks, and do not create external backlinks**. Provider-selection clarification was sent; no provider access was supplied. A real live-provider adapter remains outstanding. Local schema checks are not full vocabulary/rich-results certification.

Browser tools do not upload/store input. Image tools use copies, cap input at 20 MiB JPEG/PNG/WebP and decoded/output size at 16 megapixels/8,000 pixels per side, revoke object URLs and invalidate stale output on setting changes. Animation/metadata/color/size trade-offs are disclosed. HTML inspection uses an inert template never attached to the page. Copy/download and validation feedback are implemented.

Server tools enforce same-origin JSON, input bounds and request limits; responses are private/no-store/noindex. AMP validates pasted HTML, not a remotely fetched user URL, using the fixed official `https://cdn.ampproject.org/v0/validator_wasm.js`; load failure returns an honest 503. An obsolete endpoint was rejected after its incompatible status representation was observed. DR lookup accepts at most 30 public identities and exposes only domain/DR/DA from active eligible catalog records. Missing scores are unavailable, not zero.

Newer artwork, tools presentation/search/drop-zone files and styles already appearing in the shared workspace were preserved and integrated, not reverted. The combined design needs final browser verification; pixel-perfect completion is not claimed from source alone.

Lint, formatter and Git exclusions now also cover alternate `.next-*` build directories. A concurrent temporary design build disappearing during the final lint traversal exposed this missing exclusion; generated output is not source to lint or format.

## Verification

- TypeScript, lint and **278 unit tests in 15 files pass**. Tests include all 60 articles, conversion/encoding boundaries, CSV analysis, safe markup and organizational schema.
- Two production builds passed, including secure standalone packaging and removal of generated environment copies; original `.env` preserved. The last build preceded final small settings/presentation refinements. A final build remains pending.
- The official AMP validator returned real FAIL and line/column errors for harmless invalid HTML.
- `npm audit --omit=dev` reports zero vulnerabilities. The install's five full-tree high findings are the previously documented development dependency advisories, not a zero-advisory complete tree.
- Read-only HTTP checks on existing localhost:3001: **28/28 tool destinations returned 200/noindex; 60/60 article routes returned article body, JSON-LD and noindex**. All five index pages yielded 60 distinct articles. An initial article pass checked 44/60; the complete repeat passed 60/60. HTTP checks do not establish client behavior or accessibility.
- The first browser invocation failed the isolated-DB/loopback safety guard because TEST_BASE_URL was omitted. In the corrected invocation, **eight image operations passed** format, dimensions, grayscale/download checks; four text tests failed an exact result-label lookup. Explicit result label association was fixed. That run was interrupted, not a passing full suite.
- `tests/e2e/tools-journal.spec.ts` covers all 27 added tools, origin/input failures, inert HTML/privacy, 60 article routes, journal search/category/pagination/contents interactions, and seven representative routes at six widths (42 planned states). The counter retains earlier coverage. **The final new browser suite has not completed.**
- The isolated port-3003 restart was refused because automatic approval review hit an account usage limit. This is a review-service failure, not a safety rejection. The restart was not executed or bypassed. Our earlier test server was stopped; the owner's port-3001 server was preserved.

Once approval availability is restored, run a final build, `npm run test:server -- 3003`, set `TEST_BASE_URL=http://localhost:3003`, then run the new tools/journal suite and existing information/consistency suites against the isolated database. Inspect responsive screenshots, accessibility, asset ratios and overflow before calling the combined design fully verified.

Still outstanding: provider access/integration, owner editorial approval before indexing, legacy content/redirect migration, approved commercial/legal policies, checkout/orders/fulfillment and deferred genuine business-proof details. No deployment or WordPress cutover occurred.
