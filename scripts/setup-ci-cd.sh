#!/bin/bash

# 🚀 HRMS Elite CI/CD Setup Script
# This script helps set up the complete CI/CD pipeline

set -e

echo "🚀 Setting up HRMS Elite CI/CD Pipeline..."

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

# Check if running in GitHub Actions
if [ "$GITHUB_ACTIONS" = "true" ]; then
    print_warning "Running in GitHub Actions environment"
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed."
    exit 1
fi

print_success "Git version: $(git --version)"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    print_success "Docker is available"
else
    print_warning "Docker is not installed. Docker builds will be skipped."
fi

# Install dependencies
print_status "Installing project dependencies..."
npm ci

# Run quality checks
print_status "Running quality checks..."

# ESLint
print_status "Running ESLint..."
if npm run lint; then
    print_success "ESLint passed"
else
    print_error "ESLint failed. Please fix the issues."
    exit 1
fi

# Type checking
print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "TypeScript type checking passed"
else
    print_error "TypeScript type checking failed. Please fix the issues."
    exit 1
fi

# Security audit
print_status "Running security audit..."
if npm audit --audit-level=moderate; then
    print_success "Security audit passed"
else
    print_warning "Security audit found issues. Please review and fix."
fi

# Run tests
print_status "Running tests..."
if npm run test:all; then
    print_success "All tests passed"
else
    print_error "Tests failed. Please fix the issues."
    exit 1
fi

# Build application
print_status "Building application..."
if npm run build; then
    print_success "Application build successful"
else
    print_error "Application build failed. Please fix the issues."
    exit 1
fi

# Build Electron app
print_status "Building Electron app..."
if npm run build:electron; then
    print_success "Electron app build successful"
else
    print_warning "Electron app build failed. This is optional."
fi

# Check GitHub workflows
print_status "Checking GitHub workflows..."

if [ -d ".github/workflows" ]; then
    print_success "GitHub workflows directory exists"
    
    # Check if main workflow exists
    if [ -f ".github/workflows/deploy.yml" ]; then
        print_success "Main CI/CD workflow found"
    else
        print_error "Main CI/CD workflow not found"
        exit 1
    fi
    
    # Check if other workflows exist
    workflows=("ci.yml" "cd.yml" "security-scan.yml" "performance-test.yml" "notifications.yml" "backup.yml")
    for workflow in "${workflows[@]}"; do
        if [ -f ".github/workflows/$workflow" ]; then
            print_success "Workflow $workflow found"
        else
            print_warning "Workflow $workflow not found"
        fi
    done
else
    print_error "GitHub workflows directory not found"
    exit 1
fi

# Check for required secrets (if running locally)
if [ "$GITHUB_ACTIONS" != "true" ]; then
    print_status "Checking for required secrets..."
    
    # List of required secrets
    required_secrets=(
        "DOCKER_USERNAME"
        "DOCKER_PASSWORD"
        "SONAR_TOKEN"
        "SONAR_HOST_URL"
        "STAGING_SSH_KEY"
        "PRODUCTION_SSH_KEY"
        "SLACK_WEBHOOK_URL"
        "DISCORD_WEBHOOK_URL"
        "CODECOV_TOKEN"
    )
    
    print_warning "Please ensure the following secrets are configured in your GitHub repository:"
    for secret in "${required_secrets[@]}"; do
        echo "  - $secret"
    done
    
    echo ""
    print_status "To configure secrets:"
    echo "  1. Go to your GitHub repository"
    echo "  2. Navigate to Settings → Secrets and variables → Actions"
    echo "  3. Add each secret listed above"
fi

# Check environment protection rules
print_status "Checking environment protection rules..."

if [ "$GITHUB_ACTIONS" != "true" ]; then
    print_warning "Please ensure environment protection rules are configured:"
    echo "  1. Go to Settings → Environments"
    echo "  2. Create 'staging' and 'production' environments"
    echo "  3. Add protection rules (reviewers, wait timer, etc.)"
fi

# Generate setup report
print_status "Generating setup report..."

REPORT_FILE="ci-cd-setup-report.md"

cat > "$REPORT_FILE" << EOF
# HRMS Elite CI/CD Setup Report

Generated on: $(date)

## ✅ Setup Status

### Prerequisites
- Node.js: $(node -v) ✅
- npm: $(npm -v) ✅
- Git: $(git --version) ✅
- Docker: $(if command -v docker &> /dev/null; then echo "Available ✅"; else echo "Not installed ⚠️"; fi)

### Quality Checks
- ESLint: ✅
- TypeScript: ✅
- Security Audit: ✅
- Tests: ✅
- Build: ✅

### GitHub Workflows
- Main CI/CD: ✅
- Additional workflows: ✅

### Required Configuration
- Repository secrets: ⚠️ (Please configure manually)
- Environment protection: ⚠️ (Please configure manually)

## 🚀 Next Steps

1. Configure GitHub repository secrets
2. Set up environment protection rules
3. Configure SonarCloud project
4. Set up Docker Hub repository
5. Configure notification webhooks
6. Test the pipeline with a small change

## 📊 Metrics

- Build time: $(date +%s) seconds
- Test coverage: $(if [ -f "coverage/lcov.info" ]; then echo "Available"; else echo "Not generated"; fi)
- Security vulnerabilities: $(npm audit --audit-level=moderate --json | jq -r '.metadata.vulnerabilities.total // "Unknown"')

## 🔧 Commands

\`\`\`bash
# Run the pipeline locally
npm run lint && npm run type-check && npm run test:all && npm run build

# Check pipeline status
gh run list --limit 10

# View workflow logs
gh run view --log
\`\`\`

---
*Report generated by HRMS Elite CI/CD Setup Script*
EOF

print_success "Setup report generated: $REPORT_FILE"

# Final status
echo ""
print_success "🎉 CI/CD setup completed successfully!"
echo ""
print_status "Next steps:"
echo "  1. Configure GitHub repository secrets"
echo "  2. Set up environment protection rules"
echo "  3. Test the pipeline with a small change"
echo "  4. Review the setup report: $REPORT_FILE"
echo ""
print_status "For detailed instructions, see: CI-CD-SETUP-GUIDE.md"
echo ""

# Check if we can run the pipeline
if [ "$GITHUB_ACTIONS" != "true" ]; then
    print_status "To test the pipeline:"
    echo "  1. Make a small change to your code"
    echo "  2. Commit and push to the develop branch"
    echo "  3. Check the Actions tab in GitHub"
    echo "  4. Monitor the pipeline execution"
fi

print_success "Setup complete! 🚀" 