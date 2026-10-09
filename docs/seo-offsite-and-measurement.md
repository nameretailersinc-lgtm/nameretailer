# Off-site proof and measurement (SEO audit items 3, 9 and 10)

These items need accounts or people, not code. The code hooks are in place; this page lists what the owner has to do and how to check it worked.

## 1. Connect Search Console, Bing and GA4

| Step | Where | Code hook |
| --- | --- | --- |
| Add a Domain property for `nameretailer.com` in Google Search Console. A DNS TXT record is preferred. Or use the HTML-tag method and set `GOOGLE_SITE_VERIFICATION` to the tag's `content` value. | Search Console | `app/layout.tsx` `verification` |
| Submit `https://nameretailer.com/sitemap.xml` | Search Console › Sitemaps | `app/sitemap.ts` |
| Import the site into Bing Webmaster Tools from Search Console, or set `BING_SITE_VERIFICATION`. Bing's index feeds Copilot and ChatGPT search. | Bing Webmaster | `app/layout.tsx` |
| Create a GA4 web stream and set `NEXT_PUBLIC_GA4_ID=G-…`. Consent defaults to denied, so GA4 sends cookieless pings until a consent banner is added and the cookie policy is updated. | GA4 | `components/site/analytics.tsx` |

Rebuild after changing `NEXT_PUBLIC_*` variables, because they are inlined at build time.

## 2. Monthly review (first Monday of each month)

1. **Indexing (Search Console › Pages):**
   - Track indexed counts for `/publication/` (569 submitted at launch), the 26 range pages, the 7 niche directories, guides and blog.
   - Investigate "Crawled – currently not indexed" on profile pages first. If many remain unindexed after 8 weeks, tighten `PROFILE_RULE` rather than adding more pages.
2. **Queries (Search Console › Performance):**
   - Filter by page group and compare impressions and CTR month over month.
   - Watch for profile pages ranking for "[site] guest post" and "[site] write for us".
3. **AI referrals (GA4 › Traffic acquisition, session source):** record sessions from `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com` and `claude.ai`. Log a citation only when it is observed.
4. **Core Web Vitals:**
   - Use the Search Console CWV report once field data exists.
   - Run PageSpeed Insights on mobile for `/`, `/guest-posting-sites/`, `/da-50-to-60/`, one `/publication/…/` page and `/guides/guest-post-cost/`. Record LCP, INP and CLS.
   - Note: the audit could not measure these because the PageSpeed API quota was exhausted.
5. **Server response:** after enabling the nginx microcache (`docs/nginx-performance.md`), check `X-Cache-Status: HIT` and a time-to-first-byte under 200 ms on a repeat request.

## 3. Third-party proof (owner action, nothing to build)

The audit found almost no evidence of off-site corroboration. Search engines and AI assistants weigh what other sites say about a brand. In order of value:

1. **Official profiles.**
   - Confirm which profiles are official: the Facebook page `facebook.com/profile.php?id=61577321699205` was seen on the old site, plus any LinkedIn company page or X account.
   - Add them to `organizationNode()` in `lib/seo/json-ld.ts` as `sameAs`. It is deliberately empty until the owner confirms them; the unit test asserts that.
2. **Company identity:** supply the legal entity name, trade licence or registration number and founding year for `/about/` and the Organization schema. These are the TODOs in `app/about/page.tsx`.
3. **Author bio:** a short, real biography and job title for Zuhoor Uddin in `lib/site/authors.ts`. The author page stays noindex until then.
4. **Reviews:** ask real customers to review Name Retailer on a third-party platform such as Trustpilot or G2. Do not add review markup or on-site ratings until there are genuine, attributable reviews.
5. **Mentions:**
   - Pitch the catalogue price data (median placement price by DA band, country and topic, live on `/guides/guest-post-cost/`) to SEO newsletters and blogs as an original dataset.
   - Ask for a citation link to the guide.
   - This is the site's strongest unique asset.

Do not buy links or reviews to speed this up. It would contradict the site's own guidance on paid links.
