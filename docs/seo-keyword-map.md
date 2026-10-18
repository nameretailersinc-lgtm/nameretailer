# NameRetailer keyword-to-URL map — October 18, 2026

The later [30-topic content expansion](guest-posting-content-expansion-2026.md) records sixteen new guides, improvements to existing pages and the current UK-directory status. Use that topic map alongside this earlier sprint snapshot; the production CSV is unchanged.

This map preserves existing URLs and gives each canonical one primary intent. The accompanying [per-URL CSV](seo-keyword-inventory-2026.csv) inventories every current sitemap URL and four gated proposals, including title, description, H1, observed H2/H3 structure, relevant sampled internal links, conversion goal, index verification and priority. It is generated reproducibly by `python scripts/seo/build-keyword-map.py` from the read-only production report. Observed headings include navigation/footer text; unassigned specialist pages explicitly require editorial review. Provisional keyword assignments are not search-volume or ranking observations.

Sprint 2 implements the existing homepage, pricing report, selection workflow and three buyer-guide improvements locally. The CSV remains the Sprint 1 production snapshot; do not replace it with local content and call it deployed. See [Sprint 2 changes and verification](seo-sprint2-2026.md) and its local page inventory for the updated title, description, headings and links.

The supplied brief identifies Keyword Planner topics from October 2025–September 2026 but supplies no numeric per-keyword estimates. The two IDE-listed Downloads files were not found at those paths. **All monthly volumes remain “Not supplied”.** Google Ads competition must never be interpreted as organic SEO difficulty. The existing `docs/keyword-map.csv` is historical planning, not proof that its proposed merges were implemented; this map preserves the currently active marketplace hub and its navigation purpose.

| Canonical path | Primary intent/keyword | Supporting long-tail phrases | Action |
|---|---|---|---|
| `/` | guest post marketplace for SEO agencies | buy guest posts from relevant websites; guest posting marketplace for small businesses; guest post marketplace with niche filters | Implemented locally in Sprint 2: agency/small-business copy, niche/price research and planning links; no buy-now claim |
| `/guest-posting-sites/` | guest posting sites | guest posting opportunities by industry; guest posting sites with organic traffic; English-language guest posting websites | P1: preserve directory-navigation intent and crawlable curated links |
| `/guest-post-marketplace/` | compare guest post marketplace filters | compare guest posting sites by DA, DR, traffic and price | P2: retain as product/navigation explanation; do not target the homepage's buying intent again |
| `/guest-post-by-dr/` | guest post sites by Domain Rating | compare publishers by supplied DR and price | P1 technical repair; P2 editorial |
| `/guest-post-prices/` | guest post pricing by niche | compare guest post placement prices; guest posting sites with prices | Implemented locally in Sprint 2: price interpretation, scope exclusions, budget links and accessible tables; actual inventory source retained |
| `/guides/guest-post-cost/` | how much does a guest post cost | guest post cost; factors affecting guest post pricing; how to compare guest post prices | Implemented locally in Sprint 2: dated data, clearly hypothetical worked budget, scope comparison and existing worksheet links |
| `/guest-posting-sites-under-50/` | guest posting sites under 50 dollars | affordable guest posting websites; guest posting websites under $50; affordable guest posting sites for small businesses | P1: actual inventory and separately stated writing costs |
| `/technology-guest-posting-sites/` | technology guest posting sites | technology blogs accepting guest posts; technology guest posting websites with prices | P1: preserve existing directory |
| `/business-guest-posting-sites/` | business guest posting sites | business blogs that accept guest posts; business guest posting websites with prices | P1: preserve existing directory |
| `/health-guest-posting-sites/` | health guest posting sites | evaluate health guest post publishers and editorial standards | P2: deepen real editorial criteria, no health claims |
| `/travel-lifestyle-guest-posting-sites/` | travel guest posting sites | travel blogs accepting guest posts; lifestyle guest posting sites | P2: existing combined directory owns this intent; no synonym route |
| `/saas-guest-posting-sites/` | guest posting websites for SaaS companies | software/startup guest posting opportunities | P1: audience and technical-depth guidance |
| `/marketing-guest-posting-sites/` | guest posting sites for digital marketing | digital marketing blogs accepting guest posts with prices | P2: preserve existing directory |
| `/guest-posting-sites-usa/` | guest posting sites in USA | guest posting websites in the United States; USA guest post marketplace | P1: supplied country is not proof of independently verified audience geography |
| `/how-to-buy-links/` | how to choose guest posting websites | how to find guest posting opportunities; choose relevant publishers before planning a placement | Implemented locally in Sprint 2: discovery-to-shortlist workflow; separate links to detailed evaluation and pricing |
| `/guides/vet-a-guest-post-site/` | how to evaluate guest post publishers | how to identify low-quality publishers; evaluate backlink quality and topical relevance | Implemented locally in Sprint 2: relevance checks, evidence record and reject/pause decisions |
| `/guides/da-vs-dr-and-traffic/` | Domain Authority vs Domain Rating | how to evaluate publisher traffic; compare supplied DA DR and traffic estimates | Implemented locally in Sprint 2: organic/total traffic distinctions, provider/date evidence and hypothetical relevance example |
| `/guides/paid-guest-posts-google-link-policies/` | paid guest posts and Google link policies | dofollow vs nofollow vs sponsored links; qualify paid links with rel sponsored | P1: appropriate disclosure and qualification, no ranking promises |
| `/guides/guest-post-vs-link-insertion/` | guest posting vs niche edits | guest post cost vs niche edit cost; link insertion services explained | P2: educational comparison, not an unsupported service offer |
| `/blog/a-practical-guest-post-budget-worksheet/` | how to plan a guest posting budget | budget placement prices and separate article writing costs | P1: expand this existing worksheet before a competing budgeting article |
| `/domain-length-checker/` | domain length checker | check ASCII domain length and DNS label limits | P2: existing functioning tool; no registration/availability claim |
| `/bulk-domain-rating-checker/` | catalogue Domain Rating lookup | look up owner-supplied DR for catalogue publishers | P2: preserve URL and clear catalogue scope; no promised live Ahrefs score |
| `/publication/{slug}/` | `{publisher} guest post placement` | publisher price, supplied metrics and editorial requirements | Existing profile intent; per-URL CSV records actual canonical/title; ordinary listings stay noindex |
| `/page/{n}/`, range `?page=N` | continuation of the catalogue/range intent | publication results on page N | Index only valid nonempty clean pagination; no separate keyword campaign per page |

