# Catalogue URLs

The homepage catalogue uses publication A–Z sorting and 20 results per page by default. Its first page is `/`; later pages use `/page/2/`, `/page/3/`, and so on. Default `sort=domain`, `pageSize=20`, and `page=1` parameters are omitted.

Old URLs such as `/?sort=domain&page=2&pageSize=20` and `/?page=2` return a 301 directly to `/page/2/`. `/page/1/` returns a 301 to `/`. A page number in the path wins over a conflicting query parameter. Unsupported or empty pages return 404.

Nonempty default catalogue pages use their own canonical URL and `index, follow`. Alternative sorts, nondefault page sizes and arbitrary filters remain `noindex, follow`; they preserve their options in the query. The robots file permits sort and page-size queries so crawlers can process their redirects and noindex tags. Other existing filter crawl limits remain in place. Catalogue pagination renders real links, including sequential next/previous links, while retaining browser history and filter state.

Existing metric/range pages retain their query-based pagination. Browser-generated URLs omit default sort and size parameters there too.

Validate with `npm test -- tests/unit/marketplace-url.test.ts tests/unit/seo-facets.test.ts`, `npm run check:urls` against a populated local server, and `tests/e2e/marketplace-seo.spec.ts` against the isolated test database.

## Search Console redirect report

On October 12, 2026, all four reported blog URLs returned one 308 redirect to the trailing-slash URL followed by HTTP 200, a matching canonical and `index, follow`, including GET requests using a Googlebot user agent:

- `/blog/ai-crawler-access-needs-a-documented-product-specific-policy/`
- `/blog/a-content-experiment-log-that-records-confounders/`
- `/blog/build-a-question-map-before-drafting-answer-led-content/`
- `/blog/paid-link-disclosure-questions-to-ask-before-placement/`

The reported error could not be reproduced from this network. Use Search Console’s live URL test and Validate fix to check access from Google’s infrastructure and refresh the report. These checks do not establish the articles’ current Google indexing status.
