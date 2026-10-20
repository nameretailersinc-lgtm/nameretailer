# Implemented changes

- lib/commerce/seo-catalogue.ts: scoped directory aggregates, full-result distributions and exact subtopic counts with bounded visible row transfer; stale refresh behavior.
- lib/commerce/price-breakdown.ts: grouped numeric price-report reads replace full catalogue-document transfer; preserve statistics and hygiene semantics.
- components/site/directory-insights.tsx: render aggregate-backed DR/subtopic figures and all-match counts.
- app/[tool]/page.tsx and lib/seo/sitemap-entries.ts: align directory eligibility sources; remove unused imports; fail incomplete sitemap reads; meaningful revision dates.
- app/guest-posting-sites/page.tsx: resolve price content before rendering that section, correct metric/availability wording and disclose disabled ordering and non-reservation.
- lib/blog/indexing-policy.ts, queries.ts, public-copy.ts and editorial.ts: selectively admit the reviewed responsive QA article while honoring explicit CMS noindex; share journal/sitemap policy and real update date.
- lib/blog/technical-aeo.ts: preserve the responsive article's topic, practical example and checklist; correct mobile indexing claims, remove artificial section numbering, improve viewport/keyboard/zoom tests and contextual links.
- app/site-map/page.tsx: crawlable approved journal links and correct noindex precedence for query variants.
- lib/site/guest-posting-guides.ts: contextual responsive QA link from the publishing checklist and actual meaningful revision date. The substantial vetting guide was preserved.
- app/reference.css: allow long example parameters to wrap inside existing text cards, addressing measured 487px document width at 320/375px viewports.
- lib/seo/redirect-map.ts, docs/redirect-map.csv and redirects.config: remove three unrelated WordPress-to-blog redirects; retain honest missing-page responses and specific aliases.
- app/llms.txt/route.ts: remove obsolete ordering claims; describe private planning limitations and use shared article eligibility. This file is not an indexing solution.
- Unit and browser regression tests cover scoped reads, statistics, explicit noindex overrides, partial sitemap failure, reviewed-article eligibility, redirects, complete priority HTML and mobile layout. The older publication-dialog test expected a removed Plan placement link; it now asserts the existing Add to plan button, consistent with the restored planning workflow.
- scripts/seo/recovery-*: reproducible read-only probes, crawl graph/assets, catalogue/content audits, benchmark and report generation. Reports distinguish live, local, source-derived and untested evidence.

No database content or production credentials were modified. Only isolated test databases receive synthetic regression fixtures. No deployment, ordering/payment enablement, new SEO landing page or visual redesign was performed.
