#!/bin/bash

# HRMS Elite CI/CD Setup Script
# This script helps set up the CI/CD pipeline and checks prerequisites

set -e

echo "🚀 HRMS Elite CI/CD Setup Script"
echo "=================================="

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
    print_status "Running in GitHub Actions environment"
    GITHUB_ENV=true
else
    GITHUB_ENV=false
fi

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
if [[ $NODE_VERSION == v* ]]; then
    print_success "Node.js $NODE_VERSION is installed"
    
    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js version is compatible (>= 18)"
    else
        print_warning "Node.js version $NODE_VERSION is below recommended version 18"
    fi
else
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check npm
print_status "Checking npm..."
NPM_VERSION=$(npm --version 2>/dev/null || echo "not installed")
if [[ $NPM_VERSION == *.*.* ]]; then
    print_success "npm $NPM_VERSION is installed"
else
    print_error "npm is not installed"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Check if required scripts exist in package.json
print_status "Checking required npm scripts..."
REQUIRED_SCRIPTS=("build" "test" "lint" "type-check")
MISSING_SCRIPTS=()

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if npm run --silent "$script" >/dev/null 2>&1; then
        print_success "Script '$script' is available"
    else
        print_warning "Script '$script' is missing or not working"
        MISSING_SCRIPTS+=("$script")
    fi
done

# Check if .github/workflows directory exists
if [ ! -d ".github/workflows" ]; then
    print_status "Creating .github/workflows directory..."
    mkdir -p .github/workflows
fi

# Check if workflow files exist
WORKFLOW_FILES=(
    ".github/workflows/deploy.yml"
    ".github/workflows/security-scan.yml"
    ".github/workflows/performance-test.yml"
    ".github/workflows/notifications.yml"
    ".github/workflows/backup.yml"
)

print_status "Checking workflow files..."
for file in "${WORKFLOW_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Workflow file exists: $file"
    else
        print_warning "Workflow file missing: $file"
    fi
done

# Check if load test files exist
print_status "Checking load test configuration..."
if [ -f "load-tests/load-test.yml" ] && [ -f "load-tests/stress-test.yml" ]; then
    print_success "Load test configuration files exist"
else
    print_warning "Load test configuration files are missing"
fi

# Check if Lighthouse config exists
if [ -f ".lighthouserc.json" ]; then
    print_success "Lighthouse configuration exists"
else
    print_warning "Lighthouse configuration is missing"
fi

# Check Docker (if available)
print_status "Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is installed: $DOCKER_VERSION"
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_warning "Docker daemon is not running"
    fi
else
    print_warning "Docker is not installed (optional for local testing)"
fi

# Check if .env.example exists
if [ -f ".env.example" ]; then
    print_success "Environment template exists"
else
    print_warning "Environment template (.env.example) is missing"
fi

# Check if docker-compose.yml exists
if [ -f "deploy/docker-compose.yml" ]; then
    print_success "Docker Compose configuration exists"
else
    print_warning "Docker Compose configuration is missing"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_success "Created .env file (please update with your values)"
fi

# Check Git configuration
print_status "Checking Git configuration..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git is installed: $GIT_VERSION"
    
    # Check if this is a Git repository
    if git rev-parse --git-dir > /dev/null 2>&1; then
        print_success "This is a Git repository"
        
        # Check current branch
        CURRENT_BRANCH=$(git branch --show-current)
        print_status "Current branch: $CURRENT_BRANCH"
        
        # Check if main/develop branches exist
        if git show-ref --verify --quiet refs/heads/main; then
            print_success "Main branch exists"
        else
            print_warning "Main branch does not exist"
        fi
        
        if git show-ref --verify --quiet refs/heads/develop; then
            print_success "Develop branch exists"
        else
            print_warning "Develop branch does not exist"
        fi
    else
        print_warning "This is not a Git repository"
    fi
else
    print_error "Git is not installed"
    exit 1
fi

# Run basic tests
print_status "Running basic tests..."
if npm run test:server:run >/dev/null 2>&1; then
    print_success "Server tests pass"
else
    print_warning "Server tests failed or not available"
fi

# Check linting
print_status "Running linting check..."
if npm run lint >/dev/null 2>&1; then
    print_success "Linting passes"
else
    print_warning "Linting failed or not available"
fi

# Check TypeScript
print_status "Running TypeScript check..."
if npm run type-check >/dev/null 2>&1; then
    print_success "TypeScript check passes"
else
    print_warning "TypeScript check failed or not available"
fi

# Summary
echo ""
echo "=================================="
echo "📋 Setup Summary"
echo "=================================="

if [ ${#MISSING_SCRIPTS[@]} -eq 0 ]; then
    print_success "All required npm scripts are available"
else
    print_warning "Missing npm scripts: ${MISSING_SCRIPTS[*]}"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Configure GitHub repository secrets (see CI-CD-SETUP-GUIDE.md)"
echo "2. Set up environment protection rules for staging and production"
echo "3. Configure deployment servers"
echo "4. Set up monitoring and notifications"
echo "5. Test the pipeline with a small change"

if [ "$GITHUB_ENV" = false ]; then
    echo ""
    echo "📚 Documentation:"
    echo "- CI-CD-SETUP-GUIDE.md - Complete setup guide"
    echo "- .github/workflows/ - Workflow configurations"
    echo "- load-tests/ - Load testing configuration"
fi

echo ""
print_success "CI/CD setup check completed!" 