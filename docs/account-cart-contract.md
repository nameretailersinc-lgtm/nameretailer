# Customer accounts and cart — Phase 3b continuation

Historical initial account/cart slice. Subsequent owner-approved work activated all 56,005 imported publications and added placement briefs, private article uploads and checkout billing drafts. See [the current placement/checkout contract](placement-checkout.md). Actual orders, reservations and payment processing remain unavailable. Email ownership is not verified by registration; SMTP reset remains fail-closed when unconfigured. The sections below describe the earlier first slice, not the current file/brief functionality.

## HTTP contract

All JSON responses use private/no-store and noindex headers. Errors use `{error, issues?}`. Account and cart pages are dynamic, noindex, nonce-CSP protected. Registration signatures are purpose-separated from authenticated CSRF: anonymous challenges cannot authorize account/CMS mutations, even for the same identity. CMS permission checks are unchanged: customer sessions cannot access CMS endpoints.

- GET `/api/account/registration-csrf/`: `{token}` with a separate HttpOnly host-only challenge cookie. POST `/api/account/register/`: header `x-csrf-token`, same-origin, strict body `{name,email,password,website:""}`. Password 12–256 characters; customer role assigned only on the server. Success **202** `{message}` is the same for existing/new eligible email; existing accounts are never altered. UI prompts sign-in, never automatically logs in on registration. No marketing consent inferred.
- GET `/api/account/profile/`: `{user: UserSummary}`; 401 when signed out. PATCH: strict `{name}`; signed-in user-bound CSRF and same-origin required. No email, role or ownership fields accepted.
- GET `/api/account/csrf/`: `{token}` for any active signed-in account (including staff using their own cart).
- Existing POST `/api/account/forgot-password/` and `/api/account/reset-password/` are reused. Customer email links go to `/my-account/reset-password/`; staff links still use the admin route.
- GET `/api/products/[id]/options/`: `PlacementOptions` from `lib/commerce/cart-types.ts`, only active products in committed imports. Source export fields never exposed. `Price` is placement; source `Article_Price`, `_2`, `_3` are optional 500/750/1000-word writing **add-ons**. Zero, malformed or overflowing add-ons are unavailable. Manual listings without source writing prices offer placement only.
- GET `/api/cart/`: `CartView`, signed-in owner only. Missing cart is version 0, empty, total 0. Current prices recalculated on every read. Changed product versions require explicit review, inactive/missing/uncommitted products are unavailable. Cart total is null if any item needs review/unavailable (never a misleading partial total).
- PUT `/api/cart/`: strict `{version: number, item: CartSelection}`; add/replace one selection by productId (quantity always one, max20 distinct placements). Client prices/owner IDs/extra fields rejected. Product version must match current options; cart version must match saved version; stale requests return409 and make no change. Returns updated `CartView`.
- DELETE `/api/cart/`: strict `{version,productId}`; removes only an own-cart selection, returns updated view. Same-origin, user CSRF, fresh session check and rate limits on mutations. Cart/user/product writes share the existing transaction constraint to protect version/active-account invariants.

## UI ownership

Root implemented services/types/APIs/auth/db, routes/proxy, customer/cart components and tests. The originally assigned design/QA specialists reached their usage limit before completing this slice, so root continued their scoped work. Preserve existing marketplace branding, filtering, shortlist and admin behavior.

Pages: `/my-account/` (login/register or account/name/sign-out), `/my-account/forgot-password/`, `/my-account/reset-password/`, `/cart/`. Cart query `?product=<id>` lets anonymous buyers inspect options before signing in; sign-in link returns only to same-site cart with a validated UUID. Save requires account. Add-on selector shows placement plus writing and total USD. Saved cart permits review/update/remove, explicitly says order/checkout/payment unavailable. Article and destination details will be collected in the order workflow, not stored in this planning cart.
