# Publication detail pages: Phase 1 data and content audit

October 19, 2026 (Asia/Karachi). This phase audits existing data and content before any indexing decision. Application behavior, publication content, catalogue records and indexing rules are unchanged. The earlier draft's recommendation to require reviewed content is a proposal for later evaluation; it is not an approved or implemented policy change.

## Evidence and scope

| Artifact | Scope |
|---|---|
| [Catalogue census and stratified sample](../reports/publication-content-audit.json) | Active listings with no import batch or a committed import batch; normalized field completeness, source-column statistics and reproducible sampling |
| [Rendered publication HTML](../reports/publication-html-before.json) | **212 detail pages** from the existing October 18 local production build, requested with a Googlebot user agent |
| [Public API response shapes](../reports/publication-api-audit.json) | Public web/mobile lists, mobile detail, placement options and unauthenticated admin GET; keys only, no raw source values |
| [Sitemap and route controls](../reports/detail-sitemap-audit.json) | Actual local XML endpoint outcome, query metadata and unknown-route behavior |
| [Companion guide audit](guide-content-audit-2026.md) | Full census and HTML inspection of all 25 guide detail pages |

The full census was refreshed successfully on October 19 at 09:48 Asia/Karachi using database-side aggregates. The rendered audit is also an October 19 observation and checks returned metadata against the inspected repository template. Local-build results establish a baseline, not deployed behavior, Google index coverage, ranking changes or AI citations.

The sample covers **62 categories, 94 supplied countries, four price bands**, both observed completeness tails, existing metric-eligible profiles, section listings and `001success.net`. It contains 13 placements priced up to $50, 62 above $50 through $150, 64 above $150 through $500, and 73 above $500. It includes **16 metric-eligible records and 11 section listings**. These overlapping strata are deduplicated by listing ID.

The original deterministic, purposive selection took first domain-sorted records per category/country, records at both completeness tails, metric candidates, sections and each price band, then spaced records if coverage was below 160. The refresh replays those 212 IDs to preserve comparability and confirms no missing records or category/country coverage gaps. This is not a random or prevalence-weighted sample. Full-census completeness figures are population measurements; sample repetition percentages must not be extrapolated as population prevalence.

## Routes, schema, imports and public projections

Root details use `app/publication/[domain]/page.tsx`. Section details use `app/publication/[domain]/[listing]/page.tsx` and re-export that view. `publicationPath()` preserves the listing ID for sections; `publicationProfile()` enforces active/committed visibility and matches the section identity. Detail-page availability is independent of sitemap/index eligibility.

`lib/commerce/types.ts` and `lib/commerce/validation.ts` define the normalized product: canonical publisher URL, topic, country, language, USD placement price, supplied metrics, link terms, turnaround, requirements and record dates. MongoDB stores these in `commerce_products`; import status comes from `commerce_imports`. The importer normalizes URLs, separates placement from writing prices, retains raw source columns and converts legacy metric zeros to unavailable values. Import dates are not metric-observation dates.

`lib/commerce/csv.ts` expects 25 legacy columns. These include `Title`, `Description`, `Keywords`, `Special_Requirements`, `TAT`, `Linktype`, `link_type`, `date_added`, metrics, and three `Article_Price` fields. Their existence does not establish accuracy, publisher identity, reuse rights or current editorial acceptance. The raw text is not used by the existing publication template.

One important exception to the intended projection boundary was reproduced:

| Endpoint | Observed local result | Finding |
|---|---|---|
| `/api/products/` | HTTP 200, normalized public fields | Omits raw source and import/external IDs |
| `/api/mobile/products/` | HTTP 200, normalized public fields | Same safe list projection |
| `/api/mobile/products/[id]/` | HTTP 200, `{ product, options }` | **Exposes raw `source`, `externalId` and `importId`** through the unprojected product object |
| `/api/products/[id]/options/` | HTTP 200, explicit placement/writing option fields | Omits the raw source object |
| `/api/admin/products/` without a session | HTTP 401 | Access denied as expected |

