# Existing site audit: Phase 1 review

Prepared 2026-10-05. Full crawl: 2026-09-29 21:31–21:38 UTC (2026-09-30 in Asia/Karachi). The homepage was spot-checked on 2026-10-05; this report does not represent a fresh crawl of every URL on that date.

## Executive summary

Name Retailer is a guest-post marketplace with content services and free tools. Its current URL inventory is accessible, but its content architecture needs consolidation and stronger evidence. The crawl recorded **166 unique URLs**, of which **139 were directly fetched live HTML pages** and **133 appeared in the XML sitemaps**. The crawler had a 300-URL cap; 300 is not the number audited. It made 182 requests, including probes and discovery requests.

All 133 sitemap URLs were recorded without a non-200, noindex or conflicting canonical problem in the snapshot. That is a crawl observation, not proof that Google has indexed them. No Search Console, analytics or backlink export was provided, so the report cannot identify actual top-traffic pages, quantify keyword demand, diagnose ranking changes or guarantee that a merge will preserve traffic.

The recommended priorities are to preserve useful existing slugs and trailing slashes, consolidate overlapping metric pages, rewrite thin hubs before activating redirects, remove test content after checking its history, rebuild the owner-requested tools, and replace unsupported marketing claims with evidence. Every recommendation in [the URL inventory](existing-site-audit.csv) is a **proposal for owner review**; no live URL, redirect or content was changed.

The snapshot contains 23 pages with no observed inbound internal link, 29 pages reached only through navigation, 37 live pages with multiple H1s, and one live page with no H1. Several marketplace pages display identical first-page domain sets or empty results. The site's sitemap health alone therefore does not resolve its content and internal-linking problems.

## Evidence and method

- Raw evidence: [crawl.json](data/crawl.json), including robots rules, sitemaps, URLs, skips, HTTP results, content and link zones.
- Machine-readable inventory: [existing-site-audit.csv](existing-site-audit.csv), one row per recorded URL, with titles, descriptions, H1/H2s, word counts, internal links, images, schema types, recommendations and reasons.
- Derived comparisons: [audit-derived.json](data/audit-derived.json).
- Listing sample: [inventory-summary.json](data/inventory-summary.json). Its 2,318 distinct sampled domains are drawn from visible rows across segment pages. This is a biased sample, not the complete listing database or verified search-demand data.
- Reproducible scripts: `scripts/audit/crawl.py`, `analyze.py`, `decisions.py` and `inventory.py`. The reviewed decisions are stored separately so rerunning analysis preserves them.

The crawler used a descriptive owner-commissioned User-Agent, a one-second delay and a 300-URL cap. It read robots.txt and sitemap discovery, followed public internal links, and excluded login/account transaction endpoints, cart/checkout and add-to-cart actions. It did not log in, submit forms or test transactions. Listing pagination and thousands of per-domain detail links were not exhaustively crawled; five public detail URL probes appear in the inventory. The crawl therefore inventories sitemap content and bounded link discovery, not every possible application URL or query state.

Word counts distinguish main content from editorial content and interactive widgets. Headers, navigation, footers and detected repeated boilerplate were excluded. Counts remain parser estimates: widget text can inflate a page's apparent depth, and a short word count does not by itself establish low quality. Near-duplicate comparisons and claim-pattern matches are review leads, not proof of a ranking penalty. Empty image alt text can be appropriate for decorative images.

