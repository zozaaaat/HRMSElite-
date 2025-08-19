### Backups Runbook (SQLite)

Scope: server/utils/dbBackup.ts provides backup/restore and retention tooling.

Environment variables
- DB_BACKUP_DIR: folder for backups (default ./backups)
- DB_BACKUP_ENCRYPTION_KEY: required for encrypted archives
- DB_BACKUP_COMPRESSION: true/false (default true)
- DB_BACKUP_RETENTION_DAILY|WEEKLY|MONTHLY: default 7/4/12
- DB_BACKUP_SCHEDULE: cron (default 0 2 * * *)
- DATABASE_URL: SQLite db path (default dev.db)

Manual operations
- Create backup: `npm run db:backup`
- Restore backup: `npm run db:restore` (will prompt for target path via args if provided in script)
- Test restore: `npm run db:test-restore`

Examples
```
# Ad-hoc backup
DB_BACKUP_DIR=./backups \
DB_BACKUP_ENCRYPTION_KEY=change-me \
DATABASE_URL=./data/hrms.db \
npm run db:backup

# Restore latest backup to a temp location
DB_BACKUP_DIR=./backups \
DB_BACKUP_ENCRYPTION_KEY=change-me \
DATABASE_URL=./data/hrms.db \
npm run db:restore
```

Validation
- After restore: `sqlite3 ./data/hrms.db "PRAGMA integrity_check;"`
- Check WAL mode and vacuum periodically.

Retention
- Configure retention env vars; rotate using a scheduled job (e.g., systemd timer, cron, or container scheduler).

Security
- Store DB_BACKUP_ENCRYPTION_KEY in a secret store; never commit to VCS.
- Restrict backup directory permissions.


