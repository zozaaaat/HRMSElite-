@echo off
REM HRMS Elite Database Backup Runner
REM Simple batch file to run the backup system

echo HRMS Elite Database Backup System
echo =================================
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell is available'" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is not available
    echo Please install PowerShell or use the .bat scripts instead
    pause
    exit /b 1
)

REM Check if database exists
if not exist "dev.db" (
    echo ERROR: Database file 'dev.db' not found
    echo Please ensure you are running this from the HRMS Elite project root
    pause
    exit /b 1
)

echo Creating database backup...
echo.

REM Run the PowerShell backup script
powershell -ExecutionPolicy Bypass -File "%~dp0backup.ps1"

if %errorlevel% equ 0 (
    echo.
    echo Backup completed successfully!
    echo.
    echo To restore from backup, use:
    echo   scripts\restore.ps1 -Latest
    echo.
    echo To list available backups, use:
    echo   scripts\restore.ps1 -List
) else (
    echo.
    echo Backup failed! Check the logs for details.
)

echo.
pause 