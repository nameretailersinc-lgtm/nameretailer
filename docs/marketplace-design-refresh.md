# Marketplace design refresh

Started 2026-10-06 after the owner asked to check the latest document evidence, replace the sample agency branding with Name Retailer's marketplace offer, then continue. This is a visual update within the already authorized Phase 3b browse experience, not Phase 4 public content migration, paid checkout or deployment.

## Reference images

The subsequent five-image/public-asset continuation adds dedicated landing, draft article and functional word-counter templates, shared customer chrome and a Domain Rating view. Its [implementation report](reference-design-implementation.md) supersedes the layout descriptions below. Earlier 160-test/24-browser evidence remains historical; it is not proof of the subsequent artifact.

- [Latest landing-page reference](design-preview/evidence/Landing%20Pagefinal.png).
- [Marketplace reference](design-preview/evidence/Name%20Retailer%20Domain%20Rating%20Marketplace.png).
- [Article reference](design-preview/evidence/article-1280%20%282%29.png).

These owner-supplied raster references are preserved unchanged. They guide visual hierarchy, serif headlines, paper/mint surfaces, forest-green actions, compact publication cards and darker inquiry sections. The agency sample's brand and offer are not Name Retailer's identity. The actual app continues to use the existing two self-hosted fonts and working product data, filters and shortlist.

## Claims and publication scope

The owner requested the sample logos, testimonials, growth figures, marketer count and verification claims, then explicitly confirmed: “They are genuine; I’ll provide the supporting details.” This authorizes the exact owner-confirmed statement “Trusted by 10,000+ marketers”; it is an owner-reported business claim, not independently measured by this rebuild and not a count of currently active publications. Do not derive further numbers or guarantees from it.

The approved client/logo list, exact quotations and attributions, growth measurement periods/client sources and publisher-review process have been requested separately. The owner answered “i will provide it later continue now,” so these details are deferred, not a blocker for the visual refresh. Do not alter a sample agency quotation into a purported Name Retailer client quotation, guess logo permissions or imply this software independently verifies imported metrics. Add the other proof sections only with the exact supplied material. No live deployment is authorized by “continue.”

Name Retailer's confirmed name, email and Sharjah address remain usable. Current active-listing counts come from the API, not from draft import counts. Missing metrics remain unavailable; supplied measurements are not independent verification. Checkout and accounts remain upcoming in this visual slice. The price-tier mapping is already confirmed separately in [the pricing review](live-commerce-pricing-review.md).

## Historical evidence caveat

### Subsequent account/cart and public-asset update

The owner later asked to continue and supplied assets in `public/`. The current hero uses the decorative listing-browser bitmap through `next/image`; the checklist bitmap illustrates the planning cart. Original PNG references remain unchanged. Account/cart navigation is now functional, and stage notices distinguish the implemented planning cart from the still-unavailable order/payment flow. See [account/cart scope](account-cart-contract.md) and [new verification](account-cart-verification.md). The earlier visual evidence below describes its original code-native-illustration artifact, not this subsequent revision.

The earlier `design-preview/evidence/preview-checks.json` records tests of the Phase 2 HTML prototypes, not these newer PNG references or this refreshed Next.js build. Six recorded home/marketplace/article screenshot paths no longer exist; the two tool captures remain. Preserve the historical report but do not describe its missing captures as current evidence. The newer references cannot themselves establish responsive behavior, working links, contrast or accessibility conformance.

## Implemented visual adaptation

- Circular `n` mark and Name Retailer marketplace branding, with an explicitly branded home-page browser title and separate private admin description.
- Split serif hero with code-native HTML/CSS/SVG publication-desk illustration; no fabricated numerical charts or bitmap text baked into the page.
- Working browse/shortlist actions, the owner-confirmed marketer statement, three mint-accented benefit cards and the existing real filter/sort/pagination/compare workflows.
- Three-step buyer checklist, native keyboard-operable help disclosures, dark-green placement inquiry section and four-column footer using existing section anchors and the confirmed email/address.
- Explicit no-purchase/noindex stage notices and metric provenance retained. No client proof details invented and no account/cart/order/payment implementation added by this refresh.

## Verification

The final production build, full lint/TypeScript and all 160 unit tests pass. A single final production-mode Playwright invocation passed all 24 cases (eight new design, nine existing product browser and seven API cases), with no skips/failures; all 18 responsive state checks passed. The final screenshot review verifies the readable mobile metric note and visible desktop Compare column. Exact screenshots, execution history and limits are in [marketplace-design-verification.md](marketplace-design-verification.md); these bounded checks do not establish full WCAG conformance or launch readiness.

QA used fresh synthetic users in the isolated test database, preserving the real rate limits and owner inventory. The local QA server was stopped after verification. Standalone packaging removes generated environment copies while preserving the original `.env`. Original Phase 3b verification remains historical evidence for the previous build; it is not automatically proof of this revision. No owner records were activated, and no live deployment was performed.
