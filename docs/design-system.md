# Name Retailer design system and review direction

Current implementation update, 2026-10-06: the owner supplied newer raster landing, marketplace and article references in `design-preview/evidence/`. Their visual adaptation, branding/claim constraints and historical screenshot caveats are tracked in [marketplace-design-refresh.md](marketplace-design-refresh.md). The original proposal and prototype evidence below describe Phase 2, not an automated verification of those new images.

Prepared 2026-10-05. Phase 2 proposal, before the production scaffold. Read alongside [UX plan](ux-review.md), [project context](01-project-context.md), [audit](existing-site-audit.md) and the SEO planning documents. Tokens and components below are implementation instructions; the standalone previews illustrate a subset. No public Next.js routes, production commerce or providers are implemented here.

## Recommended direction: the publication desk

Warm paper, dark ink, restrained forest-green actions and generous serif headlines give Name Retailer the character of an editorial business. Ruled tables, compact metric labels and plain-language placement details make the marketplace practical for repeated buying decisions. The homepage leads with the task and a small comparison panel rather than an unsupported inventory claim. Trust comes from actual provenance, scope, policies and working contact information. This direction suits both an agency comparing rows and a reader learning how to evaluate a publication.

The proposed wordmark is the literal name **Name Retailer** with a simple outlined lowercase `n` mark. It is a design proposal, not an approved trademark or final logo asset. Render as text/SVG in production; the previews use HTML text. Do not add a legal suffix, founding year or inventory count until confirmed.

Alternative 1, **the research console**: white and cool slate, navy actions, sans-serif headings, tighter density and fine technical rules. This would emphasize agency efficiency, exports and comparisons; it is credible for data-heavy repeat use but less distinctive for editorial guides. Keep the same IA, semantic states and provenance requirements.

Alternative 2, **the independent journal**: ivory, charcoal and muted rust, larger editorial headings, fewer visible metrics on the home hero and more guided buyer education. This would emphasize content services and thoughtful selection; marketplace rows would remain compact, but the front page would feel more like a specialist publication. It requires stronger confirmed author/editor evidence to support that positioning.

Approve a direction before Phase 3. Alternatives are described for a real owner choice; only the recommended direction has rendered previews in this phase.

## Review the four previews

Open [home.html](design-preview/home.html), [marketplace.html](design-preview/marketplace.html), [article.html](design-preview/article.html) and [tool.html](design-preview/tool.html) in a browser. They are self-contained: inline styles/scripts, system fonts, no CDNs, external assets or network calls. Source links in the draft article only navigate when clicked. Each file includes preview-only `noindex,nofollow`; this is not public deployment metadata.

| Preview | Intended production template / route | Working in the preview | Explicit gaps |
|---|---|---|---|
| Home | Primary marketplace `/` | Local navigation and responsive sections | Inventory, basket, accounts and real policies |
| Marketplace | Metric hub `/guest-post-by-dr/` | Search/topic/country/price/min-DR filters; apply/reset; removable chips; local sort; row detail disclosures; no-result recovery | Only four labeled samples; advanced filters and language changes unavailable; checkout/pagination disabled; no persisted URL state |
| Article | Buyer guide `/how-to-buy-links/` | Linked contents, source links, reading layout | Draft sample text; author/editor/publish/review dates pending |
| Tool | Utility `/word-counter/` | Local input, word/character/paragraph/reading-time outputs; example/reset; clipboard summary with failure status | Other tool links described as planned, not pretending to work |

Local links intentionally target sibling HTML files or real sections. Six production navigation targets remain Marketplace `/`, Services `/content-writing-services/`, Tools `/seo-tools/`, Guides `/blog/`, About `/about/`, Help `/help-center/`; account and basket are separate utilities. Static Account info goes to an explanation, not a fictional logged-in dashboard. A Tools/Guides preview link illustrates that family and is not a full hub. SEO owns real route/query rules and final metadata.

