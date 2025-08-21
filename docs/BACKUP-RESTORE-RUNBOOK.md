# Backup and Restore Runbook

Step-by-step instructions to verify backups and perform restore drills.

## Verify Recent Backups
1. List backup files and confirm a recent timestamp:
```bash
ls -l backups/
```
2. Check automated backup workflow status in GitHub Actions or your scheduler.

## Manual Backup
Run a manual backup when needed:
```bash
npm run db:backup
```

## Restore Drill
1. Select the latest backup file:
```bash
LATEST=$(ls -t backups/database/*.db | head -n 1)
```
2. Restore to a temporary database and validate integrity:
```bash
sqlite3 :memory: ".restore $LATEST"
sqlite3 :memory: "PRAGMA integrity_check;"
```
3. Document results and clean up temporary files.

## Best Practices
- Store `DB_BACKUP_ENCRYPTION_KEY` securely and keep backups off-site.
- Test restore procedures regularly (at least quarterly).
- After any incident, perform a full backup and verify it.
