# HRMS Elite Database Restore Script (PowerShell)
# Restores the SQLite database from backup files
# Author: HRMS Elite Team
# Version: 1.0

param(
    [string]$BackupFile,
    [switch]$Help,
    [switch]$List,
    [switch]$Latest,
    [switch]$DryRun,
    [switch]$Force,
    [switch]$ValidateOnly
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BackupDir = Join-Path $ProjectRoot ".backup"
$DatabaseFile = Join-Path $ProjectRoot "dev.db"
$LogFile = Join-Path $BackupDir "restore.log"
$TempDir = Join-Path $BackupDir "temp"

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
function Show-Help {
    Write-Host "HRMS Elite Database Restore Script (PowerShell)" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Usage: .\restore.ps1 [OPTIONS] [<backup_file>]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Help              Show this help message"
    Write-Host "  -List              List available backups"
    Write-Host "  -Latest            Restore from the latest backup"
    Write-Host "  -DryRun            Show what would be done without executing"
    Write-Host "  -Force             Force restore without confirmation"
    Write-Host "  -ValidateOnly      Only validate backup file without restoring"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\restore.ps1 -Latest                    # Restore from latest backup"
    Write-Host "  .\restore.ps1 hrms_backup_20241201_120000.db.gz  # Restore specific backup"
    Write-Host "  .\restore.ps1 -List                      # List available backups"
    Write-Host ""
    Write-Host "This script restores the HRMS Elite database from backup files."
    Write-Host "It will create a backup of the current database before restoring."
}

# List available backups
function Show-Backups {
    Write-Host "Available Backups:" -ForegroundColor $Blue
    Write-Host ""
    
    if (-not (Test-Path $BackupDir)) {
        Write-Host "No backup directory found: $BackupDir" -ForegroundColor $Red
        return 1
    }
    
    $backupFiles = Get-ChildItem -Path $BackupDir -Filter "hrms_backup_*.db.gz" | Sort-Object LastWriteTime -Descending
    
    if ($backupFiles.Count -eq 0) {
        Write-Host "No backup files found in: $BackupDir" -ForegroundColor $Yellow
        return 1
    }
    
    Write-Host "Backup Directory: $BackupDir"
    Write-Host ""
    Write-Host ("{0,-30} {1,-20} {2,-15} {3}" -f "Filename", "Date", "Size", "Status")
    Write-Host "----------------------------------------------------------------"
    
    foreach ($backup in $backupFiles) {
        $filename = $backup.Name
        $filedate = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $filesize = [math]::Round($backup.Length / 1KB, 2)
        
        # Check if backup is valid
        try {
            $compressed = [System.IO.Compression.GZipStream]::new(
                [System.IO.File]::OpenRead($backup.FullName), 
                [System.IO.Compression.CompressionMode]::Decompress
            )
            $decompressed = [System.IO.MemoryStream]::new()
            $compressed.CopyTo($decompressed)
            $compressed.Close()
            
            if ($decompressed.Length -gt 0) {
                $status = "Valid"
            } else {
                $status = "Corrupt"
            }
        }
        catch {
            $status = "✗ Corrupt"
        }
        
        Write-Host ("{0,-30} {1,-20} {2,-15} {3}" -f $filename, $filedate, "$filesize KB", $status)
    }
    
    Write-Host ""
    Write-Host "Total Backups: $($backupFiles.Count)" -ForegroundColor $Blue
}

# Get latest backup
function Get-LatestBackup {
    $backupFiles = Get-ChildItem -Path $BackupDir -Filter "hrms_backup_*.db.gz" | Sort-Object LastWriteTime -Descending
    
    if ($backupFiles.Count -eq 0) {
        Write-Log "ERROR" "No backup files found in: $BackupDir"
        return $null
    }
    
    return $backupFiles[0].FullName
}

# Validate backup file
function Test-BackupFile {
    param([string]$BackupPath)
    
    Write-Log "INFO" "Validating backup file: $BackupPath"
    
    # Check if file exists
    if (-not (Test-Path $BackupPath)) {
        Write-Log "ERROR" "Backup file not found: $BackupPath"
        return $false
    }
    
    # Check if file is readable
    try {
        $null = Get-Item $BackupPath -ErrorAction Stop
    }
    catch {
        Write-Log "ERROR" "Cannot read backup file: $BackupPath"
        return $false
    }
    
    # Test gzip integrity
    try {
        $compressed = [System.IO.Compression.GZipStream]::new(
            [System.IO.File]::OpenRead($BackupPath), 
            [System.IO.Compression.CompressionMode]::Decompress
        )
        $decompressed = [System.IO.MemoryStream]::new()
        $compressed.CopyTo($decompressed)
        $compressed.Close()
        
        if ($decompressed.Length -eq 0) {
            Write-Log "ERROR" "Backup file is corrupted: $BackupPath"
            return $false
        }
        
        Write-Log "SUCCESS" "Backup file is valid and contains a healthy database"
        return $true
    }
    catch {
        Write-Log "ERROR" "Backup file is corrupted: $BackupPath"
        return $false
    }
}

# Create backup of current database
function Backup-CurrentDatabase {
    if (Test-Path $DatabaseFile) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $currentBackup = Join-Path $BackupDir "pre_restore_backup_$timestamp.db.gz"
        
        Write-Log "INFO" "Creating backup of current database before restore..."
        
        try {
            $content = [System.IO.File]::ReadAllBytes($DatabaseFile)
            $compressed = [System.IO.Compression.GZipStream]::new(
                [System.IO.MemoryStream]::new(), 
                [System.IO.Compression.CompressionMode]::Compress
            )
            $compressed.Write($content, 0, $content.Length)
            $compressed.Close()
            [System.IO.File]::WriteAllBytes($currentBackup, $compressed.BaseStream.ToArray())
            
            Write-Log "SUCCESS" "Current database backed up to: $currentBackup"
            return $true
        }
        catch {
            Write-Log "ERROR" "Failed to backup current database: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Log "INFO" "No current database found, skipping backup"
        return $true
    }
}

# Restore database
function Restore-Database {
    param(
        [string]$BackupPath,
        [bool]$ForceRestore = $false
    )
    
    Write-Log "INFO" "=== HRMS Elite Database Restore Started ==="
    
    # Validate backup file
    if (-not (Test-BackupFile $BackupPath)) {
        Write-Log "ERROR" "Backup validation failed, aborting restore"
        return $false
    }
    
    # Create backup of current database
    if (-not (Backup-CurrentDatabase)) {
        if (-not $ForceRestore) {
            Write-Log "ERROR" "Failed to backup current database, aborting restore"
            return $false
        } else {
            Write-Log "WARNING" "Force mode enabled, proceeding without current database backup"
        }
    }
    
    # Check for processes using the database
    Write-Log "INFO" "Checking for processes using the database..."
    try {
        $processes = Get-Process | Where-Object { $_.Modules.FileName -like "*$DatabaseFile*" }
        if ($processes) {
            Write-Log "WARNING" "Database is being used by other processes:"
            $processes | ForEach-Object { Write-Log "WARNING" "  $($_.ProcessName) (PID: $($_.Id))" }
            
            if (-not $ForceRestore) {
                Write-Log "ERROR" "Please stop all processes using the database before restoring"
                return $false
            } else {
                Write-Log "WARNING" "Force mode enabled, proceeding anyway"
            }
        }
    }
    catch {
        Write-Log "INFO" "Could not check for processes using the database"
    }
    
    # Create project root directory if it doesn't exist
    $projectDir = Split-Path -Parent $DatabaseFile
    if (-not (Test-Path $projectDir)) {
        New-Item -ItemType Directory -Path $projectDir -Force | Out-Null
    }
    
    # Restore the database
    Write-Log "INFO" "Restoring database from: $BackupPath"
    
    try {
        $compressed = [System.IO.Compression.GZipStream]::new(
            [System.IO.File]::OpenRead($BackupPath), 
            [System.IO.Compression.CompressionMode]::Decompress
        )
        $decompressed = [System.IO.MemoryStream]::new()
        $compressed.CopyTo($decompressed)
        $compressed.Close()
        
        [System.IO.File]::WriteAllBytes($DatabaseFile, $decompressed.ToArray())
        
        Write-Log "SUCCESS" "Database restored successfully"
        
        # Set proper permissions
        $acl = Get-Acl $DatabaseFile
        $acl.SetAccessRuleProtection($false, $true)
        Set-Acl $DatabaseFile $acl
        
        # Validate restored database
        try {
            $sqlite3Path = Get-Command sqlite3 -ErrorAction Stop
            $result = & sqlite3 $DatabaseFile "PRAGMA integrity_check;" 2>$null
            if ($result -eq "ok") {
                Write-Log "SUCCESS" "Restored database integrity verified"
            } else {
                Write-Log "ERROR" "Restored database integrity check failed"
                return $false
            }
        }
        catch {
            Write-Log "WARNING" "sqlite3 not found, skipping database integrity check"
        }
        
        # Get database info
        $dbSize = (Get-Item $DatabaseFile).Length
        Write-Log "INFO" "Restored database size: $([math]::Round($dbSize/1KB, 2))KB"
        
        Write-Log "INFO" "=== HRMS Elite Database Restore Completed Successfully ==="
        Write-Host "Database restored successfully" -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Log "ERROR" "Failed to restore database: $($_.Exception.Message)"
        return $false
    }
}

# Confirm restore
function Confirm-Restore {
    param([string]$BackupPath)
    
    Write-Host ""
    Write-Host "WARNING: This will replace the current database!" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "Backup file: $BackupPath"
    Write-Host "Target database: $DatabaseFile"
    Write-Host ""
    
    if (Test-Path $DatabaseFile) {
        Write-Host "Current database will be backed up before restore" -ForegroundColor $Blue
    }
    
    Write-Host ""
    $confirm = Read-Host "Are you sure you want to proceed? (yes/no)"
    
    return $confirm -eq "yes"
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# List backups if requested
if ($List) {
    Show-Backups
    exit 0
}

# Get latest backup if requested
if ($Latest) {
    $BackupFile = Get-LatestBackup
    if (-not $BackupFile) {
        exit 1
    }
}

# If no backup file specified, try to use latest
if (-not $BackupFile) {
    $BackupFile = Get-LatestBackup
    if (-not $BackupFile) {
        Write-Host "ERROR: No backup file specified and no backups found" -ForegroundColor $Red
        Show-Help
        exit 1
    }
}

# If backup file is relative, make it absolute
if (-not [System.IO.Path]::IsPathRooted($BackupFile)) {
    $BackupFile = Join-Path $BackupDir $BackupFile
}

# Dry run mode
if ($DryRun) {
    Write-Host "DRY RUN MODE - No actual restore will be performed" -ForegroundColor $Yellow
    Write-Host "Backup file: $BackupFile"
    Write-Host "Target database: $DatabaseFile"
    Write-Host "Force mode: $Force"
    exit 0
}

# Validate-only mode
if ($ValidateOnly) {
    if (Test-BackupFile $BackupFile) {
        Write-Host "Backup file is valid" -ForegroundColor $Green
        exit 0
    } else {
        Write-Host "Backup file is invalid" -ForegroundColor $Red
        exit 1
    }
}

# Confirm restore unless force mode is enabled
if (-not $Force) {
    if (-not (Confirm-Restore $BackupFile)) {
        Write-Host "Restore cancelled" -ForegroundColor $Yellow
        exit 0
    }
}

# Perform restore
if (Restore-Database $BackupFile $Force) {
    Write-Host "Database file: $DatabaseFile"
    Write-Host "Log file: $LogFile"
    exit 0
} else {
    exit 1
} 