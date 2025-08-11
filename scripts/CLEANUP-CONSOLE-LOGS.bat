@echo off
chcp 65001 >nul
echo.
echo 🧹 HRMS Elite - Console Log Cleanup Tool
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if script exists
if not exist "scripts\cleanup-console-logs.js" (
    echo ❌ Error: cleanup-console-logs.js script not found
    echo Please ensure the script exists in the scripts directory
    pause
    exit /b 1
)

echo 🔍 Checking for console.log statements...
echo.

REM Run the cleanup script
node scripts\cleanup-console-logs.js

echo.
echo ✅ Console log cleanup completed!
echo.
echo 📋 Next steps:
echo    1. Review the generated report: console-cleanup-report.md
echo    2. Check the backup directory: backup-console-logs/
echo    3. Test your application to ensure everything works
echo    4. Commit your changes if satisfied
echo.

pause 