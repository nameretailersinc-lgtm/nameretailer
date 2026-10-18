# UK, Finance and Real Estate directories

October 18, 2026. This task is limited to three new directories and their registration, rendering support and validation. Other guide, blog and existing-directory work is being handled separately in the shared workspace. No deployment, push or database mutation was performed by this task.

| Canonical | Primary intent | Supporting phrases | Actual matching inventory |
|---|---|---|---|
| `/guest-posting-sites-uk/` | guest posting sites in UK | UK guest posting websites with prices; UK business guest posting sites | 3,203 listings with supplied country `United Kingdom` |
| `/finance-guest-posting-sites/` | finance guest posting sites | finance websites accepting guest posts; finance guest posting sites with prices | 691 listings with supplied category `Finance` |
| `/real-estate-guest-posting-sites/` | real estate guest posting sites | real estate blogs accepting guest posts; property guest posting websites with prices | 143 listings with supplied category `Real Estate` |

These are read-only catalogue counts observed at `2026-10-18T17:39:01.935Z`, not demand estimates or independently verified audiences. All three exceed the existing 15-listing indexability threshold. The [qualification report](../reports/seo-directory-qualification.json) records exact filters, actual price distributions and five samples per segment. Reproduce it with `node node_modules/tsx/dist/cli.mjs scripts/seo/qualify-directories.ts`, using the private database environment and an appropriate explicit DNS resolver when required by the host.

Each new page has a distinct title, description and answer-first introduction; five original guidance sections; a practical audience example; a checklist; visible FAQs; related directories and guidance; and a primary source for paid-link qualification. The template renders up to 25 actual matching listings, supplied metrics, USD prices and a dated catalogue summary. Country/category values remain supplied fields. A listing, including a recognizable domain, does not establish publisher authorization, endorsement, current acceptance or availability. Those limitations are explicit in the new guidance.

UK guidance distinguishes location fields from audience evidence, publication sections and currency. Finance guidance covers the particular reader, evidence, specialist review, restricted-topic confirmation and total scope. Real Estate guidance distinguishes property audiences and local markets, defines dated market evidence, and addresses image rights and article format. None gives personalized financial/legal advice or claims verified editorial standards.

Finance is a narrower supplied-category subset of the existing broad Business directory. Existing Business filters and URL remain unchanged. Real Estate does not reuse the Home and Family directory intent. No synonym route or managed-service offering was added. The directory registry supplies existing hub, homepage, HTML site-map and related-directory links automatically. The existing sitemap and metadata policy continue to gate indexability on live inventory; missing statistics or fewer than 15 listings omit a directory from XML and make it noindex. Query variants retain noindex and the clean canonical.

The new guidance has a real October 18 editorial date, displayed separately from catalogue observation dates. The existing shared sitemap logic uses the later valid editorial/catalogue date. No author, reviewer, historical publication date or request-time update date was invented. The table wrapper is keyboard-focusable with a named region and table. Further-guidance links use the existing directory resource field.

Paid-link guidance was checked against [Google's outbound-link documentation](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links): sponsored is preferred for paid placements; nofollow is also accepted. No ranking, indexing, AI-answer inclusion or rich-result eligibility is promised. Numeric search volumes and GSC overlap data remain unavailable.

## Verification

- Separate `.next-seo` production build passed: compile, TypeScript, 140 generated pages and secure standalone packaging. The other agent's `.next` build and the development server were preserved.
- Unit run: **57 files / 579 tests passed**. Three new sitemap-policy tests cover insufficient/unavailable inventory, an editorial date newer than inventory, and a later genuine inventory update.
- Focused ESLint passed for the directory definitions, read-only qualification script and directory tests. Earlier full ESLint and TypeScript checks also passed during this task.
- Focused content hygiene: **all three pages passed** language, heading, image-alt and image-width checks.
- Browser verification is recorded in [the validation report](../reports/seo-specialist-directories-validation.json). It targets the isolated local production server, not deployment or Google indexing.

The separate concurrent guide test had two assumptions incompatible with these authorized new directories: the UK route must be absent, and directory resource links may only use its short internal allowlist. Removed the obsolete absence assertion and added the pricing report and Google source to the resource allowlist. No guide behavior or guide expectations were otherwise changed.

The historical per-URL production CSV remains unchanged. Use this report for the three locally implemented directory intents; the keyword map's proposal status is updated separately. After release, check the three canonical pages, matching filters, mobile table scrolling, sitemap entries and query noindex, then request URL inspection in Search Console. Catalogue eligibility and local tests do not establish Google indexing or ranking gains.