The `.example` domains, prices, DA/DR values, audience locations, traffic and turnaround descriptions are visibly illustrative. No sample is available for purchase. There are no fabricated clients, reviews, authors, rankings or inventory totals. Metric provider/date cannot be invented for a made-up value; previews explicitly say unavailable. The owner-confirmed address/email are real supplied business details.

## Color scales and data semantics

Use light mode initially. A dark theme is not specified or promised. Scales are functional tokens, not a license to use every shade as text on every background.

| Scale | Light / surface | Mid / decorative | Strong / text or action |
|---|---|---|---|
| Brand | `#e9f1ea` tint | `#71817a` boundary | `#195844` action; `#103e30` hover |
| Neutral | `#ffffff` surface; `#f6f4ed` paper | `#d6ddd6` divider; `#e9ede7` disabled; `#edf0e9` table header | `#4c605a` muted; `#172c28` ink |
| Success | `#e9f1ea` | `#71817a` | `#195844` |
| Warning | `#fff3d6` | `#71817a` boundary | `#785108` |
| Danger | white surface with text/icon | `#a3292d` boundary | `#a3292d` |
| Info / focus | `#eaf2f8` | `#71817a` boundary | `#205a83` |

`#d6ddd6` is a decorative separator only, not an input boundary, selected-state outline or sole way to distinguish a required interactive object. Meaningful input/badge boundaries use `#71817a`. Focus is a 3px blue outline with 3px offset so it contrasts with the surrounding paper/surface; on dark surrounds add a white outer separation ring and recompute that exact pair.

Do not assign green to a high DA/DR as if a score certifies a good publisher. DA/DR/TF display neutral labels plus a numeric score, range and named metric; selected range may use info tint with visible `Selected` text. Traffic uses info tint with `Estimated`, unit and provenance. Spam levels use `Low`, `Moderate`, `High`, or `Unavailable` text plus an optional icon and semantic tint; thresholds must come from the chosen provider, not this palette. Turnaround is a stated estimate/commitment with units. Missing data says `Unavailable`, never zero or an unexplained dash.

### Computed contrast

Run `node scripts/design/contrast.mjs` (or `--json`). The script computes sRGB relative luminance, checks unrounded ratios and exits nonzero on failure. The 24 pairs below pass. Ratios do not prove all future combinations or full WCAG conformance.

| Use | Foreground | Background | Ratio | Minimum |
|---|---|---|---:|---:|
| Body on paper | `#172c28` | `#f6f4ed` | 13.37:1 | 4.5:1 |
| Body on surface | `#172c28` | `#ffffff` | 14.71:1 | 4.5:1 |
| Muted on paper | `#4c605a` | `#f6f4ed` | 6.10:1 | 4.5:1 |
| Muted on surface | `#4c605a` | `#ffffff` | 6.71:1 | 4.5:1 |
| Primary button | `#ffffff` | `#195844` | 8.33:1 | 4.5:1 |
| Primary hover | `#ffffff` | `#103e30` | 11.97:1 | 4.5:1 |
| Link on paper | `#195844` | `#f6f4ed` | 7.57:1 | 4.5:1 |
| Metric badge | `#195844` | `#e9f1ea` | 7.23:1 | 4.5:1 |
| Warning badge | `#785108` | `#fff3d6` | 6.39:1 | 4.5:1 |
| Error on surface | `#a3292d` | `#ffffff` | 7.21:1 | 4.5:1 |
| Info badge | `#205a83` | `#eaf2f8` | 6.51:1 | 4.5:1 |
| Disabled label | `#4c605a` | `#e9ede7` | 5.67:1 | 4.5:1 |
| Boundary on surface | `#71817a` | `#ffffff` | 4.10:1 | 3:1 |
| Boundary on paper | `#71817a` | `#f6f4ed` | 3.72:1 | 3:1 |
| Boundary on brand tint | `#71817a` | `#e9f1ea` | 3.56:1 | 3:1 |
| Focus on surface | `#205a83` | `#ffffff` | 7.36:1 | 3:1 |
| Focus on paper | `#205a83` | `#f6f4ed` | 6.69:1 | 3:1 |
| Focus on brand tint | `#205a83` | `#e9f1ea` | 6.39:1 | 3:1 |
| Dark preview strip | `#ffffff` | `#172c28` | 14.71:1 | 4.5:1 |
| Sample label on paper | `#785108` | `#f6f4ed` | 6.41:1 | 4.5:1 |
| Sample label on surface | `#785108` | `#ffffff` | 7.05:1 | 4.5:1 |
| Table header label | `#172c28` | `#edf0e9` | 12.78:1 | 4.5:1 |
| Boundary on info tint | `#71817a` | `#eaf2f8` | 3.62:1 | 3:1 |
| Secondary hover | `#195844` | `#e9f1ea` | 7.23:1 | 4.5:1 |

