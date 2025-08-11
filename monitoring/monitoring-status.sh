#!/bin/bash

# HRMS Elite Monitoring Status Script
# This script checks the status of all monitoring services and provides a comprehensive overview

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "${CYAN}📋 $1${NC}"
}

# Check if we're in the monitoring directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the monitoring directory"
    exit 1
fi

print_header "HRMS Elite Monitoring System Status"
echo

# Check Docker services
print_section "Docker Services Status"
if command -v docker-compose &> /dev/null; then
    if docker-compose ps | grep -q "Up"; then
        print_success "Docker services are running"
        echo
        docker-compose ps
    else
        print_error "Docker services are not running"
        echo "Run: docker-compose up -d"
    fi
else
    print_error "Docker Compose is not installed"
fi
echo

# Check service endpoints
print_section "Service Endpoints"
echo

# Prometheus
print_info "Checking Prometheus..."
if curl -s http://localhost:9090/api/v1/status/config > /dev/null 2>&1; then
    print_success "Prometheus is accessible at http://localhost:9090"
else
    print_error "Prometheus is not accessible"
fi

# Grafana
print_info "Checking Grafana..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Grafana is accessible at http://localhost:3001"
    print_info "Login: admin/hrms-admin-2024"
else
    print_error "Grafana is not accessible"
fi

# AlertManager
print_info "Checking AlertManager..."
if curl -s http://localhost:9093/api/v1/status > /dev/null 2>&1; then
    print_success "AlertManager is accessible at http://localhost:9093"
else
    print_error "AlertManager is not accessible"
fi

# Loki
print_info "Checking Loki..."
if curl -s http://localhost:3100/ready > /dev/null 2>&1; then
    print_success "Loki is accessible at http://localhost:3100"
else
    print_error "Loki is not accessible"
fi

echo

# Check log files
print_section "Log Files Status"
echo

