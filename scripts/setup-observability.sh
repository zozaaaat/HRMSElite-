#!/bin/bash

# HRMS Elite - Observability Setup Script
# This script helps set up the comprehensive observability system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to install observability dependencies
install_dependencies() {
    print_status "Installing observability dependencies..."
    
    # Install npm packages
    npm install prom-client@^14.2.0 winston@^3.11.0 winston-loki@^6.0.8 uuid@^9.0.1
    
    print_success "Dependencies installed successfully"
}

# Function to create environment configuration
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
# Observability Configuration
OBSERVABILITY_ENABLED=true
LOG_LEVEL=info
LOG_FORMAT=json

# Log Shipping Configuration
LOG_SHIPPING_ENABLED=true
LOG_SHIPPING_TYPE=loki
LOG_SHIPPING_HOST=localhost
LOG_SHIPPING_PORT=3100
LOG_SHIPPING_PROTOCOL=http
LOG_SHIPPING_BATCH_SIZE=100
LOG_SHIPPING_BATCH_TIMEOUT=5000

# Metrics Configuration
METRICS_ENABLED=true
METRICS_PORT=9090

# Application Configuration
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-session-secret-here
EOF
        print_success "Created .env file with observability configuration"
    else
        print_warning ".env file already exists. Please manually add observability configuration."
    fi
}

