#!/usr/bin/env pwsh

<#
.SYNOPSIS
    HRMS Elite Console Log Cleanup Tool
    
.DESCRIPTION
    Automatically removes console.log and console.debug statements from the codebase
    while preserving console.error statements for error handling.
    
.PARAMETER DryRun
    Show what would be removed without actually making changes
    
.PARAMETER Backup
    Create backups of modified files (enabled by default)
    
.EXAMPLE
    .\CLEANUP-CONSOLE-LOGS.ps1
    
.EXAMPLE
    .\CLEANUP-CONSOLE-LOGS.ps1 -DryRun
    
.EXAMPLE
    .\CLEANUP-CONSOLE-LOGS.ps1 -Backup:$false
    
.NOTES
    Author: HRMS Elite Team
    Version: 1.0.0
#>

param(
    [switch]$DryRun,
    [switch]$Backup
)

# Set default behavior for Backup parameter (enabled by default unless explicitly disabled)
if (-not $PSBoundParameters.ContainsKey('Backup')) {
    $Backup = $true
}

# Set console encoding for proper emoji display
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "🧹 HRMS Elite - Console Log Cleanup Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if script exists
$scriptPath = "scripts\cleanup-console-logs.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Error: cleanup-console-logs.js script not found" -ForegroundColor Red
    Write-Host "Please ensure the script exists in the scripts directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🔍 Starting console log cleanup..." -ForegroundColor Yellow
Write-Host ""

# Build command with parameters
$command = "node $scriptPath"
if ($DryRun) {
    $command += " --dry-run"
    Write-Host "🔍 DRY RUN MODE - No files will be modified" -ForegroundColor Magenta
    Write-Host ""
}

# Run the cleanup script
try {
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Console log cleanup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "    1. Review the generated report: console-cleanup-report.md" -ForegroundColor White
        Write-Host "    2. Check the backup directory: backup-console-logs/" -ForegroundColor White
        Write-Host "    3. Test your application to ensure everything works" -ForegroundColor White
        Write-Host "    4. Commit your changes if satisfied" -ForegroundColor White
        Write-Host ""
        
        # Show report if it exists
        if (Test-Path "console-cleanup-report.md") {
            Write-Host "📄 Generated report:" -ForegroundColor Cyan
            Get-Content "console-cleanup-report.md" | Select-Object -First 20 | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Gray
            }
            Write-Host ""
        }
    } else {
        Write-Host "❌ Console log cleanup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running console log cleanup: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit" 