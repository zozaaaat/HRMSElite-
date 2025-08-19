@echo off
REM HRMS Elite - Observability Setup Script (Windows)
REM This script helps set up the comprehensive observability system

setlocal enabledelayedexpansion

echo ==========================================
echo HRMS Elite - Observability Setup Script
echo ==========================================
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js and run this script again.
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm and run this script again.
    exit /b 1
)

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker and run this script again.
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose and run this script again.
    exit /b 1
)

echo [SUCCESS] All prerequisites are installed

REM Install dependencies
echo [INFO] Installing observability dependencies...
npm install prom-client@^14.2.0 winston@^3.11.0 winston-loki@^6.0.8 uuid@^9.0.1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Setup environment
echo [INFO] Setting up environment configuration...
if not exist .env (
    (
        echo # Observability Configuration
        echo OBSERVABILITY_ENABLED=true
        echo LOG_LEVEL=info
        echo LOG_FORMAT=json
        echo.
        echo # Log Shipping Configuration
        echo LOG_SHIPPING_ENABLED=true
        echo LOG_SHIPPING_TYPE=loki
        echo LOG_SHIPPING_HOST=localhost
        echo LOG_SHIPPING_PORT=3100
        echo LOG_SHIPPING_PROTOCOL=http
        echo LOG_SHIPPING_BATCH_SIZE=100
        echo LOG_SHIPPING_BATCH_TIMEOUT=5000
        echo.
        echo # Metrics Configuration
        echo METRICS_ENABLED=true
        echo METRICS_PORT=9090
        echo.
        echo # Application Configuration
        echo NODE_ENV=development
        echo PORT=3000
        echo SESSION_SECRET=your-session-secret-here
    ) > .env
    echo [SUCCESS] Created .env file with observability configuration
) else (
    echo [WARNING] .env file already exists. Please manually add observability configuration.
)

REM Setup monitoring stack
echo [INFO] Setting up monitoring stack with Docker Compose...

REM Create docker-compose.monitoring.yml
(
    echo version: '3.8'
    echo.
    echo services:
    echo   prometheus:
    echo     image: prom/prometheus:latest
    echo     container_name: hrms-prometheus
    echo     ports:
    echo       - "9090:9090"
    echo     volumes:
    echo       - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    echo       - prometheus_data:/prometheus
    echo     command:
    echo       - '--config.file=/etc/prometheus/prometheus.yml'
    echo       - '--storage.tsdb.path=/prometheus'
    echo       - '--web.console.libraries=/etc/prometheus/console_libraries'
    echo       - '--web.console.templates=/etc/prometheus/consoles'
    echo       - '--storage.tsdb.retention.time=200h'
    echo       - '--web.enable-lifecycle'
    echo     restart: unless-stopped
    echo.
    echo   grafana:
    echo     image: grafana/grafana:latest
    echo     container_name: hrms-grafana
    echo     ports:
    echo       - "3001:3000"
    echo     environment:
    echo       - GF_SECURITY_ADMIN_PASSWORD=admin
    echo       - GF_USERS_ALLOW_SIGN_UP=false
    echo     volumes:
    echo       - grafana_data:/var/lib/grafana
    echo       - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    echo       - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    echo     restart: unless-stopped
    echo     depends_on:
    echo       - prometheus
    echo.
    echo   loki:
    echo     image: grafana/loki:latest
    echo     container_name: hrms-loki
    echo     ports:
    echo       - "3100:3100"
    echo     command: -config.file=/etc/loki/local-config.yaml
    echo     volumes:
    echo       - ./monitoring/loki/local-config.yaml:/etc/loki/local-config.yaml
    echo       - loki_data:/loki
    echo     restart: unless-stopped
    echo.
    echo   promtail:
    echo     image: grafana/promtail:latest
    echo     container_name: hrms-promtail
    echo     volumes:
    echo       - ./logs:/var/log
    echo       - ./monitoring/promtail/config.yml:/etc/promtail/config.yml
    echo     command: -config.file=/etc/promtail/config.yml
    echo     restart: unless-stopped
    echo     depends_on:
    echo       - loki
    echo.
    echo volumes:
    echo   prometheus_data:
    echo   grafana_data:
    echo   loki_data:
) > docker-compose.monitoring.yml

