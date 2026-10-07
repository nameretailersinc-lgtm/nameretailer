# Phase 3b progress: product inventory and customer browsing

Current continuation: the owner authorized activation of the 56,005 imported publications, which are now active. Sixty original journal articles and 28 tool pages are also implemented. See [the current implementation report](catalog-blog-tools.md) for exact scope and outstanding verification. Checkout and deployment remain pending.

Earlier missing-page continuation added twelve customer information/directory routes and a reviewed import-activation panel. At that preparation stage, the 56,005 owner products remained drafts. Its historical route scope, read-only owner report and activation safeguards are in [page coverage and activation](page-coverage-and-activation.md).

2026-10-06. Phase 3 accepted for continuation; owner approved the customer marketplace and supplied the product CSV. Phase 3b is **in progress**, not complete and not deployed. Customer registration and a planning cart are implemented in the continuation below; order management and Stripe/PayPal remain upcoming.

## Implemented first slice

- Customer marketplace at `/` and `/products/`, replacing the temporary CMS-only root. Anonymous browsing, real active-product counts, domain/topic search, country/language/category and price/DA/DR filters, sorting, bounded server pagination, shareable URL state, desktop table/mobile cards and a four-publication comparison shortlist. No forced login, fake testimonials, sample inventory or pretend checkout.
- Admin-only `/admin/products/`: actual MongoDB listing management, manual add/edit, optimistic version conflicts, explicit draft/active/archive status, CSV preview and SHA-bound confirmation. Raw export provenance is private; public API fields are allowlisted and exclude draft/staging records.
- Separate `commerce_products` and `commerce_imports` collections with unique IDs, canonical publisher URLs and legacy IDs; indexed sorting/status and atomic import visibility. Imports never overwrite existing products. A failed batch cleans only its own newly staged rows; a lost acknowledgement never removes an already committed batch. Public and admin queries hide uncommitted batches.
- CSV handling accepts at most 32 MiB / 100,000 records, checks actual streamed bytes/UTF-8, preserves safe publisher paths, reports full per-code counts while bounding issue details, rejects structurally broken files even with valid-row consent, excludes every occurrence of conflicting canonical URLs, and requires explicit consent to quarantine invalid rows. Decimal prices convert exactly to integer cents.
- Private operator CLI supports analysis without database writes and explicit SHA-bound draft commit. Source file is unchanged and is not copied into the app, repository data or standalone deployment package.

## Actual supplied CSV import

Source: `C:\Users\zuhoor\Downloads\wpk4_lm_links (1).csv`. Quality review: [product-csv-review.md](product-csv-review.md).

Successful commit to the owner-configured MongoDB database: **56,005 draft products**. **74 rows excluded:** one repeated-header placeholder, 42 rows in conflicting canonical-URL pairs, 28 invalid/ambiguous URLs and three nonpositive placement prices. Nothing activated, published, charged or made purchasable. Import ID: `06cd8282-0dda-411f-becf-2a8c081d693f`.

All original 25 fields remain private per product, including article-price tiers, raw zeros, original marketing metadata and invalid dates. Imported zero/empty metrics display Unavailable; import timestamps are actual system timestamps, not invented measurement/publication dates. Displayed nonempty metrics are owner data with unknown provider/date, not freshly verified scores or quality guarantees.

Review drafts in `/admin/products/`; change only approved records to active to make them visible in customer browsing. Anonymous browsing can legitimately show no results while all owner records remain drafts. A future safe bulk-review/activation workflow is separate from blind import activation.

## Verification and remaining work

The 2026-10-06 reference-led visual refresh adapts the newer owner images to Name Retailer at `/` and `/products/`: illustrated split hero, mint feature cards, buyer checklist/help, green inquiry section and expanded footer. The exact “10,000+ marketers” statement is owner-confirmed; client-logo/quotation/result/verification specifics are deferred per owner direction. Its final artifact passed a single 24-case browser/API run and 18 responsive state checks, alongside the 160 unit tests, lint, full TypeScript and production build. See [refresh scope](marketplace-design-refresh.md) and [fresh verification](marketplace-design-verification.md). This does not implement the remaining commerce features or authorize launch.

