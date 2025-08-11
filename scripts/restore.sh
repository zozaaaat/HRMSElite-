#!/bin/bash

# HRMS Elite Database Restore Script
# Restores the SQLite database from backup files
# Author: HRMS Elite Team
# Version: 1.0

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/.backup"
DATABASE_FILE="$PROJECT_ROOT/dev.db"
LOG_FILE="$BACKUP_DIR/restore.log"
TEMP_DIR="$BACKUP_DIR/temp"

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

# Function to show usage
show_usage() {
    echo "HRMS Elite Database Restore Script"
    echo ""
    echo "Usage: $0 [OPTIONS] <backup_file>"
    echo ""
    echo "Options:"
    echo "  --help, -h           Show this help message"
    echo "  --list, -l           List available backups"
    echo "  --latest             Restore from the latest backup"
    echo "  --dry-run            Show what would be done without executing"
    echo "  --force              Force restore without confirmation"
    echo "  --validate-only      Only validate backup file without restoring"
    echo ""
    echo "Examples:"
    echo "  $0 --latest                    # Restore from latest backup"
    echo "  $0 hrms_backup_20241201_120000.db.gz  # Restore specific backup"
    echo "  $0 --list                      # List available backups"
    echo ""
    echo "This script restores the HRMS Elite database from backup files."
    echo "It will create a backup of the current database before restoring."
}