The [live homepage](https://nameretailer.com/) spot-check on October 5 still showed the guest-post offer, listing filters, long repeated navigation and a duplicated Bulk DR Checker menu item. Attempts to read robots.txt and sitemap_index.xml through the browsing tool on that date returned tool errors; the full sitemap conclusions above use the September snapshot.

## Inventory by page type

Counts below cover the 139 directly fetched live HTML pages. Redirect/host/detail probes account for the other 27 recorded URLs and are not added to these totals.

| Page type | Live pages | In sitemaps | Treatment |
|---|---:|---:|---|
| Home | 1 | 1 | Primary marketplace and brand destination |
| Marketplace segment | 45 | 45 | Consolidate overlapping metric variants; strengthen retained pages |
| Tool, including the tools hub | 30 | 30 | Rebuild all per the owner's decision; 29 individual tools plus hub |
| Blog post | 18 | 18 | Rewrite distinct intents, merge overlaps, review test content for removal |
| Blog index/archive | 7 | 2 | Keep `/blog/`; consolidate placeholder/date archives where appropriate |
| Service | 11 | 11 | Retain differentiated offers; merge indistinct variations |
| Support | 7 | 7 | Keep necessary buyer help and remove duplicate support intent |
| Legal | 6 | 6 | Retain slugs; owner must confirm real operating terms |
| Community | 5 | 5 | Confirm product relevance; proposals do not establish that a community exists |
| Account/commerce | 1 | 0 | Public login page only; authenticated flows excluded |
| Other | 8 | 8 | Review guide/category content against distinct intent |
| **Total** | **139** | **133** | |

The original context's approximate tool count is superseded by this snapshot's 29 individual tool pages plus `/seo-tools/`. No exact duplicate live titles were detected. One exact duplicate description group was detected: `/customer-support-2/` and `/help-center/`. Template similarity remains a concern even when exact titles differ.

## Issues ranked by expected SEO and business impact

Priority reflects qualitative judgement about the business and content, not measured search volume or lost revenue.

| Priority | Finding and evidence | Recommended change |
|---|---|---|
| P0 | Existing traffic, backlinks, customers and order history are unknown; no exports are present. | Obtain Search Console and WordPress/WooCommerce data before irreversible cutover decisions. Preserve source data and validate account/order migration separately. |
| P1 | Overlapping segment intent and repeated listing sets: `/`, `/backlinks-0-to-100k/` and `/trust-flow-0-to-10/` share the same sampled domain set; monthly/price pairs also repeat. | Choose one strong destination per intent; retain useful filter capabilities as non-indexable states. Carry the old range selection into the destination where feasible. |
| P1 | Thin or empty hubs: `/guest-post-by-dr/`, `/guest-posts-by-traffic/`, `/guest-posts-by-price/` and `/guest-posts-by-backlinks/` each have about four editorial words; several TF/backlink bands show zero listing rows. | Write useful selection guidance and validate inventory before sending redirects to these hubs. Empty results in a snapshot do not establish that inventory will always be empty. |
| P1 | 23 pages have no observed inbound internal links, including the intended metric hubs and relevant articles. | Add contextual links from the marketplace, hub, buyer guides and related articles; verify all retained indexable pages can be reached. |
| P1 | Unsupported promises appear in claim matches, including verification, guarantees, ranking-speed claims and inventory-size assertions. Examples: `/da50toda60-sites/`, `/dr-50-above/`, `/price-0-to-50/`, `/how-to-buy-links/`. | Review each passage manually, remove unsupported claims, and explain sponsored placements, metric provenance and limitations. Do not publish invented evidence or outcomes. |
| P1 | Test/placeholder content is public: `/hello-world/`, `/test-blog-post/`; `/how-to-buy-links/` contains placeholder text and only nine editorial words. | Check traffic/backlinks before removal; propose 410 for test posts, and completely rewrite the buyer guide. |
| P2 | 37 live pages have multiple H1s, including most individual tools; `/blog/` has none. | Use one page H1 and a coherent H2/H3 hierarchy in the rebuild. |
| P2 | `Article` schema is emitted on 99 home/segment/tool/service/support/legal/community pages flagged by the analysis. | Match schema to actual visible content. `Article` is not appropriate merely because a page exists; validate entity identity, authorship and any offer/review claims. |
| P2 | Six live pages have no description: four date archives, `/author/admin_123/`, `/category/uncategorized/`. | Consolidate weak archives as proposed and provide descriptive metadata for retained routes. Meta length counters should guide editing, not imply fixed Google limits. |
| P2 | Most simple tools have only a few dozen editorial words; tools include data-dependent claims that cannot be validated from HTML. | Preserve the functional utility, add concise original instructions and examples, and implement genuine data adapters for remote metrics. Do not add repetitive filler to meet a word-count target. |
| P2 | Generic author/taxonomy signals and 29 nav-only pages weaken useful contextual discovery. | Use confirmed author identities, meaningful article categories and relevant contextual links. Legal pages can remain primarily in the footer. |
| P3 | No missing-alt attributes were detected in live pages; two pages contain empty alt text. | Review decorative versus informative images visually and enforce meaningful alt text where appropriate in the new media workflow. |

No broken internal target was confirmed among targets actually fetched in the bounded snapshot. This does not certify every skipped URL, external destination, tool interaction or checkout flow. Performance, accessibility, mobile layout and rich-result eligibility were not measured in Phase 1; those belong to implementation QA.

### Paid-placement accuracy

Google identifies buying or selling links for ranking manipulation as link spam and permits advertising/sponsorship links when appropriately qualified. Rebuilt marketplace copy should accurately describe the service and link attributes; it must not promise guaranteed ranking gains or portray paid followed links as automatically compliant. See [Google's link-spam policy](https://developers.google.com/search/docs/essentials/spam-policies#link-spam). The crawl's keyword matches need editorial review; a match for “guarantee” might concern a legitimate service term rather than a ranking promise.

## Proposed cannibalization and consolidation decisions

The preferred URL preserves an existing slug wherever a suitable one exists. The CSV holds the complete per-URL decisions. These groups are intent hypotheses from content/site structure, not proof of query cannibalization in Search Console.

| Competing group | Preferred destination | Reason and launch condition |
|---|---|---|
| `/` and `/guest-post-marketplace/` | `/` | One primary commercial marketplace; retain distinct explanatory sections on the homepage. |
| Ten DA band pages, `/da1toda10/` through `/da90toda100/` | **New** `/guest-post-sites-by-domain-authority/` | One useful DA guide/marketplace hub with range filters. Build the destination and transfer relevant guidance before redirects. |
| `/dr-0-to-20/`, `/dr-20-to-50/`, `/dr-50-above/` | `/guest-post-by-dr/` | One DR selection destination; rewrite the current near-empty hub first. |
| Seven TF variants, including `/trust-flow-above-50/` and `/trust-flow-50-and-above/` | `/guest-posts-by-majestic-tf-10-to-50/` | Preserve a current slug while broadening its page to the TF selection intent; make the original and selected ranges clear despite the narrow legacy URL. |
| Three backlink-count bands | `/guest-posts-by-backlinks/` | Consolidate sparse count pages; provide filter state and explain backlink-count limitations. |
| `/zero-to-50k-traffic/`, `/50k-to-500k/`, `/100k-to-500k/`, `/above-500k/` | `/guest-posts-by-traffic/` | Overlapping range taxonomy; retain the traffic selection capability and cite its source/date. |
| Five `/monthly-*` price bands | Corresponding `/price-*` pages | Sampled content/listings overlap. Confirm whether monthly pricing represents a genuinely different contract before merging. |
| `/monthly/` and price hub | `/guest-posts-by-price/` | Proposed consolidation, subject to owner confirmation of subscription terms. |
| DR article and its `-2` duplicate | `/guest-post-sites-by-domain-rating-why-dr-matters-link-building/` | Keep the original useful guide; move any unique material. |
| Overlapping guest-posting benefits/2025 explanations | `/what-is-guest-posting-and-why-it-still-matters-in-2025/` | Update content to evergreen guidance while preserving the legacy slug; date in slug is not a reason to lose an established URL. |
| `/everything-you-need-to-know-about-guest-blogging-services/` and guest-blogging service | `/guests-blogging-services/` | Commercial-intent consolidation; confirm the article does not serve a distinct informational query before implementation. |
| `/exclusive-content/`, `/niche-blog-posts/` and writing service | `/content-writing-services/` | Combine indistinct offers, preserving useful deliverables and examples. |
| `/request-a-custom-blog-post/` and `/buy-blog-posts/` | `/buy-blog-posts/` | One purchase intent unless the owner confirms a distinct commissioning service. |
| `/customer-support-2/` and `/help-center/` | `/help-center/` | Shared description and support intent; preserve actual support information. |
| `/2824-2/` and ranking guide | `/google-ranking-strategies/` | Retain any useful on-page SEO material under a readable established destination. |

Price bands are proposed for retention because the snapshot shows more differentiated buyer guidance than the collapsed metric bands. This is a provisional architecture choice: revise it if Search Console shows demand or if the full listing database cannot support useful distinct pages. `/permanent/` also requires confirmation of real service terms before publishing permanence claims.

## Junk, thin and peripheral-page review

| URL/group | Proposed treatment | Evidence and condition |
|---|---|---|
| `/hello-world/`, `/test-blog-post/` | 410 if no useful replacement or history | Test content; check Search Console/backlinks before launch. |
| `/community-guidelines/`, `/user-reviews/` | Proposed 410 | No confirmed community product or genuine review corpus is available. Confirm with the owner; do not discard real reviews or invent replacements. |
| `/networking-opportunities/`, `/writers-community/`, `/top-blogging-forums-to-join-and-grow-your-blogging-journey/` | Proposed consolidation into `/blog/` | Peripheral to the confirmed product. Move useful relevant content first; if no meaningful replacement exists, a 404/410 can be more appropriate than an unrelated redirect. |
| Date archives, `/author/admin_123/`, `/category/uncategorized/` | Proposed consolidation into `/blog/` | Placeholder/duplicate archive structure; verify article discovery and do not erase a genuine author's identity. |
| `/products/` | Proposed redirect to `/` | Almost empty generic archive; marketplace is the relevant replacement. |
| `/how-to-buy-links/` | Keep slug and rewrite | Nine editorial words and placeholder text; buyer intent remains relevant. |
| Metric hubs, `/monthly/`, `/permanent/` | Improve or consolidate per CSV | One to eight editorial words on several pages; actual commercial meaning needs confirmation. |
| Individual converters/simple tools | Keep and improve | Owner explicitly requires all tools. A useful functioning tool need not be a long article. |
| `/link-details/*` probes | Proposed retirement of public indexable detail URLs | Owner requires no indexable per-domain pages. A 410 is one option if retired; a private detail view or public `noindex` utility view can still serve buyers. Confirm application requirements before implementing the CSV proposal. |

The CSV records 82 “improve”, 44 “merge”, nine “drop-301”, and four “drop-410” decisions among the **139 live pages**. Across all 166 rows there are nine drop-410 proposals because the five detail probes are also included; do not confuse those totals. Host/protocol/slash variants account for additional normalization redirects.

## Internal-linking gaps and repair plan

The orphan count means no inbound link was found in the bounded crawl, not that no link exists anywhere on the internet. The earlier quick summary that reported zero orphans used an incomplete label match; the derived audit correctly records **23**.

Examples include `/guest-post-by-dr/`, `/guest-posts-by-traffic/`, `/guest-posts-by-price/`, `/guest-posts-by-backlinks/`, `/permanent/`, `/how-to-buy-links/` and the explanatory guest-posting guide. Another 29 pages have navigation links but no observed contextual inbound link, including `/about/`, `/contact-us/`, several services, support and legal pages.

Build a small primary navigation around Marketplace, Services, Tools, Guides and About/Help. Link each retained metric hub from the marketplace and suitable buyer guides. Link every guide to its pillar, relevant sibling guides and an appropriate marketplace or service action. Put support pages in purchase/account journeys and link author/editorial evidence from articles. Put legal links in the footer and applicable consent/checkout flows. Related-content components must use editorial relevance rather than showing the same generic list everywhere.

At launch, test the complete indexable graph rather than only the navigation menu. Every retained indexable page should have a relevant inbound link; update references to merged URLs so visitors and crawlers do not repeatedly traverse redirects. Listing domain links and widgets should remain distinct from the editorial topic graph.

## Pages with inferred business value

These are candidates for review, **not the top five pages by traffic**:

1. `/`: the primary offer and transaction starting point; highest observed contextual inbound count in the snapshot (19 source pages).
2. `/price-0-to-50/` and other price-band pages: existing inventory views with substantial buyer copy and a plausible budget-selection task.
3. `/how-to-choose-right-guest-post-package-budget-seo-goals/`: a purchase-planning guide with observed contextual links; suitable for linking to the pricing marketplace.
4. `/content-writing-services/` and `/guests-blogging-services/`: confirmed service topics close to commercial conversion.
5. `/seo-tools/` and relevant SEO/content utilities: potential discovery routes into guides and the marketplace, subject to actual performance and functional verification.

The full listing CSV may support original aggregate research after validation and permission. The visible “56,000+” inventory claim and individual DA/DR/traffic values remain site claims. Do not publish them as independently verified facts, infer regional demand from sample counts, or use sampled medians as full-inventory pricing statistics.

## Phase 1 checkpoint and handoff

Review this report together with [keyword-strategy.md](keyword-strategy.md) and [keyword-map.csv](keyword-map.csv). URL recommendations and keyword ownership must agree before Agent 2 turns them into a complete redirect plan. Phase 1b will cover URL architecture, redirect semantics and the SEO data model; design/UX review follows before scaffolding.

Artifact verification: `python scripts/audit/validate_phase1.py` passes for 166 unique audit URLs and 81 unique keywords assigned to 68 destinations. It verifies required CSV columns, lowercase trailing-slash targets, empty unsupported volume/difficulty, reviewed decision reasons, merge-source consistency, and destinations retained in the audit or declared new in the map. The changed analysis, decisions, inventory and validation scripts also pass Python syntax compilation. These checks validate planning artifacts; they do not measure live rankings or test a future application.

Before cutover, supply or explicitly resolve:

- Search Console query/page performance, ideally 16 months, plus indexing/manual-action reports; GA4 landing pages/conversions if available. These determine real page value and query overlap.
- WordPress content/media exports and WooCommerce customer/order exports or access; confirm whether accounts and historical orders must migrate. Public scraping cannot recover these records.
- The full listings CSV with metric sources, timestamps, pricing units and accurate link attributes. Clarify monthly versus permanent placement terms.
- Any Ahrefs/Semrush/backlink exports, confirmed authors, real reviews, brand/entity details and a documented inventory-verification process. Paid tools are optional for planning; their metrics must not be fabricated.

No removal or consolidation should activate until its replacement is useful, ownership is approved and available performance/backlink evidence has been checked. All surviving redirects must land directly on a working final destination with no loops or chains.
