# Guide detail pages: Phase 1 content and data audit

October 19, 2026 (Asia/Karachi). This audit extends the publication-page brief to guide detail pages. It changes reports and audit tools only. Content, approval flags, routes, metadata policy, database records and sitemap rules are unchanged.

## Evidence and coverage

- [Guide source census](../reports/guide-content-audit.json): all **25** registered guides, comprising three domain guides, sixteen guest-posting expansion guides and six original buyer guides. There are fewer than 100 guide detail pages; the entire available corpus was inspected.
- [Rendered HTML audit](../reports/guide-html-before.json): all 25 requested from the existing October 18 local production build using a Googlebot user agent on a loopback server. All returned HTTP 200 with exactly one H1, matching source titles/descriptions and the expected self-canonical. All 25 returned `index, follow`; JSON-LD parsed without errors.
- [API and sitemap control checks](../reports/detail-sitemap-audit.json): query variants and missing pages; XML availability is reported separately from source eligibility.

The route is `app/guides/[slug]/page.tsx`. Data comes from `lib/site/buyer-guides.ts`, `lib/site/domain-guides.ts` and `lib/site/guest-posting-guides.ts`. These pages are code-managed records, not MongoDB CMS articles. Existing blog/CMS content is outside the guide corpus. The guide library and sitemap collector discover the same `buyerGuides` registry.

## Completeness

| Field or capability | Present | Missing / limitation |
|---|---:|---|
| Title and meta description | 25 / 25 | None empty; zero exact duplicates after case/whitespace normalization |
| Direct answer | 24 stored + 1 live | Cost guide deliberately uses live catalogue statistics; its empty stored answer is not an empty rendered page |
| Authored question sections | 25 / 25 | Three to eight sections per guide |
| Source links | 25 / 25 | Fifteen distinct URLs; presence does not prove every claim is supported |
| Explicit source-check date | 24 / 25 | `guest-post-vs-link-insertion` renders a hard-coded `2026-10-09` fallback |
| Content update date | 25 / 25 | Stored dates are not proof of independent review |
| Supplied author | 5 / 25 | Twenty lack an identity; do not invent one |
| Supplied original publication date | 5 / 25 | Twenty lack one; do not substitute update or source-check dates |
| Named reviewer | 0 / 25 | A missing reviewer alone is not a reason to noindex a page |
| Article schema eligibility | 5 / 25 | Current helper requires approval, a supplied author and a valid publication date |
| Topic-specific related links | 20 / 25 | Other navigation exists, but five lack this optional related-content field |

The five attributed guides are the cost, guest-post-versus-link-insertion, DA/DR/traffic, vetting and paid-link-policy guides. The existing supplied author is Zuhoor Uddin. `lib/site/authors.ts` has no supplied biography or job title for that author; the audit does not fill those gaps. No reviewer or personal expertise is inferred from a source link.

Authored content spans **247–628 words**, counting the stored answer, sections, steps, checklists, templates, FAQs and tables. Rendered main content spans **329–1,005 words** because it also includes navigation, sources, shared help and, for the cost guide, live tables. These are diagnostic counts, not minimum-quality thresholds. The shortest authored guide is `/guides/guest-post-vs-sponsored-post/`; inspect whether it resolves the intended decision rather than padding it to an arbitrary length.



## Similarity and repeated structure

There are **zero exact duplicate metadata titles, descriptions, nonempty direct answers or authored section bodies** across the 25 guides. This corpus has distinct descriptions and authored explanations. Shared topics and reusable components still deserve editorial review.

The source audit compares all **300 guide pairs** using sets of consecutive five-word tokens from authored text. The highest Jaccard overlap is **0.0045 (0.45%)**, between the cost and link-insertion comparison guides. The measure excludes chrome, citations, related links and template CTAs. It detects repeated wording; it does not detect all paraphrases, factual weakness or competing search intent.

The separate rendered-main comparison includes breadcrumbs and template material. Its median overlap is **0.0246 (2.46%)**, with a maximum of **0.0624 (6.24%)**. These numbers are not SEO scores and are not directly comparable to the source measure because the included text differs.

| Repeated rendered heading | Pages | Assessment |
|---|---:|---|
| Sources | 25 | Useful conventional navigation; keep unless a clearer label serves readers |
| Which publications should I compare next? | 25 | Generic shared commercial ending; off-topic on the three domain-planning guides |
| Continue with this decision | 20 | Topic-specific destinations, generic section label |
| Common questions | 16 | Inspect whether questions add distinct answers rather than repeating the lead |
| Put it into practice | 6 | Reusable structure; underlying steps differ |
| Decision checklist | 5 | Reusable structure; underlying checklists differ |

One paragraph is repeated on all 25 pages: the closing links to niche directories, placements up to $50 and the full catalogue. Domain guides already have relevant domain-hub/tool links, so the additional placement CTA weakens their task focus. Renaming every heading would add superficial variation; improving relevance and actual substance has greater practical value.

