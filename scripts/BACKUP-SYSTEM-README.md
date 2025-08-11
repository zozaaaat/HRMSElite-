# HRMS Elite Backup System

## 📋 Overview

The HRMS Elite backup system provides comprehensive database backup and restore functionality with automated scheduling. The system includes scripts for multiple operating systems and advanced features like compression, rotation, validation, and detailed logging.

## 🚀 Quick Start

### Automated Setup (Recommended)

#### For Linux/macOS:
```bash
# Make scripts executable
chmod +x scripts/backup.sh scripts/restore.sh scripts/setup-backup-schedule.sh

# Set up automated backups (runs every 6 hours)
sudo ./scripts/setup-backup-schedule.sh --install

# Check status
./scripts/setup-backup-schedule.sh --status
```

#### For Windows:
```powershell
# Set up automated backups (runs every 6 hours)
# Run PowerShell as Administrator
.\scripts\setup-backup-schedule.ps1 install

# Check status
.\scripts\setup-backup-schedule.ps1 status
```

### Manual Backup Operations

#### Linux/macOS:
```bash
# Create a backup
./scripts/backup.sh

# Restore from latest backup
./scripts/restore.sh --latest

# List available backups
./scripts/restore.sh --list
```

#### Windows:
```powershell
# Create a backup
.\scripts\backup.ps1

# Restore from latest backup
.\scripts\restore.ps1 -Latest

# List available backups
.\scripts\restore.ps1 -List
```

## 📁 File Structure

```
scripts/
├── backup.sh                    # Linux/macOS backup script
├── backup.ps1                   # Windows PowerShell backup script
├── backup.bat                   # Windows batch backup script
├── restore.sh                   # Linux/macOS restore script
├── restore.ps1                  # Windows PowerShell restore script
├── restore.bat                  # Windows batch restore script
├── setup-backup-schedule.sh     # Linux/macOS schedule setup
├── setup-backup-schedule.ps1    # Windows schedule setup
└── BACKUP-README.md            # Detailed documentation
```

## 🔧 Features

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

### ✅ Scheduling Features
- **Automated Setup**: Easy installation of scheduled backups
- **Cross-Platform**: Works with cron (Linux/macOS) and Task Scheduler (Windows)
- **Flexible Configuration**: Customizable backup intervals
- **Status Monitoring**: Check backup schedule status
- **Easy Management**: Install, remove, and manage scheduled tasks

## ⚙️ Configuration

### Backup Settings
- **Backup Directory**: `.backup/` (relative to project root)
- **Database File**: `dev.db` (relative to project root)
- **Max Backups**: 24 (6 days with 4 backups per day)
- **Compression Level**: 9 (maximum compression)
- **Log Files**: `backup.log`, `restore.log`, and `cron.log`
- **Schedule**: Every 6 hours (configurable)

### Customization
You can modify these settings in the script files:

```bash
# In backup.sh
MAX_BACKUPS=24  # Change number of backups to keep
COMPRESSION_LEVEL=9  # Change compression level (1-9)
```

```powershell
# In backup.ps1
$MaxBackups = 24  # Change number of backups to keep
$CompressionLevel = 9  # Change compression level (1-9)
```

## 📖 Usage Examples

### Schedule Management

#### Install Backup Schedule
```bash
# Linux/macOS
sudo ./scripts/setup-backup-schedule.sh --install

# Windows (as Administrator)
.\scripts\setup-backup-schedule.ps1 install
```

#### Remove Backup Schedule
```bash
# Linux/macOS
sudo ./scripts/setup-backup-schedule.sh --remove

# Windows (as Administrator)
.\scripts\setup-backup-schedule.ps1 remove
```

#### Check Schedule Status
```bash
# Linux/macOS
./scripts/setup-backup-schedule.sh --status

# Windows
.\scripts\setup-backup-schedule.ps1 status
```

#### List Scheduled Tasks
```bash
# Linux/macOS
./scripts/setup-backup-schedule.sh --list

# Windows
.\scripts\setup-backup-schedule.ps1 list
```

### Backup Operations

#### Create a Backup
```bash
# Linux/macOS
./scripts/backup.sh

# Windows
.\scripts\backup.ps1
```

#### Test Backup Script
```bash
# Linux/macOS
./scripts/backup.sh --dry-run

# Windows
.\scripts\backup.ps1 -DryRun
```

### Restore Operations

#### Restore from Latest Backup
```bash
# Linux/macOS
./scripts/restore.sh --latest

# Windows
.\scripts\restore.ps1 -Latest
```

#### Restore Specific Backup
```bash
# Linux/macOS
./scripts/restore.sh hrms_backup_20241201_120000.db.gz

# Windows
.\scripts\restore.ps1 "hrms_backup_20241201_120000.db.gz"
```

#### Validate Backup File
```bash
# Linux/macOS
./scripts/restore.sh --validate-only hrms_backup_20241201_120000.db.gz

# Windows
.\scripts\restore.ps1 -ValidateOnly "hrms_backup_20241201_120000.db.gz"
```

