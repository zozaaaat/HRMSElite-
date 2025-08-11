# HRMS Elite Backup Schedule Setup Script for Windows
# Sets up automated database backups every 6 hours using Task Scheduler
# Author: HRMS Elite Team
# Version: 1.0

param(
    [Parameter(Position=0)]
    [ValidateSet("install", "remove", "status", "list", "test", "help")]
    [string]$Action = "install",
    
    [switch]$Force,
    [switch]$DryRun
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BackupScript = Join-Path $ScriptDir "backup.ps1"
$BackupDir = Join-Path $ProjectRoot ".backup"
$TaskName = "HRMS Elite Database Backup"
$TaskDescription = "Automated database backup for HRMS Elite - runs every 6 hours"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$ResetColor = ""

# Logging function
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { $Red }
        "SUCCESS" { $Green }
        "WARNING" { $Yellow }
        default { $Blue }
    }
    Write-Host "$timestamp [$Level] $Message" -ForegroundColor $color
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to check if backup script exists
function Test-BackupScript {
    if (-not (Test-Path $BackupScript)) {
        Write-Log "ERROR" "Backup script not found: $BackupScript"
        exit 1
    }
    
    Write-Log "SUCCESS" "Backup script found: $BackupScript"
}

# Function to create backup directory
function New-BackupDirectory {
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Log "INFO" "Created backup directory: $BackupDir"
    }
    
    Write-Log "SUCCESS" "Backup directory ready: $BackupDir"
}

# Function to check if scheduled task exists
function Test-ScheduledTask {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    return $null -ne $task
}

# Function to create scheduled task
function New-ScheduledTask {
    Write-Log "INFO" "Creating scheduled task: $TaskName"
    
    # Create action
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$BackupScript`""
    
    # Create trigger (every 6 hours)
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 6) -RepetitionDuration (New-TimeSpan -Days 365)
    
    # Create settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    # Create principal (run as current user)
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
    
    # Register the task
    try {
        Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $TaskDescription -Force
        Write-Log "SUCCESS" "Scheduled task created successfully"
        return $true
    }
    catch {
        Write-Log "ERROR" "Failed to create scheduled task: $($_.Exception.Message)"
        return $false
    }
}

# Function to remove scheduled task
function Remove-ScheduledTask {
    Write-Log "INFO" "Removing scheduled task: $TaskName"
    
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Log "SUCCESS" "Scheduled task removed successfully"
        return $true
    }
    catch {
        Write-Log "ERROR" "Failed to remove scheduled task: $($_.Exception.Message)"
        return $false
    }
}

# Function to list scheduled tasks
function Get-ScheduledTasks {
    Write-Host "`n$Blue Current Scheduled Tasks:$ResetColor" -ForegroundColor $Blue
    Write-Host ""
    
    $tasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "*HRMS*" -or $_.TaskName -like "*Backup*" }
    
    if ($tasks) {
        $tasks | Format-Table -Property TaskName, State, LastRunTime, NextRunTime -AutoSize
    } else {
        Write-Host "$Yellow No HRMS Elite scheduled tasks found$ResetColor" -ForegroundColor $Yellow
    }
    
    Write-Host "`n$Blue All Scheduled Tasks:$ResetColor" -ForegroundColor $Blue
    Write-Host ""
    Get-ScheduledTask | Format-Table -Property TaskName, State -AutoSize
}

