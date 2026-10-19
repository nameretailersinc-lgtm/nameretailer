# Marketplace and content audit

Audit date: October 19, 2026. Latest user instructions take precedence over the initial inquiry-only purchase proposal.

## Final purchase behavior

- Restored `components/cart/buy-placement.tsx`, the placement form, cart, checkout, payment result, payment configuration and cart metadata to the behavior in `d2d7ec1`.
- The Buy/Add to plan button opens the original placement brief, with account/cart and checkout behavior preserved. The historical `CHECKOUT_ENABLED = false` setting is restored; payment activation was not changed.
- Removed the duplicate Plan placement link from publication details. The single Add to plan action opens the brief.
- Contact and shortlist quote inquiries remain available separately, as requested when narrowing the rollback to Buy functionality only. Submissions use server validation, honeypot, database rate limits and `cms_leads`. SMTP is attempted only when configured; storage succeeds independently of notification delivery. Administrators can inspect `/admin/leads/`. No existing lead records were deleted.

## Publication indexability

- Shared rule: `PROFILE_RULE` in `lib/commerce/publication-pages.ts` requires a positive price, nonmissing DR and DA, a specific topic, and traffic or actual guidelines. Root-domain profiles alone qualify for the sitemap. Zero-valued supplied scores are preserved as values; missing data is not replaced with zero.
- Read-only database census: **56,005** active listing URLs; **10,655 indexable**, **45,350 noindex**.
- Page metadata and sitemap use the same completeness predicate. Missing publication fields omit their heading, label and paragraph. Visible FAQ questions and JSON-LD use the same data.

## Blog and guide disposition

- All **60** published database blog posts were inventoried: **30 indexable**, **30 noindex, follow**. The public library, eligibility rule and sitemap use the same curated article set.
- The 16 additional retained posts cover editorial writing and campaign measurement for guest posting. Existing URLs were preserved.
- Retained blog articles contain at least 800 words; supporting guides contain at least 800 words and six main guides contain 1,200?2,000 words. The audit checks each retained article title at 50?60 characters and description at 140?160 characters.
- **22** buyer guides expanded; **3** off-topic domain guides remain accessible with noindex, follow and are omitted from the sitemap. No articles were physically deleted.
- Retained articles use owner-supplied author Fahad Shaikh, with the factual biography provided by the user and a real author page. Content change dates are October 19, 2026; no new historical publication dates or credentials were invented.
- Removed peer-review/verified-documentation badges, fake citation counts and repeated introductory answer sections. Replaced unsupported audience benchmarks and engagement-rate claims in retained blog copy with concrete research and reporting steps.

## Strings and sections removed or superseded

Removed ordering-unavailable dead ends where replaced by the contact/quote interface, empty publication guidelines/audience/inclusion sections, the Information to confirm checklist, and artificial citation and peer-review labels. Missing values in the embedded publication comparison are omitted. Buy/cart wording follows the restored version where the user explicitly requested rollback.

## Retained blog articles

- `/blog/how-to-choose-a-guest-post-publication-for-your-audience/` ? 893 words
- `/blog/a-practical-guest-post-budget-worksheet/` ? 841 words
- `/blog/domain-rating-and-domain-authority-a-comparison-worksheet/` ? 845 words
- `/blog/how-to-read-a-publication-traffic-estimate/` ? 850 words
- `/blog/what-to-confirm-in-a-guest-post-placement-brief/` ? 833 words
- `/blog/paid-link-disclosure-questions-to-ask-before-placement/` ? 855 words
- `/blog/how-to-compare-publication-language-and-geography/` ? 834 words
- `/blog/an-editorial-review-checklist-for-a-publication-shortlist/` ? 830 words
- `/blog/placement-only-versus-article-writing-packages/` ? 832 words
- `/blog/what-to-record-after-a-placement-is-published/` ? 828 words
- `/blog/how-to-write-a-guest-post-brief-an-editor-can-use/` ? 827 words
- `/blog/match-article-structure-to-the-reader-s-search-intent/` ? 875 words
- `/blog/write-a-direct-answer-without-losing-important-context/` ? 853 words
- `/blog/a-source-log-for-fact-checking-content-drafts/` ? 835 words
- `/blog/headlines-that-describe-the-article-instead-of-overselling-it/` ? 837 words
- `/blog/meta-descriptions-that-help-readers-choose-a-page/` ? 838 words
- `/blog/how-to-write-helpful-faq-answers/` ? 839 words
- `/blog/image-alt-text-describe-purpose-not-every-pixel/` ? 827 words
- `/blog/a-content-refresh-decision-log/` ? 820 words
- `/blog/an-editorial-handoff-checklist-before-publication/` ? 813 words
- `/blog/a-practical-seo-measurement-plan-before-publishing/` ? 849 words
- `/blog/search-console-and-analytics-answer-different-questions/` ? 831 words
- `/blog/calculate-percentage-growth-without-hiding-the-baseline/` ? 831 words
- `/blog/keep-missing-metrics-separate-from-zero/` ? 833 words
- `/blog/a-referral-traffic-worksheet-for-publication-campaigns/` ? 807 words
- `/blog/a-content-experiment-log-that-records-confounders/` ? 829 words
- `/blog/report-keyword-ideas-without-invented-demand-metrics/` ? 817 words
- `/blog/a-backlink-report-quality-check-before-analysis/` ? 814 words
- `/blog/choose-a-reporting-window-before-evaluating-content/` ? 819 words
- `/blog/turn-an-seo-report-into-a-useful-next-action-list/` ? 841 words