The mobile detail endpoint calls `availableProduct()` and serializes the returned record; the list endpoints use an explicit public projection. `Cache-Control: private, no-store` does not make an unauthenticated response private. This is a **high-priority projection defect** to fix in an implementation phase. The audit stores field names, not raw supplier values or credentials. Future profile drafts/reviewer data would also need explicit exclusion from this response.

`placementOptions()` already interprets the three raw article-price columns as separately priced 500/750/1,000-word writing options when positive and valid. They are not publisher biography or proof of a package inclusion. A later detail template can show current normalized options from this established pricing path; it should not infer writing scope from arbitrary import text.

## Data completeness

The refreshed catalogue census contains **56,005 active/committed listings**.

| Normalized field | Present | Missing | What it can support |
|---|---:|---:|---|
| Category | 56,005 | 0 | Supplied classification; 62 distinct values, not verified editorial scope |
| Country | 56,005 | 0 | Supplied listing country; 94 values, not audience geography |
| Language | 56,005 | 0 | Supplied language; 24 values, not verified readership |
| Link terms | 56,005 | 0 | Six package labels; not confirmed attributes on a live paid link |
| Turnaround | 56,005 | 0 | Eleven supplied estimates; not a delivery guarantee |
| Requirements | 0 | 56,005 | No normalized editorial/content rules to describe |
| Metric measurement date | 0 | 56,005 | Cannot establish freshness from record update dates |
| Domain Authority | 56,005 | 0 | Supplied proprietary score, not editorial quality |
| Domain Rating | 55,921 | 84 | Supplied proprietary score |
| Estimated traffic | 12,933 | 43,072 | Supplied number; no normalized provider, channel or measurement period |
| Spam score | 56,005 | 0 | Supplied score; no independently verified quality decision |
| Trust Flow, URL Rating, referring domains, backlinks | 0 each | 56,005 each | Show an unavailable state or omit optional secondary facts |

The optional-field completeness count has **15 components**: seven text/date fields and eight metrics. Sample scores are seven for 12 records, eight for 92 records and nine for 108 records. A score of nine does not mean a researched profile is complete: all records can still lack editorial requirements, measurement dates, audience evidence and a source-backed description. Price and URL identity are assessed separately.

Repetition is already visible in the census: 32,251 listings state “4 days”; 28,687 use the supplied two-DoFollow-link label; 44,802 have the supplied United States country value. These are useful filters and terms, but repeated labels cannot support thousands of distinct publisher biographies.

The full raw-field aggregate adds these findings:

| Raw field | Nonempty records | Distinct nonempty values | Interpretation |
|---|---:|---:|---|
| Title | 56,005 | 55,587 | 418 duplicate occurrences beyond the first; uniqueness does not validate publisher identity |
| Description | 56,005 | 55,939 | 66 duplicate occurrences beyond the first; a distinct string may still be templated marketing |
| Keywords | 13,398 | 13,178 | Missing on 42,607 records; not an editorial description or audience study |
| Special_Requirements | 0 | 0 | The source does not hide substantive requirements lost during normalization |
| Each of the three article-price fields | 56,005 | 1 each | Each tier repeats one value across the catalogue; not a distinctive publisher fact |
| date_added | 56,005 | 1 | A uniform legacy field, not a metric measurement date |
| link_type | 0 | 0 | The alternate raw link field is empty; display terms come from `Linktype` |

No stored publication enrichment or reviewed-state content was found anywhere in the active census. Three inspected legacy examples from the Business, Health and Technology sample strata contained promotional guest-post or text-link wording in their imported descriptions, rather than verified publisher biographies. One imported title mixed placement marketing with a web-series download phrase; the assigned category alone therefore cannot validate topic identity. This is a targeted text spot-check, not a finding that every imported description has the same wording. Full-census source-field counts/fingerprints measure availability and repetition without exporting raw copy. Nonempty or unique strings still require source and accuracy review before reuse.

## Measured content similarity

All **212 rendered pages** returned HTTP 200, exactly one H1 and the expected canonical. All returned titles and descriptions matched the current source reconstruction. Sample titles and descriptions have **zero exact duplicates**, which is compatible with the user's concern: a domain-name substitution creates a distinct string without adding unique editorial information.

After replacing the publisher URL/host, supplied category/country/language and numeric values, all 212 descriptions reduce to **three patterns**:

