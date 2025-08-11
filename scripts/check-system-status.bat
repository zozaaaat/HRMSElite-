@echo off
chcp 65001 >nul
echo.
echo 🔍 HRMS Elite - System Status Check
echo ===================================
echo.

set "PASS=✅"
set "FAIL=❌"
set "WARN=⚠️"
set "INFO=ℹ️"

:: Initialize counters
set "total_checks=0"
set "passed_checks=0"
set "failed_checks=0"
set "warn_checks=0"

echo 📋 Checking System Components...
echo.

:: Check 1: Database file
set /a total_checks+=1
if exist "..\dev.db" (
    echo %PASS% Database file exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Database file not found
    set /a failed_checks+=1
)

:: Check 2: Backup scripts
set /a total_checks+=1
if exist "backup.ps1" (
    echo %PASS% Backup script (PowerShell) exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Backup script (PowerShell) not found
    set /a failed_checks+=1
)

set /a total_checks+=1
if exist "backup.sh" (
    echo %PASS% Backup script (Bash) exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Backup script (Bash) not found
    set /a failed_checks+=1
)

:: Check 3: Restore scripts
set /a total_checks+=1
if exist "restore.ps1" (
    echo %PASS% Restore script (PowerShell) exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Restore script (PowerShell) not found
    set /a failed_checks+=1
)

set /a total_checks+=1
if exist "restore.sh" (
    echo %PASS% Restore script (Bash) exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Restore script (Bash) not found
    set /a failed_checks+=1
)

:: Check 4: Performance analyzer
set /a total_checks+=1
if exist "performance-analyzer.js" (
    echo %PASS% Performance analyzer exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Performance analyzer not found
    set /a failed_checks+=1
)

:: Check 5: Monitoring directory
set /a total_checks+=1
if exist "..\monitoring" (
    echo %PASS% Monitoring directory exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Monitoring directory not found
    set /a failed_checks+=1
)

:: Check 6: Docker availability
set /a total_checks+=1
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo %PASS% Docker is available
    set /a passed_checks+=1
) else (
    echo %WARN% Docker not available (monitoring will not work)
    set /a warn_checks+=1
)

:: Check 7: Docker Compose availability
set /a total_checks+=1
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo %PASS% Docker Compose is available
    set /a passed_checks+=1
) else (
    echo %WARN% Docker Compose not available (monitoring will not work)
    set /a warn_checks+=1
)

:: Check 8: Backup directory
set /a total_checks+=1
if exist "..\.backup" (
    echo %PASS% Backup directory exists
    set /a passed_checks+=1
) else (
    echo %INFO% Backup directory will be created on first backup
    set /a passed_checks+=1
)

:: Check 9: Monitoring configuration files
set /a total_checks+=1
if exist "..\monitoring\docker-compose.yml" (
    echo %PASS% Docker Compose configuration exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Docker Compose configuration not found
    set /a failed_checks+=1
)

set /a total_checks+=1
if exist "..\monitoring\prometheus\prometheus.yml" (
    echo %PASS% Prometheus configuration exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Prometheus configuration not found
    set /a failed_checks+=1
)

set /a total_checks+=1
if exist "..\monitoring\alertmanager\alertmanager.yml" (
    echo %PASS% AlertManager configuration exists
    set /a passed_checks+=1
) else (
    echo %FAIL% AlertManager configuration not found
    set /a failed_checks+=1
)

set /a total_checks+=1
if exist "..\monitoring\grafana\dashboards\hrms-elite-dashboard.json" (
    echo %PASS% Grafana dashboard exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Grafana dashboard not found
    set /a failed_checks+=1
)

:: Check 10: Log rotation configuration
set /a total_checks+=1
if exist "..\monitoring\logrotate\hrms-elite.conf" (
    echo %PASS% Log rotation configuration exists
    set /a passed_checks+=1
) else (
    echo %FAIL% Log rotation configuration not found
    set /a failed_checks+=1
)

echo.
echo 📊 System Status Summary:
echo =========================
echo Total Checks: %total_checks%
echo Passed: %passed_checks%
echo Failed: %failed_checks%
echo Warnings: %warn_checks%
echo.

if %failed_checks% equ 0 (
    if %warn_checks% equ 0 (
        echo 🎉 All systems are ready!
        echo.
        echo 🚀 Quick Start Commands:
        echo =========================
        echo.
        echo 📦 Create backup: .\scripts\backup.ps1
        echo 🔄 Restore backup: .\scripts\restore.ps1 -Latest
        echo 📊 Start monitoring: .\scripts\start-monitoring.bat
        echo 🧪 Test backup: .\scripts\test-backup.bat
        echo.
    ) else (
        echo ⚠️ System is mostly ready (some warnings)
        echo.
        echo 💡 Recommendations:
        echo - Install Docker Desktop for monitoring features
        echo - All backup features are working
        echo.
    )
) else (
    echo ❌ Some components are missing
    echo.
    echo 🔧 Please check the failed components above
    echo.
)

echo 📚 Documentation:
echo =================
echo - Backup Guide: scripts\BACKUP-README.md
echo - Monitoring Guide: monitoring\README.md
echo - System Status: BACKUP-MONITORING-STATUS.md
echo.
pause 