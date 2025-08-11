@echo off
REM HRMS Elite Backup System Test Script
REM Tests the backup and restore functionality
REM Author: HRMS Elite Team
REM Version: 1.0

setlocal enabledelayedexpansion

REM Configuration
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "BACKUP_SCRIPT=%SCRIPT_DIR%backup.ps1"
set "RESTORE_SCRIPT=%SCRIPT_DIR%restore.ps1"
set "SETUP_SCRIPT=%SCRIPT_DIR%setup-backup-schedule-simple.ps1"

echo.
echo ========================================
echo HRMS Elite Backup System Test
echo ========================================
echo.

REM Check if PowerShell scripts exist
echo Checking backup scripts...
if not exist "%BACKUP_SCRIPT%" (
    echo ERROR: Backup script not found: %BACKUP_SCRIPT%
    goto :error
)
if not exist "%RESTORE_SCRIPT%" (
    echo ERROR: Restore script not found: %RESTORE_SCRIPT%
    goto :error
)
if not exist "%SETUP_SCRIPT%" (
    echo ERROR: Setup script not found: %SETUP_SCRIPT%
    goto :error
)
echo ✓ All backup scripts found
echo.

REM Test backup script
echo Testing backup script...
powershell -ExecutionPolicy Bypass -File "%BACKUP_SCRIPT%" -DryRun
if %errorlevel% neq 0 (
    echo ERROR: Backup script test failed
    goto :error
)
echo ✓ Backup script test passed
echo.

REM Test restore script
echo Testing restore script...
powershell -ExecutionPolicy Bypass -File "%RESTORE_SCRIPT%" -List
if %errorlevel% neq 0 (
    echo ERROR: Restore script test failed
    goto :error
)
echo ✓ Restore script test passed
echo.

REM Test setup script
echo Testing setup script...
powershell -ExecutionPolicy Bypass -File "%SETUP_SCRIPT%" status
if %errorlevel% neq 0 (
    echo ERROR: Setup script test failed
    goto :error
)
echo ✓ Setup script test passed
echo.

echo ========================================
echo ✓ All backup system tests passed!
echo ========================================
echo.
echo To set up automated backups:
echo   1. Run PowerShell as Administrator
echo   2. Execute: .\scripts\setup-backup-schedule.ps1 install
echo.
echo To create a manual backup:
echo   .\scripts\backup.ps1
echo.
echo To restore from backup:
echo   .\scripts\restore.ps1 -Latest
echo.
goto :end

:error
echo.
echo ========================================
echo ✗ Backup system test failed!
echo ========================================
echo.
echo Please check the error messages above and ensure:
echo   1. All backup scripts exist in the scripts directory
echo   2. PowerShell execution policy allows script execution
echo   3. Database file exists in project root
echo.
pause
exit /b 1

:end
echo.
pause
exit /b 0
