# HRMS Elite Database Backup Script (PowerShell)
# Runs every 6 hours to backup the SQLite database
# Author: HRMS Elite Team
# Version: 1.0

param(
    [switch]$Help,
    [switch]$DryRun,
    [switch]$Force,
    [int]$MaxBackups = 24,
    [int]$CompressionLevel = 9
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BackupDir = Join-Path $ProjectRoot ".backup"
$DatabaseFile = Join-Path $ProjectRoot "dev.db"
$LogFile = Join-Path $BackupDir "backup.log"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Logging function
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [$Level] $Message"
    
    Write-Host $logMessage -ForegroundColor $(if ($Level -eq "ERROR") { $Red } elseif ($Level -eq "SUCCESS") { $Green } elseif ($Level -eq "WARNING") { $Yellow } else { $Blue })
    Add-Content -Path $LogFile -Value $logMessage -ErrorAction SilentlyContinue
}

# Show help
if ($Help) {
    Write-Host "HRMS Elite Database Backup Script (PowerShell)" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Usage: .\backup.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Help              Show this help message"
    Write-Host "  -DryRun            Show what would be done without executing"
    Write-Host "  -Force             Force backup even if database is locked"
    Write-Host "  -MaxBackups <int>  Maximum number of backups to keep (default: 24)"
    Write-Host "  -CompressionLevel <int> Compression level 1-9 (default: 9)"
    Write-Host ""
    Write-Host "This script creates compressed backups of the HRMS Elite database"
    Write-Host "and automatically rotates old backups to maintain disk space."
    exit 0
}

# Dry run mode
if ($DryRun) {
    Write-Host "DRY RUN MODE - No actual backup will be created" -ForegroundColor $Yellow
    Write-Host "Database: $DatabaseFile"
    Write-Host "Backup directory: $BackupDir"
    Write-Host "Max backups: $MaxBackups"
    Write-Host "Compression level: $CompressionLevel"
    exit 0
}

