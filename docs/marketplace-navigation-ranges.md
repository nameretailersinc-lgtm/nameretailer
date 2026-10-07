# Marketplace navigation and legacy ranges

Implemented 2026-10-07 following the owner's approval to restore the four marketplace menu groups and working range pages.

The shared customer navbar now provides **Guest Posts By DA PA**, **Guest Posts By Traffic**, **Guest Posts By DR** and **Guest Posts By Price**, plus a link to the complete active catalog. Native disclosure controls support keyboard/touch navigation. Escape closes the dropdown and restores focus; outside clicks close it. The menu follows the existing green customer design and becomes a scrollable single-column panel on narrow screens.

`lib/commerce/marketplace-ranges.ts` is the shared menu/route/bounds registry. All 22 range URLs recorded in `docs/data/crawl.json` are rendered through the existing root dynamic page alongside the tool routes; unknown slugs still return 404. Pages have a matching heading, description and self-canonical. Preview noindex remains enabled; this is not a public deployment or indexing release. Legacy editorial text was not copied, and unrelated legacy URLs/redirects remain migration work.

The imported inventory supplies DA, not PA. The DA/PA menu keeps its legacy name while explicitly stating that PA was not supplied. The old `/50k-to-500k/` URL is retained with its recorded **50,000–100,000** traffic meaning (the crawl's title and heading agree with the owner's menu screenshot). No new alias or redirect is silently activated.

Bounds are inclusive unless the label says “above”: traffic above 500,000 starts at 500,001; DR above 50 starts at 51; price above $200 starts at 20,001 integer cents. Adjacent inclusive bands can share endpoints. DA 1–10 applies both `minDa=1` and `maxDa=10`. Known numeric zero is allowed by filters; missing/null metrics are explicitly excluded with numeric type checks, not interpreted as zero. USD bounds are converted directly to integer cents. Invalid, unsafe or reversed ranges fail with 422.

Range pages lock their preset bounds against query overrides. Additional topic/country/language/budget/metric filters narrow the page. Sorting, page size and pagination preserve the bounds. Reset removes additional filters while retaining the route's range. A visible notice explains this, and “Browse all publications” returns to the unrestricted active catalog. The existing active-product and committed-import visibility checks are unchanged.

## Verification

- Production build, TypeScript and ESLint pass; all 340 unit tests across 17 files pass.
- Six targeted browser/API tests pass: all 22 route titles/canonicals/noindex, existing tool and unknown-slug regression, synthetic DA/DR/traffic/USD boundary and missing-value checks, reversed-range errors, and four responsive navigation/filter cases.
- Widths 320, 375, 768 and 1280px pass horizontal-overflow and automated WCAG A/AA checks for both the expanded menu and the range page. Keyboard opening, Escape/focus restoration, all range links, sorting, page size, reset and override protection are covered. Automated checks do not establish full accessibility conformance.
- Synthetic API writes use only a guarded `_test` MongoDB database and localhost:3003. Test accounts were refreshed because previous private fixture credentials no longer authenticated. Owner accounts, inventory, `.env`, payments and the live WordPress site were not changed.

Final test artifacts: `.local/qa-marketplace-ranges-verified/`; responsive screenshots: `.local/qa-marketplace-ranges-release/`. Earlier attempts are not represented as passing: they found a 320px navbar overflow, test-response matching against a pre-redirect URL, and stale QA credentials. The overflow and test setup were corrected before the final run.