# Function to setup monitoring stack
setup_monitoring_stack() {
    print_status "Setting up monitoring stack with Docker Compose..."
    
    # Create docker-compose.yml for monitoring stack
    cat > docker-compose.monitoring.yml << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: hrms-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: hrms-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped
    depends_on:
      - prometheus

  loki:
    image: grafana/loki:latest
    container_name: hrms-loki
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./monitoring/loki/local-config.yaml:/etc/loki/local-config.yaml
      - loki_data:/loki
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    container_name: hrms-promtail
    volumes:
      - ./logs:/var/log
      - ./monitoring/promtail/config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
    depends_on:
      - loki

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
EOF

    # Create Prometheus configuration
    mkdir -p monitoring/prometheus
    cat > monitoring/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'hrms-elite'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF

    # Create Loki configuration
    mkdir -p monitoring/loki
    cat > monitoring/loki/local-config.yaml << EOF
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    cache_ttl: 24h
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

compactor:
  working_directory: /loki/compactor
  shared_store: filesystem

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
EOF

    # Create Promtail configuration
    mkdir -p monitoring/promtail
    cat > monitoring/promtail/config.yml << EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: hrms-elite-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: hrms-elite
          __path__: /var/log/*.log
    pipeline_stages:
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            requestId: requestId
            method: method
            url: url
            statusCode: statusCode
            responseTime: responseTime
            userId: userId
            userRole: userRole
            ip: ip
            userAgent: userAgent
      - labels:
          level:
          requestId:
          method:
          url:
          statusCode:
          userId:
          userRole:
          ip:
          userAgent:
      - timestamp:
          source: timestamp
          format: RFC3339Nano
EOF

    # Create Grafana datasource configuration
    mkdir -p monitoring/grafana/datasources
    cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: true
EOF

    # Create Grafana dashboard provisioning
    mkdir -p monitoring/grafana/dashboards
    cat > monitoring/grafana/dashboards/dashboards.yml << EOF
apiVersion: 1

providers:
  - name: 'HRMS Elite'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

    print_success "Monitoring stack configuration created"
}

# Function to start monitoring stack
start_monitoring_stack() {
    print_status "Starting monitoring stack..."
    
    if [ -f docker-compose.monitoring.yml ]; then
        docker-compose -f docker-compose.monitoring.yml up -d
        print_success "Monitoring stack started successfully"
        print_status "Grafana: http://localhost:3001 (admin/admin)"
        print_status "Prometheus: http://localhost:9090"
        print_status "Loki: http://localhost:3100"
    else
        print_error "docker-compose.monitoring.yml not found"
        exit 1
    fi
}

# Function to import Grafana dashboard
import_dashboard() {
    print_status "Importing Grafana dashboard..."
    
    # Wait for Grafana to be ready
    print_status "Waiting for Grafana to be ready..."
    sleep 30
    
    # Import dashboard using Grafana API
    if command_exists curl; then
        curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Basic YWRtaW46YWRtaW4=" \
            -d @monitoring/grafana/dashboards/hrms-elite-observability.json \
            http://localhost:3001/api/dashboards/db
        
        print_success "Dashboard imported successfully"
    else
        print_warning "curl not found. Please manually import the dashboard:"
        print_status "1. Open Grafana at http://localhost:3001"
        print_status "2. Go to Dashboards > Import"
        print_status "3. Upload monitoring/grafana/dashboards/hrms-elite-observability.json"
    fi
}

# Function to create logs directory
setup_logs() {
    print_status "Setting up logs directory..."
    
    mkdir -p logs
    touch logs/app.log
    
    print_success "Logs directory created"
}

# Function to test observability
test_observability() {
    print_status "Testing observability system..."
    
    # Test metrics endpoint
    if curl -s http://localhost:3000/metrics > /dev/null 2>&1; then
        print_success "Metrics endpoint is accessible"
    else
        print_warning "Metrics endpoint not accessible (server may not be running)"
    fi
    
    # Test health endpoint
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Health endpoint is accessible"
    else
        print_warning "Health endpoint not accessible (server may not be running)"
    fi
    
    # Test Prometheus
    if curl -s http://localhost:9090/api/v1/status/targets > /dev/null 2>&1; then
        print_success "Prometheus is running"
    else
        print_warning "Prometheus not accessible"
    fi
    
    # Test Grafana
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Grafana is running"
    else
        print_warning "Grafana not accessible"
    fi
}

# Function to generate setup report
generate_report() {
    print_status "Generating setup report..."
    
    cat > observability-setup-report.md << EOF
# HRMS Elite - Observability Setup Report

## Setup Summary

- **Date**: $(date)
- **Status**: Setup completed successfully
- **Environment**: $(uname -s) $(uname -r)

## Components Installed

### Dependencies
- prom-client@^14.2.0
- winston@^3.11.0
- winston-loki@^6.0.8
- uuid@^9.0.1

### Monitoring Stack
- Prometheus (port 9090)
- Grafana (port 3001)
- Loki (port 3100)
- Promtail

### Configuration Files
- .env (environment variables)
- docker-compose.monitoring.yml
- monitoring/prometheus/prometheus.yml
- monitoring/loki/local-config.yaml
- monitoring/promtail/config.yml
- monitoring/grafana/datasources/prometheus.yml
- monitoring/grafana/dashboards/dashboards.yml

## Access URLs

- **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Application Metrics**: http://localhost:3000/metrics
- **Application Health**: http://localhost:3000/health

## Next Steps

1. Start the application: \`npm run dev\`
2. Access Grafana dashboard
3. Configure alerts in Grafana
4. Monitor application logs in Loki
5. Set up log retention policies

## Troubleshooting

- Check container status: \`docker-compose -f docker-compose.monitoring.yml ps\`
- View logs: \`docker-compose -f docker-compose.monitoring.yml logs\`
- Restart services: \`docker-compose -f docker-compose.monitoring.yml restart\`

## Support

For issues or questions, refer to OBSERVABILITY-IMPLEMENTATION.md
EOF

    print_success "Setup report generated: observability-setup-report.md"
}

# Main execution
main() {
    echo "=========================================="
    echo "HRMS Elite - Observability Setup Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_monitoring_stack
    setup_logs
    start_monitoring_stack
    import_dashboard
    test_observability
    generate_report
    
    echo ""
    echo "=========================================="
    print_success "Observability setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Start your application: npm run dev"
    echo "2. Access Grafana: http://localhost:3001 (admin/admin)"
    echo "3. View the HRMS Elite dashboard"
    echo "4. Monitor your application metrics and logs"
    echo ""
    echo "For detailed information, see:"
    echo "- OBSERVABILITY-IMPLEMENTATION.md"
    echo "- observability-setup-report.md"
    echo ""
}

# Run main function
main "$@"
