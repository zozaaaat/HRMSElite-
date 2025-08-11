@echo off
chcp 65001 >nul
echo.
echo 🚀 HRMS Elite - Monitoring System Startup
echo ===========================================
echo.

:: Check if Docker is running
echo 📋 Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and start it
    pause
    exit /b 1
)

:: Check if docker-compose is available
echo 📋 Checking docker-compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not available
    echo Please install docker-compose
    pause
    exit /b 1
)

:: Navigate to monitoring directory
cd /d "%~dp0..\monitoring"

:: Check if .env file exists, create if not
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # HRMS Elite Monitoring Configuration
        echo # Email Configuration
        echo SMTP_HOST=smtp.gmail.com
        echo SMTP_PORT=587
        echo SMTP_USER=hrms-alerts@yourcompany.com
        echo SMTP_PASS=your-app-password
        echo.
        echo # Grafana Configuration
        echo GRAFANA_ADMIN_PASSWORD=hrms-admin-2024
        echo.
        echo # Prometheus Configuration
        echo PROMETHEUS_RETENTION_TIME=200h
        echo.
        echo # Application Configuration
        echo HRMS_APP_PORT=3000
        echo HRMS_APP_HOST=127.0.0.1
    ) > .env
    echo ✅ Created .env file - Please update with your email settings
)

:: Start monitoring stack
echo 🚀 Starting monitoring stack...
docker-compose up -d

:: Wait a moment for services to start
timeout /t 5 /nobreak >nul

:: Check service status
echo 📊 Checking service status...
docker-compose ps

:: Show access URLs
echo.
echo 🌐 Monitoring Dashboard Access:
echo ===============================
echo.
echo 📊 Grafana Dashboard: http://localhost:3001
echo    Username: admin
echo    Password: hrms-admin-2024
echo.
echo 📈 Prometheus: http://localhost:9090
echo.
echo 🔔 AlertManager: http://localhost:9093
echo.
echo 📋 Logs: docker-compose logs -f
echo.

:: Check if services are healthy
echo 🔍 Checking service health...
timeout /t 10 /nobreak >nul

docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ All monitoring services are running successfully!
    echo.
    echo 🎯 Next steps:
    echo 1. Open http://localhost:3001 in your browser
    echo 2. Login with admin/hrms-admin-2024
    echo 3. Import the HRMS Elite dashboard
    echo 4. Configure email alerts in AlertManager
    echo.
) else (
    echo ⚠️ Some services may not be running properly
    echo Check logs with: docker-compose logs
)

echo.
echo 💡 Tips:
echo - To stop monitoring: docker-compose down
echo - To view logs: docker-compose logs -f
echo - To restart: docker-compose restart
echo.
pause 