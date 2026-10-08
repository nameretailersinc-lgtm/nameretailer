# nginx performance settings (host nginx, port 3100 upstream)

Enable HTTP/2, compression and long-lived caching for hashed assets. Adjust paths/certs to the server.

```nginx
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

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Verify: `curl -sI --http2 https://nameretailer.com/ | head -1` should print `HTTP/2 200`.
