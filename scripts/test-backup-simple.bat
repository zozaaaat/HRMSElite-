@echo off
REM HRMS Elite Backup System Simple Test
REM Tests basic backup and restore functionality
REM Author: HRMS Elite Team
REM Version: 1.0

echo.
echo ========================================
echo HRMS Elite Backup System Test
echo ========================================
echo.

REM Check if PowerShell scripts exist
echo Checking backup scripts...
if not exist "scripts\backup.ps1" (
    echo ERROR: Backup script not found
    goto :error
)
if not exist "scripts\restore.ps1" (
    echo ERROR: Restore script not found
    goto :error
)
echo ✓ All backup scripts found
echo.

REM Test backup script
echo Testing backup script...
powershell -ExecutionPolicy Bypass -File "scripts\backup.ps1" -DryRun
if %errorlevel% neq 0 (
    echo ERROR: Backup script test failed
    goto :error
)
echo ✓ Backup script test passed
echo.

REM Test restore script
echo Testing restore script...
powershell -ExecutionPolicy Bypass -File "scripts\restore.ps1" -List
if %errorlevel% neq 0 (
    echo ERROR: Restore script test failed
    goto :error
)
echo ✓ Restore script test passed
echo.

echo ========================================
echo ✓ All backup system tests passed!
echo ========================================
echo.
echo To create a manual backup:
echo   .\scripts\backup.ps1
echo.
echo To restore from backup:
echo   .\scripts\restore.ps1 -Latest
echo.
echo To set up automated backups (as Administrator):
echo   .\scripts\setup-backup-schedule-simple.ps1 install
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
