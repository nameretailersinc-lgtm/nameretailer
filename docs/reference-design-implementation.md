# Customer reference templates

The subsequent [customer consistency correction](customer-consistency-review.md) unifies all customer headers/footers, announcement bars, page-title and gutter tokens, and explicitly checks tablet/breakpoint layouts. Its report supersedes earlier shared-shell details and screenshots, while retaining the routes, business boundaries and supplied artwork described below.

2026-10-06 continuation. The owner asked to continue accounts/cart work and closely match the five supplied PNG references using the existing `public/` assets. This update builds the customer-facing layouts; it does not authorize deployment, listing activation or payment processing.

## Routes and reference mapping

| Route                | Design evidence                                                       | Working behavior                                                                                                            |
| -------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/`                  | `Landing Pagefinal.png` (latest; supersedes the older landing sample) | Dedicated marketplace landing page, six feature links, four-step planning process, inquiry CTA                              |
| `/products/`         | Domain Rating marketplace reference                                   | Existing real active inventory, URL filters/sort/pagination, four-item comparison, placement planning                       |
| `/guest-post-by-dr/` | `Name Retailer Domain Rating Marketplace.png`                         | Same genuine inventory/filter workflow, metric-specific heading and supplied laptop artwork; not a fabricated demo dataset  |
| `/how-to-buy-links/` | `article-1280 (2).png`                                                | Explicitly draft buying checklist, four numbered sections, comparison table, sticky desktop contents, official source links |
| `/word-counter/`     | `Modern Word Counter Tool UI.png`                                     | Browser-local word/Unicode-character/nonempty-line counts, estimated reading time, example/clear/copy and native FAQs       |

All current public templates remain **noindex**. The mapped legacy guide/tool/metric routes are previews, not completed Phase 4 content migration or reviewed redirect activation. The landing page is intentionally no longer a duplicate catalog: inventory/search query workflows live at `/products/` and the metric view. Tests retain those workflows on their actual catalog routes and separately cover home navigation.

## Visual system and asset use

`app/reference.css` scopes the customer templates without replacing admin styles: circular `n` wordmark, Inter/Source Serif typography, pale paper/mint surfaces, forest-green actions, white cards, split illustrated heroes, numbered guide sections and dark process/mountain CTA bands. Shared header/footer live in `components/site/chrome.tsx`. The app uses confirmed Name Retailer branding, offer, email and address, not the sample agency identity.

Existing PNG assets are preserved, loaded with `next/image`, explicit dimensions, responsive sizes and decorative empty alt. Home uses the analytics illustration, benefit/service icons, illustrative use-case photos and mountain banner. The guide uses the checklist and listing-browser artwork; the word counter uses the content-metrics panel; the metric view uses the supplied laptop. Standalone packaging includes public assets and excludes generated environment copies while preserving the original `.env`.

The original raster references remain unchanged. This is a reference-led implementation, **not a measured pixel-identical result**: marketplace copy, supported actions, real inventory, deferred proof, native accessible controls and mobile reflow deliberately differ from sample agency/draft artwork. No pixel-diff threshold or full WCAG claim is invented. Current captures and bounded checks are recorded separately in the verification report.

The final marketplace context panel sits beneath the results rather than extending the filter sidebar. It retains the complete owner-supplied/unknown-source-date caveat with a draft checklist link. Compact UI headings, fully visible comparison controls and the amber stage notice preserve the reference's hierarchy without hiding limitations. See [verification and current captures](reference-design-verification.md).

## Claims and deferred content

The owner-confirmed `Trusted by 10,000+ marketers` statement remains explicitly owner-reported, not an active-inventory statistic. Exact client/logo list, testimonial quotes/names, growth sources/periods and publisher-review checks are deferred at the owner's request. Home therefore shows labeled pending client-proof slots and illustrative audience use cases, not sample quotes, growth numbers, famous-client endorsements or a verification badge. Decorative analytics artwork is labeled as illustration, not measured client results. No newsletter subscription form, social profile, service offer or policy link is fabricated; the footer provides the working contact address.

The guide has no fake author, publication/update date or reading-time measurement. Its draft status and editorial/owner-review requirement are visible. Source links point to Ahrefs' DR definition and Google's current link-spam/outbound-link guidance. This is not final legal, merchant or refund policy.

## Counter privacy and definitions

`lib/tools/word-counter.ts` uses Unicode word segmentation; characters are Unicode code points including whitespace, paragraphs are nonempty lines, reading minutes round up at 200 words/min. The textarea caps input at 100,000 browser input units. Input is not sent to an API or saved in local/session storage. Copy includes only the count summary. Clipboard failure is reported honestly; Clear removes input and restores focus. The privacy statement describes this tool, not all account/cart processing.

## Commerce boundaries

Customer accounts and the persisted server-priced cart remain implemented; registration and authenticated mutation CSRF signatures now have distinct purposes. Same-user-ID anonymous registration tokens must not authorize cart mutations. Changed/unavailable items block a misleading total, imported drafts remain private, and no order/reservation/payment is created. See [the account/cart contract](account-cart-contract.md) and [verification](account-cart-verification.md).

The 56,005 owner products remain drafts. All integration writes are synthetic `_test` database records; `.env`, owner CSV, live WordPress, owner listings, DNS and deployment are unchanged. Remaining Phase 3b work includes private briefs/files, immutable orders, fulfillment and Stripe/PayPal integrations. Final proof, production SMTP, operational policies, public SEO/migration and launch QA remain separate gates.
