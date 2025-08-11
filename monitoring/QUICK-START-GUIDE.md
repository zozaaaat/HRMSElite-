# HRMS Elite Monitoring & Alerting - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Prerequisites Check
```bash
# Check if Docker is installed
docker --version

# Check if Docker Compose is installed
docker-compose --version

# Check if you have sudo access
sudo whoami
```

### 2. Start Monitoring System
```bash
# Navigate to monitoring directory
cd monitoring

# Make setup script executable
chmod +x setup-monitoring.sh

# Run the setup script
./setup-monitoring.sh
```

### 3. Configure Email Alerts
```bash
# Edit the environment file
nano .env

# Update these values:
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Import Dashboards
```bash
# Run dashboard setup
./setup-dashboards.sh
```

### 5. Check Status
```bash
# Check all services
./monitoring-status.sh
```

## 📊 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3001 | admin/hrms-admin-2024 |
| **Prometheus** | http://localhost:9090 | No auth |
| **AlertManager** | http://localhost:9093 | No auth |
| **Loki** | http://localhost:3100 | No auth |

## 🔔 Test Alerts

### 1. Test Email Configuration
```bash
# Test AlertManager
curl -X POST http://localhost:9093/api/v1/test
```

### 2. Trigger Test Alert
```bash
# Create a test alert
curl -X POST http://localhost:9090/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '{
    "alerts": [{
      "labels": {
        "alertname": "TestAlert",
        "severity": "warning"
      },
      "annotations": {
        "summary": "Test Alert",
        "description": "This is a test alert"
      }
    }]
  }'
```

## 📁 Log Files

### View Logs
```bash
# Application logs
tail -f /var/log/hrms-elite/application.log

# Error logs
tail -f /var/log/hrms-elite/error.log

# Security logs
tail -f /var/log/hrms-elite/security.log

# Monitoring logs
tail -f /var/log/hrms-elite/monitoring.log
```

### Log Locations
- **Application**: `/var/log/hrms-elite/application.log`
- **Access**: `/var/log/hrms-elite/access.log`
- **Error**: `/var/log/hrms-elite/error.log`
- **Security**: `/var/log/hrms-elite/security.log`
- **Database**: `/var/log/hrms-elite/database.log`
- **Monitoring**: `/var/log/hrms-elite/monitoring.log`
- **Backup**: `/var/log/hrms-elite/backup.log`
- **Audit**: `/var/log/hrms-elite/audit.log`

## 🔧 Common Commands

### Service Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart grafana

# View service logs
docker-compose logs prometheus
docker-compose logs alertmanager
docker-compose logs grafana
```

### Monitoring Commands
```bash
# Check service status
docker-compose ps

# View metrics endpoint
curl http://localhost:3000/metrics

# Check health endpoint
curl http://localhost:3000/api/health

# View Prometheus targets
curl http://localhost:9090/api/v1/targets
```

### Log Management
```bash
# Test logrotate
sudo logrotate -d /etc/logrotate.d/hrms-elite

# Check logrotate status
sudo systemctl status hrms-logrotate.timer

# Manual log rotation
sudo logrotate /etc/logrotate.d/hrms-elite
```

## 🚨 Troubleshooting

### Service Not Starting
```bash
# Check Docker status
docker ps

# Check service logs
docker-compose logs

# Restart Docker
sudo systemctl restart docker
```

### Metrics Not Showing
```bash
# Check if HRMS app is running
curl http://localhost:3000/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Restart Prometheus
docker-compose restart prometheus
```

### Email Alerts Not Working
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check AlertManager logs
docker-compose logs alertmanager

# Test email configuration
curl -X POST http://localhost:9093/api/v1/test
```

### Grafana Dashboard Issues
```bash
# Check Grafana logs
docker-compose logs grafana

# Restart Grafana
docker-compose restart grafana

# Clear Grafana cache
docker-compose exec grafana rm -rf /var/lib/grafana/grafana.db
```

## 📈 Dashboard Setup

### Import HRMS Dashboard
1. Open Grafana: http://localhost:3001
2. Login: admin/hrms-admin-2024
3. Go to Dashboards → Import
4. Upload: `grafana/dashboards/hrms-elite-dashboard.json`

### Create Custom Dashboard
1. Go to Dashboards → New Dashboard
2. Add panels with Prometheus queries
3. Save dashboard

## 🔒 Security Notes

### Default Credentials
- **Grafana**: admin/hrms-admin-2024
- **Change these in production**

### Network Access
- All services run on localhost
- Use reverse proxy for external access
- Configure firewall rules

### Data Protection
- Log files have restricted permissions
- Sensitive data is not logged
- Regular log rotation

## 📞 Support

### Quick Help
```bash
# View all logs
docker-compose logs

# Check service status
./monitoring-status.sh

# View configuration
cat docker-compose.yml
cat prometheus/prometheus.yml
cat alertmanager/alertmanager.yml
```

### Documentation
- **Full Guide**: `monitoring/README.md`
- **Implementation**: `MONITORING-ALERTING-IMPLEMENTATION.md`
- **Troubleshooting**: Check logs and service status

### Contact
- Check service logs for errors
- Review configuration files
- Contact development team

## 🎯 Next Steps

1. **Configure Email Alerts**: Update `.env` with your SMTP settings
2. **Import Dashboards**: Run `./setup-dashboards.sh`
3. **Test Alerts**: Trigger test alerts to verify email delivery
4. **Customize Alerts**: Modify `prometheus/rules/alerts.yml`
5. **Monitor Performance**: Use Grafana dashboards
6. **Set Up Logs**: Configure log collection and rotation

## ✅ Verification Checklist

- [ ] Docker services are running
- [ ] Grafana is accessible at http://localhost:3001
- [ ] Prometheus is accessible at http://localhost:9090
- [ ] AlertManager is accessible at http://localhost:9093
- [ ] Email alerts are configured
- [ ] Log files are being created
- [ ] Metrics endpoint is responding
- [ ] Health check is working
- [ ] Dashboards are imported
- [ ] Test alerts are working

## 🎉 Success!

Your HRMS Elite monitoring and alerting system is now ready! You have:

- ✅ Real-time system monitoring
- ✅ Automated alerting
- ✅ Centralized log management
- ✅ Performance dashboards
- ✅ Email notifications
- ✅ Log rotation

Monitor your system at http://localhost:3001 and receive alerts via email!
