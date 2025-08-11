# HRMS Elite Monitoring System

A comprehensive monitoring and alerting system for the HRMS Elite application using Prometheus, Grafana, AlertManager, and centralized logging.

## 📊 Overview

This monitoring system provides:

- **Metrics Collection**: Prometheus-based metrics collection
- **Visualization**: Grafana dashboards for real-time monitoring
- **Alerting**: Email alerts for critical system issues
- **Log Management**: Centralized logging with logrotate
- **Performance Monitoring**: Application and system performance metrics

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HRMS Elite    │    │   Prometheus    │    │     Grafana     │
│   Application   │───▶│   (Metrics)     │───▶│  (Dashboard)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │  AlertManager   │              │
         │              │   (Alerts)      │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Promtail      │    │      Loki       │    │   logrotate     │
│ (Log Collector) │───▶│  (Log Storage)  │    │ (Log Rotation)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Linux/Unix system (for logrotate)
- SMTP server for email alerts

### Installation

1. **Clone and navigate to the monitoring directory:**
   ```bash
   cd monitoring
   ```

2. **Run the setup script:**
   ```bash
   chmod +x setup-monitoring.sh
   ./setup-monitoring.sh
   ```

3. **Configure email alerts:**
   ```bash
   # Edit the .env file
   nano .env
   ```

4. **Import dashboards:**
   ```bash
   ./setup-dashboards.sh
   ```

5. **Check status:**
   ```bash
   ./monitoring-status.sh
   ```

## 📋 Services

### Prometheus (Port 9090)
- **Purpose**: Metrics collection and storage
- **URL**: http://localhost:9090
- **Configuration**: `prometheus/prometheus.yml`
- **Alert Rules**: `prometheus/rules/alerts.yml`

### Grafana (Port 3001)
- **Purpose**: Metrics visualization and dashboards
- **URL**: http://localhost:3001
- **Credentials**: admin/hrms-admin-2024
- **Dashboards**: `grafana/dashboards/`

### AlertManager (Port 9093)
- **Purpose**: Alert routing and notifications
- **URL**: http://localhost:9093
- **Configuration**: `alertmanager/alertmanager.yml`

### Loki (Port 3100)
- **Purpose**: Log aggregation and storage
- **URL**: http://localhost:3100
- **Configuration**: `promtail-config.yml`

### Node Exporter (Port 9100)
- **Purpose**: System metrics collection
- **URL**: http://localhost:9100

## 📊 Metrics

### Application Metrics
- HTTP request rate and response times
- Error rates and status codes
- Active users count
- Database connection status
- Memory and CPU usage

### System Metrics
- CPU, memory, and disk usage
- Network traffic
- Process statistics
- Container metrics (via cAdvisor)

### Business Metrics
- User activity patterns
- API endpoint usage
- Database performance
- Security events

## 🔔 Alerts

### Critical Alerts
- Application down
- High error rate (>5%)
- Database connection issues
- Low disk space (<10%)

### Warning Alerts
- High CPU usage (>80%)
- High memory usage (>85%)
- High response time (>2s)
- High disk usage (>90%)

### Email Configuration
Update the AlertManager configuration in `alertmanager/alertmanager.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'hrms-alerts@yourcompany.com'
  smtp_auth_username: 'hrms-alerts@yourcompany.com'
  smtp_auth_password: 'your-app-password'
```

## 📁 Log Management

### Log Files
- `/var/log/hrms-elite/application.log` - Application logs
- `/var/log/hrms-elite/access.log` - Access logs
- `/var/log/hrms-elite/error.log` - Error logs
- `/var/log/hrms-elite/security.log` - Security logs
- `/var/log/hrms-elite/database.log` - Database logs
- `/var/log/hrms-elite/monitoring.log` - Monitoring logs
- `/var/log/hrms-elite/backup.log` - Backup logs
- `/var/log/hrms-elite/audit.log` - Audit logs

### Log Rotation
- **Frequency**: Daily rotation
- **Retention**: 30 days (90 days for audit logs)
- **Compression**: Enabled
- **Configuration**: `/etc/logrotate.d/hrms-elite`

## 🛠️ Configuration

### Environment Variables
Create a `.env` file in the monitoring directory:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hrms-alerts@yourcompany.com
SMTP_PASS=your-app-password

# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=hrms-admin-2024

# Prometheus Configuration
PROMETHEUS_RETENTION_TIME=200h

# Application Configuration
HRMS_APP_PORT=3000
HRMS_APP_HOST=127.0.0.1
```

### Custom Metrics
Add custom metrics in your application:

```typescript
import { metricsUtils } from './middleware/metrics';

// Increment a counter
metricsUtils.incrementMetric('user_login_total');

// Set a gauge
metricsUtils.setMetric('active_sessions', 25);

// Update active users
metricsUtils.updateActiveUsers(150);
```

## 📈 Dashboards

### HRMS Elite Dashboard
- System overview and health status
- CPU, memory, and disk usage
- HTTP request metrics
- Error rates and response times
- Database performance
- Network traffic

### Custom Dashboards
Create custom dashboards in Grafana:
1. Access Grafana at http://localhost:3001
2. Login with admin/hrms-admin-2024
3. Create new dashboard
4. Add panels with Prometheus queries

## 🔧 Maintenance

### Daily Tasks
- Check alert status in AlertManager
- Review error logs
- Monitor dashboard metrics

### Weekly Tasks
- Review log rotation
- Check disk space usage
- Update alert thresholds if needed

### Monthly Tasks
- Review and clean old metrics data
- Update monitoring configuration
- Performance analysis and optimization

## 🚨 Troubleshooting

### Common Issues

1. **Prometheus not scraping metrics**
   ```bash
   # Check if HRMS app is running
   curl http://localhost:3000/metrics
   
   # Check Prometheus targets
   curl http://localhost:9090/api/v1/targets
   ```

2. **Grafana not loading dashboards**
   ```bash
   # Check Grafana logs
   docker-compose logs grafana
   
   # Restart Grafana
   docker-compose restart grafana
   ```

3. **Email alerts not working**
   ```bash
   # Test SMTP configuration
   curl -X POST http://localhost:9093/api/v1/test
   
   # Check AlertManager logs
   docker-compose logs alertmanager
   ```

4. **Log rotation not working**
   ```bash
   # Check logrotate status
   sudo systemctl status hrms-logrotate.timer
   
   # Test logrotate manually
   sudo logrotate -d /etc/logrotate.d/hrms-elite
   ```

### Log Locations
- **Application logs**: `/var/log/hrms-elite/`
- **Docker logs**: `docker-compose logs [service-name]`
- **System logs**: `/var/log/syslog`

## 📚 API Endpoints

### Metrics Endpoint
```
GET /metrics
```
Returns Prometheus-formatted metrics

### Health Check
```
GET /api/health
```
Returns enhanced health status with metrics

### Prometheus Targets
```
GET http://localhost:9090/api/v1/targets
```
Shows all monitored targets

## 🔒 Security

### Access Control
- Grafana: admin/hrms-admin-2024
- Prometheus: No authentication (internal network only)
- AlertManager: No authentication (internal network only)

### Network Security
- All services run on localhost
- Use reverse proxy for external access
- Implement proper firewall rules

### Data Protection
- Log files have restricted permissions
- Sensitive data is not logged
- Regular log rotation prevents data accumulation

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review service logs
3. Check the HRMS Elite documentation
4. Contact the development team

## 📄 License

This monitoring system is part of the HRMS Elite project and follows the same license terms. 