LOG_DIR="/var/log/hrms-elite"
if [ -d "$LOG_DIR" ]; then
    print_success "Log directory exists: $LOG_DIR"
    echo
    echo "Log files:"
    ls -la "$LOG_DIR"/*.log 2>/dev/null | while read -r line; do
        if [ -n "$line" ]; then
            print_info "$line"
        fi
    done
    
    # Check log file sizes
    echo
    echo "Log file sizes:"
    for logfile in "$LOG_DIR"/*.log; do
        if [ -f "$logfile" ]; then
            size=$(du -h "$logfile" | cut -f1)
            print_info "$(basename "$logfile"): $size"
        fi
    done
else
    print_error "Log directory does not exist: $LOG_DIR"
    print_info "Run: sudo mkdir -p $LOG_DIR"
fi

echo

# Check logrotate
print_section "Logrotate Status"
echo

if systemctl is-active --quiet hrms-logrotate.timer; then
    print_success "Logrotate timer is active"
else
    print_warning "Logrotate timer is not active"
    print_info "Run: sudo systemctl enable hrms-logrotate.timer"
fi

if [ -f "/etc/logrotate.d/hrms-elite" ]; then
    print_success "Logrotate configuration exists"
else
    print_error "Logrotate configuration missing"
    print_info "Run: sudo cp logrotate/hrms-elite.conf /etc/logrotate.d/hrms-elite"
fi

echo

# Check metrics endpoint
print_section "Application Metrics"
echo

if curl -s http://localhost:3000/metrics > /dev/null 2>&1; then
    print_success "Metrics endpoint is responding"
    
    # Get some basic metrics
    metrics=$(curl -s http://localhost:3000/metrics)
    
    # Check for specific metrics
    if echo "$metrics" | grep -q "http_requests_total"; then
        print_success "HTTP request metrics are available"
    else
        print_warning "HTTP request metrics not found"
    fi
    
    if echo "$metrics" | grep -q "active_users"; then
        print_success "Active users metric is available"
    else
        print_warning "Active users metric not found"
    fi
    
    if echo "$metrics" | grep -q "database_connections"; then
        print_success "Database connections metric is available"
    else
        print_warning "Database connections metric not found"
    fi
else
    print_error "Metrics endpoint is not responding"
    print_info "Make sure the HRMS application is running on port 3000"
fi

echo

# Check health endpoint
print_section "Health Check"
echo

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Health endpoint is responding"
    
    # Get health data
    health_data=$(curl -s http://localhost:3000/api/health)
    
    # Extract status
    status=$(echo "$health_data" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$status" = "OK" ]; then
        print_success "Application health status: $status"
    else
        print_warning "Application health status: $status"
    fi
    
    # Extract uptime
    uptime=$(echo "$health_data" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)
    if [ -n "$uptime" ]; then
        print_info "Application uptime: ${uptime}s"
    fi
else
    print_error "Health endpoint is not responding"
fi

echo

# Check Prometheus targets
print_section "Prometheus Targets"
echo

if curl -s http://localhost:9090/api/v1/targets > /dev/null 2>&1; then
    targets_data=$(curl -s http://localhost:9090/api/v1/targets)
    
    # Count active targets
    active_targets=$(echo "$targets_data" | grep -c '"health":"up"' || echo "0")
    total_targets=$(echo "$targets_data" | grep -c '"health"' || echo "0")
    
    if [ "$active_targets" -eq "$total_targets" ] && [ "$total_targets" -gt 0 ]; then
        print_success "All Prometheus targets are healthy ($active_targets/$total_targets)"
    elif [ "$active_targets" -gt 0 ]; then
        print_warning "Some Prometheus targets are down ($active_targets/$total_targets)"
    else
        print_error "No Prometheus targets are healthy"
    fi
    
    # List targets
    echo
    echo "Target details:"
    echo "$targets_data" | grep -E '"job":"[^"]*"' | while read -r line; do
        job=$(echo "$line" | grep -o '"job":"[^"]*"' | cut -d'"' -f4)
        health=$(echo "$line" | grep -o '"health":"[^"]*"' | cut -d'"' -f4)
        if [ "$health" = "up" ]; then
            print_success "$job: $health"
        else
            print_error "$job: $health"
        fi
    done
else
    print_error "Cannot access Prometheus targets"
fi

echo

# Check AlertManager alerts
print_section "AlertManager Status"
echo

if curl -s http://localhost:9093/api/v1/alerts > /dev/null 2>&1; then
    alerts_data=$(curl -s http://localhost:9093/api/v1/alerts)
    
    # Count active alerts
    active_alerts=$(echo "$alerts_data" | grep -c '"state":"active"' || echo "0")
    
    if [ "$active_alerts" -eq 0 ]; then
        print_success "No active alerts"
    else
        print_warning "$active_alerts active alert(s)"
        
        # List active alerts
        echo
        echo "Active alerts:"
        echo "$alerts_data" | grep -A 5 '"state":"active"' | while read -r line; do
            if echo "$line" | grep -q '"alertname"'; then
                alertname=$(echo "$line" | grep -o '"alertname":"[^"]*"' | cut -d'"' -f4)
                print_warning "Alert: $alertname"
            fi
        done
    fi
else
    print_error "Cannot access AlertManager"
fi

echo

# Check system resources
print_section "System Resources"
echo

# CPU usage
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$cpu_usage < 80" | bc -l) )); then
    print_success "CPU usage: ${cpu_usage}%"
else
    print_warning "CPU usage: ${cpu_usage}%"
fi

# Memory usage
memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
if (( $(echo "$memory_usage < 85" | bc -l) )); then
    print_success "Memory usage: ${memory_usage}%"
else
    print_warning "Memory usage: ${memory_usage}%"
fi

# Disk usage
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 90 ]; then
    print_success "Disk usage: ${disk_usage}%"
else
    print_warning "Disk usage: ${disk_usage}%"
fi

echo

# Summary
print_header "Summary"
echo

# Count issues
issues=0
if ! docker-compose ps | grep -q "Up"; then
    ((issues++))
fi
if ! curl -s http://localhost:9090/api/v1/status/config > /dev/null 2>&1; then
    ((issues++))
fi
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    ((issues++))
fi
if ! curl -s http://localhost:3000/metrics > /dev/null 2>&1; then
    ((issues++))
fi

if [ "$issues" -eq 0 ]; then
    print_success "All monitoring systems are healthy! 🎉"
    echo
    print_info "Access your dashboards:"
    print_info "• Grafana: http://localhost:3001 (admin/hrms-admin-2024)"
    print_info "• Prometheus: http://localhost:9090"
    print_info "• AlertManager: http://localhost:9093"
    print_info "• Loki: http://localhost:3100"
else
    print_warning "$issues issue(s) detected"
    echo
    print_info "Troubleshooting steps:"
    print_info "1. Check Docker services: docker-compose ps"
    print_info "2. View service logs: docker-compose logs [service-name]"
    print_info "3. Restart services: docker-compose restart"
    print_info "4. Check application: curl http://localhost:3000/health"
fi

echo
print_header "End of Status Report"
echo
print_info "For more information, see:"
print_info "• Quick Start Guide: monitoring/QUICK-START-GUIDE.md"
print_info "• Full Documentation: monitoring/README.md"
print_info "• Implementation Summary: MONITORING-ALERTING-IMPLEMENTATION.md"
