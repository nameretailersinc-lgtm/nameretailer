# Account/cart continuation verification

2026-10-06. Scope: customer accounts, persisted planning cart and owner-supplied decorative public images. Phase3b remains in progress; this is not launch approval, a payment integration or full security/WCAG audit.

## Automated checks

- Latest full unit suite: **182 passing tests in 13 files** (the account/cart slice added16 checks to the previous160; the local counter adds6).
- Full TypeScript and optimized standalone build passed with the new dynamic `/my-account/`, password-reset and `/cart/` routes, account APIs, cart API and allowlisted placement-options API.
- Full ESLint and TypeScript checks pass. Generated Playwright reports, test output and coverage are excluded from lint; application/test source remains checked.

Unit coverage includes strict registration/profile schemas, customer role/owner/price-field rejection, safe profile output, exact placement-plus-writing cents, unavailable/zero/malformed/overflowing add-ons, manual placement-only listings, changed/unavailable aggregate totals, active/committed-only options and canonical CSRF validation.

## Execution history

Latest shared-layout continuation: account, cart and password-reset pages now use the same customer header/footer as the landing, catalog, guide and tool. The unchanged security/cart services and updated UI pass all eight account/cart cases across the documented 47-plus-3 regression invocations; all 50 unique selected browser/API cases pass. This supersedes the earlier private-shell screenshots, not the historical execution details below. See [customer consistency review](customer-consistency-review.md).

The first browser invocation was stopped after identifying the inline cart sign-in link's missing underline and obsolete browse-only design assertions that rejected the now-implemented account/cart links. The first three new API cases and the save/update/remove browser journey passed in that attempt, but it is **not** claimed as a passing complete run. Its diagnostics/screenshots remain under ignored `.local/qa-account-cart/`. The inline link now has a persistent underline; design assertions now check real account/cart navigation while continuing to reject checkout links. Checks were not removed for unimplemented checkout.

The earlier corrected account/cart candidate passed32 cases under ignored `.local/qa-account-cart-final/`, **before** registration-purpose separation; it is not final proof of that security change.

The later purpose-separated build and new reference templates passed **all42 cases in one invocation**, without failures or skips, under `.local/qa-reference-polished/`: eight account/cart, seven product API, nine product browser, eight catalog/metric-view design and ten landing/guide/tool cases. The account/cart cases include an anonymous registration challenge bearing the same user ID that still cannot authorize an authenticated cart mutation, strict customer-only assignment, duplicate/inactive/staff preservation, ownership isolation, exact cents, concurrent/stale write rejection, changed/archived total blocking and browser save/update/remove/profile/logout/reset states. Missing SMTP correctly fails closed; no email-delivery success is claimed.

Visual review then identified oversized marketplace benefit headings caused by the shared editorial H2 style and metric context positioned beneath the filters instead of the results. Follow-ups change only scoped public marketplace markup/CSS; account APIs/security/cart services and private customer styling are unchanged. Both the27-case UI follow-up and the final17-case marketplace/product recheck pass without failures/skips. Exact artifact scope and screenshots are in [reference-template verification](reference-design-verification.md). No claim is made that the earlier42-case invocation tested a later visual artifact.

## Safety and limitations

All integration mutations use synthetic accounts/products in the guarded `_test` MongoDB database and a loopback production-mode server on port3003. Registration, login, CSRF, transaction/version and rate limits remain enabled. The original `.env`, owner CSV, 56,005 owner draft products and WordPress storefront are unchanged. No owner listing activation, order, payment, DNS/cutover or live deployment occurred. Only generated standalone environment copies were removed by packaging; original credentials were preserved.

New accounts are password-authenticated but **email ownership is not verified**. There is no legacy customer/order migration, private article upload/brief submission, immutable order snapshot, fulfillment admin or Stripe/PayPal checkout. Production SMTP reset is unconfigured and must fail closed. Legal/merchant/privacy/refund/tax/fulfillment policies and supporting client/logo/testimonial/result/verification details remain owner inputs before launch. Public pages remain noindex.

When `TRUST_PROXY` is not explicitly configured, the registration address bucket is a shared `untrusted` bucket (20/hour), not a safely distinguishable per-client IP. Configure a restricted trusted proxy before launch; do not trust arbitrary forwarded headers. Registration also limits3/email/hour and200 globally/hour; cart/profile mutations limit120/account/hour. Honeypot and rate limits are implemented; no Turnstile keys or claim of CAPTCHA protection is invented.

The bounded tests do not establish full WCAG conformance, performance/CWV targets, live merchant eligibility, email delivery, provider behavior, exhaustive penetration testing, backup/restore or Phase4 public SEO/migration readiness.