## 🔄 Automated Scheduling

### Linux/macOS (Cron)
The setup script automatically creates a cron job that runs every 6 hours:
```bash
0 */6 * * * /path/to/HRMSElite/scripts/backup.sh >> /path/to/HRMSElite/.backup/cron.log 2>&1
```

### Windows (Task Scheduler)
The setup script creates a scheduled task that runs every 6 hours with these settings:
- **Task Name**: "HRMS Elite Database Backup"
- **Trigger**: Every 6 hours
- **Action**: PowerShell script execution
- **Run Level**: Highest privileges

### Manual Cron Setup (Alternative)
If you prefer to set up cron manually:
```bash
# Edit crontab
crontab -e

# Add this line for every 6 hours
0 */6 * * * /path/to/HRMSElite/scripts/backup.sh >> /path/to/HRMSElite/.backup/cron.log 2>&1
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
├── cron.log
├── backup_summary.txt
└── temp/  # Temporary files during restore
```

## 🔍 Monitoring and Logs

### Log Files
- **`backup.log`**: Detailed backup operation logs
- **`restore.log`**: Detailed restore operation logs
- **`cron.log`**: Scheduled backup execution logs
- **`backup_summary.txt`**: Summary of all backups

### Log Format
```
2024-12-01 14:30:22 [INFO] === HRMS Elite Backup Started ===
2024-12-01 14:30:22 [INFO] Starting backup process...
2024-12-01 14:30:22 [SUCCESS] Backup created successfully
2024-12-01 14:30:22 [INFO] === HRMS Elite Backup Completed Successfully ===
```

### Monitoring Commands
```bash
# Monitor backup logs in real-time
tail -f .backup/backup.log

# Monitor scheduled backup execution
tail -f .backup/cron.log

# Check backup summary
cat .backup/backup_summary.txt
```

## ⚠️ Important Notes

### Before Restoring
1. **Stop the Application**: Ensure no processes are using the database
2. **Verify Backup**: Use validation options to check backup integrity
3. **Test Restore**: Use dry run mode to preview the restore operation
4. **Backup Current**: The script automatically backs up current database before restore

### Security Considerations
- Backup files contain sensitive data - secure the `.backup/` directory
- Consider encrypting backup files for additional security
- Regularly test restore procedures
- Keep backups in multiple locations
- Restrict access to backup scripts and directories

### Performance
- Backup size depends on database size and compression level
- Higher compression levels (9) reduce size but increase CPU usage
- Restore operations are typically faster than backup operations
- Scheduled backups run in the background without user interaction

## 🛠️ Troubleshooting

### Common Issues

#### "Database file not found"
- Ensure `dev.db` exists in the project root
- Check file permissions
- Verify the database file path in the script

#### "Insufficient disk space"
- Free up disk space or use `--force` flag
- Consider reducing `MaxBackups` setting
- Check available space with `df -h`

#### "Backup integrity check failed"
- Database may be corrupted
- Try running database repair tools
- Use `--force` flag to proceed anyway

#### "Cannot read database file"
- Check file permissions
- Ensure no other processes are locking the file
- Try stopping the application first

#### "Scheduled task creation failed"
- Ensure you're running as Administrator (Windows)
- Ensure you're running as root (Linux/macOS)
- Check Task Scheduler service is running (Windows)
- Check cron service is running (Linux/macOS)

### Getting Help
```bash
# Show help for backup script
./scripts/backup.sh --help

# Show help for restore script
./scripts/restore.sh --help

# Show help for schedule setup
./scripts/setup-backup-schedule.sh --help
```

```powershell
# Show help for Windows scripts
.\scripts\backup.ps1 -Help
.\scripts\restore.ps1 -Help
.\scripts\setup-backup-schedule.ps1 help
```

## 📈 Best Practices

1. **Regular Testing**: Test restore procedures monthly
2. **Multiple Locations**: Keep backups in different locations
3. **Monitoring**: Set up alerts for backup failures
4. **Documentation**: Document any custom configurations
5. **Version Control**: Keep backup scripts in version control
6. **Security**: Secure backup files and access to backup scripts
7. **Automation**: Use scheduled backups for consistency
8. **Validation**: Regularly validate backup integrity
9. **Rotation**: Maintain appropriate backup retention policies
10. **Monitoring**: Monitor backup logs for errors

## 🔗 Related Documentation

- [HRMS Elite Project Documentation](../docs/)
- [Database Schema](../shared/schema.ts)
- [Deployment Guide](../deploy/README.md)
- [Security Implementation](../SECURITY-IMPLEMENTATION.md)
- [Monitoring Setup](../monitoring/README.md)

## 📞 Support

For issues with the backup system:
1. Check the troubleshooting section above
2. Review the log files for error details
3. Test the backup script manually
4. Verify system requirements and permissions

---

**Last Updated**: December 2024  
**Version**: 2.0  
**Author**: HRMS Elite Team
