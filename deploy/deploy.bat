@echo off
REM HRMS Elite Deployment Script for Windows
REM This script automates the deployment process for production on Windows

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=hrms-elite
set DOCKER_COMPOSE_FILE=docker-compose.yml
set ENV_FILE=.env

REM Colors for output (Windows 10+)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Logging function
:log
echo %BLUE%[%date% %time%]%NC% %~1
goto :eof

:success
echo %GREEN%✅ %~1%NC%
goto :eof

:warning
echo %YELLOW%⚠️  %~1%NC%
goto :eof

:error
echo %RED%❌ %~1%NC%
goto :eof

REM Check prerequisites
:check_prerequisites
call :log "Checking prerequisites..."

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :error "Docker is not installed or not in PATH"
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :error "Docker Compose is not installed or not in PATH"
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    call :error "Docker daemon is not running"
    exit /b 1
)

call :success "Prerequisites check passed"
goto :eof

REM Create SSL certificates for development
:create_ssl_certs
call :log "Creating SSL certificates for development..."

if not exist "ssl" mkdir ssl

if not exist "ssl\cert.pem" (
    call :log "Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl\key.pem -out ssl\cert.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    if errorlevel 1 (
        call :warning "OpenSSL not found. Please install OpenSSL or manually create SSL certificates."
        call :warning "You can download OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html"
    ) else (
        call :success "SSL certificates created"
    )
) else (
    call :success "SSL certificates already exist"
)
goto :eof

REM Setup environment file
:setup_env
call :log "Setting up environment configuration..."

if not exist "%ENV_FILE%" (
    if exist "env.example" (
        copy env.example "%ENV_FILE%" >nul
        call :warning "Created %ENV_FILE% from example. Please update the values!"
    ) else (
        call :error "No env.example file found"
        exit /b 1
    )
) else (
    call :success "Environment file already exists"
)
goto :eof

REM Create necessary directories
:create_directories
call :log "Creating necessary directories..."

if not exist "backups" mkdir backups
if not exist "logs" mkdir logs
if not exist "ssl" mkdir ssl

call :success "Directories created"
goto :eof

REM Build and start services
:deploy_services
call :log "Deploying HRMS Elite services..."

REM Stop existing containers
call :log "Stopping existing containers..."
docker-compose -f "%DOCKER_COMPOSE_FILE%" down --remove-orphans

REM Build images
call :log "Building Docker images..."
docker-compose -f "%DOCKER_COMPOSE_FILE%" build --no-cache

REM Start services
call :log "Starting services..."
docker-compose -f "%DOCKER_COMPOSE_FILE%" up -d

call :success "Services deployed successfully"
goto :eof

REM Wait for services to be ready
:wait_for_services
call :log "Waiting for services to be ready..."

set max_attempts=30
set attempt=1

:wait_loop
curl -f -s http://localhost/health >nul 2>&1
if not errorlevel 1 (
    call :success "Application is ready"
    goto :eof
)

call :log "Waiting for application to be ready... (attempt %attempt%/%max_attempts%)"
timeout /t 10 /nobreak >nul
set /a attempt+=1

if %attempt% leq %max_attempts% goto wait_loop

call :error "Application failed to start within expected time"
exit /b 1

REM Run database migrations
:run_migrations
call :log "Running database migrations..."

REM Wait a bit for the database to be ready
timeout /t 5 /nobreak >nul

REM Run migrations using the application container
docker-compose -f "%DOCKER_COMPOSE_FILE%" exec -T hrms-app npm run db:push
if errorlevel 1 (
    call :warning "Database migrations failed or not needed"
) else (
    call :success "Database migrations completed"
)
goto :eof

REM Check service health
:check_health
call :log "Checking service health..."

REM Check main application
curl -f -s http://localhost/health >nul
if errorlevel 1 (
    call :error "Main application health check failed"
    exit /b 1
) else (
    call :success "Main application is healthy"
)

REM Check nginx
curl -f -s http://localhost >nul
if errorlevel 1 (
    call :error "Nginx health check failed"
    exit /b 1
) else (
    call :success "Nginx is healthy"
)

REM Check Redis (if enabled)
docker-compose -f "%DOCKER_COMPOSE_FILE%" ps redis | findstr "Up" >nul
if not errorlevel 1 (
    docker-compose -f "%DOCKER_COMPOSE_FILE%" exec -T redis redis-cli ping | findstr "PONG" >nul
    if errorlevel 1 (
        call :warning "Redis health check failed"
    ) else (
        call :success "Redis is healthy"
    )
)

call :success "All health checks passed"
goto :eof

REM Show deployment status
:show_status
call :log "Deployment Status:"
echo.
docker-compose -f "%DOCKER_COMPOSE_FILE%" ps
echo.
call :log "Application URLs:"
echo   - Main Application: https://localhost
echo   - Health Check: https://localhost/health
echo.
call :log "Logs can be viewed with:"
echo   - All services: docker-compose -f %DOCKER_COMPOSE_FILE% logs -f
echo   - Application: docker-compose -f %DOCKER_COMPOSE_FILE% logs -f hrms-app
echo   - Nginx: docker-compose -f %DOCKER_COMPOSE_FILE% logs -f nginx
goto :eof

REM Backup function
:backup
call :log "Creating backup..."

docker-compose -f "%DOCKER_COMPOSE_FILE%" run --rm backup
if errorlevel 1 (
    call :error "Backup failed"
    exit /b 1
) else (
    call :success "Backup created successfully"
)
goto :eof

REM Main deployment function
:main
call :log "Starting HRMS Elite deployment..."

call :check_prerequisites
if errorlevel 1 exit /b 1

call :create_directories
call :create_ssl_certs
call :setup_env
call :deploy_services
call :wait_for_services
call :run_migrations
call :check_health
call :show_status

call :success "HRMS Elite deployment completed successfully!"
call :log "You can now access the application at https://localhost"
goto :eof

REM Handle script arguments
if "%1"=="" goto main
if "%1"=="deploy" goto main
if "%1"=="backup" goto backup
if "%1"=="stop" (
    call :log "Stopping HRMS Elite services..."
    docker-compose -f "%DOCKER_COMPOSE_FILE%" down
    call :success "Services stopped"
    goto :eof
)
if "%1"=="restart" (
    call :log "Restarting HRMS Elite services..."
    docker-compose -f "%DOCKER_COMPOSE_FILE%" restart
    call :success "Services restarted"
    goto :eof
)
if "%1"=="logs" (
    docker-compose -f "%DOCKER_COMPOSE_FILE%" logs -f
    goto :eof
)
if "%1"=="status" (
    docker-compose -f "%DOCKER_COMPOSE_FILE%" ps
    goto :eof
)
if "%1"=="clean" (
    call :log "Cleaning up HRMS Elite deployment..."
    docker-compose -f "%DOCKER_COMPOSE_FILE%" down -v --remove-orphans
    docker system prune -f
    call :success "Cleanup completed"
    goto :eof
)

echo Usage: %0 {deploy^|backup^|stop^|restart^|logs^|status^|clean}
echo.
echo Commands:
echo   deploy   - Deploy the application (default^)
echo   backup   - Create a backup of the database
echo   stop     - Stop all services
echo   restart  - Restart all services
echo   logs     - Show logs from all services
echo   status   - Show status of all services
echo   clean    - Stop and remove all containers and volumes
exit /b 1 