# Function to list available backups
list_backups() {
    echo -e "${BLUE}Available Backups:${NC}"
    echo ""
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        echo -e "${RED}No backup directory found: $BACKUP_DIR${NC}"
        return 1
    fi
    
    local backup_files=$(find "$BACKUP_DIR" -name "hrms_backup_*.db.gz" -type f 2>/dev/null | sort -r)
    
    if [[ -z "$backup_files" ]]; then
        echo -e "${YELLOW}No backup files found in: $BACKUP_DIR${NC}"
        return 1
    fi
    
    echo "Backup Directory: $BACKUP_DIR"
    echo ""
    printf "%-30s %-20s %-15s %s\n" "Filename" "Date" "Size" "Status"
    echo "----------------------------------------------------------------"
    
    while IFS= read -r backup_file; do
        local filename=$(basename "$backup_file")
        local file_date=$(stat -c %y "$backup_file" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
        local file_size=$(du -h "$backup_file" | cut -f1)
        
        # Check if backup is valid
        if gzip -t "$backup_file" 2>/dev/null; then
            local status="${GREEN}✓ Valid${NC}"
        else
            local status="${RED}✗ Corrupt${NC}"
        fi
        
        printf "%-30s %-20s %-15s %s\n" "$filename" "$file_date" "$file_size" "$status"
    done <<< "$backup_files"
    
    echo ""
    echo -e "${BLUE}Total Backups: $(echo "$backup_files" | wc -l)${NC}"
}

# Function to get latest backup
get_latest_backup() {
    local latest_backup=$(find "$BACKUP_DIR" -name "hrms_backup_*.db.gz" -type f 2>/dev/null | sort -r | head -n1)
    
    if [[ -z "$latest_backup" ]]; then
        log "ERROR" "No backup files found in: $BACKUP_DIR"
        return 1
    fi
    
    echo "$latest_backup"
}

# Function to validate backup file
validate_backup() {
    local backup_file="$1"
    
    log "INFO" "Validating backup file: $backup_file"
    
    # Check if file exists
    if [[ ! -f "$backup_file" ]]; then
        log "ERROR" "Backup file not found: $backup_file"
        return 1
    fi
    
    # Check if file is readable
    if [[ ! -r "$backup_file" ]]; then
        log "ERROR" "Cannot read backup file: $backup_file"
        return 1
    fi
    
    # Check if file is compressed
    if ! file "$backup_file" | grep -q "gzip compressed data"; then
        log "ERROR" "Backup file is not a valid gzip compressed file: $backup_file"
        return 1
    fi
    
    # Test gzip integrity
    if ! gzip -t "$backup_file"; then
        log "ERROR" "Backup file is corrupted: $backup_file"
        return 1
    fi
    
    # Extract and validate SQLite database
    log "INFO" "Extracting backup to validate SQLite database..."
    
    mkdir -p "$TEMP_DIR"
    local temp_db="$TEMP_DIR/temp_restore.db"
    
    if gzip -dc "$backup_file" > "$temp_db"; then
        # Check if it's a valid SQLite database
        if command -v sqlite3 >/dev/null 2>&1; then
            if sqlite3 "$temp_db" "PRAGMA integrity_check;" | grep -q "ok"; then
                log "SUCCESS" "Backup file is valid and contains a healthy SQLite database"
                rm -f "$temp_db"
                return 0
            else
                log "ERROR" "Backup contains a corrupted SQLite database"
                rm -f "$temp_db"
                return 1
            fi
        else
            log "WARNING" "sqlite3 not found, skipping database integrity check"
            rm -f "$temp_db"
            return 0
        fi
    else
        log "ERROR" "Failed to extract backup file"
        rm -f "$temp_db"
        return 1
    fi
}

# Function to create backup of current database
backup_current_database() {
    if [[ -f "$DATABASE_FILE" ]]; then
        local timestamp=$(date '+%Y%m%d_%H%M%S')
        local current_backup="$BACKUP_DIR/pre_restore_backup_${timestamp}.db.gz"
        
        log "INFO" "Creating backup of current database before restore..."
        
        if gzip -c "$DATABASE_FILE" > "$current_backup"; then
            log "SUCCESS" "Current database backed up to: $current_backup"
            return 0
        else
            log "ERROR" "Failed to backup current database"
            return 1
        fi
    else
        log "INFO" "No current database found, skipping backup"
        return 0
    fi
}

# Function to restore database
restore_database() {
    local backup_file="$1"
    local force_restore="${2:-false}"
    
    log "INFO" "=== HRMS Elite Database Restore Started ==="
    
    # Validate backup file
    if ! validate_backup "$backup_file"; then
        log "ERROR" "Backup validation failed, aborting restore"
        return 1
    fi
    
    # Create backup of current database
    if ! backup_current_database; then
        if [[ "$force_restore" != "true" ]]; then
            log "ERROR" "Failed to backup current database, aborting restore"
            return 1
        else
            log "WARNING" "Force mode enabled, proceeding without current database backup"
        fi
    fi
    
    # Stop any running processes that might be using the database
    log "INFO" "Checking for processes using the database..."
    
    # On Linux, we can check for processes using the database file
    if command -v lsof >/dev/null 2>&1; then
        local processes=$(lsof "$DATABASE_FILE" 2>/dev/null | grep -v PID || true)
        if [[ -n "$processes" ]]; then
            log "WARNING" "Database is being used by other processes:"
            echo "$processes"
            if [[ "$force_restore" != "true" ]]; then
                log "ERROR" "Please stop all processes using the database before restoring"
                return 1
            else
                log "WARNING" "Force mode enabled, proceeding anyway"
            fi
        fi
    fi
    
    # Create project root directory if it doesn't exist
    mkdir -p "$(dirname "$DATABASE_FILE")"
    
    # Restore the database
    log "INFO" "Restoring database from: $backup_file"
    
    if gzip -dc "$backup_file" > "$DATABASE_FILE"; then
        log "SUCCESS" "Database restored successfully"
        
        # Set proper permissions
        chmod 644 "$DATABASE_FILE"
        
        # Validate restored database
        if command -v sqlite3 >/dev/null 2>&1; then
            if sqlite3 "$DATABASE_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
                log "SUCCESS" "Restored database integrity verified"
            else
                log "ERROR" "Restored database integrity check failed"
                return 1
            fi
        fi
        
        # Get database info
        local db_size=$(du -h "$DATABASE_FILE" | cut -f1)
        log "INFO" "Restored database size: $db_size"
        
        log "INFO" "=== HRMS Elite Database Restore Completed Successfully ==="
        echo -e "${GREEN}✅ Database restored successfully${NC}"
        return 0
    else
        log "ERROR" "Failed to restore database"
        return 1
    fi
}

# Function to confirm restore
confirm_restore() {
    local backup_file="$1"
    
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will replace the current database!${NC}"
    echo ""
    echo "Backup file: $backup_file"
    echo "Target database: $DATABASE_FILE"
    echo ""
    
    if [[ -f "$DATABASE_FILE" ]]; then
        echo -e "${BLUE}Current database will be backed up before restore${NC}"
    fi
    
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " -r
    echo
    
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        return 0
    else
        echo -e "${YELLOW}Restore cancelled${NC}"
        return 1
    fi
}

# Main execution
main() {
    local backup_file=""
    local force_restore=false
    local dry_run=false
    local validate_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_usage
                exit 0
                ;;
            --list|-l)
                list_backups
                exit 0
                ;;
            --latest)
                backup_file=$(get_latest_backup)
                if [[ $? -ne 0 ]]; then
                    exit 1
                fi
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --force)
                force_restore=true
                shift
                ;;
            --validate-only)
                validate_only=true
                shift
                ;;
            -*)
                echo -e "${RED}Unknown option: $1${NC}"
                show_usage
                exit 1
                ;;
            *)
                if [[ -z "$backup_file" ]]; then
                    backup_file="$1"
                else
                    echo -e "${RED}Multiple backup files specified${NC}"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # If no backup file specified, try to use latest
    if [[ -z "$backup_file" ]]; then
        backup_file=$(get_latest_backup)
        if [[ $? -ne 0 ]]; then
            echo -e "${RED}No backup file specified and no backups found${NC}"
            show_usage
            exit 1
        fi
    fi
    
    # If backup file is relative, make it absolute
    if [[ ! "$backup_file" = /* ]]; then
        backup_file="$BACKUP_DIR/$backup_file"
    fi
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    if [[ "$dry_run" == "true" ]]; then
        echo "DRY RUN MODE - No actual restore will be performed"
        echo "Backup file: $backup_file"
        echo "Target database: $DATABASE_FILE"
        echo "Force mode: $force_restore"
        exit 0
    fi
    
    if [[ "$validate_only" == "true" ]]; then
        if validate_backup "$backup_file"; then
            echo -e "${GREEN}✅ Backup file is valid${NC}"
            exit 0
        else
            echo -e "${RED}❌ Backup file is invalid${NC}"
            exit 1
        fi
    fi
    
    # Confirm restore unless force mode is enabled
    if [[ "$force_restore" != "true" ]]; then
        if ! confirm_restore "$backup_file"; then
            exit 1
        fi
    fi
    
    # Perform restore
    if restore_database "$backup_file" "$force_restore"; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@" 