REM Create monitoring directories
if not exist monitoring\prometheus mkdir monitoring\prometheus
if not exist monitoring\loki mkdir monitoring\loki
if not exist monitoring\promtail mkdir monitoring\promtail
if not exist monitoring\grafana\datasources mkdir monitoring\grafana\datasources
if not exist monitoring\grafana\dashboards mkdir monitoring\grafana\dashboards

REM Create Prometheus configuration
(
    echo global:
    echo   scrape_interval: 15s
    echo   evaluation_interval: 15s
    echo.
    echo rule_files:
    echo   - "rules/*.yml"
    echo.
    echo scrape_configs:
    echo   - job_name: 'hrms-elite'
    echo     static_configs:
    echo       - targets: ['host.docker.internal:3000']
    echo     metrics_path: '/metrics'
    echo     scrape_interval: 5s
    echo.
    echo   - job_name: 'prometheus'
    echo     static_configs:
    echo       - targets: ['localhost:9090']
) > monitoring\prometheus\prometheus.yml

REM Create Loki configuration
(
    echo auth_enabled: false
    echo.
    echo server:
    echo   http_listen_port: 3100
    echo.
    echo ingester:
    echo   lifecycler:
    echo     address: 127.0.0.1
    echo     ring:
    echo       kvstore:
    echo         store: inmemory
    echo       replication_factor: 1
    echo     final_sleep: 0s
    echo   chunk_idle_period: 5m
    echo   chunk_retain_period: 30s
    echo.
    echo schema_config:
    echo   configs:
    echo     - from: 2020-05-15
    echo       store: boltdb-shipper
    echo       object_store: filesystem
    echo       schema: v11
    echo       index:
    echo         prefix: index_
    echo         period: 24h
    echo.
    echo storage_config:
    echo   boltdb_shipper:
    echo     active_index_directory: /loki/boltdb-shipper-active
    echo     cache_location: /loki/boltdb-shipper-cache
    echo     cache_ttl: 24h
    echo     shared_store: filesystem
    echo   filesystem:
    echo     directory: /loki/chunks
    echo.
    echo compactor:
    echo   working_directory: /loki/compactor
    echo   shared_store: filesystem
    echo.
    echo limits_config:
    echo   enforce_metric_name: false
    echo   reject_old_samples: true
    echo   reject_old_samples_max_age: 168h
) > monitoring\loki\local-config.yaml

