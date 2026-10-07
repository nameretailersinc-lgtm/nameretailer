# Keyword strategy

**Prepared:** 2026-10-05  
**Scope:** Phase 1 planning only; no redirects, pages, or production code are implemented.  
**Inputs:** the 2026-09-29 UTC / 2026-09-30 Asia/Karachi crawl, existing-page copy and taxonomy, owner-confirmed offers, a biased crawl sample of visible listing rows, and representative web search observations on 2026-10-05.

## Method and evidence rules

1. The marketplace, guest-post services, content services, and existing tool set supplied seed topics.
2. Existing URLs were grouped by intent. One keyword is assigned to exactly one canonical target in `keyword-map.csv`.
3. Representative searches were used to identify dominant result type and messaging—not positions, exhaustive competitors, demand, volume, or difficulty.
4. No GSC, GA4, Ahrefs, Semrush, or full listing export was supplied. Every `volume` and `difficulty` cell is blank and every row has `data_source=needs-data`.
5. The crawler’s 2,318 de-duplicated visible listing domains are a biased sample across first/visible segment results. They cannot establish full inventory size, market demand, country/niche shares, or valid pricing benchmarks. Pagination is not used to infer totals.
6. All keep/merge/drop choices are proposals pending owner approval and GSC/backlink review. The new DA hub must exist and be validated before any old DA URL redirects are enabled.

## Representative SERP observations

The search interface did not expose a reliable People Also Ask panel, featured-snippet label, AI Overview, or complete result count. Therefore **no PAA question is claimed as observed** and no SERP-feature absence is inferred. Questions later in this document are explicitly hypotheses.

