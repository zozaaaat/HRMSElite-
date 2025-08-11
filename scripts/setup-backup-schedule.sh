#!/bin/bash

# HRMS Elite Backup Schedule Setup Script
# Sets up automated database backups every 6 hours using cron
# Author: HRMS Elite Team
# Version: 1.0

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
CRON_JOB="0 */6 * * * $BACKUP_SCRIPT >> $PROJECT_ROOT/.backup/cron.log 2>&1"

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
    echo -e "${timestamp} [${level}] ${message}"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log "INFO" "Running as root - this is required for cron setup"
        return 0
    else
        log "ERROR" "This script must be run as root to modify crontab"
        log "ERROR" "Please run: sudo $0"
        exit 1
    fi
}

# Function to check if backup script exists and is executable
check_backup_script() {
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        log "ERROR" "Backup script not found: $BACKUP_SCRIPT"
        exit 1
    fi
    
    if [[ ! -x "$BACKUP_SCRIPT" ]]; then
        log "INFO" "Making backup script executable..."
        chmod +x "$BACKUP_SCRIPT"
    fi
    
    log "SUCCESS" "Backup script found and executable: $BACKUP_SCRIPT"
}

# Function to create backup directory
create_backup_dir() {
    local backup_dir="$PROJECT_ROOT/.backup"
    
    if [[ ! -d "$backup_dir" ]]; then
        mkdir -p "$backup_dir"
        log "INFO" "Created backup directory: $backup_dir"
    fi
    
    # Set proper permissions
    chmod 755 "$backup_dir"
    log "SUCCESS" "Backup directory ready: $backup_dir"
}

# Function to check if cron job already exists
check_existing_cron() {
    local current_user=$(whoami)
    local existing_jobs=$(crontab -l 2>/dev/null | grep -c "$BACKUP_SCRIPT" || echo "0")
    
    if [[ $existing_jobs -gt 0 ]]; then
        log "WARNING" "Backup cron job already exists for user: $current_user"
        return 0
    else
        log "INFO" "No existing backup cron job found"
        return 1
    fi
}

# Function to add cron job
add_cron_job() {
    local current_user=$(whoami)
    local temp_cron=$(mktemp)
    
    log "INFO" "Setting up cron job for user: $current_user"
    log "INFO" "Backup will run every 6 hours"
    
    # Get existing crontab
    crontab -l 2>/dev/null > "$temp_cron" || true
    
    # Add HRMS Elite backup job
    echo "" >> "$temp_cron"
    echo "# HRMS Elite Database Backup - Runs every 6 hours" >> "$temp_cron"
    echo "$CRON_JOB" >> "$temp_cron"
    echo "" >> "$temp_cron"
    
    # Install new crontab
    if crontab "$temp_cron"; then
        log "SUCCESS" "Cron job added successfully"
        rm -f "$temp_cron"
        return 0
    else
        log "ERROR" "Failed to add cron job"
        rm -f "$temp_cron"
        return 1
    fi
}

# Function to remove cron job
remove_cron_job() {
    local current_user=$(whoami)
    local temp_cron=$(mktemp)
    
    log "INFO" "Removing HRMS Elite backup cron job for user: $current_user"
    
    # Get existing crontab and remove HRMS Elite entries
    crontab -l 2>/dev/null | grep -v "HRMS Elite" | grep -v "$BACKUP_SCRIPT" > "$temp_cron" || true
    
    # Install updated crontab
    if crontab "$temp_cron"; then
        log "SUCCESS" "Cron job removed successfully"
        rm -f "$temp_cron"
        return 0
    else
        log "ERROR" "Failed to remove cron job"
        rm -f "$temp_cron"
        return 1
    fi
}

# Function to list current cron jobs
list_cron_jobs() {
    local current_user=$(whoami)
    
    echo -e "${BLUE}Current Cron Jobs for User: $current_user${NC}"
    echo ""
    
    local jobs=$(crontab -l 2>/dev/null | grep -E "(HRMS Elite|$BACKUP_SCRIPT)" || echo "No HRMS Elite cron jobs found")
    
    if [[ "$jobs" == "No HRMS Elite cron jobs found" ]]; then
        echo -e "${YELLOW}$jobs${NC}"
    else
        echo "$jobs"
    fi
    
    echo ""
    echo -e "${BLUE}All Cron Jobs:${NC}"
    echo ""
    crontab -l 2>/dev/null || echo "No cron jobs found"
}

# Function to test backup script
test_backup_script() {
    log "INFO" "Testing backup script..."
    
    if "$BACKUP_SCRIPT" --dry-run; then
        log "SUCCESS" "Backup script test passed"
        return 0
    else
        log "ERROR" "Backup script test failed"
        return 1
    fi
}