## Typography and layout tokens

Previews intentionally use Georgia for headings and system UI for text, so no font fetch or late font swap affects review. Production proposal: at most two variable families, `Source_Serif_4` for display and `Inter` for UI, through `next/font/google`, `display: 'swap'`, Latin subset, CSS variables and fallback metric adjustment (`adjustFontFallback: true` where supported by the selected Next.js/font API). Inspect the generated fallback CSS and measure CLS; do not assume a handwritten fallback stack alone adjusts metrics. Font availability/API options and font weights must be checked at scaffold time. System fallbacks remain Georgia and system UI. Use the approved wordmark as text/SVG, not a third font.

| Token | Value / behavior |
|---|---|
| Body | 16px UI; 18px article desktop; 17px article mobile; line-height 1.6-1.7 |
| Small / label | 13px; metric values/badges 12px; never below 11px supplementary source labels |
| H1 display | `clamp(36px, 4.8vw, 64px)`; mobile 42px home / 36px utility/segment |
| H1 inner | `clamp(34px, 4vw, 52px)`; max width approximately 23ch |
| H2 / H3 | H2 `clamp(28px, 3vw, 40px)`; article 29-32px; H3 19-21px |
| Numerals | `font-variant-numeric: tabular-nums` in tables, counters, prices, pagination |
| Article measure | approximately 60-75 characters; max 70ch with a 740px column; test actual selected font |
| Container | maximum 1180px; side gutter 24px desktop, 16px mobile |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72px |
| Radius | 4px badges; 6px fields/buttons; 8px cards/panels; 999px small identity mark only |
| Border | 1px; strong functional boundary vs soft decorative separator as above |
| Shadow | default none; overlay `0 8px 24px rgb(23 44 40 / .08)` only if needed |
| Layer | base 0; sticky table/TOC 10; header 20 if future sticky; popover 30; consent 40; dialog 50; skip link 100 |
| Breakpoints | 640px row/card switch; 900px navigation/filter layout switch; 1050px compact gutters; validate 320/375/1280 |
| Motion | 150-200ms transform/opacity only when feedback needs it; no height/width/position/color animation; reduced-motion disables transitions, animations and smooth scrolling |

There is no package.json, Tailwind config or production scaffold in this phase, so no installed Tailwind major can be asserted. At Phase 3 choose/verify the actual version: Tailwind v4 uses CSS-first `@theme` in `app/globals.css`; v3 uses `tailwind.config.ts`. Never write both competing token sources. Map the project spacing/type scales into the chosen API after direction approval.

shadcn variable map: `--background: paper`, `--foreground: ink`, `--card/--popover: surface`, their foregrounds ink, `--primary: brand`, `--primary-foreground: surface`, `--secondary/--accent: tint`, their foregrounds brand, `--muted: disabled`, `--muted-foreground: muted`, `--destructive: danger`, destructive foreground surface, `--border/--input: boundary`, `--ring: info`, `--radius: 8px`. Use a separate `--divider` for soft lines instead of weakening the global functional border. `--chart-*` values, if needed, must have labels/patterns; charts are not part of this review.

## Shared states and component specifications

