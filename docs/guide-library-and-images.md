# Guide library and supplied illustrations

Updated 2026-10-07 following the owner's reports that `/guides/` showed too few articles and that blog illustrations were available in `public/blogs`.

## Library

The old Guides page was a static information page with three resource links; it was not querying the journal. `/guides/` and `/blog/` now share `components/site/article-library.tsx` and the published-record query. Guides defaults to 24 cards and Blog to 12. Both offer 12/24/60 articles per page, title search, topic filters, numbered pagination and no-results recovery. Links/forms retain the current directory route. Query results clamp out-of-range pages, use a deterministic sort and exclude draft posts.

Read-only checks against the owner's localhost:3001 preview confirm 60 articles, including all 60 unique article links in the expanded view. No new articles or database changes were needed to make Guides display the library. The existing AI-assisted editorial disclosures and preview noindex gates remain in place; legacy archive migration and editorial/indexing approval are separate tasks.

## Images

`public/blogs` contains 24 PNG illustrations, each 256×256. Visual inspection found several cropped fragments. Twelve clearer illustrations are selected by article-title/slug topic rules in `lib/blog/artwork.ts`; they are intentionally reused across the 60 articles rather than presented as unique photographs or evidence of customer results. The originals are unchanged.

Each article uses the same mapping on its library card, related-reading card and article hero, regardless of pagination or filter order. Cards use compact 176px square images in a reserved-height mint panel; heroes are limited to their native 256px size. Next Image provides responsive source sets/lazy loading. Decorative card images have empty alt text; article heroes have descriptive illustrative alt text. Excerpts are visually limited to four lines with a full-article link.

Open Graph and article-schema imagery use an in-memory fallback, preserving valid editor-selected OG images and leaving CMS records untouched. Built-in square artwork declares its real dimensions and uses a summary Twitter card. Existing company-page artwork remains unchanged through optional shared-shell image props.

## Verification

- Final production build, TypeScript and ESLint pass. All 363 unit tests across 19 files pass, including asset existence, stable mapping, topic choices and preservation of editor metadata/original records.
- All five read-only browser tests pass on localhost:3001: 60-card pagination/filter/search/article-link flow, matching card/hero/social image, successful decoding, plus image presence, horizontal overflow and automated WCAG A/AA checks at 320/375/768/1280px. Automated checks are not a full accessibility certification.
- Initial checks exposed low-contrast decorative card numbers, ambiguous select labels and short development-navigation waits; these were corrected before the passing run. The image continuation also caught and corrected an incomplete TypeScript test fixture before the final build.
- Final screenshots and browser artifacts are under `.local/qa-blog-artwork/`. No owner accounts, inventory, CMS content, `.env`, public image files or live WordPress deployment were modified.
