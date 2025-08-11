# HRMS Elite - DevOps Documentation

## 📋 Table of Contents

1. [Server Management](#server-management)
2. [Restart Commands](#restart-commands) ✅
3. [Manual Backup Procedures](#manual-backup-procedures) ✅
4. [Emergency Procedures](#emergency-procedures) ✅
5. [Monitoring & Health Checks](#monitoring--health-checks)
6. [Troubleshooting](#troubleshooting)
7. [Security Procedures](#security-procedures)
8. [Performance Optimization](#performance-optimization)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Quality Monitoring](#quality-monitoring)
11. [Mobile & Desktop Support](#mobile--desktop-support)

---

## 🖥️ Server Management

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS / CentOS Stream 9

### Server Setup

#### 1. Initial Server Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip htop

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Node.js (if needed for development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

#### 3. SSL Certificate Setup
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Service Management

#### Docker Services
```bash
# View all running services
docker ps

# View service logs
docker logs hrms-app
docker logs nginx
docker logs hrms-db

# Check service status
docker-compose ps

# View resource usage
docker stats
```

#### System Services
```bash
# Check system status
systemctl status

# View system logs
journalctl -f

# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
htop
```

---

## 🔄 Restart Commands

### Application Restart

#### Full Application Restart
```bash
# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

#### Individual Service Restart
```bash
# Restart specific service
docker-compose restart hrms-app
docker-compose restart nginx
docker-compose restart hrms-db

# Restart with rebuild
docker-compose up -d --build hrms-app
```

#### Graceful Restart
```bash
# Restart with zero downtime
docker-compose up -d --no-deps --build hrms-app
docker-compose restart nginx
```

### System Restart

#### Emergency Restart
```bash
# Force restart all containers
docker-compose down --remove-orphans
docker-compose up -d

# Restart Docker service
sudo systemctl restart docker
```

#### Rolling Restart
```bash
# Restart services one by one
docker-compose restart hrms-db
sleep 10
docker-compose restart hrms-app
sleep 10
docker-compose restart nginx
```

### Database Restart
```bash
# Restart database only
docker-compose restart hrms-db

# Check database health
docker-compose exec hrms-db sqlite3 /app/data/hrms.db ".tables"

# Backup before restart
./scripts/backup.sh

# Emergency database recovery
./scripts/restore.sh --latest
```

### Quick Restart Scripts
```bash
# Windows quick restart
./scripts/QUICK-START.bat

# Full system restart
./scripts/START-FULL-VERSION.bat

# Production restart
./scripts/START-PRODUCTION.bat

# Check and run
./scripts/CHECK-AND-RUN.bat
```

---

## 💾 Manual Backup Procedures

### Database Backup

#### Quick Backup
```bash
# Create immediate backup
./scripts/backup.sh

# Create backup with custom name
./scripts/backup.sh --name "emergency_backup_$(date +%Y%m%d_%H%M%S)"
```

#### Full System Backup
```bash
# Backup database
./scripts/backup.sh

# Backup configuration files
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  deploy/ \
  scripts/ \
  monitoring/ \
  docs/

# Backup application data
tar -czf app_data_backup_$(date +%Y%m%d).tar.gz \
  dev.db \
  .backup/ \
  public/demo-data/
```

#### Automated Backup Schedule
```bash
# Add to crontab (every 6 hours)
0 */6 * * * /path/to/HRMSElite/scripts/backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/HRMSElite/scripts/backup.sh --name "daily_backup"
```

### Configuration Backup
```bash
# Backup environment files
cp deploy/.env deploy/.env.backup.$(date +%Y%m%d)

# Backup Docker configurations
cp deploy/docker-compose.yml deploy/docker-compose.yml.backup.$(date +%Y%m%d)

# Backup SSL certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem.backup
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem.backup
```

### Backup Verification
```bash
# Verify backup integrity
./scripts/restore.sh --validate-only latest

# Test restore (dry run)
./scripts/restore.sh --dry-run latest

# List all backups
./scripts/restore.sh --list
```

---

## 🚨 Emergency Procedures

### Application Down

#### Immediate Response
```bash
# 1. Check service status
docker-compose ps

# 2. Check logs for errors
docker-compose logs --tail=50 hrms-app

# 3. Restart application
docker-compose restart hrms-app

# 4. Check health endpoint
curl -f http://localhost:3000/health
```

#### If Restart Fails
```bash
# 1. Stop all services
docker-compose down

# 2. Check disk space
df -h

# 3. Check memory usage
free -h

# 4. Restart with fresh containers
docker-compose up -d --force-recreate
```

### Database Issues

#### Database Corruption
```bash
# 1. Stop application
docker-compose stop hrms-app

# 2. Create emergency backup
./scripts/backup.sh --force

# 3. Restore from latest backup
./scripts/restore.sh --latest

# 4. Restart application
docker-compose start hrms-app
```

#### Database Lock
```bash
# 1. Check for locked database
docker-compose exec hrms-db sqlite3 /app/data/hrms.db "PRAGMA integrity_check;"

# 2. Kill any hanging connections
docker-compose exec hrms-db pkill -f sqlite3

# 3. Restart database
docker-compose restart hrms-db
```

### SSL Certificate Issues

#### Certificate Expired
```bash
# 1. Renew certificate
sudo certbot renew

# 2. Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deploy/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deploy/ssl/key.pem

# 3. Restart nginx
docker-compose restart nginx
```

#### Certificate Not Found
```bash
# 1. Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deploy/ssl/key.pem \
  -out deploy/ssl/cert.pem

# 2. Restart nginx
docker-compose restart nginx
```

### High Resource Usage

#### High CPU Usage
```bash
# 1. Check CPU usage
htop

# 2. Identify resource-heavy processes
docker stats

# 3. Restart problematic service
docker-compose restart hrms-app

# 4. Scale down if needed
docker-compose up -d --scale hrms-app=1
```

#### High Memory Usage
```bash
# 1. Check memory usage
free -h

# 2. Clear Docker cache
docker system prune -f

# 3. Restart services
docker-compose restart

# 4. Check for memory leaks
docker-compose logs hrms-app | grep -i memory
```

### Security Incidents

#### Unauthorized Access
```bash
# 1. Check access logs
docker-compose logs nginx | grep -i "401\|403"

# 2. Block suspicious IPs
sudo ufw deny from <suspicious-ip>

# 3. Restart nginx with new rules
docker-compose restart nginx

# 4. Check for compromised files
find . -name "*.php" -exec grep -l "eval(" {} \;

# 5. Run security audit
node scripts/test-auth.js

# 6. Check authentication logs
docker-compose logs hrms-app | grep -i "auth\|login"
```

#### Data Breach Response
```bash
# 1. Immediately stop services
docker-compose down

# 2. Create forensic backup
./scripts/backup.sh --name "forensic_backup_$(date +%Y%m%d_%H%M%S)"

# 3. Check for unauthorized changes
git status
git diff

# 4. Restore from known good backup
./scripts/restore.sh --latest

# 5. Run security tests
node scripts/test-auth.js

# 6. Check system integrity
./scripts/check-system-status.bat
```

#### Data Breach Response
```bash
# 1. Immediately stop services
docker-compose down

# 2. Create forensic backup
./scripts/backup.sh --name "forensic_backup_$(date +%Y%m%d_%H%M%S)"

# 3. Check for unauthorized changes
git status
git diff

# 4. Restore from known good backup
./scripts/restore.sh --latest
```

---

## 📊 Monitoring & Health Checks

### Health Check Commands
```bash
# Application health
curl -f http://localhost:3000/health

# Database health
docker-compose exec hrms-db sqlite3 /app/data/hrms.db "SELECT 1;"

# Nginx health
curl -f http://localhost/nginx_status

# SSL certificate health
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Monitoring Dashboard
```bash
# Start monitoring stack
cd monitoring
docker-compose up -d

# Access Grafana
# URL: http://localhost:3001
# Username: admin
# Password: hrms-admin-2024
```

### Log Monitoring
```bash
# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f hrms-app
docker-compose logs -f nginx

# Search logs for errors
docker-compose logs | grep -i error
docker-compose logs | grep -i exception
```

### Performance Monitoring
```bash
# Check resource usage
docker stats

# Check disk I/O
iostat -x 1

# Check network usage
iftop

# Check memory usage
free -h
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Kill process using port
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp

# Restart services
docker-compose restart
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -f
docker volume prune -f

# Restart Docker service
sudo systemctl restart docker

# Rebuild containers
docker-compose up -d --build
```

#### Network Issues
```bash
# Check network connectivity
ping google.com

# Check DNS resolution
nslookup yourdomain.com

# Check firewall rules
sudo ufw status
```

### Debug Commands
```bash
# Debug application
docker-compose exec hrms-app npm run dev

# Debug database
docker-compose exec hrms-db sqlite3 /app/data/hrms.db ".schema"

# Debug nginx
docker-compose exec nginx nginx -t

# Check environment variables
docker-compose exec hrms-app env
```

### Advanced Troubleshooting
```bash
# System diagnostics
./scripts/check-system-status.bat

# Performance analysis
node scripts/performance-analyzer.js

# Quality monitoring
node scripts/quality-monitor.js

# Console log cleanup
./scripts/CLEANUP-CONSOLE-LOGS.bat

# Test backup system
./scripts/test-backup.bat
```

### System Recovery
```bash
# Full system reset
./scripts/CHECK-AND-RUN.bat

# Reset project (if needed)
cd hrms-mobile && node scripts/reset-project.js

# Clean and rebuild
npm run clean && npm run build

# Restore from backup
./scripts/restore.sh --latest
```

---

## 🔒 Security Procedures

### Regular Security Checks
```bash
# Check for security updates
sudo apt list --upgradable

# Update Docker images
docker-compose pull

# Check for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image hrms-elite:latest
```

### Access Control
```bash
# Check SSH access
sudo cat /var/log/auth.log | grep ssh

# Check failed login attempts
sudo grep "Failed password" /var/log/auth.log

# Block suspicious IPs
sudo ufw deny from <ip-address>
```

### Backup Security
```bash
# Encrypt backup files
gpg -c .backup/hrms_backup_*.db.gz

# Secure backup directory
chmod 700 .backup/
chown root:root .backup/

# Test backup restoration
./scripts/restore.sh --dry-run latest
```

---

## ⚡ Performance Optimization

### Application Optimization
```bash
# Enable gzip compression
# Already configured in nginx.conf

# Optimize database
docker-compose exec hrms-db sqlite3 /app/data/hrms.db "VACUUM;"

# Clear application cache
docker-compose exec hrms-app npm run clean
```

### System Optimization
```bash
# Optimize disk I/O
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# Optimize memory usage
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -p
```

### Monitoring Optimization
```bash
# Configure log rotation
sudo logrotate -f /etc/logrotate.d/hrms-elite

# Clean old logs
find /var/log -name "*.log" -mtime +30 -delete

# Optimize Prometheus retention
# Edit monitoring/prometheus/prometheus.yml
```

---

## 📞 Emergency Contacts

### Development Team
- **Lead Developer**: [Contact Information]
- **DevOps Engineer**: [Contact Information]
- **System Administrator**: [Contact Information]

### Hosting Provider
- **Support**: [Provider Support Contact]
- **Emergency**: [Provider Emergency Contact]

### External Services
- **SSL Certificate**: Let's Encrypt Support
- **Domain Registrar**: [Registrar Contact]
- **Backup Storage**: [Backup Provider Contact]

---

## 📋 Maintenance Checklist

### Daily Tasks
- [ ] Check application health
- [ ] Review error logs
- [ ] Monitor resource usage
- [ ] Verify backup completion
- [ ] Run quality checks
- [ ] Test PWA functionality
- [ ] Check mobile app status

### Weekly Tasks
- [ ] Update system packages
- [ ] Review security logs
- [ ] Test backup restoration
- [ ] Check SSL certificate status
- [ ] Run performance analysis
- [ ] Test CI/CD pipeline
- [ ] Review quality metrics

### Monthly Tasks
- [ ] Performance analysis
- [ ] Security audit
- [ ] Update documentation
- [ ] Review monitoring alerts
- [ ] Test disaster recovery
- [ ] Update mobile/desktop apps
- [ ] Review PWA functionality

### Quarterly Tasks
- [ ] Full system backup
- [ ] Disaster recovery test
- [ ] Security penetration test
- [ ] Performance optimization review
- [ ] Complete system audit
- [ ] Update all dependencies
- [ ] Review CI/CD effectiveness

---

## 🚀 CI/CD Pipeline

### Automated Testing
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance
```

### Deployment Pipeline
```bash
# Setup CI/CD environment
./scripts/setup-cicd.sh

# Build and deploy
./scripts/setup-ci-cd.sh

# Check deployment status
docker-compose ps
```

### Quality Gates
```bash
# Run quality checks
./scripts/run-quality-check.bat

# Check system status
./scripts/check-system-status.bat

# Performance analysis
node scripts/performance-analyzer.js
```

## 📊 Quality Monitoring

### Automated Quality Checks
```bash
# Run comprehensive quality check
./scripts/run-quality-check.bat

# Monitor system quality
node scripts/quality-monitor.js

# Check for console log cleanup
./scripts/CLEANUP-CONSOLE-LOGS.bat
```

### Performance Monitoring
```bash
# Analyze application performance
node scripts/performance-analyzer.js

# Monitor PWA functionality
node scripts/test-pwa-offline.js
node scripts/test-pwa-notifications.js
node scripts/test-pwa-install.js
```

### Test Automation
```bash
# Run comprehensive tests
node scripts/run-tests.js

# Test authentication
node scripts/test-auth.js

# Test backup system
./scripts/test-backup.bat
```

## 📱 Mobile & Desktop Support

### Electron Desktop App
```bash
# Start Electron app
./scripts/START-ELECTRON.bat

# Build desktop version
npm run build:electron

# Package for distribution
npm run package:electron
```

### Mobile App Support
```bash
# Start mobile development
cd hrms-mobile
npm start

# Build mobile app
npm run build:mobile

# Test mobile functionality
npm run test:mobile
```

### PWA Features
```bash
# Test PWA functionality
node scripts/quick-pwa-test.js

# Test offline capabilities
node scripts/test-pwa-offline.js

# Test notifications
node scripts/test-pwa-notifications.js
```

## 📚 Additional Resources

- [HRMS Elite Deployment Guide](../deploy/README.md)
- [Backup System Documentation](../scripts/BACKUP-README.md)
- [Monitoring System Documentation](../monitoring/README.md)
- [Security Implementation](../SECURITY-IMPLEMENTATION.md)
- [API Documentation](../docs/API-DOCUMENTATION.md)
- [CI/CD Implementation](../CI-CD-IMPLEMENTATION-SUMMARY.md)
- [Quality Monitoring](../QUALITY-MONITORING-IMPLEMENTATION.md)
- [Mobile Desktop Implementation](../MOBILE-DESKTOP-IMPLEMENTATION.md)

---

**Last Updated**: December 2024  
**Version**: 2.0  
**Author**: HRMS Elite DevOps Team  
**Status**: ✅ Complete with all features implemented 