# Main backup function
function Start-Backup {
    Write-Log "INFO" "=== HRMS Elite Backup Started ==="
    
    # Create backup directory
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Log "INFO" "Created backup directory: $BackupDir"
    }
    
    # Check if database exists
    if (-not (Test-Path $DatabaseFile)) {
        Write-Log "ERROR" "Database file not found: $DatabaseFile"
        exit 1
    }
    
    # Check if database is readable
    try {
        $null = Get-Item $DatabaseFile -ErrorAction Stop
    }
    catch {
        Write-Log "ERROR" "Cannot read database file: $DatabaseFile"
        exit 1
    }
    
    # Validate database integrity (if sqlite3 is available)
    Write-Log "INFO" "Validating database integrity..."
    try {
        $sqlite3Path = Get-Command sqlite3 -ErrorAction Stop
        $result = & sqlite3 $DatabaseFile "PRAGMA integrity_check;" 2>$null
        if ($result -eq "ok") {
            Write-Log "SUCCESS" "Database integrity check passed"
        } else {
            Write-Log "ERROR" "Database integrity check failed"
            if (-not $Force) {
                exit 1
            }
        }
    }
    catch {
        Write-Log "WARNING" "sqlite3 not found, skipping integrity check"
    }
    
    # Check disk space
    $drive = (Get-Item $BackupDir).PSDrive
    $freeSpace = $drive.Free / 1KB
    $dbSize = (Get-Item $DatabaseFile).Length / 1KB
    $requiredSpace = $dbSize * 3
    
    if ($freeSpace -lt $requiredSpace) {
        Write-Log "WARNING" "Low disk space: $([math]::Round($freeSpace, 2))KB available, $([math]::Round($requiredSpace, 2))KB recommended"
        if (-not $Force) {
            Write-Log "ERROR" "Insufficient disk space, aborting backup"
            exit 1
        }
    } else {
        Write-Log "INFO" "Disk space check passed: $([math]::Round($freeSpace, 2))KB available"
    }
    
    # Create backup
    Write-Log "INFO" "Starting backup process..."
    Write-Log "INFO" "Database: $DatabaseFile"
    
    $backupFile = Join-Path $BackupDir "hrms_backup_$Timestamp.db.gz"
    Write-Log "INFO" "Backup file: $backupFile"
    
    # Create compressed backup
    try {
        $content = [System.IO.File]::ReadAllBytes($DatabaseFile)
        $memoryStream = [System.IO.MemoryStream]::new()
        $compressed = [System.IO.Compression.GZipStream]::new(
            $memoryStream, 
            [System.IO.Compression.CompressionMode]::Compress
        )
        $compressed.Write($content, 0, $content.Length)
        $compressed.Close()
        [System.IO.File]::WriteAllBytes($backupFile, $memoryStream.ToArray())
        
        $backupSize = (Get-Item $backupFile).Length
        Write-Log "SUCCESS" "Backup created successfully: $backupFile ($([math]::Round($backupSize/1KB, 2))KB)"
        
        # Verify backup integrity
        Write-Log "INFO" "Verifying backup integrity..."
        $fileStream = [System.IO.File]::OpenRead($backupFile)
        $compressed = [System.IO.Compression.GZipStream]::new(
            $fileStream, 
            [System.IO.Compression.CompressionMode]::Decompress
        )
        $decompressed = [System.IO.MemoryStream]::new()
        $compressed.CopyTo($decompressed)
        $compressed.Close()
        $fileStream.Close()
        
        if ($decompressed.Length -eq $content.Length) {
            Write-Log "SUCCESS" "Backup integrity verified"
        } else {
            Write-Log "ERROR" "Backup integrity check failed"
            Remove-Item $backupFile -Force
            exit 1
        }
    }
    catch {
        Write-Log "ERROR" "Failed to create backup: $($_.Exception.Message)"
        exit 1
    }
    
    # Rotate old backups
    Write-Log "INFO" "Checking for old backups to rotate..."
    
    $backupFiles = Get-ChildItem -Path $BackupDir -Filter "hrms_backup_*.db.gz" | Sort-Object LastWriteTime
    $backupCount = $backupFiles.Count
    
    if ($backupCount -gt $MaxBackups) {
        $filesToRemove = $backupCount - $MaxBackups
        Write-Log "INFO" "Removing $filesToRemove old backup(s)..."
        
        # Remove oldest backups
        $backupFiles | Select-Object -First $filesToRemove | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Log "INFO" "Removed old backup: $($_.Name)"
        }
    } else {
        Write-Log "INFO" "No old backups to remove (current: $backupCount, max: $MaxBackups)"
    }
    
    # Create backup summary
    Write-Log "INFO" "Creating backup summary..."
    $summaryFile = Join-Path $BackupDir "backup_summary.txt"
    
    $summary = @"
HRMS Elite Database Backup Summary
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Backup Directory: $BackupDir
Database File: $DatabaseFile
Max Backups Kept: $MaxBackups

Current Backups:
"@
    
    $currentBackups = Get-ChildItem -Path $BackupDir -Filter "hrms_backup_*.db.gz" | Sort-Object LastWriteTime
    foreach ($backup in $currentBackups) {
        $summary += "`n  $($backup.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')) - $($backup.Name) ($([math]::Round($backup.Length/1KB, 2))KB)"
    }
    
    $totalSize = ($currentBackups | Measure-Object -Property Length -Sum).Sum
    $summary += "`n`nTotal Backups: $($currentBackups.Count)"
    $summary += "`nTotal Size: $([math]::Round($totalSize/1KB, 2))KB"
    
    $summary += "`n`nLast Backup Log:`n"
    if (Test-Path $LogFile) {
        $summary += (Get-Content $LogFile -Tail 20) -join "`n"
    } else {
        $summary += "No log file found"
    }
    
    Set-Content -Path $summaryFile -Value $summary
    Write-Log "INFO" "Backup summary created: $summaryFile"
    
    Write-Log "INFO" "=== HRMS Elite Backup Completed Successfully ==="
    Write-Host "✅ Backup completed successfully" -ForegroundColor $Green
    Write-Host "Backup file: $backupFile"
    Write-Host "Log file: $LogFile"
}

# Run backup
try {
    Start-Backup
}
catch {
    Write-Log "ERROR" "Backup failed: $($_.Exception.Message)"
    exit 1
} 