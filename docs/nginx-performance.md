# nginx performance settings (host nginx, port 3100 upstream)

Enable HTTP/2, compression, long-lived caching for hashed assets, and a short anonymous HTML microcache. Adjust paths/certs to the server.

**Why the microcache:** public pages are rendered per request (`Cache-Control: private, no-store` from Next.js). On 2026-10-09 the live homepage had a 1.25 s time to first byte from one test location. The app already caches catalogue aggregates in memory for 15 minutes and listing pages for 60 seconds. A 60-second nginx cache for anonymous visitors removes the remaining render cost for crawlers and first-time visitors without serving one user's page to another.

```nginx
# http {} context
proxy_cache_path /var/cache/nginx/nameretailer levels=1:2 keys_zone=nr_html:20m
                 max_size=512m inactive=10m use_temp_path=off;

# Bypass the cache for signed-in visitors, React Server Component requests and non-GET.
map $http_cookie $nr_has_session {
    default 0;
    ~*(next-auth|__Secure-next-auth|__Host-next-auth) 1;
}
map "$request_method:$nr_has_session:$http_rsc$http_next_router_prefetch" $nr_skip_cache {
    default 1;
    "GET:0:" 0;
    "HEAD:0:" 0;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;                      # nginx >= 1.25.1; older: `listen 443 ssl http2;`
    server_name nameretailer.com www.nameretailer.com;

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/css application/javascript application/json application/xml image/svg+xml text/plain;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3100;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Never cache private or mutable areas.
    location ~ ^/(admin|api|my-account|cart|checkout)(/|$) {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache nr_html;
        proxy_cache_key "$scheme$host$request_uri";
        proxy_cache_bypass $nr_skip_cache;
        proxy_no_cache $nr_skip_cache;
        # Next.js marks dynamic HTML no-store; cache it here for anonymous GETs only.
        proxy_ignore_headers Cache-Control Expires Set-Cookie;
        proxy_hide_header Set-Cookie;   # responses that set cookies are never shared
        proxy_cache_valid 200 301 308 60s;
        proxy_cache_valid 404 10s;
        proxy_cache_use_stale updating error timeout http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status always;
    }
}
```

`proxy_hide_header Set-Cookie` matters: without it, a cookie set on an anonymous request (for example a CSRF token) could be cached and replayed to other visitors. Pages that need a cookie on first load must fetch it from `/api/...`, which is never cached. Confirm this before enabling the cache: `curl -sI https://nameretailer.com/ | grep -i set-cookie` should print nothing.

The app sends `Strict-Transport-Security: max-age=31536000` (see `next.config.ts`). Add `includeSubDomains; preload` only after confirming every subdomain serves HTTPS.

Verify:

- `curl -sI --http2 https://nameretailer.com/ | head -1` prints `HTTP/2 200`.
- Two requests a few seconds apart: the second shows `X-Cache-Status: HIT` and a much lower `time_starttransfer` (`curl -s -o /dev/null -w "%{time_starttransfer}\n" https://nameretailer.com/`).
- A signed-in request (with the session cookie) shows `X-Cache-Status: BYPASS`.
- Core Web Vitals: run PageSpeed Insights for `/`, `/guest-posting-sites/`, one range page and one `/publication/…/` page on mobile, and check the Search Console Core Web Vitals report after 28 days of field data.
