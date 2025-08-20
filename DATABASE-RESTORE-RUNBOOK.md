# Database Restore Runbook

## Overview
This runbook provides step-by-step procedures for database backup, restore, and disaster recovery operations for the HRMS Elite system.

## Prerequisites

### System Requirements
- Node.js 16+ with npm/yarn
- SQLite 3.x or SQLCipher
- Sufficient disk space (minimum 3x database size)
- Access to backup storage location

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=./data/hrms.db
DB_ENCRYPTION_ENABLED=true
DB_ENCRYPTION_KEY=your-32-byte-hex-key
# DB_ENCRYPTION_KEY_PREVIOUS=old-key-for-rotation

# Backup Configuration
DB_BACKUP_DIR=./backups
DB_BACKUP_ENCRYPTION_KEY=your-backup-encryption-key
DB_BACKUP_SCHEDULE="0 2 * * *"
DB_BACKUP_RETENTION_DAILY=7
DB_BACKUP_RETENTION_WEEKLY=4
DB_BACKUP_RETENTION_MONTHLY=12

# Security Configuration
NODE_ENV=production
DB_AUDIT_ENABLED=true
```

## Key Rotation
1. Generate a new 32+ character key.
2. Set `DB_ENCRYPTION_KEY` to the new key and `DB_ENCRYPTION_KEY_PREVIOUS` to the old key.
3. Restart the application to re-encrypt the database at startup.
4. Remove `DB_ENCRYPTION_KEY_PREVIOUS` once rotation is verified.

## Backup Procedures

### 1. Manual Backup Creation

#### Standard Backup
```bash
# Create immediate backup
npm run db:backup

# Expected output:
# 🔄 Creating database backup...
# ✅ Backup created successfully:
# ID: backup-2025-01-19T12-30-00-000Z-a1b2c3d4
# Size: 15.67 MB
# Encrypted: true
# Compressed: true
```

#### Verify Backup Integrity
```bash
# Test the latest backup
npm run db:test-restore

# Test specific backup
npm run db:test-restore backup-2025-01-19T12-30-00-000Z-a1b2c3d4
```

### 2. Automated Backup Scheduling

#### Enable Scheduled Backups
```typescript
import { dbBackupManager } from './server/utils/dbBackup';

// Start scheduled backups (runs automatically in production)
dbBackupManager.startScheduledBackups();
```

#### Monitor Backup Status
```bash
# Check backup status
npm run db:security-status
```

## Restore Procedures

### 1. Emergency Restore (Production Downtime)

#### Step 1: Stop Application Services
```bash
# Stop the application
pm2 stop hrms-elite
# or
docker-compose down
```

#### Step 2: Backup Current Database
```bash
# Create emergency backup of current state
cp $DATABASE_URL ${DATABASE_URL}.emergency-backup-$(date +%Y%m%d-%H%M%S)
```

#### Step 3: List Available Backups
```bash
# List all available backups
tsx server/utils/dbBackup.ts --list

# Output:
# 📋 Available backups:
# backup-2025-01-19T12-30-00-000Z-a1b2c3d4 | 2025-01-19T12:30:00.000Z | 15.67MB | scheduled
# backup-2025-01-19T06-00-00-000Z-b2c3d4e5 | 2025-01-19T06:00:00.000Z | 15.45MB | scheduled
```

#### Step 4: Restore from Backup
```bash
# Restore specific backup
npm run db:restore backup-2025-01-19T12-30-00-000Z-a1b2c3d4

# Expected output:
# 🔄 Restoring database from backup: backup-2025-01-19T12-30-00-000Z-a1b2c3d4
# ✅ Database restored successfully
```

#### Step 5: Verify Restore
```bash
# Test database connectivity
npm run db:security-status

# Check application functionality
npm run dev
# Navigate to http://localhost:3000/health
```

#### Step 6: Restart Services
```bash
# Restart the application
pm2 start hrms-elite
# or
docker-compose up -d
```

### 2. Point-in-Time Recovery

#### Step 1: Identify Recovery Point
```bash
# List backups with timestamps
tsx server/utils/dbBackup.ts --list

# Choose backup closest to desired recovery point
```

#### Step 2: Create Test Environment
```bash
# Create test database for verification
npm run db:restore backup-id --target ./test-restore.db
```

#### Step 3: Verify Data Integrity
```bash
# Test restore in staging environment
DB_PATH=./test-restore.db npm run db:test-restore backup-id
```

#### Step 4: Apply to Production (if verified)
```bash
# Follow Emergency Restore procedure above
```

### 3. Partial Data Recovery

#### Restore Specific Tables
```sql
-- Attach backup database
ATTACH DATABASE 'backup.db' AS backup;

-- Copy specific table
INSERT INTO main.employees SELECT * FROM backup.employees 
WHERE created_at > '2025-01-19 00:00:00';

-- Detach backup
DETACH DATABASE backup;
```

## Data Recovery Scenarios

### 1. Corruption Detection and Recovery

#### Symptoms
- Database file corruption errors
- Inconsistent query results
- Application crashes on database operations

#### Recovery Steps
```bash
# 1. Stop application immediately
pm2 stop hrms-elite

# 2. Check database integrity
sqlite3 $DATABASE_URL "PRAGMA integrity_check;"

# 3. If corruption detected, restore from latest backup
npm run db:restore $(tsx server/utils/dbBackup.ts --list | head -1 | cut -d' ' -f1)