## Blog URLs excluded from indexing

- `/blog/a-canonical-url-checklist-for-a-rebuilt-website/`
- `/blog/internal-links-that-make-an-article-library-easier-to-use/`
- `/blog/noindex-and-robots-txt-are-different-controls/`
- `/blog/plan-a-sitemap-around-approved-public-pages/`
- `/blog/a-structured-data-review-checklist-for-blog-articles/`
- `/blog/check-server-rendered-article-content-before-launch/`
- `/blog/a-responsive-article-page-qa-checklist/`
- `/blog/choose-image-dimensions-and-formats-deliberately/`
- `/blog/measure-page-experience-with-a-repeatable-test-setup/`
- `/blog/a-wordpress-to-next-js-content-migration-worksheet/`
- `/blog/what-aeo-means-in-a-practical-content-workflow/`
- `/blog/build-a-question-map-before-drafting-answer-led-content/`
- `/blog/definitions-that-remain-useful-outside-their-paragraph/`
- `/blog/comparison-tables-that-preserve-meaningful-differences/`
- `/blog/use-examples-to-make-an-answer-actionable/`
- `/blog/keep-important-answers-available-as-readable-text/`
- `/blog/how-to-audit-an-answer-for-unsupported-certainty/`
- `/blog/plan-useful-follow-up-answers-without-duplicating-pages/`
- `/blog/aeo-readiness-is-not-the-same-as-indexing-approval/`
- `/blog/an-answer-quality-review-sheet-for-editors/`
- `/blog/what-geo-means-for-a-small-content-team/`
- `/blog/build-an-evidence-inventory-before-writing-brand-claims/`
- `/blog/keep-organization-information-consistent-across-content/`
- `/blog/original-observations-versus-hypothetical-examples/`
- `/blog/a-citation-ready-claim-has-a-clear-source-boundary/`
- `/blog/geo-content-planning-without-publishing-query-duplicates/`
- `/blog/a-fair-comparison-page-brief-for-a-brand-website/`
- `/blog/ai-crawler-access-needs-a-documented-product-specific-policy/`
- `/blog/record-generative-search-appearances-as-observations/`
- `/blog/a-geo-experiment-brief-with-a-useful-stopping-rule/`

## Guide URLs excluded from indexing

- `/guides/choose-a-domain-name/`
- `/guides/buy-and-register-a-domain-name/`
- `/guides/domain-name-seo-and-migrations/`

## Sources checked

Primary references include Google Search Central guidance on helpful content, link spam, paid-link qualification, title links, snippets, images and Search Console; Google Analytics campaign URL documentation; Ahrefs metric definitions; and the Moz authority scoring guide. Retained source lists contain the relevant references, without invented citations or metrics.

## Owner decisions still needed

- Confirm the existing refund policy claims: automatic refunds after publisher rejection, delivery becoming final at approval, and 3?5 business day processing. These are visibly flagged; replacement legal terms were not invented.
- Supply approved full service terms. The existing privacy policy identifies Name Retailer Inc in Delaware, while the supplied author biography identifies ownership of THE Promoters FZC. Confirm the applicable legal entity and policy accuracy; no entity details were silently rewritten.

