# Placement brief and checkout review — 2026-10-06

The supplied logged-in WordPress screenshots are the functional reference: Buy now opens a placement dialog; customers choose link-only versus placement plus writing, supply a URL/keyword and article/brief, review a cart, then enter billing details. The new screens retain the rebuild's paper/evergreen shared design. No screenshot's personal billing values, sample prices or guaranteed-growth claims were copied.

## Implemented boundary

- `BuyPlacement` opens a native modal from publication listings/details. It fetches current options and the authenticated owner's cart, restores focus on close, supports Escape and locks background scrolling. Unsigned buyers can inspect prices but must sign in to save/upload.
- `PlacementForm` collects a public HTTP(S) destination, keyword/anchor, requirements and plain-text article brief or customer article. Per-product CSV writing charges map to 500/750/1,000 words; sample prices are not hardcoded. Unavailable tiers cannot be selected. Placement-only can use pasted text instead of a file; writing requires a brief. Rich-text/TinyMCE formatting is not implemented in this slice.
- Briefs persist in the owner's existing `commerce_carts` record. Strict validation rejects browser totals, owner IDs, quantities and unsupported tiers. Server integer-cent pricing, the 20-publication cap, active/committed inventory checks and cart/product versions are retained. One placement per publication. Older selections remain readable but need complete briefs before checkout review.
- Cart displays destination, keyword, link type, article option/file, quantity one and recalculated prices, with edit/remove and a real `/checkout/` review link. Changed/unavailable listings, missing briefs and unavailable files block progress. Explicit refresh reloads saved form values; navigation to another product resets the configuration.
- `/checkout/` provides international billing, notes, current placement summary and Stripe/PayPal preference. Identity/address fields are validated; region/postal fields are optional for international use. Draft save/reload/delete works. Billing is not an invoice, payment or acceptance of unavailable terms.

## Private uploads and retention

`/api/cart/files/` supports authenticated GET summaries and POST upload; `/api/cart/files/[id]/` supports owner-only attachment GET and CSRF-protected DELETE. Multipart parsing is bounded to 5 MiB plus envelope allowance; size, simple filename and PDF/DOC/DOCX/TXT container/content checks are enforced. TXT must be UTF-8; DOCX headers are inspected without inflating ZIP content. These checks **are not full document validation or malware scanning**. A production scanning/quarantine workflow is still required before staff processing.

Files are private MongoDB Binary records in `commerce_article_files`, never public media. At most 20 unexpired files/account (100 MiB); seven-day TTL retention. APIs check expiry immediately, independent of delayed TTL deletion. Listing/referencing another account's file is disallowed. Customers can select/reuse/delete retained files, including uploads not saved to a cart. Downloads use application/octet-stream, attachment, nosniff and sandbox CSP. The app does not execute, preview or automatically parse documents. Do not open untrusted DOC/PDF content, which may contain active features.

`commerce_checkout_drafts` stores one private billing draft/account with seven-day retention and immediate expiry checks. Saves recheck active/session-version identity, cart version, current listings/prices, brief completeness and file ownership/availability in a transaction. Stale draft versions fail with 409. Deletion removes saved billing. APIs are private/no-store/noindex; `/checkout/` has private-page CSP/noindex headers. New audit entries omit article text, billing details and raw file names. Removing a cart item does not immediately delete a retained file; users can explicitly delete it or let retention expire.

## Payment and order boundary

The owner selected **Stripe and PayPal**. Only preference selection is implemented; **neither provider adapter is implemented or connected yet**. Place order is disabled and explains this. No card details, orders, reservations, inventory decrements, payment sessions, receipts or fulfillment jobs are created. No success page implies a purchase. Coupons, fees/taxes and a final payable total are not configured; the amount is a preview subtotal.

Next integration needs owner merchant accounts/test credentials in the private environment (not chat), approved final commercial/privacy/refund/replacement rules and a tax/fee decision. Then implement sandbox redirects, order snapshots, idempotency, verified webhooks/capture, paid-state reconciliation, durable private fulfillment files, history/admin views and recovery. Browser success must never independently mark an order paid. Live charges and cutover need separate approval.

## Verification

TypeScript, ESLint and 301 unit tests passed. Production builds passed; packaging removed only generated environment copies and preserved the owner's original `.env`. The isolated port-3003 `_test` app was used. Owner records and the live WordPress site were not mutated.

The final build and eight-case confirmation run passed: all seven `tests/e2e/placement-checkout.spec.ts` cases plus the existing customer-cart browser case. This covers ownership/download/format checks, forged fields/origins, stale draft/cart/product guards, writing-package dialog→cart→billing save/reload, browser upload/reload/removal, and accessibility/overflow at 320/375/768/1280px. Dialog bounds, scrolling, Escape and restored focus were checked. Twelve route/viewport states were exercised; private final screenshots are in `.local/qa-placement-checkout-release/`. Eight existing account/cart cases also passed in an earlier regression invocation; its combined run was interrupted for the reload refinement, not reported as a complete passing invocation. The final run rechecked that refinement and the customer edit/remove flow.

Payment integration is not counted as verified. Other pending tools/journal visual checks retain their own scope in [catalog/blog/tools notes](catalog-blog-tools.md). The rebuild remains noindex and was not deployed.