| Query seed | Observation on 2026-10-05 | Dominant intent / result type | Examples observed |
|---|---|---|---|
| `guest post marketplace` | Mix of self-serve marketplace pages and explanatory/evaluation guides; filters, visible pricing, workflow, publisher quality, and reporting recur | Commercial investigation / marketplace | [GPosting buyers](https://gposting.com/buyers), [marketplace guide](https://statisticsfundamentals.com/blog/marketing/guest-posting-marketplace/), [GetGuestPosts guide](https://getguestposts.com/guest-post-marketplace/) |
| `buy guest posts` | Provider landing pages emphasize site selection, public metrics, per-placement scope, turnaround, and replacement policies | Transactional / service or marketplace | [Rhino Rank](https://www.rhinorank.io/guest-posts/), [GPosting](https://gposting.com/buyers) |
| `guest posting services` | Service landing pages compete with “best services” comparisons; agency execution and marketplace self-service are distinct models | Commercial investigation | [SitePoint comparison](https://www.sitepoint.com/best-guest-posting-services-for-seo-teams/), [Seahawk comparison](https://seahawkmedia.com/seo/best-guest-posting-services/) |
| `guest post sites` | Curated/list articles dominate, commonly organized by niche, acceptance status, and third-party metrics | Informational / list guide | [Gaurav Tiwari list](https://gauravtiwari.org/guest-posting-sites-list/), [WPVista list](https://wpvista.com/guest-posting-sites-list/) |
| `content writing services` | Specialist agency landing pages emphasize process, specialist writers, formats, and consultation | Transactional / agency | [SEO.co](https://seo.co/writing/), [ContentWriters](https://contentwriters.com/seo-content-writing-services) |
| `competitor backlink analyzer` | Dedicated tools and established SEO-index providers compete; freshness and index coverage are central to usefulness | Informational / interactive tool | [Ahrefs backlink checker](https://ahrefs.com/backlink-checker), [Competitor Backlinks](https://competitorbacklinks.com/free-backlink-checker) |
| `schema markup generator` | Dedicated browser tools support multiple types, validation, copy/download, and no-signup positioning | Informational / interactive tool | [Baseline Labs](https://www.markupschema.com/schema-generator), [SchemaMarkup.info](https://schemamarkup.info/) |
| `guest post sites UAE` | An informational regional list appeared, but this alone does not prove enough demand or inventory for a Name Retailer UAE landing page | Informational / list guide | [UAE Central](https://www.uaecentral.com/guest-posting-sites-in-uae/) |

These are observations from a representative search sample, not a claim about stable rankings. Current Name Retailer rankings were not measured.

## Search-policy boundary

The site must not frame paid links as “Google-safe,” “white hat,” “penalty-proof,” or guaranteed to improve rankings. Google defines links created primarily to manipulate rankings as link spam, including paid guest-post links that pass ranking credit. Paid placements should use `rel="sponsored"` or `nofollow`, and marketplace copy should emphasize audience relevance, editorial quality, disclosure, and legitimate advertising outcomes. Source: [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) and [qualifying outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).

## Topic clusters and canonical ownership

| Cluster | Pillar / commercial target | Supporting targets | Strategy |
|---|---|---|---|
| Marketplace | `/` | Price, DR, DA, Trust Flow, traffic and backlink hubs; curated niche/country/language pages only after validation | Homepage owns “buy guest posts” and “guest post marketplace”; merge `/guest-post-marketplace/` and `/products/` |
| Guest-post services | `/guests-blogging-services/` | Package-selection guide, buying guide, how-it-works | Keep managed service intent separate from self-serve marketplace intent |
| Guest-post education | `/what-is-guest-posting-and-why-it-still-matters-in-2025/` | Backlink guide, curated-sites guide, metric explainers | Rewrite the content evergreen even though the legacy slug contains a year; consolidate overlapping benefits/“still works” articles |
| Metrics and filters | `/guest-post-by-dr/`, new `/guest-post-sites-by-domain-authority/`, TF/traffic/backlink/price hubs | Definition guides for DA, DR and Trust Flow | Range URLs become filter states unless data proves distinct demand and unique value |
| Content services | `/content-writing-services/` | `/buy-blog-posts/`, SEO blog posts, content marketing, proofreading, plagiarism checking, social promotion | Consolidate thin writing satellites; differentiate deliverables and expertise |
| SEO tools | `/seo-tools/` | DR checker, backlink analyzer, keyword, schema, metadata and audit tools | Keep every tool per owner decision, but require real data provenance and useful guidance |
| Content/media tools | `/seo-tools/` | Image tools, word counter, case converter | Link naturally to content/image guidance and content services where relevant |
| Utility tools | `/seo-tools/` | Base64, reverse text, HEX/RGB, PX/REM, length, temperature, file size | Rebuild per owner decision; avoid forced commercial CTAs and index only when each page is genuinely useful |

### Conditional niche, country and language pages

The map proposes a small validation queue—business, technology, finance, health, USA, UK, India, and Spanish-language inventory. These are **not approved for publication based on the crawl sample**. Publish a page only when all are true:

- paid/GSC data shows distinct query demand;
- the full owner listing CSV shows a stable, useful inventory;
- the page adds curated buyer guidance and inventory-specific facts rather than swapping a place/niche name;
- it has a contextual path from the marketplace and relevant guide;
- filters and canonical behavior prevent near-duplicate combinations.

The English-only default remains. A page filtering Spanish-language publications is not automatically a Spanish translation and should not receive Spanish hreflang unless the page itself is localized.

## Proposed cannibalization fixes

| Intent | Proposed winner | Merge / retire candidates | Why |
|---|---|---|---|
| Buy guest posts / marketplace | `/` | `/guest-post-marketplace/`, `/products/` | One primary commercial page |
| Guest-posting definition and benefits | `/what-is-guest-posting-and-why-it-still-matters-in-2025/` | “still works” and “real benefits” articles | Same explanatory intent; make copy evergreen |
| Guest blogging service | `/guests-blogging-services/` | `/everything-you-need-to-know-about-guest-blogging-services/` | Commercial page should own service query |
| DR education | Non-`-2` DR article | `…link-building-2/` | Direct duplicate |
| DA filters | New `/guest-post-sites-by-domain-authority/` | Ten `/da…/` URLs | One substantial hub with filter states; launch target first |
| DR filters | `/guest-post-by-dr/` | Three DR bands | One hub; Ahrefs metric needs provenance |
| Trust Flow filters | `/guest-posts-by-majestic-tf-10-to-50/` | Seven overlapping/empty TF URLs | One hub; Majestic metric needs provenance |
| Traffic filters | `/guest-posts-by-traffic/` | Four overlapping bands | One hub with disclosed traffic source/date |
| Backlink filters | `/guest-posts-by-backlinks/` | Three thin/empty bands | Backlink count alone is not quality |
| Price filters | `/guest-posts-by-price/` and five price bands | Monthly duplicates | Keep one taxonomy; validate each band before indexing |
| Content writing | `/content-writing-services/` | `/exclusive-content/`, `/niche-blog-posts/` | Thin overlapping offers |
| Support | `/help-center/` | `/customer-support-2/` | Duplicate intent and description |

No proposed merge or removal should ship until GSC landing-page/query data and backlink exports are checked. Individual `/link-details/` routes may remain authenticated and noindexed if customers need them; owner rejection of indexable per-domain SEO pages does not by itself require a 410.

## Tool strategy

The owner explicitly chose to rebuild all current tools, so every tool is marked **improve**, not drop. “Improve” means functional accuracy, one H1, useful instructions, privacy/error states, and honest limitations. Pages that are not yet substantive should remain noindexed until ready.

| Tier | Tools | Decision and marketplace pathway |
|---|---|---|
| Core buyer tools | Bulk DR checker; competitor backlink analyzer; keyword suggestion; keyword density; image alt checker | Improve. DR, backlink and live keyword datasets require a named provider, timestamp, quota/error behavior and definitions. Keyword-density and image-alt analysis may compute from user-supplied text/HTML or a disclosed page fetch without an external dataset. Link results to the relevant guide, then to a pre-filtered marketplace view where appropriate |
| Structured-data/social tools | Schema generator; schema validator; AMP validator; Open Graph generator; Twitter/X card generator | Improve. Keep browser-first where possible; link to implementation guides and content services, not directly to unrelated listings |
| High-risk concept | High-authority backlink generator | Improve by reframing as an educational citation/profile-opportunity audit or transparent submission workflow. Never auto-create spam, call links “high authority” without a source, or promise ranking gains |
| Media tools | Compress, resize, crop, rotate, image-to-B&W, image-to-WebP, WebP-to-PNG, JPG-to-PNG, PNG-to-JPG | Improve. Explain local/server processing, quality, transparency, size limits, and deletion. Link to image SEO/alt guidance and optionally content services |
| Content utilities | Word counter; text case converter | Improve. Add character/reading-time outputs and accessible controls; link to writing guidance/services only when contextually useful |
| Peripheral utilities | Base64; reverse text; HEX-to-RGB; PX-to-REM; length, temperature and file-size converters | Improve because the owner requested all tools. Keep lightweight, accurate, and self-contained; no forced marketplace CTA |

“Domain Rating” is Ahrefs proprietary. Without Ahrefs API access, the DR tool may only show stored listing data or a differently named provider metric. Competitor backlinks and keyword suggestions likewise require a real provider adapter; empty or fabricated output is unacceptable.

## Prioritized content calendar

Priority combines business value × feasibility × observed competition qualitatively. “Hard” competition is not a numeric difficulty score.

| Priority / rationale | Target keyword and URL | Intent / format / proposed H1 | Answer-first question headings | Internal links to and from | Original evidence or expertise required |
|---|---|---|---|---|---|
| **P1 — very high value × medium feasibility × hard competition** | `buy guest posts` → `/` | Transactional landing; **Buy Guest Posts by Niche, Country, Language and Useful Metrics** | How does the marketplace work?; What can buyers filter?; How are listings checked?; How are paid links qualified?; What happens after checkout? | To price/metric hubs, how-it-works, policy-aware buying guide; from all filter hubs and core guides | Full listings DB aggregates, documented vetting process, real order steps, support/replacement terms; compute any inventory count |
| **P1 — high value × medium feasibility × unmeasured competition** | `guest post sites by domain authority` → `/guest-post-sites-by-domain-authority/` | Commercial landing; **Guest Post Sites by Domain Authority** | What does DA measure?; Which DA range fits a campaign?; Why is relevance more important than DA alone?; Where does DA data come from? | To DA definition, marketplace, price/traffic hubs; from all legacy DA routes and DA guide | Full inventory by DA band, metric provider/date, real filter results. Build and validate before redirects activate |
| **P1 — high value × high feasibility × hard competition** | `guest post sites by domain rating` → `/guest-post-by-dr/` | Commercial landing; **Guest Post Sites by Domain Rating** | What is DR?; How should buyers use DR?; What else should be checked?; How fresh is the data? | To DR guide and marketplace; from bulk DR tool and legacy DR bands | Ahrefs license/provider confirmation, refresh cadence, full inventory aggregation |
| **P1 — high value × high feasibility × competitive** | `guest posts by price` → `/guest-posts-by-price/` | Commercial landing; **Guest Post Sites by Price** | What is included in the price?; How do price filters work?; What affects placement cost?; Are cheaper placements lower quality? | To distinct price bands, package guide, homepage; from buying guide | Full listing CSV, currency rules, content inclusion, real fee/refund terms |
| **P1 — high value × high feasibility × competitive** | `guest post sites by traffic` → `/guest-posts-by-traffic/` | Commercial landing; **Guest Post Sites by Estimated Organic Traffic** | Where does traffic data come from?; How fresh is it?; Why can estimates differ?; How should traffic and relevance be combined? | To marketplace and metric/buying guides; from legacy traffic bands | Provider name, collection date, refresh cadence, full-inventory distribution |
| **P1 — high value × medium feasibility × hard competition** | `guest posting services` → `/guests-blogging-services/` | Service page; **Managed Guest Posting Services** | What is included?; Marketplace or managed service?; How are publishers selected?; How are paid links disclosed?; What is the review process? | To marketplace, packages, how-it-works, policy guide; from service comparisons/guides | Actual workflow, staff expertise, revision/approval policy, reporting sample, no invented clients/results |
| **P1 — high value × high feasibility × hard competition** | `content writing services` → `/content-writing-services/` | Service page; **SEO Content Writing Services for Useful, Publishable Content** | What content formats are offered?; Who writes and edits?; How is research sourced?; What does SEO optimization include?; What are revisions and rights? | To buy-blog-posts, SEO blog posts, proofreading; from word counter and writing guides | Named process, real editor expertise, sample policy, turnaround/revisions/ownership terms |
| **P1 — high value × high feasibility × competitive** | `how to buy guest posts` → `/how-to-buy-links/` | Buyer guide; **How to Buy Guest Posts: Quality, Disclosure and Risk Checklist** | What should be defined before choosing a site?; Which metrics are useful?; When must links be sponsored or nofollow?; What warning signs matter?; How should results be measured? | To marketplace, price/metric hubs, package guide; from homepage and service page | Owner’s real QA checklist, annotated listing examples, Google policy citations |
| **P1 — high value × medium feasibility × competitive** | `what is guest posting` → legacy URL | Evergreen guide; **What Is Guest Posting? Benefits, Risks and How It Works** | What is guest posting?; How is it different from sponsored content?; Does it still work?; What are legitimate goals?; What does Google say about paid links? | To service, marketplace, curated-sites and buying guides; from blog hub | Editorial examples, policy sources, audience/referral outcomes; merge overlapping articles |
| **P1 — medium/high value × medium feasibility × hard competition** | `best guest posting sites` → existing best-sites URL | Curated guide; **How to Evaluate Guest Posting Sites (With a Current Shortlist)** | What makes a site relevant?; How is editorial quality checked?; Which metrics can be misleading?; How often is the list reviewed? | To marketplace filters and buying guide; from blog and metric guides | Transparent scoring rubric, dated manual review, only real/verified examples; avoid unsupported “best” claims |
| **P1 — high value × low feasibility until API selected × hard competition** | `bulk domain rating checker` → `/bulk-domain-rating-checker-tool/` | Tool; **Bulk Domain Rating Checker** | Where does DR come from?; How fresh is it?; How many domains can be checked?; Why can DR differ from DA? | To DR guide and DR marketplace hub; from SEO tools hub | Ahrefs API or clearly limited own-inventory lookup, timestamps, rate/error states |
| **P1 — high value × low feasibility until provider selected × hard competition** | `competitor backlink analyzer` → `/competitor-backlink-analyzer/` | Tool; **Competitor Backlink Analyzer** | Which backlink index is used?; What is included in free results?; How are referring domains deduplicated?; How can users judge relevance? | To backlink guide, marketplace and tools hub; from related guides | Licensed backlink index, freshness/coverage disclosure, export limits, test domains |
| **P2 — medium value × high feasibility × hard competition** | `schema markup generator` → `/online-schema-generator/` | Tool; **Schema Markup Generator for Valid JSON-LD** | Which schema types are supported?; Which fields are required?; Does schema guarantee rich results?; How is output validated? | To schema validator and implementation guide; from tools hub/content services | Schema.org and Google documentation, supported-type test suite, sample outputs matching visible content |
| **P2 — medium value × high feasibility × competitive** | `image alt checker` → `/image-alt-checker/` | Tool; **Image Alt Text Checker for Accessibility and SEO** | What does the checker inspect?; What makes alt text useful?; When should alt be empty?; Can JavaScript-loaded images be checked? | To image tools and content service; from tools hub | Accessibility guidance, crawler limitations, test fixtures and result explanations |
| **P2 — high value × medium feasibility × unmeasured competition** | `business guest post sites` → `/business-guest-post-sites/` | Conditional marketplace landing; **Business Guest Post Sites** | What business subtopics are covered?; Which countries/languages are available?; How are sites reviewed?; Which filters matter? | To homepage, price/traffic hubs and business content guide; from marketplace filters | Full listing CSV and verified demand; publish only with stable inventory and distinct guidance |
| **P3 — low direct value × medium feasibility × risky concept** | `high authority backlink generator` → existing tool URL | Educational tool/workflow; **Backlink Opportunity and Citation Checker** | What can the tool legitimately find?; What does authority mean?; Which submissions are low value?; What practices violate spam policies? | To policy-aware buying guide and backlink analyzer; from tools hub | Honest provider/source list, no automated spam, no ranking claim, documented output review |

## Hypothesized questions (not observed PAA)

- How do guest post marketplaces work?
- Are paid guest posts safe?
- What should I check before buying a guest post?
- Is Domain Rating the same as Domain Authority?
- How often should marketplace traffic metrics be updated?
- When should a paid link use `rel="sponsored"`?
- How do I choose a guest-post site for my niche or country?
- Does schema markup guarantee a rich result?

Validate these in GSC query data and live SERP tools before presenting them as PAA-derived opportunities.

## Owner decisions needed

1. Approve, revise, or reject the proposed URL merges and 410s after reviewing GSC/backlink evidence.
2. Decide whether customer-facing `/link-details/` routes remain as authenticated/noindexed pages or are retired. Do not treat “not indexable” as automatically “410.”
3. Confirm the listing-vetting method, metric providers, refresh cadence, and whether paid placements require publishers to qualify links.
4. Select providers/API budgets for Ahrefs DR, backlinks, keyword suggestions, traffic, DA and Trust Flow—or accept explicitly limited own-inventory results.
5. Confirm which niche/country/language segment pages have enough inventory and commercial priority after the full CSV analysis.
6. Confirm legal entity name, named editors/authors, founding year, phone, social profiles, content-service process, and real policies/testimonials.
7. Confirm whether “monthly” and “permanent” describe placement duration, billing, or something else. Monthly-price URLs must not be merged until their service meaning and any distinct performance are reviewed.

## Data needed and what it changes

| Data | Requested scope | Decisions it can change |
|---|---|---|
| Google Search Console Performance | Queries and pages, last 16 months; include clicks, impressions, CTR, position, country and device where available | Preserve/merge/retire choices, keyword ownership, unexpected long-tail demand, country pages, seasonal loss/gain |
| GA4 | Organic landing pages, conversions/revenue, engagement and checkout assists | Business priority and pages that must not lose conversion value |
| Ahrefs or Semrush | Organic keywords/pages, competing domains, backlinks/referring domains, best-by-links pages | Difficulty/competition assessment, redirect risk, externally linked URLs, competitor gaps |
| Full listings CSV | Expected at `docs/data/listings.csv`, with stable IDs plus niche, country, language, price, availability and metric source/date | Real inventory count, which segment pages deserve indexing, unique first-party aggregates, removal of biased crawl-sample conclusions |
| WordPress/WooCommerce export | WXR plus users/orders/products as legally and operationally appropriate | Exact content migration, media/authorship, account/order history, hidden URLs and redirects |
| Provider/API documentation | Pricing, quotas, license/display rules, freshness and attribution | Whether data-driven tools can launch and which metric names may be used |
| Business evidence | Vetting SOP, editorial policy, service workflow, real examples/case studies, refund/replacement terms | Trust copy, E-E-A-T, answer-first content, claims that can be substantiated |

Until these arrive, the roadmap is intent-led and qualitative. It must not be represented as a forecast of traffic or rankings.

Validation on 2026-10-05: `python scripts/audit/validate_phase1.py` passed with 166 unique audit URLs, 81 unique keywords, 68 destinations, only retained or declared-new targets, and no populated volume/difficulty metrics.

