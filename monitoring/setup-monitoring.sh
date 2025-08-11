#!/bin/bash

# HRMS Elite Monitoring Setup Script
# This script sets up Prometheus, Grafana, AlertManager, and logrotate for monitoring

set -e

echo "🚀 Setting up HRMS Elite Monitoring System..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Creating monitoring directory structure..."

# Create log directories
sudo mkdir -p /var/log/hrms-elite
sudo chown $USER:$USER /var/log/hrms-elite
sudo chmod 755 /var/log/hrms-elite

# Create log files
touch /var/log/hrms-elite/application.log
touch /var/log/hrms-elite/access.log
touch /var/log/hrms-elite/error.log
touch /var/log/hrms-elite/security.log
touch /var/log/hrms-elite/database.log
touch /var/log/hrms-elite/monitoring.log
touch /var/log/hrms-elite/backup.log
touch /var/log/hrms-elite/audit.log

print_success "Log directories and files created"

# Install logrotate configuration
print_status "Installing logrotate configuration..."
sudo cp logrotate/hrms-elite.conf /etc/logrotate.d/hrms-elite
sudo chmod 644 /etc/logrotate.d/hrms-elite
print_success "Logrotate configuration installed"

# Create monitoring user
print_status "Creating monitoring user..."
if ! id "hrms" &>/dev/null; then
    sudo useradd -r -s /bin/false hrms
    print_success "Monitoring user 'hrms' created"
else
    print_warning "User 'hrms' already exists"
fi

# Set up logrotate permissions
sudo chown -R hrms:hrms /var/log/hrms-elite
sudo chmod -R 755 /var/log/hrms-elite

# Create monitoring data directories
print_status "Creating monitoring data directories..."
mkdir -p monitoring-data/prometheus
mkdir -p monitoring-data/grafana
mkdir -p monitoring-data/alertmanager
mkdir -p monitoring-data/loki

print_success "Monitoring data directories created"

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f .env ]; then
    cat > .env << EOF
# HRMS Elite Monitoring Environment Variables

# Email Configuration for Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hrms-alerts@yourcompany.com
SMTP_PASS=your-app-password

# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=hrms-admin-2024
GRAFANA_SECURITY_ADMIN_USER=admin

# Prometheus Configuration
PROMETHEUS_RETENTION_TIME=200h
PROMETHEUS_STORAGE_PATH=./monitoring-data/prometheus

# AlertManager Configuration
ALERTMANAGER_STORAGE_PATH=./monitoring-data/alertmanager

# Loki Configuration
LOKI_STORAGE_PATH=./monitoring-data/loki

# Application Configuration
HRMS_APP_PORT=3000
HRMS_APP_HOST=127.0.0.1

# Database Configuration (if using PostgreSQL)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hrms_db
POSTGRES_USER=hrms_user
POSTGRES_PASSWORD=hrms_password
EOF
    print_success "Environment file created"
else
    print_warning "Environment file already exists"
fi

# Start monitoring services
print_status "Starting monitoring services..."
cd monitoring
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose ps

# Test Prometheus
print_status "Testing Prometheus..."
if curl -s http://localhost:9090/api/v1/status/config > /dev/null; then
    print_success "Prometheus is running"
else
    print_error "Prometheus failed to start"
fi

# Test Grafana
print_status "Testing Grafana..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    print_success "Grafana is running"
else
    print_error "Grafana failed to start"
fi

# Test AlertManager
print_status "Testing AlertManager..."
if curl -s http://localhost:9093/api/v1/status > /dev/null; then
    print_success "AlertManager is running"
else
    print_error "AlertManager failed to start"
fi

# Create systemd service for logrotate (optional)
print_status "Setting up logrotate service..."
sudo tee /etc/systemd/system/hrms-logrotate.service > /dev/null << EOF
[Unit]
Description=HRMS Elite Log Rotation
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/logrotate /etc/logrotate.d/hrms-elite
User=root

[Install]
WantedBy=multi-user.target
EOF

# Create timer for logrotate
sudo tee /etc/systemd/system/hrms-logrotate.timer > /dev/null << EOF
[Unit]
Description=Run HRMS Elite log rotation daily
Requires=hrms-logrotate.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Enable and start logrotate timer
sudo systemctl daemon-reload
sudo systemctl enable hrms-logrotate.timer
sudo systemctl start hrms-logrotate.timer

print_success "Logrotate service configured"

# Create monitoring dashboard setup script
print_status "Creating dashboard setup script..."
cat > setup-dashboards.sh << 'EOF'
#!/bin/bash

# Setup Grafana Dashboards
echo "Setting up Grafana dashboards..."

# Wait for Grafana to be ready
until curl -s http://localhost:3001/api/health; do
    echo "Waiting for Grafana..."
    sleep 5
done

# Import HRMS Elite dashboard
curl -X POST \
  http://admin:hrms-admin-2024@localhost:3001/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @grafana/dashboards/hrms-elite-dashboard.json

echo "Dashboard setup complete!"
EOF

chmod +x setup-dashboards.sh

print_success "Dashboard setup script created"

# Create monitoring status script
print_status "Creating monitoring status script..."
cat > monitoring-status.sh << 'EOF'
#!/bin/bash

echo "=== HRMS Elite Monitoring Status ==="
echo

echo "Docker Services:"
docker-compose ps
echo

echo "Service URLs:"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001 (admin/hrms-admin-2024)"
echo "AlertManager: http://localhost:9093"
echo "Loki: http://localhost:3100"
echo

echo "Log Files:"
ls -la /var/log/hrms-elite/
echo

echo "Logrotate Status:"
sudo systemctl status hrms-logrotate.timer
echo

echo "Recent Logs:"
tail -n 10 /var/log/hrms-elite/application.log
EOF

chmod +x monitoring-status.sh

print_success "Monitoring status script created"

# Create monitoring logs
print_status "Creating initial monitoring logs..."
cat > /var/log/hrms-elite/monitoring.log << EOF
$(date): HRMS Elite monitoring system initialized
$(date): Prometheus started on port 9090
$(date): Grafana started on port 3001
$(date): AlertManager started on port 9093
$(date): Logrotate configured for daily rotation
EOF

print_success "Initial monitoring logs created"

# Final status
echo
print_success "🎉 HRMS Elite Monitoring System Setup Complete!"
echo
echo "📊 Monitoring Services:"
echo "  • Prometheus: http://localhost:9090"
echo "  • Grafana: http://localhost:3001 (admin/hrms-admin-2024)"
echo "  • AlertManager: http://localhost:9093"
echo "  • Loki: http://localhost:3100"
echo
echo "📁 Log Files: /var/log/hrms-elite/"
echo "📋 Status Check: ./monitoring-status.sh"
echo "📊 Dashboard Setup: ./setup-dashboards.sh"
echo
echo "⚠️  Next Steps:"
echo "  1. Update .env file with your email settings"
echo "  2. Run ./setup-dashboards.sh to import dashboards"
echo "  3. Configure alert rules in prometheus/rules/alerts.yml"
echo "  4. Test the monitoring system with ./monitoring-status.sh"
echo
print_success "Setup completed successfully!" 