@echo off
chcp 65001 >nul
echo.
echo 🧹 HRMS Elite - Enhanced Console Log Cleanup Tool
echo ================================================
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
if not exist "scripts\enhanced-console-cleanup.js" (
    echo ❌ Error: enhanced-console-cleanup.js script not found
    echo Please ensure the script exists in the scripts directory
    pause
    exit /b 1
)

echo 🔍 Enhanced Console Log Cleanup Options:
echo.
echo 1. Basic cleanup (remove console statements)
echo 2. Dry run (preview changes only)
echo 3. Cleanup with git auto-commit
echo 4. Cleanup with git status check
echo 5. Verbose cleanup (detailed output)
echo 6. Show help
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🧹 Running basic console log cleanup...
    node scripts\enhanced-console-cleanup.js
) else if "%choice%"=="2" (
    echo.
    echo 🔍 Running dry run (preview mode)...
    node scripts\enhanced-console-cleanup.js --dry-run --verbose
) else if "%choice%"=="3" (
    echo.
    echo 🧹 Running cleanup with auto-commit...
    node scripts\enhanced-console-cleanup.js --auto-commit
) else if "%choice%"=="4" (
    echo.
    echo 🧹 Running cleanup with git check...
    node scripts\enhanced-console-cleanup.js --git-check
) else if "%choice%"=="5" (
    echo.
    echo 🧹 Running verbose cleanup...
    node scripts\enhanced-console-cleanup.js --verbose
) else if "%choice%"=="6" (
    echo.
    node scripts\enhanced-console-cleanup.js --help
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo ✅ Enhanced console log cleanup completed!
echo.
echo 📋 Next steps:
echo    1. Review the generated report: enhanced-console-cleanup-report.md
echo    2. Check the backup directory: backup-console-logs/
echo    3. Test your application to ensure everything works
echo    4. Run your test suite to verify functionality
echo    5. Commit your changes if satisfied
echo.
echo 💡 Enhanced features:
echo    - Multi-line console statement detection
echo    - Git integration with auto-commit
echo    - Advanced pattern matching
echo    - Performance impact analysis
echo    - Comprehensive reporting
echo.

pause
