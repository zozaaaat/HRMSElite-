### Troubleshooting

Startup and environment
- Env validation failed (missing/invalid): ensure `.env` exists and JWT_SECRET, SESSION_SECRET are 32+ chars.
- EADDRINUSE on 3001: change `PORT` in `.env` or stop the process using the port.
- Node version errors: use Node 20+.

Authentication & CSRF
- 403 CSRF_TOKEN_INVALID: refresh the page to get a new token; confirm cookies enabled; for local debug temporarily set `CSRF_ENABLED=false`.
- Cookies not set behind proxy: ensure TLS terminator passes `X-Forwarded-*` and app has `trust proxy = 1` (already set).

CORS
- Browser blocked by CORS: set `CORS_ORIGINS=http://localhost:5173` (comma-separated for multiple origins) and restart.

Database
- File not found: set `DATABASE_URL=./dev.db` or create it by starting the app; seed with `node add-sample-data.js`.
- Locked DB: close extra processes writing to the DB; retry; VACUUM off-hours.

File uploads
- 413 or size errors: increase `UPLOAD_MAX_BYTES` and verify reverse proxy `client_max_body_size` (Nginx) or `request_body` (Caddy) if needed.
- S3 errors: set `FILE_STORAGE_PROVIDER=s3`, ensure AWS creds and bucket/region; for local use `local` and ensure `LOCAL_FILE_PATH` exists and writable.

Logging/metrics
- No logs in Loki/Elastic: set LOG_SHIPPING_* envs and ensure network reachability.
- Metrics not scraping: confirm `/metrics` exposed via proxy and Prometheus target is healthy.

Build
- `npm run build` fails: run `npm run type-check` and `npm run lint`; fix reported errors. Clear cache with `npm run clean`.