All interactive components inherit these seven states. Static sections have no invented hover/active/disabled states; the component table identifies those as not applicable.

| State | Required presentation and behavior |
|---|---|
| Default | Real anchor destination or real button action; clear name; preferred 44px target; native semantics |
| Hover | Primary darkens, secondary gains light tint, links underline; never reveal essential information only on hover |
| Focus-visible | 3px blue outline + 3px offset; keep wholly visible; keyboard matches pointer actions |
| Active | Visible selected/pressed text, `aria-pressed`/`aria-current` only when accurate; no scale bounce |
| Disabled | Native disabled when unavailable; readable muted label, fixed dimensions and nearby reason; do not make needed explanatory links unreachable |
| Error | Visible actionable message plus icon/text, danger boundary; retain values; `aria-invalid` and `aria-describedby` for fields |
| Loading | Preserve space/content; label the actual task; `aria-busy` on region; status announced once, not simulated success |

| Component | Anatomy / responsive and semantic behavior | State specialization | Does this cost CWV? |
|---|---|---|---|
| Header / simplified mega-menu | Six parent links, wordmark, truthful utilities. Production Services may have a separate disclosure button and a small grouped panel, not 50 links. Escape closes, focus departure/outside click closes, focus returns when dismissed; no hover-only open. Mobile named disclosure; production drawer only with complete modal behavior | Default parent links always usable; current-route underline; trigger expanded state; unavailable utilities omitted. Error/loading only for an actual search request | No LCP image. Reserve header dimensions; lazy-load optional suggestions. Preview uses simple Services link to avoid unfinished popover behavior |
| Hero | One H1, concise offer, marketplace CTA and buyer-guide secondary action; optional small metric comparison panel; stack at mobile | CTA inherits all seven states; no selected/loading state for static copy | Text LCP, no stock photography/video/carousel, no hero hydration needed |
| Cards and CTA | Semantic article/section; heading/body; one clear link, avoid nested interactive full-card links | Hover/focus on link only; selected only for actual selectable card; errors/loading not applied to editorial card | Server HTML; reserve media aspect ratios only if genuine media added |
| Footer | Confirmed NAP, real policy/support links, cookie preferences after consent implemented, catalog links without duplicate mega-menu | Anchor states; preference trigger expanded/modal states; no fake social links | Static text; no late injected marketing counters |
| Breadcrumbs | Named nav; linked actual ancestors; current item text with aria-current | Hover/focus linked ancestors; no disabled/error/loading | Static small HTML; JSON-LD coordinated with SEO |
| Author box | Confirmed person, real credentials/bio/profile, publish/update/review dates; visible pending label in drafts | Profile link states; static evidence has no active/disabled/loading | Text-first; reserve avatar dimensions if supplied; never invent author photo |
| Sticky TOC | Own desktop column; in-flow open disclosure below 900px or short viewport; anchors with scroll offset | Current-section indicator only if genuinely tracked; native focus/disclosure state; no loading/error for static list | Server outline; no scroll listener needed for basic function |
| Newsletter form | Visible email label, optional purposes/consent wording, submit and privacy link; only after service/process confirmed | All seven field/submit states; server acknowledgment before success; focused linked error summary; spam/privacy integration | Reserve success/error region; minimal client validation. Not functional in preview |
| Consent banner | Equal Accept/Reject + Preferences; optional purposes initially off; persistent footer access; no entry marketing popup | All seven button/toggle states; actual saved preferences; Escape/focus rules for modal; failure is recoverable | Reserve in-flow region on narrow/zoomed screens; avoid content-covering late layout; defer optional tags. Not implemented in previews, which load no optional trackers |
| Listing table / mobile cards | Caption, scoped column and publisher row headers; sticky desktop head; one dataset; explicit visible mobile label/value pairs. Mobile CSS retains accessible headers and explicit table roles; manual screen-reader review still needed | Row detail disclosure; sort labels/aria-sort if header button sorting; selection only if implemented. Fixed rows on loading; errors retry without losing facets | Render bounded page of rows, not full inventory. No infinite-scroll-only flow. Reserve page dimensions; no per-row heavy widget |
| Filter panel / chips | Native labels, ordered relevance facets then budget/metrics; apply/reset/count; removable chips with specific names. Preview uses in-flow details; production mobile bottom sheet native dialog with inert background, focus containment/Escape/return | Validate numeric bounds/range order; disabled provider-specific fields explain why; error preserves selections; busy/count announcement; chip removal returns focus | Small progressive client island; query defaults server-rendered. Do not rerender huge table on each keystroke |
| Metric badges | Name/value/unit plus source/date and definition; color never sole score/quality signal; unavailable explicit | Default/selected info; stale warning with wording; missing/error info; fixed-width skeleton if fetched; hover/focus only on a real explanatory disclosure | Text/SVG only; no animated gauges; no layout-changing tooltips |
| Pricing/package card | Scope, USD/unit, content inclusion, tax/fees and one-time/recurring terms; no invented sale/strike-through price | Real package selected indicator; disabled unavailable reason; loading price stays sized; changed-price error explains review before checkout | Server price snapshot; revalidate on checkout; no countdown timers |
| Trust strip | Actual processes/policies/provenance or buyer considerations; no fake logos, stars/counters | Static content; links inherit anchor states; not interactive cards | Three text items, wraps; no badge image fetches |
| Tool shell | H1/instructions -> input/output -> explainer -> FAQ -> related tools -> contextually relevant optional commercial action | All seven input/output/action states. Provider absence says unavailable; quotas/timeouts retry; local operations have real copy/reset statuses | Small tool-specific island; image/WASM dependencies lazy-loaded only if necessary; fixed output areas; never bundle all tools |
| Empty state | Explain no results, keep facets, offer reset/relaxation and contact if useful | Default reset link/button, focus, working recovery; loading/error separately worded, not disguised as empty | Stable reserved region; text-first |
| Skeleton | Match actual row/card/image/output dimensions; hidden from AT; region aria-busy plus one task label | Loading only; no blinking/shimmer when reduced motion; remove on true settle | Dimension preservation reduces CLS; skeleton is not a performance substitute |
| Pagination | Real previous/numbered/next links and result range; retain filters; page resets after filter change | Current page text/aria-current, unavailable edges disabled with reason; request error preserves page; loading stable | Server links; no endless DOM growth. Preview one-page controls intentionally disabled |
| Toast | Polite short acknowledgment of completed action, optional undo; never sole field error; does not steal focus | Actual default/success/error text; dismiss/undo focus; no loading-success lie | Fixed reserved overlay/in-flow placement; avoid obscuring focused components; no animation dependency |
| Form fields | Visible label, required/optional, hint, units, correct input type/autocomplete, consistent 44px height | All seven states; error message and retained input, no untouched-field error; password paste/password managers allowed | Native controls first; deferred spam script; no layout-shifting input wrappers |