REM Create Promtail configuration
(
    echo server:
    echo   http_listen_port: 9080
    echo   grpc_listen_port: 0
    echo.
    echo positions:
    echo   filename: /tmp/positions.yaml
    echo.
    echo clients:
    echo   - url: http://loki:3100/loki/api/v1/push
    echo.
    echo scrape_configs:
    echo   - job_name: hrms-elite-logs
    echo     static_configs:
    echo       - targets:
    echo           - localhost
    echo         labels:
    echo           job: hrms-elite
    echo           __path__: /var/log/*.log
    echo     pipeline_stages:
    echo       - json:
    echo           expressions:
    echo             timestamp: timestamp
    echo             level: level
    echo             message: message
    echo             requestId: requestId
    echo             method: method
    echo             url: url
    echo             statusCode: statusCode
    echo             responseTime: responseTime
    echo             userId: userId
    echo             userRole: userRole
    echo             ip: ip
    echo             userAgent: userAgent
    echo       - labels:
    echo           level:
    echo           requestId:
    echo           method:
    echo           url:
    echo           statusCode:
    echo           userId:
    echo           userRole:
    echo           ip:
    echo           userAgent:
    echo       - timestamp:
    echo           source: timestamp
    echo           format: RFC3339Nano
) > monitoring\promtail\config.yml

REM Create Grafana datasource configuration
(
    echo apiVersion: 1
    echo.
    echo datasources:
    echo   - name: Prometheus
    echo     type: prometheus
    echo     access: proxy
    echo     url: http://prometheus:9090
    echo     isDefault: true
    echo     editable: true
    echo.
    echo   - name: Loki
    echo     type: loki
    echo     access: proxy
    echo     url: http://loki:3100
    echo     editable: true
) > monitoring\grafana\datasources\prometheus.yml

REM Create Grafana dashboard provisioning
(
    echo apiVersion: 1
    echo.
    echo providers:
    echo   - name: 'HRMS Elite'
    echo     orgId: 1
    echo     folder: ''
    echo     type: file
    echo     disableDeletion: false
    echo     updateIntervalSeconds: 10
    echo     allowUiUpdates: true
    echo     options:
    echo       path: /etc/grafana/provisioning/dashboards
) > monitoring\grafana\dashboards\dashboards.yml

echo [SUCCESS] Monitoring stack configuration created

REM Setup logs directory
echo [INFO] Setting up logs directory...
if not exist logs mkdir logs
if not exist logs\app.log type nul > logs\app.log
echo [SUCCESS] Logs directory created

REM Start monitoring stack
echo [INFO] Starting monitoring stack...
docker-compose -f docker-compose.monitoring.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start monitoring stack
    exit /b 1
)
echo [SUCCESS] Monitoring stack started successfully
echo [INFO] Grafana: http://localhost:3001 (admin/admin)
echo [INFO] Prometheus: http://localhost:9090
echo [INFO] Loki: http://localhost:3100

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Test observability
echo [INFO] Testing observability system...

REM Test metrics endpoint (if server is running)
curl -s http://localhost:3000/metrics >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Metrics endpoint is accessible
) else (
    echo [WARNING] Metrics endpoint not accessible (server may not be running)
)

REM Test health endpoint (if server is running)
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Health endpoint is accessible
) else (
    echo [WARNING] Health endpoint not accessible (server may not be running)
)

REM Test Prometheus
curl -s http://localhost:9090/api/v1/status/targets >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Prometheus is running
) else (
    echo [WARNING] Prometheus not accessible
)

REM Test Grafana
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Grafana is running
) else (
    echo [WARNING] Grafana not accessible
)

REM Generate setup report
echo [INFO] Generating setup report...
(
    echo # HRMS Elite - Observability Setup Report
    echo.
    echo ## Setup Summary
    echo.
    echo - **Date**: %date% %time%
    echo - **Status**: Setup completed successfully
    echo - **Environment**: Windows
    echo.
    echo ## Components Installed
    echo.
    echo ### Dependencies
    echo - prom-client@^14.2.0
    echo - winston@^3.11.0
    echo - winston-loki@^6.0.8
    echo - uuid@^9.0.1
    echo.
    echo ### Monitoring Stack
    echo - Prometheus (port 9090)
    echo - Grafana (port 3001)
    echo - Loki (port 3100)
    echo - Promtail
    echo.
    echo ### Configuration Files
    echo - .env (environment variables)
    echo - docker-compose.monitoring.yml
    echo - monitoring/prometheus/prometheus.yml
    echo - monitoring/loki/local-config.yaml
    echo - monitoring/promtail/config.yml
    echo - monitoring/grafana/datasources/prometheus.yml
    echo - monitoring/grafana/dashboards/dashboards.yml
    echo.
    echo ## Access URLs
    echo.
    echo - **Grafana Dashboard**: http://localhost:3001 (admin/admin)
    echo - **Prometheus**: http://localhost:9090
    echo - **Loki**: http://localhost:3100
    echo - **Application Metrics**: http://localhost:3000/metrics
    echo - **Application Health**: http://localhost:3000/health
    echo.
    echo ## Next Steps
    echo.
    echo 1. Start the application: `npm run dev`
    echo 2. Access Grafana dashboard
    echo 3. Configure alerts in Grafana
    echo 4. Monitor application logs in Loki
    echo 5. Set up log retention policies
    echo.
    echo ## Troubleshooting
    echo.
    echo - Check container status: `docker-compose -f docker-compose.monitoring.yml ps`
    echo - View logs: `docker-compose -f docker-compose.monitoring.yml logs`
    echo - Restart services: `docker-compose -f docker-compose.monitoring.yml restart`
    echo.
    echo ## Support
    echo.
    echo For issues or questions, refer to OBSERVABILITY-IMPLEMENTATION.md
) > observability-setup-report.md

echo [SUCCESS] Setup report generated: observability-setup-report.md

echo.
echo ==========================================
echo [SUCCESS] Observability setup completed successfully!
echo ==========================================
echo.
echo Next steps:
echo 1. Start your application: npm run dev
echo 2. Access Grafana: http://localhost:3001 (admin/admin)
echo 3. View the HRMS Elite dashboard
echo 4. Monitor your application metrics and logs
echo.
echo For detailed information, see:
echo - OBSERVABILITY-IMPLEMENTATION.md
echo - observability-setup-report.md
echo.

pause
