# 🚀 HRMS Elite CI/CD Setup Guide

## 📋 Overview

This guide provides comprehensive instructions for setting up and maintaining the CI/CD pipeline for the HRMS Elite project. The pipeline follows the **build → lint → test → deploy** pattern with enhanced security and quality checks.

## 🏗️ Pipeline Architecture

### Main Workflow: `.github/workflows/deploy.yml`

The main CI/CD pipeline includes the following stages:

#### 1. 🔍 Code Quality & Security
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Type checking
- **Security Audit**: npm audit for vulnerability scanning
- **Secret Detection**: TruffleHog for secret scanning
- **Hardcoded Secrets**: Custom script for detecting hardcoded credentials
- **SonarQube**: Code quality analysis

#### 2. 🧪 Testing Suite
- **Server Tests**: Backend API testing
- **Client Tests**: Frontend component testing
- **API Tests**: Integration testing
- **Performance Tests**: Load and stress testing
- **Accessibility Tests**: WCAG compliance testing
- **Cross-Platform**: Testing on Ubuntu and Windows

#### 3. 📊 Coverage Report
- **Coverage Generation**: Test coverage reports
- **Codecov Integration**: Coverage tracking
- **PR Comments**: Automatic coverage comments

#### 4. 🏗️ Build & Package
- **Application Build**: Production build
- **Electron Build**: Desktop app packaging
- **Mobile Build**: Mobile app compilation
- **Artifact Upload**: Build artifacts storage

#### 5. 🐳 Docker Build & Test
- **Docker Build**: Container image creation
- **Container Testing**: Health checks
- **Security Scanning**: Trivy vulnerability scanning
- **Image Registry**: Docker Hub integration

#### 6. 🚀 Deployment
- **Staging Deployment**: Automatic deployment to staging
- **Production Deployment**: Manual deployment to production
- **Mobile Deployment**: App store deployment
- **Health Checks**: Post-deployment verification

## 🔧 Setup Instructions

### 1. Repository Configuration

#### Required Secrets
Add the following secrets to your GitHub repository:

```bash
# Docker Registry
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# SonarQube
SONAR_TOKEN=your-sonarqube-token
SONAR_HOST_URL=https://sonarcloud.io

# Deployment
STAGING_SSH_KEY=your-staging-server-ssh-key
PRODUCTION_SSH_KEY=your-production-server-ssh-key
STAGING_HOST=staging.hrms-elite.com
PRODUCTION_HOST=hrms-elite.com

# Notifications
SLACK_WEBHOOK_URL=your-slack-webhook
DISCORD_WEBHOOK_URL=your-discord-webhook
EMAIL_SMTP_HOST=your-smtp-host
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your-email
EMAIL_PASSWORD=your-email-password

# Code Coverage
CODECOV_TOKEN=your-codecov-token
```

#### Environment Protection Rules
Set up environment protection rules for `staging` and `production`:

1. Go to Settings → Environments
2. Create environments: `staging` and `production`
3. Add protection rules:
   - Required reviewers
   - Wait timer (5 minutes for production)
   - Deployment branches (main for production, develop for staging)

### 2. Local Development Setup

#### Prerequisites
```bash
# Install required tools
npm install -g @types/node typescript eslint
npm install -g @sonarqube/scanner
npm install -g trivy
```

#### Local Testing
```bash
# Run all tests locally
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run quality checks
npm run lint
npm run type-check
npm audit

# Build locally
npm run build
npm run build:electron
```

### 3. Pipeline Configuration

#### Workflow Triggers
The pipeline is triggered by:
- **Push** to `main` or `develop` branches
- **Pull Request** to `main` or `develop` branches
- **Manual dispatch** with environment selection

#### Job Dependencies
```
code-quality → test → build → docker → deploy-staging/deploy-production
```

### 4. Deployment Configuration

#### Staging Environment
```yaml
# Automatic deployment on develop branch
if: github.ref == 'refs/heads/develop'
environment: staging
```

#### Production Environment
```yaml
# Manual deployment on main branch
if: github.ref == 'refs/heads/main'
environment: production
```

### 5. Security Configuration

#### SonarQube Setup
1. Create SonarCloud account
2. Add project to SonarCloud
3. Configure `sonar-project.properties`:

```properties
sonar.projectKey=hrms-elite
sonar.organization=your-organization
sonar.sources=.
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

#### Docker Security
```yaml
# Trivy security scanning
- name: Security scan Docker image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'hrms-elite:latest'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

### 6. Monitoring & Notifications

#### Slack Integration
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    channel: '#deployments'
```

#### Discord Integration
```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
    status: ${{ job.status }}
    title: "HRMS Elite Deployment"
```

## 🚀 Usage

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "HRMS Elite CI/CD Pipeline"
3. Click "Run workflow"
4. Choose environment (staging/production)
5. Click "Run workflow"

### Monitoring Deployments
- **GitHub Actions**: View real-time pipeline status
- **SonarCloud**: Code quality metrics
- **Codecov**: Test coverage reports
- **Docker Hub**: Container image registry

### Troubleshooting

#### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   npm run build --verbose
   
   # Clear cache
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Test Failures**
   ```bash
   # Run tests locally
   npm run test:all
   
   # Check test environment
   echo $NODE_ENV
   echo $DATABASE_URL
   ```

3. **Deployment Failures**
   ```bash
   # Check server connectivity
   ssh user@server "cd /path/to/app && git status"
   
   # Check Docker containers
   docker ps -a
   docker logs container-name
   ```

#### Debug Commands
```bash
# Local pipeline simulation
npm run lint && npm run type-check && npm run test:all && npm run build

# Docker testing
docker build -t hrms-elite:test .
docker run --rm -p 3000:3000 hrms-elite:test

# Security scanning
npm audit
trivy image hrms-elite:latest
```

## 📊 Metrics & Reporting

### Quality Gates
- **Code Coverage**: Minimum 80%
- **Security Vulnerabilities**: Zero high/critical
- **Code Duplication**: Maximum 5%
- **Technical Debt**: Maximum 10%

### Performance Metrics
- **Build Time**: Maximum 10 minutes
- **Test Execution**: Maximum 15 minutes
- **Deployment Time**: Maximum 5 minutes

### Success Criteria
- ✅ All tests pass
- ✅ Code coverage above threshold
- ✅ No security vulnerabilities
- ✅ Successful deployment
- ✅ Health checks pass

## 🔄 Maintenance

### Regular Tasks
1. **Weekly**: Review security audit results
2. **Monthly**: Update dependencies
3. **Quarterly**: Review and update pipeline configuration
4. **Annually**: Security assessment and penetration testing

### Updates
```bash
# Update dependencies
npm update
npm audit fix

# Update GitHub Actions
# Check for updates in .github/workflows/

# Update Docker images
docker pull node:20-alpine
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Docker Security Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)

---

## 🎯 Quick Start Checklist

- [ ] Repository secrets configured
- [ ] Environment protection rules set
- [ ] SonarCloud project created
- [ ] Docker Hub repository created
- [ ] Slack/Discord webhooks configured
- [ ] Local development environment tested
- [ ] First pipeline run successful
- [ ] Monitoring dashboards configured
- [ ] Team notifications working
- [ ] Documentation updated

**Pipeline Status**: ✅ **Ready for Production** 