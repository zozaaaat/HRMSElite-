# Incident Runbook

Checklist for responding to production incidents.

## Identify and Triage
1. Define scope (API, auth, uploads, database).
2. Capture timestamps, error messages, and recent changes.

## Quick Health Checks
- `GET /health` returns `200`.
- `GET /metrics` is reachable.
- Logs show no unexpected spikes.
- `sqlite3 $DATABASE_URL "PRAGMA integrity_check;"` succeeds.

## Common Issues
- Port conflict: ensure only one service uses the target port.
- Missing environment variables: verify `JWT_SECRET` and `SESSION_SECRET`.
- CSRF errors: proxy must preserve cookies and `trust proxy` should be set.

## Rollback/Restore
1. Roll back to the previous deployment.
2. Restore the database using the backups runbook.

## Post-Incident
- Document root cause, timeline, and corrective actions.
- Add tests or alerts to prevent recurrence.

## Contacts
- Infra owner: <name/email>
- App owner: <name/email>
- On-call: <rotation link>
