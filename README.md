# Name Retailer rebuild

Phase 3 CMS is complete; Phase 3b marketplace is in progress. Browsing exists at `/products/`, accounts at `/my-account/`, placement briefs/private article uploads and server-priced selections at `/cart/`, billing drafts at `/checkout/`, and product/import management at `/admin/products/`. All 56,005 imported publications are active. `/blog/` includes 60 new guides and `/seo-tools/` links to 28 functional tools with scoped research modes. Stripe and PayPal are selected but their adapters are not implemented or connected; actual orders/payments, live SEO-provider access and legacy migration/redirects remain pending. This is **not a launch-ready replacement yet**. See [placement and checkout scope](docs/placement-checkout.md).

## Local setup

Use Node 24 LTS. The project includes a workspace-local Node 24 executable for this Windows machine's older global Node; `npm run` uses that executable without changing the system installation.

1. `npm install` (subsequent clean installs: `npm ci`).
2. Keep your private `.env`. The existing owner key `MOngodb_URI` works; the preferred key is `MONGODB_URI`. Use `.env.example` for other settings. **MongoDB is used for both development and production, as requested. There is no PostgreSQL/Drizzle or embedded database fallback.**
3. `npm run db:setup` creates indexes in `MONGODB_DB` (default `nameretailer_cms`); it does not insert sample content or overwrite existing accounts.
4. Set `ADMIN_BOOTSTRAP_PASSWORD` privately to a strong 12–256 character password, then run `npm run admin:create -- your-email@example.com "Your name"`. Remove the bootstrap variable afterward. No default login exists; test credentials are never production accounts.
5. `npm run dev`, then open `http://localhost:3000/admin/`.

Development can generate a private random auth secret at `.local/auth-secret` if `NEXTAUTH_SECRET` is absent. Production **requires** an environment secret of at least 32 characters and `NEXTAUTH_URL` set to the correct HTTPS origin. No fallback credential is accepted in production. Development resets can capture mail under `.local/mail/` only when `MAIL_TRANSPORT=local`; production resets require SMTP/TLS.

The owner's Windows DNS resolver refused Atlas SRV lookups. A process-only development fallback to public DNS works, without changing Windows DNS. For production, use a working host resolver or explicitly set `MONGODB_DNS_SERVERS`; production never silently switches resolvers. Atlas network access, a least-privilege database user and TLS still apply. Error responses/logs omit connection strings and credentials.

## Data and permissions

Native MongoDB driver; unique CMS IDs, collection/slugs and user emails; revision snapshots and optimistic version checks. Use Atlas or another **replica set** because content/revision/audit writes, bulk changes and password resets use transactions. No fabricated public content, authors, testimonials, inventory or leads are seeded. The `cms_*` collections separate content, accounts, revisions, audit events, reset tokens, settings and expiring rate-limit buckets. Body HTML is sanitized on the server; informative images require alt text and decorative images require an explicit decorative choice with empty alt.

Admin: all CMS settings/users/exports/records. Editor: content, categories, tags, author profiles and media. Author: only own drafts; cannot publish/schedule or edit others' content. Customer: denied the editorial workspace. Auth roles are rechecked against the database per request; disabling a user, resetting a password or changing permissions invalidates existing sessions. A login account is not automatically a verified public author.

Admin mutations require a signed user-bound CSRF token and same-origin request. Login uses Auth.js CSRF. Password resets are generic, expiring, hashed and single-use. Login/reset/upload limits are stored in MongoDB. CSP uses per-request nonces; no third-party analytics are loaded by this phase. Local optimized media lives in `MEDIA_ROOT` and must be backed up along with MongoDB. S3 is an optional future storage driver, not configured here.

In-app publishing invalidates CMS/public cache tags. Scheduled publishing is callable by `npm run publish:scheduled` or a POST to `/api/cron/publish/` with a configured strong `CRON_SECRET` Bearer token. The standalone CLI updates MongoDB but has no Next request/cache context; use the in-app cron endpoint once public ISR routes are implemented. Public rendering and migration redirect activation remain gated for Phase 4. Redirect configuration in the CMS is not proof that a live old URL redirects.

## Product CSV and customer browsing

The admin preview/confirmation workflow at `/admin/products/` activates reviewed batches of 1–500 drafts; import does not automatically publish. Use `npm run products:activation-preview -- IMPORT_ID 100` for a read-only report. The owner separately requested all imported publications visible on 2026-10-06: an exact-count/full-fingerprint CLI activated 56,005 with a private recovery backup and audited 500-record transactions. See [current catalog, articles and tools evidence](docs/catalog-blog-tools.md); the [earlier preparation report](docs/page-coverage-and-activation.md) describes the historical draft-only state.

The export originally entered as **56,005 drafts** and is now **56,005 active publications** following explicit owner approval. The 74 excluded source rows and original CSV are unchanged. Review [CSV quality findings](docs/product-csv-review.md). Active visibility does not independently verify publishers, metrics or current placement availability and does not enable purchasing.

Use `/admin/products/` for manual management and preview-then-confirm CSV uploads (32 MiB maximum). File hashes bind preview to commit. Imports default to drafts and never overwrite existing products. For an operator dry run: `npm run products:analyze -- "path/to/file.csv" --summary`. The separate `products:import` CLI also defaults to a dry run; only explicit `--commit --sha256=PREVIEW_HASH` writes, and files with flagged rows additionally require `--accept-valid-rows`. Structurally malformed files cannot be partially committed. Raw source/title/description/article tiers remain private and missing/zero metrics are not invented measured values.

The live storefront confirms placement-only pricing plus optional 500/750/1,000-word writing add-ons from the three article-price fields; zero tiers are unavailable. See [pricing evidence](docs/live-commerce-pricing-review.md). Checkout is not implemented yet. The first slice passed 160 unit checks, all 16 unique browser/API cases across the documented runs, and 12 responsive state checks; see [verification and limitations](docs/phase3b-verification.md).