# Function to test backup script
function Test-BackupScriptExecution {
    Write-Log "INFO" "Testing backup script..."
    
    try {
        & $BackupScript -DryRun
        Write-Log "SUCCESS" "Backup script test passed"
        return $true
    }
    catch {
        Write-Log "ERROR" "Backup script test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to show status
function Show-Status {
    Write-Host "$Blue HRMS Elite Backup Schedule Status$ResetColor" -ForegroundColor $Blue
    Write-Host "=================================="
    Write-Host ""
    Write-Host "Project Root: $Green$ProjectRoot$ResetColor" -ForegroundColor $Green
    Write-Host "Backup Script: $Green$BackupScript$ResetColor" -ForegroundColor $Green
    Write-Host "Backup Directory: $Green$BackupDir$ResetColor" -ForegroundColor $Green
    Write-Host ""
    
    # Check if backup script exists
    if (Test-Path $BackupScript) {
        Write-Host "Backup Script: $Green✓ Found$ResetColor" -ForegroundColor $Green
    } else {
        Write-Host "Backup Script: $Red✗ Not Found$ResetColor" -ForegroundColor $Red
    }
    
    # Check if backup directory exists
    if (Test-Path $BackupDir) {
        Write-Host "Backup Directory: $Green✓ Exists$ResetColor" -ForegroundColor $Green
    } else {
        Write-Host "Backup Directory: $Red✗ Not Found$ResetColor" -ForegroundColor $Red
    }
    
    # Check scheduled task
    Write-Host ""
    Write-Host "$Blue Scheduled Task Status:$ResetColor" -ForegroundColor $Blue
    if (Test-ScheduledTask) {
        $task = Get-ScheduledTask -TaskName $TaskName
        Write-Host "Scheduled Task: $Green✓ Active ($($task.State))$ResetColor" -ForegroundColor $Green
        Write-Host "Last Run: $($task.LastRunTime)"
        Write-Host "Next Run: $($task.NextRunTime)"
    } else {
        Write-Host "Scheduled Task: $Red✗ Not Found$ResetColor" -ForegroundColor $Red
    }
    
    Write-Host ""
}

# Function to show usage
function Show-Usage {
    Write-Host "HRMS Elite Backup Schedule Setup Script for Windows"
    Write-Host ""
    Write-Host "Usage: $($MyInvocation.MyCommand.Name) [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  install            Install backup scheduled task (default)"
    Write-Host "  remove             Remove backup scheduled task"
    Write-Host "  status             Show current status"
    Write-Host "  list               List scheduled tasks"
    Write-Host "  test               Test backup script"
    Write-Host "  help               Show this help message"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -Force             Force operation without confirmation"
    Write-Host "  -DryRun            Show what would be done without executing"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\setup-backup-schedule.ps1 install    # Install backup schedule"
    Write-Host "  .\setup-backup-schedule.ps1 remove     # Remove backup schedule"
    Write-Host "  .\setup-backup-schedule.ps1 status     # Show current status"
    Write-Host "  .\setup-backup-schedule.ps1 list       # List scheduled tasks"
    Write-Host ""
    Write-Host "This script sets up automated database backups every 6 hours."
    Write-Host "Must be run as Administrator to modify scheduled tasks."
}

# Main execution
function Main {
    switch ($Action) {
        "install" {
            Write-Log "INFO" "=== HRMS Elite Backup Schedule Installation ==="
            
            if (-not (Test-Administrator)) {
                Write-Log "ERROR" "This script must be run as Administrator"
                Write-Log "ERROR" "Please run PowerShell as Administrator"
                exit 1
            }
            
            Test-BackupScript
            New-BackupDirectory
            
            if (Test-ScheduledTask) {
                Write-Log "WARNING" "Backup scheduled task already exists"
                if (-not $Force) {
                    $response = Read-Host "Do you want to replace it? (y/N)"
                    if ($response -notmatch "^[Yy]$") {
                        Write-Log "INFO" "Installation cancelled"
                        exit 0
                    }
                }
                Remove-ScheduledTask
            }
            
            if (New-ScheduledTask) {
                Write-Log "SUCCESS" "=== Backup Schedule Installation Completed ==="
                Write-Host "$Green✅ Backup schedule installed successfully$ResetColor" -ForegroundColor $Green
                Write-Host ""
                Write-Host "$Blue Next backup will run in 6 hours$ResetColor" -ForegroundColor $Blue
                Write-Host ""
                Write-Host "$Blue To monitor backups:$ResetColor" -ForegroundColor $Blue
                Write-Host "  Get-Content $BackupDir\backup.log -Wait"
                Write-Host "  Get-Content $BackupDir\cron.log -Wait"
            } else {
                Write-Log "ERROR" "=== Backup Schedule Installation Failed ==="
                exit 1
            }
        }
        
        "remove" {
            Write-Log "INFO" "=== HRMS Elite Backup Schedule Removal ==="
            
            if (-not (Test-Administrator)) {
                Write-Log "ERROR" "This script must be run as Administrator"
                exit 1
            }
            
            if (Test-ScheduledTask) {
                if (Remove-ScheduledTask) {
                    Write-Log "SUCCESS" "=== Backup Schedule Removal Completed ==="
                    Write-Host "$Green✅ Backup schedule removed successfully$ResetColor" -ForegroundColor $Green
                } else {
                    Write-Log "ERROR" "=== Backup Schedule Removal Failed ==="
                    exit 1
                }
            } else {
                Write-Log "INFO" "No backup scheduled task found to remove"
            }
        }
        
        "status" {
            Show-Status
        }
        
        "list" {
            Get-ScheduledTasks
        }
        
        "test" {
            Test-BackupScriptExecution
        }
        
        "help" {
            Show-Usage
        }
        
        default {
            Write-Log "ERROR" "Unknown action: $Action"
            Show-Usage
            exit 1
        }
    }
}

# Run main function
Main