| Metadata/lead variant | Sample pages |
|---|---:|
| Price plus supplied DR and DA, traffic unavailable in the lead | 92 |
| Price plus supplied DR/DA and traffic | 108 |
| Price and supplied DA, DR/traffic unavailable in the lead | 12 |

The metadata itself contains DR when supplied; DA appears in the lead, not the metadata description. The same 92/108/12 split occurs in the normalized introductions. These are field-availability branches of one template. They do not describe publisher identity, editorial focus, content standards or a documented audience.

The rendered-main audit compares **22,366 page pairs** using set Jaccard overlap of consecutive five-word tokens. It excludes scripts, styles, the site header and footer, and retains main breadcrumbs, help text and related lists. Median lexical overlap is **26.49%**, the 90th percentile is **34.45%**, and the maximum is **69.55%**. This is an explicit text-repetition measure, not an SEO quality threshold, semantic similarity model or proof of a Google penalty.

| Repeated rendered heading | Pages |
|---|---:|
| Listing details | 212 |
| How does this price compare? | 212 |
| What to check before ordering | 212 |
| Similar publications (DR within 5 points) | 102 |

The disclosure, price-guide help and vetting-checklist paragraphs also repeat on all 212 pages. Shared disclosures and predictable headings can help readers. The larger issue is how little sourced publisher-specific information accompanies them. Cosmetic heading synonyms would not solve that gap.

## Factual and comparison issues

1. **Unsupported traffic period.** Metadata, introductory text, FAQs and fact labels describe the stored traffic value as monthly visits. The normalized model does not record its provider, channel or period. A listing update timestamp cannot supply these missing facts.
2. **Country presented as audience.** The FAQ asks about audience, then answers with category, country and language fields. Those fields do not verify audience location or demographics. Country should be labeled as the supplied listing country.
3. **Overstated supplier identity.** The lead says the publisher supplied metrics. The audit establishes catalogue/import supply, not that the publisher personally supplied or authenticated the figures.
4. **Unknown data disappears.** The `Fact` component omits missing metrics; repeated FAQ patterns remain even when relevant data is unavailable. A professional detail page should make decision-critical unknowns legible and condition optional questions on actual facts.
5. **Package label treated as confirmed scope.** “Links included” renders a legacy link-type label. It does not confirm writing inclusion, paid-link qualification, editorial acceptance, article type or a live link's attributes.
6. **Misleading traffic-price ratio.** Placement price divided by site-wide estimated traffic is not the cost of visits to the proposed article, a referral forecast or a return measure. The page's “per 100,000 estimated monthly visits” framing obscures that distinction.
7. **Unexplained comparison sampling.** `publicationInsights()` limits topic rows to the first 3,000 without a deterministic sort, then derives peer and median statistics. Turnaround parsing takes the first digits from arbitrary text. These results need clearer selection rules or replacement with appropriately scoped calculations.
8. **Observation-time wording.** Insight reads are cached for fifteen minutes and can serve older results on errors, while copy says comparisons reflect request time. Listing timestamps, observation times and metric measurement dates should remain separate.

Existing whole-topic `catalogueSummary()` price distributions can support a genuine price comparison. Such figures still describe the catalogue's supplied prices and dates, not a market valuation, a quality rating or guaranteed results.

## Current indexing and structured data

The existing owner-approved rule admits **569 metric/root-domain candidates** and leaves **55,436** other listings outside that gate. It requires a root URL, nonempty country/language, positive safe-integer price, a specific non-excluded category, traffic at least 500,000, DR at least 60, DA at least 50 and spam score at most 10. It does **not** require unique prose or editorial requirements. The Mongo filter and `hasPublicationProfile()` recheck feed sitemap selection; metadata also checks membership, failing closed on load errors. Duplicate canonical paths are deduplicated.

In the rendered sample, sixteen pages returned `index, follow` and 196 returned `noindex, follow`, matching the sample's metric candidates. Parameterized examples retained clean canonicals and `noindex, follow`. Unknown publication and guide slugs returned HTTP 404. The first local XML request failed; a later retry returned HTTP 200 for the index and all four XML files, with **569 publication URLs**, all 25 guide detail URLs, no duplicates and no sample eligibility/membership mismatches. This establishes the later response, not cold-cache reliability or deployed indexing.