## Verification

- Content/metadata audit: passed with zero violations; database blog inventory confirms 30 indexable URLs.
- Lint, unit tests and production build are run for the final implementation. Browser checks cover the contact inquiry at mobile/desktop and the restored purchase action. Final results are reported in the accompanying response.
- No live deployment or real customer placement submission was performed. Browser API mutations are intercepted; unit persistence and notification behavior use mocks. Database census operations are read-only.

## Files changed, grouped by purpose

### Placement and inquiry interfaces

- `app/about/page.tsx`
- `app/admin/leads/page.tsx`
- `app/api/inquiries/route.ts`
- `app/api/mobile/inquiries/route.ts`
- `app/contact/page.tsx`
- `app/guest-post-prices/page.tsx`
- `app/guest-posting-sites/page.tsx`
- `app/how-to-buy-links/page.tsx`
- `app/layout.tsx`
- `app/placement.css`
- `app/refund-policy/page.tsx`
- `app/terms/page.tsx`
- `components/account/account-page.tsx`
- `components/account/desk.tsx`
- `components/inquiries/placement-inquiry.tsx`
- `components/marketplace/marketplace.tsx`
- `components/marketplace/presentation.tsx`
- `components/marketplace/publication-shortlist.tsx`
- `components/site/article-library.tsx`
- `components/site/chrome.tsx`
- `components/site/directory-page.tsx`
- `components/site/home.tsx`
- `components/site/navigation.tsx`
- `components/site/publication-table.tsx`
- `lib/inquiries.ts`
- `lib/mail.ts`
- `lib/site/directories.ts`
- `lib/site/directory-intros.ts`
- `lib/site/faq.ts`
- `lib/site/pages.ts`
- `lib/site/public-copy.ts`
- `lib/site/range-copy.ts`
- `next-env.d.ts`

### Publication content and indexing

- `app/methodology/page.tsx`
- `app/publication/[domain]/page.tsx`
- `lib/commerce/publication-pages.ts`
- `lib/commerce/publication-presentation.ts`
- `lib/commerce/publication-profiles.ts`

### Blog, guides and authors

- `app/authors/[slug]/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/blog/page.tsx`
- `app/guides/[slug]/page.tsx`
- `lib/blog/additional-buyer-content.ts`
- `lib/blog/buyer-expansions.ts`
- `lib/blog/editorial.ts`
- `lib/blog/geo-measurement.ts`
- `lib/blog/index-metadata.ts`
- `lib/blog/indexing-policy.ts`
- `lib/blog/library.ts`
- `lib/blog/marketplace-content.ts`
- `lib/blog/public-copy.ts`
- `lib/blog/queries.ts`
- `lib/blog/seo.ts`
- `lib/blog/technical-aeo.ts`
- `lib/site/authors.ts`
- `lib/site/buyer-guides.ts`
- `lib/site/domain-guides.ts`
- `lib/site/guest-posting-guides.ts`
- `lib/site/guide-expansions.ts`
- `scripts/content/seed-blog.ts`

### Index hygiene, audit and checks

- `docs/inquiry-content-audit.md`
- `lib/seo/facets.ts`
- `lib/seo/json-ld.ts`
- `lib/seo/sitemap-entries.ts`
- `lib/seo/sitemap-files.ts`
- `reports/buyer-content-audit.json`
- `scripts/content/audit-buyer-content.ts`
- `scripts/seo/audit-publication-content.ts`
- `scripts/seo/index-policy-report.ts`
- `tests/e2e/placement-inquiry.spec.ts`
- `tests/e2e/restored-placement-action.spec.ts`
- `tests/unit/article-library.test.ts`
- `tests/unit/blog-indexing-approval.test.ts`
- `tests/unit/blog-seo-consistency.test.ts`
- `tests/unit/buyer-article-schema.test.ts`
- `tests/unit/buyer-guides.test.ts`
- `tests/unit/guest-posting-guides.test.ts`
- `tests/unit/inquiries.test.ts`
- `tests/unit/marketplace-empty-pagination.test.ts`
- `tests/unit/publication-pages.test.ts`
- `tests/unit/publication-profile-routing.test.ts`
- `tests/unit/publication-rendering.test.ts`
- `tests/unit/seo-facets.test.ts`
- `tests/unit/tools-blog.test.ts`

