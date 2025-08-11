# HRMS Elite Database Backup System

This directory contains comprehensive backup and restore scripts for the HRMS Elite SQLite database. The system provides multiple script formats for different operating systems and includes advanced features like compression, rotation, validation, and logging.

## 📁 Files Overview

### Backup Scripts
- **`backup.sh`** - Linux/macOS bash script
- **`backup.bat`** - Windows batch script
- **`backup.ps1`** - Windows PowerShell script (recommended)

### Restore Scripts
- **`restore.sh`** - Linux/macOS bash script
- **`restore.bat`** - Windows batch script
- **`restore.ps1`** - Windows PowerShell script (recommended)

## 🚀 Quick Start

### For Windows Users (Recommended)
```powershell
# Create a backup
.\scripts\backup.ps1

# Restore from latest backup
.\scripts\restore.ps1 -Latest

# List available backups
.\scripts\restore.ps1 -List
```

### For Linux/macOS Users
```bash
# Make scripts executable
chmod +x scripts/backup.sh scripts/restore.sh

# Create a backup
./scripts/backup.sh

# Restore from latest backup
./scripts/restore.sh --latest

# List available backups
./scripts/restore.sh --list
```

## 📋 Features

### ✅ Backup Features
- **Automatic Compression**: Uses gzip compression to reduce backup size
- **Database Validation**: Checks database integrity before backup
- **Backup Rotation**: Automatically removes old backups (keeps 24 by default)
- **Disk Space Check**: Warns if insufficient disk space
- **Comprehensive Logging**: Detailed logs with timestamps
- **Backup Summary**: Creates summary report after each backup
- **Cross-Platform**: Works on Windows, Linux, and macOS

### ✅ Restore Features
- **Safe Restore**: Creates backup of current database before restoring
- **Backup Validation**: Validates backup file integrity before restore
- **Process Detection**: Warns if database is in use
- **Multiple Restore Options**: Latest backup, specific backup, or list backups
- **Dry Run Mode**: Preview what would be done without executing
- **Force Mode**: Bypass safety checks when needed

## 🔧 Configuration

### Backup Settings
- **Backup Directory**: `.backup/` (relative to project root)
- **Database File**: `dev.db` (relative to project root)
- **Max Backups**: 24 (6 days with 4 backups per day)
- **Compression Level**: 9 (maximum compression)
- **Log Files**: `backup.log` and `restore.log`

### Customization
You can modify these settings in the script files:

```powershell
# In backup.ps1
$MaxBackups = 24  # Change number of backups to keep
$CompressionLevel = 9  # Change compression level (1-9)
```

## 📖 Usage Examples

### Backup Operations

#### Create a Backup
```powershell
# Basic backup
.\scripts\backup.ps1

# Backup with custom settings
.\scripts\backup.ps1 -MaxBackups 48 -CompressionLevel 6

# Dry run (preview only)
.\scripts\backup.ps1 -DryRun

# Force backup (ignore warnings)
.\scripts\backup.ps1 -Force
```

#### Linux/macOS Backup
```bash
# Basic backup
./scripts/backup.sh

# Dry run
./scripts/backup.sh --dry-run

# Force backup
./scripts/backup.sh --force
```

### Restore Operations

#### Restore from Latest Backup
```powershell
# Restore from latest backup (with confirmation)
.\scripts\restore.ps1 -Latest

# Force restore (no confirmation)
.\scripts\restore.ps1 -Latest -Force

# Dry run
.\scripts\restore.ps1 -Latest -DryRun
```

#### Restore Specific Backup
```powershell
# Restore specific backup file
.\scripts\restore.ps1 "hrms_backup_20241201_120000.db.gz"

# Validate backup without restoring
.\scripts\restore.ps1 "hrms_backup_20241201_120000.db.gz" -ValidateOnly
```

#### List Available Backups
```powershell
# List all backups with details
.\scripts\restore.ps1 -List
```

