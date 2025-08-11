#!/bin/bash

# HRMS Elite Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="hrms-elite"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create SSL certificates for development
create_ssl_certs() {
    log "Creating SSL certificates for development..."
    
    if [ ! -d "ssl" ]; then
        mkdir -p ssl
    fi
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log "Generating self-signed SSL certificates..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        success "SSL certificates created"
    else
        success "SSL certificates already exist"
    fi
}

# Setup environment file
setup_env() {
    log "Setting up environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "env.example" ]; then
            cp env.example "$ENV_FILE"
            warning "Created $ENV_FILE from example. Please update the values!"
        else
            error "No env.example file found"
            exit 1
        fi
    else
        success "Environment file already exists"
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p backups
    mkdir -p logs
    mkdir -p ssl
    
    success "Directories created"
}

# Build and start services
deploy_services() {
    log "Deploying HRMS Elite services..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    
    # Build images
    log "Building Docker images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    success "Services deployed successfully"
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    # Wait for the main application
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            success "Application is ready"
            return 0
        fi
        
        log "Waiting for application to be ready... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    error "Application failed to start within expected time"
    return 1
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait a bit for the database to be ready
    sleep 5
    
    # Run migrations using the application container
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T hrms-app npm run db:push; then
        success "Database migrations completed"
    else
        warning "Database migrations failed or not needed"
    fi
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check main application
    if curl -f -s http://localhost/health > /dev/null; then
        success "Main application is healthy"
    else
        error "Main application health check failed"
        return 1
    fi
    
    # Check nginx
    if curl -f -s http://localhost > /dev/null; then
        success "Nginx is healthy"
    else
        error "Nginx health check failed"
        return 1
    fi
    
    # Check Redis (if enabled)
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps redis | grep -q "Up"; then
        if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping | grep -q "PONG"; then
            success "Redis is healthy"
        else
            warning "Redis health check failed"
        fi
    fi
    
    success "All health checks passed"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo ""
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    echo ""
    log "Application URLs:"
    echo "  - Main Application: https://localhost"
    echo "  - Health Check: https://localhost/health"
    echo ""
    log "Logs can be viewed with:"
    echo "  - All services: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    echo "  - Application: docker-compose -f $DOCKER_COMPOSE_FILE logs -f hrms-app"
    echo "  - Nginx: docker-compose -f $DOCKER_COMPOSE_FILE logs -f nginx"
}

# Backup function
backup() {
    log "Creating backup..."
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" run --rm backup; then
        success "Backup created successfully"
    else
        error "Backup failed"
        return 1
    fi
}

# Main deployment function
main() {
    log "Starting HRMS Elite deployment..."
    
    check_root
    check_prerequisites
    create_directories
    create_ssl_certs
    setup_env
    deploy_services
    wait_for_services
    run_migrations
    check_health
    show_status
    
    success "HRMS Elite deployment completed successfully!"
    log "You can now access the application at https://localhost"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        backup
        ;;
    "stop")
        log "Stopping HRMS Elite services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        success "Services stopped"
        ;;
    "restart")
        log "Restarting HRMS Elite services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" restart
        success "Services restarted"
        ;;
    "logs")
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
        ;;
    "status")
        docker-compose -f "$DOCKER_COMPOSE_FILE" ps
        ;;
    "clean")
        log "Cleaning up HRMS Elite deployment..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down -v --remove-orphans
        docker system prune -f
        success "Cleanup completed"
        ;;
    *)
        echo "Usage: $0 {deploy|backup|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  backup   - Create a backup of the database"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs from all services"
        echo "  status   - Show status of all services"
        echo "  clean    - Stop and remove all containers and volumes"
        exit 1
        ;;
esac 