# Function to show status
show_status() {
    echo -e "${BLUE}HRMS Elite Backup Schedule Status${NC}"
    echo "=================================="
    echo ""
    echo -e "Project Root: ${GREEN}$PROJECT_ROOT${NC}"
    echo -e "Backup Script: ${GREEN}$BACKUP_SCRIPT${NC}"
    echo -e "Backup Directory: ${GREEN}$PROJECT_ROOT/.backup${NC}"
    echo ""
    
    # Check if backup script exists
    if [[ -f "$BACKUP_SCRIPT" ]]; then
        echo -e "Backup Script: ${GREEN}✓ Found${NC}"
        if [[ -x "$BACKUP_SCRIPT" ]]; then
            echo -e "Executable: ${GREEN}✓ Yes${NC}"
        else
            echo -e "Executable: ${RED}✗ No${NC}"
        fi
    else
        echo -e "Backup Script: ${RED}✗ Not Found${NC}"
    fi
    
    # Check if backup directory exists
    if [[ -d "$PROJECT_ROOT/.backup" ]]; then
        echo -e "Backup Directory: ${GREEN}✓ Exists${NC}"
    else
        echo -e "Backup Directory: ${RED}✗ Not Found${NC}"
    fi
    
    # Check cron jobs
    echo ""
    echo -e "${BLUE}Cron Job Status:${NC}"
    local cron_count=$(crontab -l 2>/dev/null | grep -c "$BACKUP_SCRIPT" || echo "0")
    if [[ $cron_count -gt 0 ]]; then
        echo -e "Cron Job: ${GREEN}✓ Active ($cron_count job(s))${NC}"
    else
        echo -e "Cron Job: ${RED}✗ Not Found${NC}"
    fi
    
    echo ""
}

# Function to show usage
show_usage() {
    echo "HRMS Elite Backup Schedule Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h           Show this help message"
    echo "  --install            Install backup cron job (default)"
    echo "  --remove             Remove backup cron job"
    echo "  --status             Show current status"
    echo "  --list               List current cron jobs"
    echo "  --test               Test backup script"
    echo ""
    echo "Examples:"
    echo "  sudo $0 --install    # Install backup schedule"
    echo "  sudo $0 --remove     # Remove backup schedule"
    echo "  $0 --status          # Show current status"
    echo "  $0 --list            # List cron jobs"
    echo ""
    echo "This script sets up automated database backups every 6 hours."
    echo "Must be run as root to modify crontab."
}

# Main execution
main() {
    local action="install"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_usage
                exit 0
                ;;
            --install)
                action="install"
                shift
                ;;
            --remove)
                action="remove"
                shift
                ;;
            --status)
                action="status"
                shift
                ;;
            --list)
                action="list"
                shift
                ;;
            --test)
                action="test"
                shift
                ;;
            -*)
                echo -e "${RED}Unknown option: $1${NC}"
                show_usage
                exit 1
                ;;
            *)
                echo -e "${RED}Unknown argument: $1${NC}"
                show_usage
                exit 1
                ;;
        esac
    done
    
    case "$action" in
        install)
            log "INFO" "=== HRMS Elite Backup Schedule Installation ==="
            check_root
            check_backup_script
            create_backup_dir
            
            if check_existing_cron; then
                log "WARNING" "Backup cron job already exists"
                read -p "Do you want to replace it? (y/N): " -r
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    remove_cron_job
                else
                    log "INFO" "Installation cancelled"
                    exit 0
                fi
            fi
            
            if add_cron_job; then
                log "SUCCESS" "=== Backup Schedule Installation Completed ==="
                echo -e "${GREEN}✅ Backup schedule installed successfully${NC}"
                echo ""
                echo -e "${BLUE}Next backup will run at:${NC}"
                echo "  $(date -d "$(date -d 'next hour' | awk '{print $1, $2, $3, int($4/6)*6, $5, $6}')" '+%Y-%m-%d %H:%M:%S')"
                echo ""
                echo -e "${BLUE}To monitor backups:${NC}"
                echo "  tail -f $PROJECT_ROOT/.backup/cron.log"
                echo "  tail -f $PROJECT_ROOT/.backup/backup.log"
            else
                log "ERROR" "=== Backup Schedule Installation Failed ==="
                exit 1
            fi
            ;;
        remove)
            log "INFO" "=== HRMS Elite Backup Schedule Removal ==="
            check_root
            
            if check_existing_cron; then
                if remove_cron_job; then
                    log "SUCCESS" "=== Backup Schedule Removal Completed ==="
                    echo -e "${GREEN}✅ Backup schedule removed successfully${NC}"
                else
                    log "ERROR" "=== Backup Schedule Removal Failed ==="
                    exit 1
                fi
            else
                log "INFO" "No backup cron job found to remove"
            fi
            ;;
        status)
            show_status
            ;;
        list)
            list_cron_jobs
            ;;
        test)
            test_backup_script
            ;;
        *)
            log "ERROR" "Unknown action: $action"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
