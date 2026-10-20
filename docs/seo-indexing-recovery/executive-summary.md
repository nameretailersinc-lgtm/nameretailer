# NameRetailer indexing recovery — 20 October 2026

Implemented locally; **not deployed**. Google indexing and ranking have not been claimed as fixed.

Confirmed production technical issues: the SaaS and Technology directories returned 200 but noindex and no publication rows on three direct probes each. Their full-catalogue read exceeded its deadline. The responsive QA article's code policy excluded it despite its CMS robotsIndex=true setting. The live sitemap advertised pages that returned noindex. Local cold-cache testing also demonstrated partial sitemap snapshots on read failures; the implementation now fails retryably instead of caching incomplete success.

Confirmed content issues: the hub simultaneously claimed verified metrics and explained they were not independently verified; the responsive article incorrectly equated collapsed mobile content with non-indexable content. Its numbered section labels and rigid device/font assertions were corrected. Long tracking parameters caused mobile overflow and now wrap within existing cards.

Legacy migration issues: /hello-world/, /2824-2/ and /category/uncategorized/ redirected to an unrelated blog hub without corresponding CMS records. These now return 404 locally. Specific equivalent redirects remain. Historical pagination and unsupported auxiliary resources retain honest 404s.

Local evidence: five priority pages return 200, self canonical and index, follow in repeated checks; SaaS/Technology contain actual linked listings. 10799 sitemap entries were parsed, 246 HTML pages and 107 assets were fetched, and 25555 HTML anchor edges were recorded. Every one of 10655 eligible publication profiles was checked for generated metadata duplication; none were found. None has reviewed editorial content in the captured data. This is an editorial evidence gap, not proof of why Google excluded a page.

Limits: the exact ~150-URL GSC export, URL Inspection history, traffic/backlink history, production access/error logs and active Nginx configuration were unavailable. Publication HTML and outgoing links were sampled; this is not a complete outgoing graph of every listing and filter variant. See verification-results.md for exact executed checks and any remaining failures.

The supplied crawl statistics establish activity and a healthy host. Low discovery percentage, resource/AdsBot traffic and fluctuations do not establish a crawl-budget problem or penalty. Request indexing only after an authorized deployment and live verification; monitor for 2–6 weeks without guaranteeing selection.
