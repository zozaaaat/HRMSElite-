# HRMS Elite Monitoring & Alerting System Implementation

## 🎯 Overview

Successfully implemented a comprehensive monitoring and alerting system for the HRMS Elite application, providing real-time visibility into system performance, automated alerting, and centralized log management.

## ✅ Implemented Components

### 1. **Prometheus + Grafana Stack**
- **Prometheus**: Metrics collection and storage (Port 9090)
- **Grafana**: Real-time dashboards and visualization (Port 3001)
- **AlertManager**: Alert routing and notifications (Port 9093)
- **Node Exporter**: System metrics collection (Port 9100)
- **cAdvisor**: Container metrics (Port 8080)
- **Loki**: Log aggregation (Port 3100)
- **Promtail**: Log collection

### 2. **Log Management (logrotate)**
- Automated log rotation and compression
- Configurable retention policies (30-90 days)
- Systemd service integration
- Multiple log file types support

### 3. **Email Alerting System**
- SMTP-based email notifications
- Configurable alert severity levels (Critical/Warning)
- HTML-formatted alert messages
- Multiple recipient groups

## 📁 File Structure

```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Prometheus configuration
│   └── rules/
│       └── alerts.yml          # Alert rules (10+ alerts)
├── alertmanager/
│   └── alertmanager.yml        # AlertManager configuration
├── grafana/
│   ├── dashboards/
│   │   └── hrms-elite-dashboard.json
│   └── datasources/
│       └── prometheus.yml
├── logrotate/
│   └── hrms-elite.conf         # Log rotation configuration
├── docker-compose.yml          # Monitoring stack orchestration
├── promtail-config.yml         # Log collection configuration
├── setup-monitoring.sh         # Automated setup script
└── README.md                   # Comprehensive documentation
```

## 🔧 Application Integration

### Metrics Middleware
- **File**: `server/middleware/metrics.ts`
- **Features**:
  - HTTP request metrics collection
  - Response time tracking
  - Error rate monitoring
  - System resource usage
  - Custom business metrics
  - Prometheus format export

### Health Check Endpoint
- **Endpoint**: `/api/health`
- **Features**:
  - Enhanced health status
  - Metrics information
  - Security status
  - System uptime

### Metrics Endpoint
- **Endpoint**: `/metrics`
- **Features**:
  - Prometheus-formatted metrics
  - Real-time data export
  - Custom business metrics

## 📊 Monitoring Metrics

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
- Container metrics

### Business Metrics
- User activity patterns
- API endpoint usage
- Database performance
- Security events

## 🔔 Alert Rules

### Critical Alerts
1. **Application Down**: `up{job="hrms-elite"} == 0`
2. **High Error Rate**: Error rate > 5%
3. **Database Connection Issues**: Database exporter down
4. **Low Disk Space**: Disk space < 10%

### Warning Alerts
1. **High CPU Usage**: CPU usage > 80%
2. **High Memory Usage**: Memory usage > 85%
3. **High Response Time**: 95th percentile > 2s
4. **High Disk Usage**: Disk usage > 90%
5. **High Network Usage**: Network receive > 1GB/s
6. **Memory Leak**: Memory increase > 100MB/hour

## 📧 Email Alert Configuration

### Alert Severity Levels
- **Critical**: Immediate action required
- **Warning**: Monitor and investigate

### Email Recipients
- **Critical Alerts**: admin@yourcompany.com, hrms-admin@yourcompany.com
- **Warning Alerts**: hrms-team@yourcompany.com
- **General Alerts**: hrms-team@yourcompany.com

### SMTP Configuration
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

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Linux/Unix system (for logrotate)
- SMTP server for email alerts

### Installation
```bash
cd monitoring
chmod +x setup-monitoring.sh
./setup-monitoring.sh
```

### Configuration
1. Update `.env` file with email settings
2. Run `./setup-dashboards.sh` to import dashboards
3. Configure alert rules in `prometheus/rules/alerts.yml`
4. Test with `./monitoring-status.sh`

## 📊 Dashboards

### HRMS Elite Dashboard
- System overview and health status
- CPU, memory, and disk usage
- HTTP request metrics
- Error rates and response times
- Database performance
- Network traffic

### Custom Dashboards
- Create custom dashboards in Grafana
- Access at http://localhost:3001
- Login: admin/hrms-admin-2024

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
   curl http://localhost:3000/metrics
   curl http://localhost:9090/api/v1/targets
   ```

2. **Grafana not loading dashboards**
   ```bash
   docker-compose logs grafana
   docker-compose restart grafana
   ```

3. **Email alerts not working**
   ```bash
   curl -X POST http://localhost:9093/api/v1/test
   docker-compose logs alertmanager
   ```

4. **Log rotation not working**
   ```bash
   sudo systemctl status hrms-logrotate.timer
   sudo logrotate -d /etc/logrotate.d/hrms-elite
   ```

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

## 🎉 Success Metrics

### Implementation Status
- ✅ Prometheus + Grafana stack deployed
- ✅ AlertManager with email notifications configured
- ✅ Logrotate with automated log management
- ✅ Application metrics integration
- ✅ Comprehensive alert rules
- ✅ Monitoring dashboards
- ✅ Automated setup scripts
- ✅ Documentation and guides

### Performance Benefits
- Real-time system visibility
- Proactive issue detection
- Automated alerting
- Centralized log management
- Historical data retention
- Performance optimization insights

### Business Value
- Reduced downtime through proactive monitoring
- Faster issue resolution with detailed metrics
- Improved system reliability
- Better resource utilization
- Enhanced security monitoring
- Compliance with audit requirements