#### Linux/macOS Restore
```bash
# Restore from latest backup
./scripts/restore.sh --latest

# List backups
./scripts/restore.sh --list

# Restore specific backup
./scripts/restore.sh hrms_backup_20241201_120000.db.gz
```

## 🔄 Automated Backups

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to run every 6 hours
4. Action: Start a program
5. Program: `powershell.exe`
6. Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\HRMSElite\scripts\backup.ps1"`

### Linux/macOS Cron
Add to crontab (`crontab -e`):
```bash
# Run backup every 6 hours
0 */6 * * * /path/to/HRMSElite/scripts/backup.sh
```

### GitHub Actions (CI/CD)
Add to `.github/workflows/backup.yml`:
```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create Backup
        run: |
          chmod +x scripts/backup.sh
          ./scripts/backup.sh
```

## 📊 Backup File Naming

Backup files follow this naming convention:
```
hrms_backup_YYYYMMDD_HHMMSS.db.gz
```

Example:
```
hrms_backup_20241201_143022.db.gz
```

## 📁 Directory Structure

After running backups, your `.backup/` directory will contain:
```
.backup/
├── hrms_backup_20241201_120000.db.gz
├── hrms_backup_20241201_180000.db.gz
├── hrms_backup_20241202_000000.db.gz
├── backup.log
├── restore.log
├── backup_summary.txt
└── temp/  # Temporary files during restore
```

## 🔍 Monitoring and Logs

### Log Files
- **`backup.log`**: Detailed backup operation logs
- **`restore.log`**: Detailed restore operation logs
- **`backup_summary.txt`**: Summary of all backups

### Log Format
```
2024-12-01 14:30:22 [INFO] === HRMS Elite Backup Started ===
2024-12-01 14:30:22 [INFO] Starting backup process...
2024-12-01 14:30:22 [SUCCESS] Backup created successfully
2024-12-01 14:30:22 [INFO] === HRMS Elite Backup Completed Successfully ===
```

## ⚠️ Important Notes

### Before Restoring
1. **Stop the Application**: Ensure no processes are using the database
2. **Verify Backup**: Use `-ValidateOnly` to check backup integrity
3. **Test Restore**: Use `-DryRun` to preview the restore operation
4. **Backup Current**: The script automatically backs up current database before restore

### Security Considerations
- Backup files contain sensitive data - secure the `.backup/` directory
- Consider encrypting backup files for additional security
- Regularly test restore procedures
- Keep backups in multiple locations

### Performance
- Backup size depends on database size and compression level
- Higher compression levels (9) reduce size but increase CPU usage
- Restore operations are typically faster than backup operations

## 🛠️ Troubleshooting

### Common Issues

#### "Database file not found"
- Ensure `dev.db` exists in the project root
- Check file permissions

#### "Insufficient disk space"
- Free up disk space or use `-Force` flag
- Consider reducing `MaxBackups` setting

#### "Backup integrity check failed"
- Database may be corrupted
- Try running database repair tools
- Use `-Force` flag to proceed anyway

#### "Cannot read database file"
- Check file permissions
- Ensure no other processes are locking the file

### Getting Help
```powershell
# Show help for backup script
.\scripts\backup.ps1 -Help

# Show help for restore script
.\scripts\restore.ps1 -Help
```

## 📈 Best Practices

1. **Regular Testing**: Test restore procedures monthly
2. **Multiple Locations**: Keep backups in different locations
3. **Monitoring**: Set up alerts for backup failures
4. **Documentation**: Document any custom configurations
5. **Version Control**: Keep backup scripts in version control
6. **Security**: Secure backup files and access to backup scripts

## 🔗 Related Documentation

- [HRMS Elite Project Documentation](../docs/)
- [Database Schema](../shared/schema.ts)
- [Deployment Guide](../deploy/README.md)
- [Security Implementation](../SECURITY-IMPLEMENTATION.md)

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Author**: HRMS Elite Team 