The paid-link qualification source appears on nineteen guides, and the spam-policy and helpful-content sources each appear on twelve. Repeated citations are appropriate where the same policy governs different tasks. A source list should not be treated as evidence that a hypothetical scenario is a real customer result.

## Metadata, discovery and rendering

`generateMetadata` selects each guide's title/description; `pageMetadata` limits these to 60/155 characters and sets Open Graph/Twitter fields. Clean detail URLs are indexable when `approved` is true. Parameterized examples returned `noindex, follow` with the clean canonical. Unknown slugs returned HTTP 404. The source sitemap collector includes approved guides and uses their content update dates.

All 25 records are currently approved in code. The expansion factory sets approval and dates centrally; this is the existing commissioning convention, not evidence that each page has a named reviewer. Twenty pages deliberately omit Article schema because supplied attribution/date prerequisites are missing. Visible FAQs on sixteen guides do not add FAQPage schema. No invented author, review, rating or availability is present in the inspected guide model.

All source metadata matched the existing build's returned metadata. The initial local XML fetch failed; a later retry returned HTTP 200 for the index and all four XML files. All 25 guide details were present, and no duplicate sitemap URLs were found. This verifies the later local response; it does not establish reliable cold-cache generation, deployed behavior or Google index coverage.

## Content that can support meaningful improvements

| Existing material | Supported next improvement | Evidence needed before stronger claims |
|---|---|---|
| Distinct direct answers and decision sections | Tighten answers around the reader's actual task; preserve topic-specific distinctions | Real reader questions or query data to prioritize revisions |
| Outreach templates | Explain when each template fits; retain editable examples and placeholders | Permission before publishing real outreach correspondence |
| Hypothetical budgets and ROI arithmetic | Make assumptions easy to inspect and reuse | Actual agreed costs/outcomes before presenting a case study |
| Live cost data and dated distributions | Explain placement versus writing and the dataset's limits | Current provider dates and scope before making market-wide claims |
| Traffic/metric definitions and checking workflow | Keep definitions separate from evidence-collection steps and cross-link them | Real query/page data before merging either guide |
| Domain rubric, registration and migration guidance | Give domain guides relevant next actions and tools | Observed user tests or authorized migration evidence for first-hand examples |
| Source links and recorded check dates | Associate important claims with their relevant citation; maintain real check records | A fresh claim-by-claim review before advancing a check date |

Potentially adjacent tasks are discovery versus vetting, traffic checking versus metric definitions, and strategy versus the publishing checklist. Their current wording and intended tasks differ. No Search Console query/page export, conversion evidence or readership study was supplied, so cannibalization, ranking losses and merge decisions remain unverified.

## Recommended order for a later implementation phase

1. Replace the unsupported fallback source-check date with an explicit missing state until a real check is recorded; add real attribution when supplied.
2. Make closing actions match the guide's task, starting with domain guides. Retain useful shared headings rather than generating cosmetic synonyms.
3. Deepen guides with permissioned examples, useful recording sheets or observed workflows where available. Keep hypothetical inputs explicitly labeled. Review the sponsored-post comparison for unresolved questions.
4. Review material claims against primary sources and put citations near those claims. Repeated policy citations are acceptable; source presence alone is insufficient.
5. Use actual query/page and conversion evidence to evaluate adjacent guides before changing URLs, canonicals or approval flags. Investigate the initial XML failure before claiming reliable cold-cache release checks.

For SEO, AEO and GEO, Google's current [generative AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) emphasizes useful original information, readable structure and technical discovery. It says no special AI markup, fixed content length or AI-specific rewrite is required. The [Article documentation](https://developers.google.com/search/docs/appearance/structured-data/article) informs accurate structured data; missing personal details must not be fabricated to satisfy markup. These sources inform recommendations, not a promise of rankings or AI citations.

## Reproduction and limits

Run `node --import tsx scripts/seo/audit-guide-content.ts`, then run `python scripts/seo/audit-publication-html.py --kind guide --phase before --base http://127.0.0.1:3253` against the existing local production build. The HTTP audit accepts loopback origins only. Raw publication source values and credentials are not persisted by the API-shape audit.

The [combined validation artifact](../reports/detail-content-audit-validation.json) reconciles all 237 publication/guide detail responses with their current manifests and sitemap eligibility. TypeScript, focused ESLint, Python compilation and whitespace checks passed for the audit tools. No application change requires a production rebuild in this phase. HTML parsing is not browser accessibility, visual layout, field performance, external Rich Results validation or a deployment check. Linked sources were inventoried; this is not a claim-by-claim factual review of all 25 guides. See the companion [publication audit](publication-content-audit-2026.md) for the materially different catalogue data problem.