Lint, full TypeScript, 160 unit tests (82 CMS + 78 CSV/validation) and standalone production build pass. All 16 unique first-slice production browser/API cases passed across a corrected 15-pass run and the remaining case's targeted rerun, with no skips; all 12 responsive template/state checks passed. Exact evidence and limitations are in [phase3b-verification.md](phase3b-verification.md); this is not full WCAG conformance or launch QA. QA uses the separate `_test` database and synthetic test-only products, never owner inventory. Standalone packaging excludes environment copies and private CSV/test artifacts; original `.env` remains untouched.

The live WordPress storefront's purchase-plugin source confirms `Price` is placement-only USD, while `Article_Price`, `Article_Price_2` and `Article_Price_3` are additional writing charges for 500, 750 and 1,000 words respectively. Placement-only buyers supply their own article; zero-priced writing tiers mean unavailable, not free. Per-product amounts, not universal sample prices, must drive server-calculated checkout. Read-only evidence and the older writing-page contradiction are documented in [live-commerce-pricing-review.md](live-commerce-pricing-review.md). Original fields were preserved unchanged; no reimport is needed to apply these semantics. This confirms the legacy intended calculation, not successful authenticated checkout or fulfillment.

## Account/cart continuation

The later customer design continuation follows the supplied latest landing, marketplace, guide and tool references using public assets. Home is a dedicated landing page; the real catalog remains at `/products/` and `/guest-post-by-dr/`. The guide is visibly draft and the word counter works entirely in the browser. Details and publication boundaries are in [reference design implementation](reference-design-implementation.md); this does not complete Phase 3b or Phase 4.

Implemented `/my-account/` registration/sign-in/profile-name/sign-out, customer password-reset pages, and `/cart/` with anonymous placement-option inspection followed by signed-in private persistence. Accounts share the existing secure password/session system but cannot access CMS routes. Cookie-bound registration CSRF, same-origin checks, strict schemas, rate limits, honeypot and customer-only server assignment protect registration; duplicate/inactive/staff accounts are never replaced. Email ownership is not verified or claimed.

Options expose only an allowlisted current quote, not raw CSV source. Placement and optional 500/750/1,000-word add-ons are server-derived integer cents. Zero/malformed/overflowing writing tiers are unavailable; manual listings without imported prices offer placement only. Cart writes reject client amounts/ownership fields and stale product/cart versions, recheck active session inside transactions, and share the product/user constraint. Reads recompute current prices; changed/unavailable items block a misleading partial total. Maximum20 placements, quantity1 each. No orders, reservations or charges.

The owner then supplied images in `public/`. The listing-browser illustration replaces the code-native hero artwork; the checklist illustrates the empty cart. Both use `next/image`, reserved aspect ratios, responsive sizing and empty decorative alt. Public assets are included in standalone packaging. Logos, portraits and result imagery are not used as business proof while precise evidence remains deferred.

Detailed API scope is in [account-cart-contract.md](account-cart-contract.md); bounded verification and remaining security/launch limitations are in [account-cart-verification.md](account-cart-verification.md). Earlier verification paragraphs above describe the previous browse/design artifacts, not automatic proof of this continuation.

Remaining: article option/brief/private-upload order flow; immutable server-priced order snapshots and fulfillment admin; Stripe/PayPal test adapters, verified/idempotent webhooks, owner-controlled payment configuration and confirmed operational policy. No payment credentials, SMTP deployment, email verification, legacy customer/order migration, merchant tax/refund policy or publisher availability/eligibility verification is assumed complete. Public SEO templates, content migration, sitemap/robots/llms and reviewed redirect activation remain Phase 4; current public build stays noindex.