All paths above resolve against `https://nameretailer.com`. Titles/descriptions/H1s in the CSV remain observed production values. Sprint 2 content changes are local and have not been deployed by this task.

## Metadata and heading direction

Homepage: implemented local title “Guest Post Marketplace for SEO Agencies | Name Retailer”, with the corresponding marketplace H1 and content for agency and small-business shortlists. The existing catalogue, metric definitions, scope explanation and related guides remain. The description mentions actual filters and planning actions; there is no buy-now or fully vetted claim.

Pricing report: retain distinct “Guest post pricing by niche” intent, dated actual distribution, price bands, writing inclusions/exclusions, methodology and budget guide. Cost guide: direct cost answer, factors, placement versus writing table, realistic worksheet inputs, disclosure and report links. Do not make both pages target the same generic cost phrase as primary.

Existing niche/country directories: one H1 naming the audience, original introduction, actual relevant listings with prices, niche/country selection guidance, metric caveats, supported marketplace filter links, a small number of useful visible FAQs and related guides. Inventory eligibility controls indexability. Avoid rewriting dates without real content updates.

Guide structure: answer the principal question first, show a practical example, explain evaluation steps and caveats, cite actual primary sources, link to relevant inventory and show real publication/update attribution. Do not add FAQ schema merely to repeat keywords or promise AEO/GEO placement.

## Gated proposals and prioritized backlog

| Priority | Proposed canonical | Keyword/intent | Required before implementation/indexing |
|---|---|---|---|
| Implemented locally | `/guest-posting-sites-uk/` | guest posting sites in UK; UK guest posting websites with prices | 3,203 actual UK-field listings; unique audience-evidence guidance, live prices and filter links; inventory-gated indexing |
| Implemented locally | `/finance-guest-posting-sites/` | finance guest posting sites; finance websites accepting guest posts | 691 Finance-category listings; focused subset of the broad Business directory with evidence and editorial-review guidance |
| Implemented locally | `/real-estate-guest-posting-sites/` | real estate guest posting sites; real estate blogs accepting guest posts | 143 Real Estate-category listings; distinct property-reader/local-market guidance and live prices |
| P2 | `/guest-post-budget-calculator/` | guest posting budget calculator | Working tested arithmetic for placement/writing inputs, limitations, accessible inputs and visible methodology |

The three directories are now implemented and verified in a local production build; their XML entries remain conditional on actual inventory. See [directory evidence and verification](seo-specialist-directories-2026.md). The budget calculator remains unimplemented. The historical production CSV still records all four as proposals; it is not a current local inventory or deployment record. The UK directory does not target a managed-service offering. No search volumes or verified audience claims are inferred from these counts.

“Link building services”, “SEO link building services”, “white label link building”, “guest post outreach”, “backlink outreach”, “SaaS link building”, “local SEO link building”, “link building packages/prices/cost” and “link insertion services” do not justify commercial pages without real offered capabilities. Mention only in useful educational comparisons where the existing guide actually addresses them. No managed-service keyword pages are scheduled.

Sprint 2 improved the existing selection, pricing, evaluation and traffic-evidence content. The later [30-topic expansion](guest-posting-content-expansion-2026.md) adds sixteen guides, paid-link comparisons and the existing budget worksheet supplement. Next priorities: inspect GSC overlap among guides and the journal before merging or redirecting; validate reader outcomes and remaining content gaps before further expansion. The downloadable budget record is a blank CSV; an interactive calculator remains unimplemented.

Use the [audit's release and Search Console checklist](seo-audit-2026.md) to verify indexing. A self canonical and successful HTTP response establish technical eligibility only; they do not establish Google indexing, organic difficulty, search demand or improved rankings.
