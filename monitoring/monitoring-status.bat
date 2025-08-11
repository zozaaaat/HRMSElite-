@echo off
REM HRMS Elite Monitoring Status Script for Windows
REM This script checks the status of all monitoring services and provides a comprehensive overview

setlocal enabledelayedexpansion

echo ================================
echo HRMS Elite Monitoring System Status
echo ================================
echo.

REM Check if we're in the monitoring directory
if not exist "docker-compose.yml" (
    echo ❌ Please run this script from the monitoring directory
    exit /b 1
)

echo 📋 Docker Services Status
echo.

REM Check Docker services
docker-compose ps >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker services are running
    echo.
    docker-compose ps
) else (
    echo ❌ Docker services are not running
    echo Run: docker-compose up -d
)
echo.

echo 📋 Service Endpoints
echo.

REM Check Prometheus
echo ℹ️  Checking Prometheus...
curl -s http://localhost:9090/api/v1/status/config >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Prometheus is accessible at http://localhost:9090
) else (
    echo ❌ Prometheus is not accessible
)

REM Check Grafana
echo ℹ️  Checking Grafana...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Grafana is accessible at http://localhost:3001
    echo ℹ️  Login: admin/hrms-admin-2024
) else (
    echo ❌ Grafana is not accessible
)

REM Check AlertManager
echo ℹ️  Checking AlertManager...
curl -s http://localhost:9093/api/v1/status >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ AlertManager is accessible at http://localhost:9093
) else (
    echo ❌ AlertManager is not accessible
)

REM Check Loki
echo ℹ️  Checking Loki...
curl -s http://localhost:3100/ready >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Loki is accessible at http://localhost:3100
) else (
    echo ❌ Loki is not accessible
)

echo.

echo 📋 Application Metrics
echo.

REM Check metrics endpoint
curl -s http://localhost:3000/metrics >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Metrics endpoint is responding
    
    REM Get metrics data
    curl -s http://localhost:3000/metrics > temp_metrics.txt
    
    REM Check for specific metrics
    findstr /i "http_requests_total" temp_metrics.txt >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ HTTP request metrics are available
    ) else (
        echo ⚠️  HTTP request metrics not found
    )
    
    findstr /i "active_users" temp_metrics.txt >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Active users metric is available
    ) else (
        echo ⚠️  Active users metric not found
    )
    
    findstr /i "database_connections" temp_metrics.txt >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Database connections metric is available
    ) else (
        echo ⚠️  Database connections metric not found
    )
    
    del temp_metrics.txt
) else (
    echo ❌ Metrics endpoint is not responding
    echo ℹ️  Make sure the HRMS application is running on port 3000
)

echo.

echo 📋 Health Check
echo.

REM Check health endpoint
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Health endpoint is responding
    
    REM Get health data
    curl -s http://localhost:3000/api/health > temp_health.txt
    
    REM Extract status
    findstr /i "status" temp_health.txt | findstr "OK" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Application health status: OK
    ) else (
        echo ⚠️  Application health status: Not OK
    )
    
    del temp_health.txt
) else (
    echo ❌ Health endpoint is not responding
)

echo.

echo 📋 System Resources
echo.

REM Get CPU usage (simplified for Windows)
wmic cpu get loadpercentage /value | findstr "LoadPercentage" > temp_cpu.txt
for /f "tokens=2 delims==" %%a in (temp_cpu.txt) do set cpu_usage=%%a
if !cpu_usage! lss 80 (
    echo ✅ CPU usage: !cpu_usage!%%
) else (
    echo ⚠️  CPU usage: !cpu_usage!%%
)
del temp_cpu.txt

REM Get memory usage
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value > temp_mem.txt
for /f "tokens=2 delims==" %%a in (temp_mem.txt) do (
    if "%%a"=="TotalVisibleMemorySize" (
        set total_mem=%%b
    ) else if "%%a"=="FreePhysicalMemory" (
        set free_mem=%%b
    )
)
set /a used_mem=!total_mem!-!free_mem!
set /a mem_percent=!used_mem!*100/!total_mem!
if !mem_percent! lss 85 (
    echo ✅ Memory usage: !mem_percent!%%
) else (
    echo ⚠️  Memory usage: !mem_percent!%%
)
del temp_mem.txt

REM Get disk usage
for /f "tokens=3" %%a in ('dir C:\ ^| findstr "bytes free"') do set free_space=%%a
for /f "tokens=2" %%a in ('wmic logicaldisk where "DeviceID='C:'" get Size /value ^| findstr "Size"') do set total_space=%%a
set /a used_space=!total_space!-!free_space!
set /a disk_percent=!used_space!*100/!total_space!
if !disk_percent! lss 90 (
    echo ✅ Disk usage: !disk_percent!%%
) else (
    echo ⚠️  Disk usage: !disk_percent!%%
)

echo.

echo ================================
echo Summary
echo ================================
echo.

REM Count issues
set issues=0
docker-compose ps | findstr "Up" >nul 2>&1
if %errorlevel% neq 0 set /a issues+=1

curl -s http://localhost:9090/api/v1/status/config >nul 2>&1
if %errorlevel% neq 0 set /a issues+=1

curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 set /a issues+=1

curl -s http://localhost:3000/metrics >nul 2>&1
if %errorlevel% neq 0 set /a issues+=1

if %issues% equ 0 (
    echo ✅ All monitoring systems are healthy! 🎉
    echo.
    echo ℹ️  Access your dashboards:
    echo ℹ️  • Grafana: http://localhost:3001 (admin/hrms-admin-2024)
    echo ℹ️  • Prometheus: http://localhost:9090
    echo ℹ️  • AlertManager: http://localhost:9093
    echo ℹ️  • Loki: http://localhost:3100
) else (
    echo ⚠️  %issues% issue(s) detected
    echo.
    echo ℹ️  Troubleshooting steps:
    echo ℹ️  1. Check Docker services: docker-compose ps
    echo ℹ️  2. View service logs: docker-compose logs [service-name]
    echo ℹ️  3. Restart services: docker-compose restart
    echo ℹ️  4. Check application: curl http://localhost:3000/health
)

echo.
echo ================================
echo End of Status Report
echo ================================
echo.
echo ℹ️  For more information, see:
echo ℹ️  • Quick Start Guide: monitoring/QUICK-START-GUIDE.md
echo ℹ️  • Full Documentation: monitoring/README.md
echo ℹ️  • Implementation Summary: MONITORING-ALERTING-IMPLEMENTATION.md

pause
