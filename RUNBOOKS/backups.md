# Backups Runbook

Use this guide to create, verify, and restore database backups.

## Create Backup
1. Set required environment variables:
   - `DB_BACKUP_DIR`
   - `DB_BACKUP_ENCRYPTION_KEY`
   - `DATABASE_URL`
2. Run `npm run db:backup`.
3. Confirm the archive appears in `$DB_BACKUP_DIR`.

## Restore Backup
1. Ensure the target database is not in use.
2. Run `npm run db:restore` and select the desired archive.
3. Validate with `sqlite3 <db> "PRAGMA integrity_check;"`.

## Schedule & Retention
- Configure `DB_BACKUP_SCHEDULE` (default `0 2 * * *`).
- Rotate archives using `DB_BACKUP_RETENTION_DAILY|WEEKLY|MONTHLY`.

## Security
- Store `DB_BACKUP_ENCRYPTION_KEY` in a secret manager.
- Restrict file permissions on the backup directory.