Icons, when needed, are small tree-shaken `lucide-react` SVGs in the future build with accessible text or decorative `aria-hidden`. No icon font. Components use Server Components by default; client islands only for actual stateful controls. `/design-system` becomes a future component/state gallery with `noindex,nofollow`, excluded from sitemaps; this phase does not scaffold that route.

## Mobile-first template notes

Above-fold descriptions are priorities, not a claim that every viewport displays the same amount. At 320px or high zoom content must reflow in reading order without clipping. Stable header, bounded text LCP and no entry popups apply to every template.

| Template | First useful viewport / mobile order | Desktop and later content / performance constraint |
|---|---|---|
| Home | Wordmark/nav disclosure, direct offer, marketplace CTA and buyer guide; sample comparison follows | Hero split with compact data panel; marketplace entry/facets, selection guide, genuine services, process/policies and helpful FAQs. Production primary inventory may follow hero; this preview only links into sample inventory |
| Marketplace segment/category/archive | Breadcrumb, one precise H1, concise selection context, current criteria/results; filter disclosure, then card rows | Filter rail + sticky-heading table, count/sort/chips, real pagination, original segment guidance and definitions. Conditional niche/country/language pages gated by inventory/demand/editorial evidence |
| Single article/post | Breadcrumb, H1, direct summary and actual byline/dates; takeaways/contents before long copy | 60-75 character reading column + separate sticky TOC, cited answer-first sections, author box, relevant related guides and one contextual CTA |
| Service landing | Clear deliverable, truthful process and primary inquiry/purchase CTA | Real formats/scope, sample work with permission, priced packages only if confirmed, process/revision/rights FAQs; no invented clients or results |
| Tool | Breadcrumb/H1, plain instructions, labeled input and output; local privacy or provider disclosure | Input/output grid, definitions, explainer, FAQ, real related tools and context-specific service/marketplace link; basic utility does not force an unrelated purchase CTA |
| About | Confirmed name, what the business does, real contact/location | Real team/experience/process and editorial policy; no missing founding year or credentials filled by guesses |
| Contact | Confirmed email, labeled message form when wired, clear response expectations only if confirmed | Optional business address and help links; validation/success/error, honeypot/Turnstile accessible fallback; no unstaffed chat button |
| Search results | Labeled query form, query summary, real grouped results or empty/error recovery | Type filters, stable suggestions behavior per UX; no private content; noindex and no sitemap inclusion handled by SEO |
| 404 | Clear not-found H1, plain explanation, marketplace/tools/guides links and working search | Preserve navigation/context; helpful existing destinations; no fabricated suggested page and no automatic confusing redirect |
| Legal | Page title, owner-reviewed effective date and content outline | Comfortable measure, policy subsections, actual contact; readable text without marketing interruption. Preserve existing confirmed legal slugs |