The customer marketplace's latest visual refresh adapts the owner's newer reference images to Name Retailer's offer: split illustrated hero, mint cards, buyer checklist/help and a forest-green inquiry section. The “10,000+ marketers” line is owner-confirmed; exact client logos, testimonial attributions, growth sources and publisher-verification details are deferred until supplied. See [refresh scope](docs/marketplace-design-refresh.md) and its separate verification report. The reference images and older prototype test report are not proof of the refreshed app's behavior.

## Customer accounts and planning cart

Customer registration assigns only the customer role, uses a cookie-bound signed CSRF challenge, rate limits and a honeypot, and never replaces an existing account. Registration responses are generic; sign in explicitly afterward. Email ownership verification and legacy account/order migration are not implemented. Customers remain denied CMS access. Name editing, sign-out and password reset pages are available; password-reset email requires configured SMTP in production.

The cart is private to the signed-in owner, persisted in `commerce_carts`, and limited to 20 placements, one per publication. The server reads current active/committed product prices and converts writing add-ons exactly to integer cents; client prices and owner IDs are rejected. Version conflicts require review, and unavailable/changed selections block the aggregate total. Saving is not an order or reservation. Article files/briefs, order snapshots, fulfillment, payment and operational policies remain upcoming. See [account/cart contract](docs/account-cart-contract.md) and [verification](docs/account-cart-verification.md).

Owner-supplied `public/03_listing_browser_panel.png` and `public/01_guest_post_checklist.png` are used as decorative optimized images, with responsive sizes and reserved aspect ratios. The standalone build includes `public/` alongside client assets. Logo/portrait/case-study assets are not presented as client proof without the deferred supporting details.

## Checks

Current placement continuation: TypeScript, ESLint, 301 unit tests and production builds pass. The new placement/upload/checkout browser suite passes its scoped API, interaction and four-width accessibility checks; see [the exact evidence and payment boundary](docs/placement-checkout.md). The approval service is available again. The earlier 60-article/28-tool HTTP checks remain valid historical evidence; their broader browser rerun is separate, still pending work in [catalog/blog/tools notes](docs/catalog-blog-tools.md). Indexing, legacy migration, final order submission and payment processing were not enabled.

Latest consistency continuation: all nine customer routes now share the header/footer, responsive gutters, page-title typography and announcement bar. Tablet navigation wraps deliberately, and the catalog uses publication cards through 1100px. Build, TypeScript, ESLint and 182 unit tests pass; 50 unique browser/API cases pass across two runs, including 54 route/viewport checks and six breakpoint boundary states. See [customer screen consistency review](docs/customer-consistency-review.md) for the live-site comparison, screenshots and exact verification scope.

The latest customer templates now separate the marketplace landing page (`/`) from real browsing (`/products/`), add the Domain Rating view (`/guest-post-by-dr/`), an explicitly draft guide (`/how-to-buy-links/`) and a working browser-local counter (`/word-counter/`). They use the supplied public artwork and shared customer chrome while retaining noindex and the no-order/payment boundary. See [reference mapping and implementation](docs/reference-design-implementation.md) and [current screenshots/verification](docs/reference-design-verification.md). The full182-unit suite and42-case browser/API run pass;27-case UI and17-case final marketplace follow-ups recheck subsequent visual changes. Exact proof details remain deferred; sample logos/quotes/growth figures are not published as client evidence.

```text
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

For browser/integration tests, `npm run test:prepare` creates fresh QA-only accounts in the separate `nameretailer_cms_test` database and writes random credentials to ignored `.local/e2e.json`. Run `npm run build`, then `npm run test:server -- 3003`. This starts the standalone build on loopback with the isolated database and test-only media storage. Set `TEST_BASE_URL=http://localhost:3003` and `TEST_RESET_MAIL_CAPTURE=false`, then run `npm run test:e2e`. The production-mode reset test verifies that missing SMTP fails closed; the local-mail single-use/reset flow runs separately against development mode with `MAIL_TRANSPORT=local`. Do not point tests at the real content database. `PLAYWRIGHT_CHROME_PATH` can override the local Windows Chrome executable; Linux should use an installed Playwright browser. Full launch Lighthouse/schema/accessibility and public sitemap/redirect checks are later phases.

`npm run build` checks the standalone package, removes only Next.js-generated copies of private environment files, excludes local/test/content artifacts and includes client assets. Your original `.env` is not changed. Production receives secrets at runtime. Production dependency audit currently reports zero advisories; the full audit still reports five development-only transitive ESLint/globbing advisories without a patched `braces` release in the registry at verification time. Do not describe that as a zero-advisory full dependency tree.

## Deployment groundwork (do not cut over yet)

Dockerfile targets Node 24 and Next standalone. Compose runs the app plus Caddy and uses the owner-configured MongoDB connection (no PostgreSQL service). Persist the media volume, keep `.env` out of images/Git, set HTTPS `NEXTAUTH_URL`, and configure SMTP, database permissions, DNS and trusted proxy handling before a later approved deployment. Do not enable `TRUST_PROXY` unless only a trusted proxy can reach the app. Full deployment/backup/restore/DNS checklist is Phase 6.

The CI workflow is configured locally but has not run on GitHub. Action versions were checked against the official [checkout releases](https://github.com/actions/checkout/releases) and [setup-node releases](https://github.com/actions/setup-node/releases). Database/browser checks require an explicitly isolated test environment and are not silently run against owner data in CI.

Original brief and phase decisions: `docs/00-original-brief.md`, `docs/01-project-context.md`. API and file ownership: `docs/phase3-contract.md`.
