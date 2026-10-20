# Search Console follow-up

No Search Console account data was accessed. The supplied approximate count and crawl statistics are context; the exact ~150 affected URLs, Google-selected canonicals and last-crawl dates remain unknown. The CSV contains the five investigated URLs and marks membership unconfirmed rather than fabricating the export.

After the owner authorizes deployment:

1. Confirm the deployed five URLs return 200 with meaningful HTML, self canonical, index/follow, working assets and no conflicting HTTP robots directive. Repeat SaaS/Technology with cold and warm caches. Verify XML index and children after a cold start; retryable failures must not become cached partial 200 snapshots.
2. Open each priority URL in [URL Inspection](https://support.google.com/webmasters/answer/9012289), record Google's indexed status, last crawl, fetch result, user/Google-selected canonical and referring/sitemap information. Run Test live URL, inspect rendered content and resources, and confirm noindex is gone on the deployed build.
3. In Sitemaps, verify https://nameretailer.com/sitemap.xml and its existing children. Resubmit the existing sitemap after meaningful deployed corrections if appropriate; do not submit filter variants or fabricate lastmod. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
4. Request indexing for the five corrected URLs or a smaller representative subset. Repeated requests are not a recovery strategy and successful live tests do not guarantee selection.
5. Export the actual Crawled – currently not indexed examples and join them to crawled-not-indexed-url-audit.csv. Separate changed valuable pages, duplicates, retired WordPress URLs and auxiliary resources. Inspect representatives of each group before wider changes.
6. Record a deployment-date baseline and compare weekly for 2–6 weeks: submitted/discovered/indexed counts, exclusion reasons, per-URL canonical decisions, impressions, and eligible-page coverage. Example lists and totals can change and processing can lag; compare consistent cohorts.
7. Review Crawl Stats by response, HTML/resource type and verified Search Googlebot. Keep AdsBot, image and resource loading separate. Correlate 429/5xx/slow HTML with server logs. Healthy host status and low discovery share alone do not establish a budget issue or penalty.

For the meaning of exclusion categories see [Page indexing report](https://support.google.com/webmasters/answer/7440203). Indexing, rankings, traffic and any particular recovery date remain Google's decisions. The live test proves current access/eligibility, not that Google will index a page.

Editorial references checked during this work: [Google mobile content guidance](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing) supports equivalent accessible content, including accordions/tabs; [paid-link qualification](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links) distinguishes sponsored/nofollow attributes from visible disclosure. No FAQ rich-result promise is made.