No carousel, autoplay, floating 3D object, glass effect, entrance popup or layout-shifting trust counter is part of the proposal. A future photograph/illustration must be real/useful, optimized, dimensioned and appropriate; this direction needs no generated bitmap assets.

## Verification and remaining decisions

The contrast script passes 24 explicit pairs. The final parent browser run after cross-review fixes passes all 12 template/width combinations at 320, 375 and 1280px, with no page overflow or runtime errors. At 375 and 1280px, marketplace no-result/recovery, reset, budget filter, chip removal and ascending price sort pass; word-counter words, paragraphs, Unicode character counts, example and clear pass. Eight screenshots cover each template at 375 and 1280px. Evidence is [preview-checks.json](design-preview/evidence/preview-checks.json), generated by `scripts/qa/check_design_previews.py`. Keyboard smoke confirms the skip link receives first focus. These checks do not measure production Lighthouse/CWV, actual checkout, full keyboard/assistive-technology conformance, legal compliance or provider accuracy.

UX cross-review led to a plain Services parent link in previews, accessible preserved mobile table headers/roles and actual label markup, publisher row headings, removable 44px chips, current-page breadcrumbs and operable disclosure summaries. A replacement-string bug in the demo filter script was corrected by literal whole-script replacement before final browser verification. Production must still run real screen-reader/mobile semantics, focus, keyboard, text-resize, zoom and consent-layer tests; neither a source review nor a screenshot certifies WCAG.

Owner checkpoint: approve the publication-desk direction or select an alternative, and refine wordmark/colors if desired. Data gates before production remain actual listing CSV/provenance, paid-placement and monthly/permanent terms, confirmed authors/service process/real policies, migration of customers/orders and remote-tool providers. These do not prevent reviewing the proposed visuals.

SEO handoff: root legacy slugs/slashes remain; no indexable per-domain page, no arbitrary filter combinations as SEO landing pages, and no fabricated counters/ratings/schema evidence. UX handoff: six-link IA, guest comparison/value before checkout sign-in, complete production modal/search behavior, retained input and truthful statuses. Do not copy preview-disabled controls or local-only demo facets into a production flow as if implemented.
