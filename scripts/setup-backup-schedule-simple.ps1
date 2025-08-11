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

# Logging function
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "$timestamp [$Level] $Message"
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
    
    try {
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$BackupScript`""
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 6) -RepetitionDuration (New-TimeSpan -Days 365)
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
        
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
    Write-Host "Current Scheduled Tasks:"
    $tasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "*HRMS*" -or $_.TaskName -like "*Backup*" }
    
    if ($tasks) {
        $tasks | Format-Table -Property TaskName, State, LastRunTime, NextRunTime -AutoSize
    } else {
        Write-Host "No HRMS Elite scheduled tasks found"
    }
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
    Write-Host "HRMS Elite Backup Schedule Status"
    Write-Host "=================================="
    Write-Host ""
    Write-Host "Project Root: $ProjectRoot"
    Write-Host "Backup Script: $BackupScript"
    Write-Host "Backup Directory: $BackupDir"
    Write-Host ""
    
    if (Test-Path $BackupScript) {
        Write-Host "Backup Script: ✓ Found"
    } else {
        Write-Host "Backup Script: ✗ Not Found"
    }
    
    if (Test-Path $BackupDir) {
        Write-Host "Backup Directory: ✓ Exists"
    } else {
        Write-Host "Backup Directory: ✗ Not Found"
    }
    
    Write-Host ""
    Write-Host "Scheduled Task Status:"
    if (Test-ScheduledTask) {
        $task = Get-ScheduledTask -TaskName $TaskName
        Write-Host "Scheduled Task: ✓ Active ($($task.State))"
        Write-Host "Last Run: $($task.LastRunTime)"
        Write-Host "Next Run: $($task.NextRunTime)"
    } else {
        Write-Host "Scheduled Task: ✗ Not Found"
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
    Write-Host "Examples:"
    Write-Host "  .\setup-backup-schedule-simple.ps1 install"
    Write-Host "  .\setup-backup-schedule-simple.ps1 remove"
    Write-Host "  .\setup-backup-schedule-simple.ps1 status"
    Write-Host ""
    Write-Host "This script sets up automated database backups every 6 hours."
    Write-Host "Must be run as Administrator to modify scheduled tasks."
}

# Main execution
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
            Write-Host "✅ Backup schedule installed successfully"
            Write-Host ""
            Write-Host "Next backup will run in 6 hours"
            Write-Host ""
            Write-Host "To monitor backups:"
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
                Write-Host "✅ Backup schedule removed successfully"
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