All 212 publication pages emitted WebPage and FAQPage markup alongside shared organization/breadcrumb data; the parsed JSON-LD had no syntax errors. A repeated FAQ schema does not establish publisher-specific usefulness. Google's [May/June 2026 documentation updates](https://developers.google.com/search/updates#may-2026) state that FAQ rich results stopped appearing from May 7, 2026 and the FAQ feature documentation was removed in June. Do not sell repeated FAQ markup as a current Google rich-result or AEO benefit.

No content gate, bulk noindex change, canonical change or sitemap exclusion was implemented by this phase. If a later proposal requires genuinely reviewed publisher descriptions and requirements, quantify its effect first: the existing census has no normalized requirements or measurement dates even among the 569 candidates. That is a reason to plan enrichment, not sufficient evidence to automatically remove all candidates from indexing. Obtain real query/page/indexing evidence before making that decision.

## Which fields can support better publisher-specific content?

| Evidence available now | Safe use | Additional evidence required |
|---|---|---|
| Exact normalized URL and section identity | Name the host and exact placement section | Verified publisher/brand name before presenting an organization biography |
| Supplied topic, country and language | Clearly labeled catalogue facts and matching browse links | Recent editorial samples and sourced audience/location evidence |
| Placement price and existing writing options | Separate available charges and unknown inclusions | Confirmed current scope, exclusions, revisions and expiry of quote |
| DA, DR, traffic and spam score | Label as supplied estimates/scores, with unavailable states | Provider, channel, period, measurement date and scope for stronger interpretation |
| Link terms and turnaround | Quote as supplied terms/estimates | Confirmed package scope, paid-link attributes, approval and delivery conditions |
| Whole-topic price statistics | Dated catalogue comparison with transparent population | No unsupported “best value,” ROI or article-traffic claim |
| Legacy title/description/keywords | Private research leads for an admin | Identity match, accurate sources, reuse rights and editorial review before publication |
| Editorial requirements and audience details | No substantive normalized evidence currently available | Actual guidelines/source URLs, check dates and responsible reviewer |

Recommended next implementation order: close the mobile projection leak; correct unsupported labels and comparison claims; make unknowns visible; provide an editor for real sourced enrichment; then improve summaries, metadata and conditional answers using that evidence. Preserve URLs and existing index decisions while evaluating the later policy separately. Do not mass-generate biographies, histories, readership figures, ratings, acceptance claims or artificial review dates.

Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) supports original, accurate and useful information rather than a preferred word count. Its current [generative AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) emphasizes the same principles for SEO/AEO/GEO and does not require special AI markup. These sources support the editorial approach; they do not establish an internal numeric indexing threshold or guarantee visibility.

## Validation and reproduction

The [validation artifact](../reports/detail-content-audit-validation.json) reconciles the refreshed census, all 237 rendered detail pages, XML membership and API findings. TypeScript, focused ESLint, Python compilation and whitespace checks passed. Initial failures and the limits of the successful checks are recorded separately.

Run `node --import tsx scripts/seo/audit-publication-content.ts` with the existing private database environment for the read-only census. For HTML, run `python scripts/seo/audit-publication-html.py --phase before --base http://127.0.0.1:3253` against the existing local production build. Run `python scripts/seo/audit-detail-http.py --base http://127.0.0.1:3253` for API shapes, XML and query/404 controls. Python tools restrict access to loopback origins; the database script writes only local report artifacts.

Full-record download attempts stalled or timed out. The final script refreshed only the recorded 212 sample IDs and computed all population/source-column statistics on MongoDB; this run succeeded for all 56,005 listings. It preserves category/country coverage and limits every query. Source copy is summarized with counts and fingerprints. The sample seed is the existing report's original stratified selection, so retain that artifact when reproducing this comparative audit.

There is no Search Console/analytics dataset, external publisher verification, source-copy licensing review, field CWV measurement or deployed crawl in this phase. The pre-existing uncommitted profile-review model/API are unfinished work and are not certified by this audit. No deployment, push, merge or database mutation was performed.
