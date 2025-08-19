### TLS Termination Guide (Nginx and Caddy)

Goal: terminate HTTPS at a reverse proxy and forward traffic to the Node server (PORT, default 3001) and Vite client (5173) if needed.

Assumptions
- Domain: example.com
- Node server: http://127.0.0.1:3001
- Client (optional dev): http://127.0.0.1:5173
- Ensure `CORS_ORIGINS` includes your public origins.

Nginx (recommended for production)
1) Install nginx and obtain certificates (e.g., certbot)
2) Example server block:
```
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;

    # API -> Node server
    location /api/ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3001;
    }

    # Metrics/health (optional)
    location /metrics {
        proxy_pass http://127.0.0.1:3001;
    }
    location /health {
        proxy_pass http://127.0.0.1:3001;
    }

    # Static app (production build served by Node from /dist/public)
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3001;
    }
}
```

Caddy (simple and automatic certificates)
```
example.com {
    encode zstd gzip
    @api path /api/*
    reverse_proxy @api 127.0.0.1:3001

    # Everything else goes to the Node server which serves the built client
    reverse_proxy 127.0.0.1:3001

    header {
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Content-Security-Policy "upgrade-insecure-requests"
    }
}
```

Notes
- Set `app.set('trust proxy', 1)` (already set) so secure cookies and rate limiting work behind a proxy.
- Ensure `SESSION_COOKIE.secure` is true in production (code checks NODE_ENV).
- Update `CORS_ORIGINS` to your domain if you expose different origins.

Local HTTPS (dev)
- Use `mkcert` or Caddy locally if you need HTTPS in dev.


