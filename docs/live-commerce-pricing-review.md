# Live article-price mapping

Verified 2026-10-06 after the owner directed us to inspect the existing site. Read-only anonymous lookup; no login, registration, form submission, cart change, checkout or payment.

## Confirmed mapping

The homepage loads the existing plugin's JavaScript, whose modal template and price handlers establish:

| Export field      | Meaning                                           | Sample source amount |
| ----------------- | ------------------------------------------------- | -------------------: |
| `Price`           | Publisher placement only                          |    Varies by listing |
| `Article_Price`   | Additional article-writing charge for 500 words   |            USD 12.00 |
| `Article_Price_2` | Additional article-writing charge for 750 words   |            USD 20.00 |
| `Article_Price_3` | Additional article-writing charge for 1,000 words |            USD 30.00 |

Writing mode totals placement plus the selected writing tier. Placement-only mode uses `Price`, resets the article charge to zero, and shows a customer article-file upload. Writing mode requests the destination URL, keyword and article brief/requirements, with a word-count selector. Its template describes provider-managed writing and publication. Zero-priced writing tiers are unavailable, not free. The sampled amounts come from the supplied CSV, not universal prices hardcoded in JavaScript. Evidence: [homepage](https://nameretailer.com/) and its discovered [custom-filter JavaScript](https://nameretailer.com/wp-content/cache/min/1/wp-content/plugins/Plugin-1.31/custom-filters/filter.js?ver=1787317744), functions `generateAndShowModal`, `updateContentLength` and `setupPricingHandler`.

The plugin asset returned HTTP 200; inspected UTF-8 body SHA-256:

```text
4b4c54d8aea404649893ee807b70bf6b46bf55122dbe9419de44f37b569923ef
```

## Scope and contradiction

The browser lookup rendered the public listing prices, but not the generated purchase modal. An exact discovered [publisher-detail link](https://nameretailer.com/link-details/cidadesdomeubrasil.com.br/) was also checked by anonymous GET: its slashless URL redirected once to the trailing-slash URL, which returned 200. The detail markup did not supply a clearer tier-label mapping; the publicly loaded modal source did. JavaScript was inspected as text, not executed. This confirms the intended legacy storefront calculation, not authenticated checkout/server enforcement or successful order fulfillment.

The older [content-writing-services page](https://nameretailer.com/content-writing-services/) says standalone writing is not officially offered through the website and points to direct contact. That conflicts with the purchase plugin's optional writing workflow. A plausible inference is that the old page refers to standalone services or is stale; neither explanation is proven. Do not copy that announcement into the rebuilt purchase flow. The owner-directed storefront evidence resolves the CSV tier mapping without requiring a guessed label or an authenticated session.

## Implementation handoff

The rebuild may model placement-only versus optional 500/750/1,000-word writing using the validated per-product CSV amounts. Retain original fields privately and show explicit normalized tier charges. Recalculate totals on the server using integer cents; never trust legacy client-posted `selected_price` or article charges. Unavailable or malformed tiers must not become free options. Do not inherit the legacy float arithmetic or implicit default selection: make buyer choice and total clear.

Publisher activation, final fulfillment/acceptance/refund terms and live payment-provider setup remain separate operational requirements. No app schema or import code was changed by this inspection.

Reproduce bounded read-only inspection:

```powershell
.\node_modules\node\bin\node.exe scripts/commerce/inspect-live-pricing.mjs
```

The helper reads one homepage, its discovered custom-filter script, and one discovered detail URL plus its exact trailing-slash normalization. It stores no live HTML, account state or cookies and performs no POST requests. Scoped ESLint passes.
