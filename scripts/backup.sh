#!/bin/bash

# HRMS Elite Database Backup Script
# Runs every 6 hours to backup the SQLite database
# Author: HRMS Elite Team
# Version: 1.0

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/.backup"
DATABASE_FILE="$PROJECT_ROOT/dev.db"
LOG_FILE="$BACKUP_DIR/backup.log"
MAX_BACKUPS=24  # Keep 6 days of backups (4 per day)
COMPRESSION_LEVEL=9

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Function to check if database exists
check_database() {
    if [[ ! -f "$DATABASE_FILE" ]]; then
        log "ERROR" "Database file not found: $DATABASE_FILE"
        exit 1
    fi
    
    if [[ ! -r "$DATABASE_FILE" ]]; then
        log "ERROR" "Cannot read database file: $DATABASE_FILE"
        exit 1
    fi
}

# Function to create backup directory
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log "INFO" "Created backup directory: $BACKUP_DIR"
    fi
}

# Function to create backup
create_backup() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/hrms_backup_${timestamp}.db.gz"
    
    log "INFO" "Starting backup process..."
    log "INFO" "Database: $DATABASE_FILE"
    log "INFO" "Backup file: $backup_file"
    
    # Create backup with compression
    if gzip -c -$COMPRESSION_LEVEL "$DATABASE_FILE" > "$backup_file"; then
        local backup_size=$(du -h "$backup_file" | cut -f1)
        log "SUCCESS" "Backup created successfully: $backup_file (${backup_size})"
        
        # Verify backup integrity
        if gzip -t "$backup_file"; then
            log "SUCCESS" "Backup integrity verified"
        else
            log "ERROR" "Backup integrity check failed"
            rm -f "$backup_file"
            exit 1
        fi
    else
        log "ERROR" "Failed to create backup"
        exit 1
    fi
}

# Function to rotate old backups
rotate_backups() {
    log "INFO" "Checking for old backups to rotate..."
    
    local backup_count=$(find "$BACKUP_DIR" -name "hrms_backup_*.db.gz" | wc -l)
    
    if [[ $backup_count -gt $MAX_BACKUPS ]]; then
        local files_to_remove=$((backup_count - MAX_BACKUPS))
        log "INFO" "Removing $files_to_remove old backup(s)..."
        
        # Remove oldest backups
        find "$BACKUP_DIR" -name "hrms_backup_*.db.gz" -type f -printf '%T@ %p\n' | \
        sort -n | head -n "$files_to_remove" | \
        while read timestamp file; do
            rm -f "$file"
            log "INFO" "Removed old backup: $(basename "$file")"
        done
    else
        log "INFO" "No old backups to remove (current: $backup_count, max: $MAX_BACKUPS)"
    fi
}

# Function to create backup summary
create_summary() {
    local summary_file="$BACKUP_DIR/backup_summary.txt"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > "$summary_file" << EOF
HRMS Elite Database Backup Summary
Generated: $timestamp

Backup Directory: $BACKUP_DIR
Database File: $DATABASE_FILE
Max Backups Kept: $MAX_BACKUPS

Current Backups:
$(find "$BACKUP_DIR" -name "hrms_backup_*.db.gz" -type f -printf '%T@ %p %s\n' | sort -n | while read timestamp file size; do
    local date=$(date -d "@$timestamp" '+%Y-%m-%d %H:%M:%S')
    local size_human=$(numfmt --to=iec $size)
    echo "  $date - $(basename "$file") ($size_human)"
done)

Total Backups: $(find "$BACKUP_DIR" -name "hrms_backup_*.db.gz" | wc -l)
Total Size: $(du -sh "$BACKUP_DIR" | cut -f1)

Last Backup Log:
$(tail -n 20 "$LOG_FILE" 2>/dev/null || echo "No log file found")
EOF

    log "INFO" "Backup summary created: $summary_file"
}

# Function to check disk space
check_disk_space() {
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required_space=$(du -s "$DATABASE_FILE" | cut -f1)
    
    # Require at least 3x the database size as available space
    local required_space_kb=$((required_space * 3))
    
    if [[ $available_space -lt $required_space_kb ]]; then
        log "WARNING" "Low disk space: ${available_space}KB available, ${required_space_kb}KB recommended"
        return 1
    fi
    
    log "INFO" "Disk space check passed: ${available_space}KB available"
    return 0
}

# Function to validate database integrity
validate_database() {
    log "INFO" "Validating database integrity..."
    
    if command -v sqlite3 >/dev/null 2>&1; then
        if sqlite3 "$DATABASE_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
            log "SUCCESS" "Database integrity check passed"
            return 0
        else
            log "ERROR" "Database integrity check failed"
            return 1
        fi
    else
        log "WARNING" "sqlite3 not found, skipping integrity check"
        return 0
    fi
}

# Main execution
main() {
    log "INFO" "=== HRMS Elite Backup Started ==="
    
    # Check if running as root (not recommended)
    if [[ $EUID -eq 0 ]]; then
        log "WARNING" "Running as root is not recommended"
    fi
    
    # Create backup directory
    create_backup_dir
    
    # Check database exists and is readable
    check_database
    
    # Validate database integrity
    if ! validate_database; then
        log "ERROR" "Database validation failed, aborting backup"
        exit 1
    fi
    
    # Check disk space
    if ! check_disk_space; then
        log "WARNING" "Proceeding with backup despite low disk space"
    fi
    
    # Create backup
    create_backup
    
    # Rotate old backups
    rotate_backups
    
    # Create summary
    create_summary
    
    log "INFO" "=== HRMS Elite Backup Completed Successfully ==="
    echo -e "${GREEN}✅ Backup completed successfully${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "HRMS Elite Database Backup Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --dry-run      Show what would be done without executing"
        echo "  --force        Force backup even if database is locked"
        echo ""
        echo "This script creates compressed backups of the HRMS Elite database"
        echo "and automatically rotates old backups to maintain disk space."
        exit 0
        ;;
    --dry-run)
        echo "DRY RUN MODE - No actual backup will be created"
        echo "Database: $DATABASE_FILE"
        echo "Backup directory: $BACKUP_DIR"
        echo "Max backups: $MAX_BACKUPS"
        exit 0
        ;;
    --force)
        log "INFO" "Force mode enabled"
        ;;
    "")
        # Normal execution
        ;;
    *)
        log "ERROR" "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac

# Run main function
main "$@" 