# 4. Verify integrity of restored database
npm run db:security-status

# 5. Restart application
pm2 start hrms-elite
```

### 2. Accidental Data Deletion

#### Recovery Steps
```bash
# 1. Immediately stop write operations
# 2. Identify last known good backup before deletion
tsx server/utils/dbBackup.ts --list

# 3. Restore to test environment
npm run db:restore backup-id --target ./recovery-test.db

# 4. Extract deleted data
sqlite3 ./recovery-test.db "SELECT * FROM table_name WHERE conditions;"

# 5. Apply recovered data to production (carefully)
```

### 3. Schema Migration Rollback

#### Preparation
```bash
# Always create backup before migrations
npm run db:backup
# Note the backup ID for potential rollback
```

#### Rollback Process
```bash
# 1. Stop application
pm2 stop hrms-elite

# 2. Restore pre-migration backup
npm run db:restore backup-id-before-migration

# 3. Verify schema version
npm run db:security-status

# 4. Restart application
pm2 start hrms-elite
```

## Disaster Recovery

### 1. Complete System Loss

#### Recovery Procedure
```bash
# 1. Set up new system environment
# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with production values

# 4. Restore from latest backup
npm run db:restore latest-backup-id

# 5. Verify system functionality
npm run test:security
npm run dev

# 6. Deploy to production
npm run build
pm2 start ecosystem.config.js
```

### 2. Backup Storage Loss

#### Prevention
- Multiple backup locations (local + cloud)
- Regular backup verification
- Offsite backup rotation

#### Recovery
```bash
# 1. Check alternative backup locations
ls -la /backup/offsite/
ls -la /backup/cloud/

# 2. Restore from alternative source
npm run db:restore /backup/offsite/backup-id

# 3. Re-establish backup procedures
npm run db:backup
```

## Testing and Validation

### 1. Regular Backup Testing

#### Weekly Backup Validation
```bash
#!/bin/bash
# weekly-backup-test.sh

# Get latest backup
LATEST_BACKUP=$(tsx server/utils/dbBackup.ts --list | head -1 | cut -d' ' -f1)

# Test restore
echo "Testing restore for backup: $LATEST_BACKUP"
npm run db:test-restore $LATEST_BACKUP

if [ $? -eq 0 ]; then
    echo "✅ Weekly backup test passed"
else
    echo "❌ Weekly backup test failed - Alert administrators"
    exit 1
fi
```

### 2. Disaster Recovery Drills

#### Monthly DR Drill
1. Create test environment
2. Simulate disaster scenario
3. Execute restore procedures
4. Verify data integrity
5. Document lessons learned

#### Quarterly Full DR Test
1. Complete system rebuild
2. Full restore from backups
3. Application functionality testing
4. Performance validation
5. Update procedures based on findings

## Monitoring and Alerts

### 1. Backup Monitoring

#### Key Metrics
- Backup creation success/failure
- Backup file size trends
- Backup completion time
- Storage space utilization

#### Alert Conditions
```javascript
// Example monitoring conditions
const alerts = {
  backupFailed: 'Backup creation failed',
  backupSizeAnomaly: 'Backup size changed >20% from average',
  backupDelayed: 'Backup not completed within expected timeframe',
  storageSpaceLow: 'Backup storage <10% free space'
};
```

### 2. Recovery Monitoring

#### Success Criteria
- Database integrity check passes
- Application starts successfully
- Core functionality verified
- Performance within acceptable range

## Security Considerations

### 1. Backup Encryption
- All backups encrypted with AES-256
- Separate encryption keys for database and backups
- Key rotation procedures

### 2. Access Control
- Backup access limited to authorized personnel
- Audit logging for all backup/restore operations
- Multi-factor authentication for critical operations

### 3. Data Privacy
- PII masking in non-production restores
- Secure deletion of temporary files
- Compliance with data protection regulations

## Troubleshooting

### Common Issues

#### 1. Backup Creation Fails
```bash
# Check disk space
df -h

# Check permissions
ls -la $DB_BACKUP_DIR

# Check database locks
lsof $DATABASE_URL

# Manual backup with verbose logging
DEBUG=* npm run db:backup
```

#### 2. Restore Fails
```bash
# Verify backup integrity
npm run db:test-restore backup-id

# Check target path permissions
ls -la $(dirname $DATABASE_URL)

# Manual restore with error details
tsx server/utils/dbBackup.ts --restore backup-id --verbose
```

#### 3. Performance Issues After Restore
```bash
# Analyze database
sqlite3 $DATABASE_URL "ANALYZE;"

# Vacuum database
sqlite3 $DATABASE_URL "VACUUM;"

# Check WAL mode
sqlite3 $DATABASE_URL "PRAGMA journal_mode;"
```

## Contact Information

### Emergency Contacts
- **Database Administrator**: [Contact Info]
- **System Administrator**: [Contact Info]
- **Development Team Lead**: [Contact Info]

### Escalation Procedures
1. **Level 1**: Application restart, basic troubleshooting
2. **Level 2**: Database restore from recent backup
3. **Level 3**: Full disaster recovery procedures
4. **Level 4**: Vendor support engagement

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-19 | Initial version | HRMS Elite Team |

---

*This runbook should be reviewed quarterly and updated as procedures evolve.*
