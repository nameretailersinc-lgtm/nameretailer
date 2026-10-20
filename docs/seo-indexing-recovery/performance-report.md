# Performance evidence

These are network measurements from this workstation, not Core Web Vitals or a production rollout comparison. Production and loopback have different network paths/cache conditions. First local requests include database connection/cold-cache work. Subsequent requests demonstrate warm behavior only.

| Existing page | Production TTFB, three probes (ms) | Local TTFB, three probes (ms) | Publication links, production first / local final |
|---|---|---|---|
| /guest-posting-sites/ | 6788, 2522, 360 | 573, 368, 47 | 12 / 12 |
| /saas-guest-posting-sites/ | 15605, 12341, 12445 | 1003, 52, 58 | 0 / 25 |
| /technology-guest-posting-sites/ | 17224, 12444, 12779 | 2204, 69, 58 | 0 / 35 |
| /guides/vet-a-guest-post-site/ | 362, 240, 222 | 46, 82, 33 | 0 / 0 |
| /blog/a-responsive-article-page-qa-checklist/ | 883, 707, 3054 | 594, 1413, 460 | 0 / 0 |

Direct requests established repeated slow 200/noindex category responses; retrieval-tool timeouts were not used alone as proof. The new scoped payload benchmark is recorded in evidence.json. It preserves the actual counts: 541 SaaS and 3,062 Technology listings in the captured inventory, while transferring 25 main rows and exact category subsets rather than all 56,005 inventory documents.

Price-report grouping retains original active/committed visibility, numeric USD prices, DA/DR bands, medians/percentiles, top-topic/country ordering and metric hygiene notices. No price, readership or result is fabricated.

Cold sitemap requests initially exceeded the 30/45-second probe deadlines and an early local snapshot omitted failed ranges. A longer retry succeeded after warming. The corrected source does not cache partial-success snapshots: failures yield retryable 503 and must be checked on deployment. Full cold-cache reliability under production network conditions remains an operator verification item.

No production server logs or active Nginx config were available. The existing Nginx document is guidance, not evidence of deployed settings. Do not apply an HTML cache without separately validating session/cookie, authorization and RSC behavior. No infrastructure changes were made. No Lighthouse/CrUX improvement is claimed.
