#!/usr/bin/env pwsh

<#
.SYNOPSIS
    HRMS Elite Enhanced Console Log Cleanup Tool
    
.DESCRIPTION
    Advanced console.log and console.debug removal with git integration,
    multi-line statement detection, and comprehensive reporting.
    
.PARAMETER Mode
    Operation mode: basic, dry-run, auto-commit, git-check, verbose, help
    
.EXAMPLE
    .\ENHANCED-CONSOLE-CLEANUP.ps1
    
.EXAMPLE
    .\ENHANCED-CONSOLE-CLEANUP.ps1 -Mode dry-run
    
.NOTES
    Author: HRMS Elite Team
    Version: 2.0.0
#>

param(
    [ValidateSet('basic', 'dry-run', 'auto-commit', 'git-check', 'verbose', 'help', 'interactive')]
    [string]$Mode = 'interactive'
)

# Set console encoding for proper emoji display
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "🧹 HRMS Elite - Enhanced Console Log Cleanup Tool" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
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
$scriptPath = "scripts\enhanced-console-cleanup.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Error: enhanced-console-cleanup.js script not found" -ForegroundColor Red
    Write-Host "Please ensure the script exists in the scripts directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to show interactive menu
function Show-InteractiveMenu {
    Write-Host "🔍 Enhanced Console Log Cleanup Options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Basic cleanup (remove console statements)" -ForegroundColor White
    Write-Host "2. Dry run (preview changes only)" -ForegroundColor White
    Write-Host "3. Cleanup with git auto-commit" -ForegroundColor White
    Write-Host "4. Cleanup with git status check" -ForegroundColor White
    Write-Host "5. Verbose cleanup (detailed output)" -ForegroundColor White
    Write-Host "6. Show help" -ForegroundColor White
    Write-Host "7. Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-7)"
    
    switch ($choice) {
        "1" { 
            Write-Host ""
            Write-Host "🧹 Running basic console log cleanup..." -ForegroundColor Green
            return "basic"
        }
        "2" { 
            Write-Host ""
            Write-Host "🔍 Running dry run (preview mode)..." -ForegroundColor Magenta
            return "dry-run"
        }
        "3" { 
            Write-Host ""
            Write-Host "🧹 Running cleanup with auto-commit..." -ForegroundColor Green
            return "auto-commit"
        }
        "4" { 
            Write-Host ""
            Write-Host "🧹 Running cleanup with git check..." -ForegroundColor Green
            return "git-check"
        }
        "5" { 
            Write-Host ""
            Write-Host "🧹 Running verbose cleanup..." -ForegroundColor Green
            return "verbose"
        }
        "6" { 
            Write-Host ""
            return "help"
        }
        "7" { 
            Write-Host "👋 Exiting..." -ForegroundColor Yellow
            exit 0
        }
        default { 
            Write-Host "❌ Invalid choice. Please try again." -ForegroundColor Red
            return "interactive"
        }
    }
}

# Function to build command based on mode
function Build-Command {
    param([string]$Mode)
    
    $command = "node $scriptPath"
    
    switch ($Mode) {
        "basic" { return $command }
        "dry-run" { return "$command --dry-run --verbose" }
        "auto-commit" { return "$command --auto-commit" }
        "git-check" { return "$command --git-check" }
        "verbose" { return "$command --verbose" }
        "help" { return "$command --help" }
        default { return $command }
    }
}

# Main execution
if ($Mode -eq 'interactive') {
    $Mode = Show-InteractiveMenu
    if ($Mode -eq 'interactive') {
        exit 1
    }
}

$command = Build-Command -Mode $Mode

Write-Host "🔍 Starting enhanced console log cleanup..." -ForegroundColor Yellow
Write-Host ""

# Run the cleanup script
try {
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Enhanced console log cleanup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "    1. Review the generated report: enhanced-console-cleanup-report.md" -ForegroundColor White
        Write-Host "    2. Check the backup directory: backup-console-logs/" -ForegroundColor White
        Write-Host "    3. Test your application to ensure everything works" -ForegroundColor White
        Write-Host "    4. Run your test suite to verify functionality" -ForegroundColor White
        Write-Host "    5. Commit your changes if satisfied" -ForegroundColor White
        Write-Host ""
        
        # Show enhanced features
        Write-Host "💡 Enhanced features:" -ForegroundColor Cyan
        Write-Host "    - Multi-line console statement detection" -ForegroundColor White
        Write-Host "    - Git integration with auto-commit" -ForegroundColor White
        Write-Host "    - Advanced pattern matching" -ForegroundColor White
        Write-Host "    - Performance impact analysis" -ForegroundColor White
        Write-Host "    - Comprehensive reporting" -ForegroundColor White
        Write-Host ""
        
        # Show report if it exists
        if (Test-Path "enhanced-console-cleanup-report.md") {
            Write-Host "📄 Generated report preview:" -ForegroundColor Cyan
            Get-Content "enhanced-console-cleanup-report.md" | Select-Object -First 15 | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Gray
            }
            Write-Host ""
        }
        
        # Show backup info if it exists
        if (Test-Path "backup-console-logs") {
            $backupCount = (Get-ChildItem "backup-console-logs" -Recurse -File).Count
            Write-Host "💾 Backup files created: $backupCount" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Enhanced console log cleanup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running enhanced console log cleanup: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
