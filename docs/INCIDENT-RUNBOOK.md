### Incident Runbook

Use this checklist during production incidents.

1) Identify and triage
- Define scope: API down? Auth failures? File uploads? DB locked?
- Capture timestamps, error messages, and recent changes (deploys, infra events).

2) Quick health checks
- API: GET /health returns 200
- Metrics: GET /metrics is reachable (behind auth/allowlist)
- Logs: check Node logs and log shipper (Loki/Elastic) if enabled
- DB: `sqlite3 $DATABASE_URL "PRAGMA integrity_check;"`

3) Common issues and actions
- Port conflict: ensure only one instance on PORT; restart service
- Env validation failures: JWT_SECRET/SESSION_SECRET length; fix and restart
- CSRF 403s en masse: confirm proxy preserves cookies and `trust proxy` set; check domain/origin
- CORS failures: update `CORS_ORIGINS` to include requesting origin
- File upload failures: verify `FILE_STORAGE_PROVIDER`, local path perms, S3 creds
- Rate limit bursts: adjust `RATE_LIMIT_*` envs temporarily

4) Database-specific
- Locked DB: check long-running processes, ensure single-writer pattern; VACUUM during low traffic
- Corruption suspected: take emergency backup; use BACKUPS-RUNBOOK to restore latest good snapshot

5) Rollback/restore
- Roll back to previous app version (container/image or commit)
- Restore DB from last known good backup using BACKUPS-RUNBOOK

6) Post-incident
- Document root cause, timeline, and corrective actions
- Add tests or alerts to prevent recurrence

Contacts & Escalation
- Infra owner: <name/email>
- App owner: <name/email>
- On-call: <rotation link>


