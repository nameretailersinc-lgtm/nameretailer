# Programmatic directory inventory

Minimum indexable size: 5 active, committed-import listings. Every retained page displays full-segment real price statistics, countries/topics and a supplied catalogue timestamp. No metric measurement date is inferred.

The under-$50 niche page and $0–$50 price band have the same nonnegative-price intent; keep /price-0-to-50/ and 301 /guest-posting-sites-under-50/. Metric and price band endpoints remain inclusive to preserve existing filters. Adjacent bands share boundary values; they address different ranges rather than duplicate the same intent. Broad traffic >500k is an intentional aggregate view of narrower high-traffic segments. Technology/SaaS and other topic groups overlap where their real category filters overlap but target distinct audiences.

| URL | Type/filter | Decision |
|---|---|---|
| /da-1-to-10/ | {"minDa":"1","maxDa":"10"} | Keep; noindex below 5 |
| /da-10-to-20/ | {"minDa":"10","maxDa":"20"} | Keep; noindex below 5 |
| /da-20-to-30/ | {"minDa":"20","maxDa":"30"} | Keep; noindex below 5 |
| /da-30-to-40/ | {"minDa":"30","maxDa":"40"} | Keep; noindex below 5 |
| /da-40-to-50/ | {"minDa":"40","maxDa":"50"} | Keep; noindex below 5 |
| /da-50-to-60/ | {"minDa":"50","maxDa":"60"} | Keep; noindex below 5 |
| /da-60-to-70/ | {"minDa":"60","maxDa":"70"} | Keep; noindex below 5 |
| /da-70-to-80/ | {"minDa":"70","maxDa":"80"} | Keep; noindex below 5 |
| /da-80-to-90/ | {"minDa":"80","maxDa":"90"} | Keep; noindex below 5 |
| /da-90-to-100/ | {"minDa":"90","maxDa":"100"} | Keep; noindex below 5 |
| /0-to-50k-traffic/ | {"minTraffic":"0","maxTraffic":"50000"} | Keep; noindex below 5 |
| /50k-to-100k-traffic/ | {"minTraffic":"50000","maxTraffic":"100000"} | Keep; noindex below 5 |
| /100k-to-500k-traffic/ | {"minTraffic":"100000","maxTraffic":"500000"} | Keep; noindex below 5 |
| /500k-to-1m-traffic/ | {"minTraffic":"500000","maxTraffic":"1000000"} | Keep; noindex below 5 |
| /1m-to-5m-traffic/ | {"minTraffic":"1000000","maxTraffic":"5000000"} | Keep; noindex below 5 |
| /5m-to-10m-traffic/ | {"minTraffic":"5000000","maxTraffic":"10000000"} | Keep; noindex below 5 |
| /10m-plus-traffic/ | {"minTraffic":"10000000"} | Keep; noindex below 5 |
| /dr-0-to-20/ | {"minDr":"0","maxDr":"20"} | Keep; noindex below 5 |
| /dr-20-to-50/ | {"minDr":"20","maxDr":"50"} | Keep; noindex below 5 |
| /dr-50-plus/ | {"minDr":"51"} | Keep; noindex below 5 |
| /price-0-to-50/ | {"minPrice":"0","maxPrice":"50"} | Keep; noindex below 5 |
| /price-50-to-100/ | {"minPrice":"50","maxPrice":"100"} | Keep; noindex below 5 |
| /price-100-to-150/ | {"minPrice":"100","maxPrice":"150"} | Keep; noindex below 5 |
| /price-150-to-200/ | {"minPrice":"150","maxPrice":"200"} | Keep; noindex below 5 |
| /price-200-plus/ | {"minPrice":"200.01"} | Keep; noindex below 5 |
| /500k-plus-traffic/ | {"minTraffic":"500001"} | Keep; noindex below 5 |
| /technology-guest-posting-sites/ | {"categories":["Technology","Computers","Gadgets","Internet","Mobile","Hardware development"]} | Keep; noindex below 5 |
| /saas-guest-posting-sites/ | {"categories":["Software development","Programming","Web-development","Startups"]} | Keep; noindex below 5 |
| /guest-posting-sites-under-50/ | {"maxPriceCents":5000} | 301 to /price-0-to-50/ |
| /guest-posting-sites-usa/ | {"country":"United States"} | Keep; noindex below 5 |
| /marketing-guest-posting-sites/ | {"categories":["Marketing","E-commerce"]} | Keep; noindex below 5 |
| /business-guest-posting-sites/ | {"categories":["Business","Finance","Career and Employment"]} | Keep; noindex below 5 |
| /health-guest-posting-sites/ | {"categories":["Health","Beauty","Sports"]} | Keep; noindex below 5 |
| /travel-lifestyle-guest-posting-sites/ | {"categories":["Travelling","Lifestyle","Food","Fashion","Home and Family"]} | Keep; noindex below 5 |
