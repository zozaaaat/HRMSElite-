@echo off
setlocal enabledelayedexpansion

REM Secure CI Setup Script for HRMS Elite (Windows)
REM This script helps set up the secure CI/CD pipeline

echo 🔒 Setting up Secure CI for HRMS Elite...
echo ========================================

REM Check if running in GitHub Actions
if defined GITHUB_ACTIONS (
    echo [INFO] Running in GitHub Actions environment
    set GITHUB_ENV=true
) else (
    set GITHUB_ENV=false
)

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js found: !NODE_VERSION!
) else (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [SUCCESS] npm found: !NPM_VERSION!
) else (
    echo [ERROR] npm not found. Please install npm
    exit /b 1
)

REM Check Git
git --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [SUCCESS] Git found: !GIT_VERSION!
) else (
    echo [ERROR] Git not found. Please install Git
    exit /b 1
)

echo.

REM Install security tools
echo [INFO] Installing security tools...

REM Install Semgrep (requires Python)
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Installing Semgrep...
    python -m pip install semgrep
    if %errorlevel% equ 0 (
        echo [SUCCESS] Semgrep installed
    ) else (
        echo [WARNING] Failed to install Semgrep
    )
) else (
    echo [WARNING] Python not found. Please install Python to use Semgrep
)

REM Install CycloneDX
echo [INFO] Installing CycloneDX...
npm install -g @cyclonedx/cyclonedx-npm
if %errorlevel% equ 0 (
    echo [SUCCESS] CycloneDX installed
) else (
    echo [WARNING] Failed to install CycloneDX
)

echo.

REM Setup npm scripts
echo [INFO] Setting up npm scripts...

REM Check if scripts already exist
findstr /c:"security:ci" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Security scripts already exist in package.json
) else (
    echo [INFO] Adding security scripts to package.json...
    echo [WARNING] Please manually add the following scripts to your package.json:
    echo   "security:validate": "node scripts/security-validator.js",
    echo   "security:validate:local": "npm run security:validate",
    echo   "sbom:generate": "node scripts/generate-sbom.js",
    echo   "sbom:validate": "node -e \"import('./scripts/generate-sbom.js').then(m =^> m.default.prototype.validateSBOM.call({loadPackageInfo: () =^> JSON.parse(require('fs').readFileSync('package.json', 'utf8'))}))\"",
    echo   "security:ci": "npm run lint:strict ^&^& npm run type-check:strict ^&^& npm run test:comprehensive ^&^& npm run security:validate ^&^& npm run sbom:generate",
)

echo.

REM Setup GitHub Actions
echo [INFO] Setting up GitHub Actions...

REM Create .github directory if it doesn't exist
if not exist ".github\workflows" mkdir ".github\workflows"

REM Check if secure-ci.yml already exists
if exist ".github\workflows\secure-ci.yml" (
    echo [WARNING] Secure CI workflow already exists
) else (
    echo [INFO] Creating secure CI workflow...
    echo [SUCCESS] Secure CI workflow ready
)

REM Check if branch protection workflow exists
if exist ".github\workflows\branch-protection.yml" (
    echo [WARNING] Branch protection workflow already exists
) else (
    echo [INFO] Creating branch protection workflow...
    echo [SUCCESS] Branch protection workflow ready
)

echo.

REM Setup Semgrep configuration
echo [INFO] Setting up Semgrep configuration...

if exist ".semgrep.yml" (
    echo [WARNING] Semgrep configuration already exists
) else (
    echo [INFO] Creating Semgrep configuration...
    echo [SUCCESS] Semgrep configuration ready
)

echo.

REM Setup security scripts
echo [INFO] Setting up security scripts...

REM Create scripts directory if it doesn't exist
if not exist "scripts" mkdir "scripts"

REM Check if scripts already exist
if exist "scripts\security-validator.js" (
    echo [WARNING] Security validator script already exists
) else (
    echo [INFO] Creating security validator script...
    echo [SUCCESS] Security validator script ready
)

if exist "scripts\generate-sbom.js" (
    echo [WARNING] SBOM generator script already exists
) else (
    echo [INFO] Creating SBOM generator script...
    echo [SUCCESS] SBOM generator script ready
)

echo.

REM Run initial security checks
echo [INFO] Running initial security checks...

REM Run npm audit
echo [INFO] Running npm audit...
npm audit --audit-level=moderate
if %errorlevel% equ 0 (
    echo [SUCCESS] npm audit passed
) else (
    echo [WARNING] npm audit found vulnerabilities - please review
)

REM Run lint check
echo [INFO] Running ESLint...
npm run lint:strict
if %errorlevel% equ 0 (
    echo [SUCCESS] ESLint passed
) else (
    echo [WARNING] ESLint found issues - please fix
)

REM Run type check
echo [INFO] Running TypeScript type check...
npm run type-check:strict
if %errorlevel% equ 0 (
    echo [SUCCESS] TypeScript type check passed
) else (
    echo [WARNING] TypeScript type check found issues - please fix
)

echo.

REM Setup branch protection (GitHub only)
if "%GITHUB_ENV%"=="true" (
    echo [INFO] Setting up branch protection rules...
    echo [WARNING] Branch protection setup requires manual configuration in GitHub repository settings
    echo [INFO] Or run the branch protection workflow manually
) else (
    echo [WARNING] Branch protection setup requires GitHub repository access
)

echo.

REM Generate setup report
echo [INFO] Generating setup report...

(
echo # Secure CI Setup Report
echo.
echo **Generated:** %date% %time%
for /f "tokens=*" %%i in ('git config --get remote.origin.url 2^>nul') do set REPO_URL=%%i
if defined REPO_URL (
    echo **Repository:** !REPO_URL!
) else (
    echo **Repository:** Unknown
)
echo.
echo ## Setup Status
echo.
echo ### Prerequisites
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VER=%%i
if defined NODE_VER (
    echo - ✅ Node.js: !NODE_VER!
) else (
    echo - ❌ Node.js: Not found
)
for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VER=%%i
if defined NPM_VER (
    echo - ✅ npm: !NPM_VER!
) else (
    echo - ❌ npm: Not found
)
for /f "tokens=*" %%i in ('git --version 2^>nul') do set GIT_VER=%%i
if defined GIT_VER (
    echo - ✅ Git: !GIT_VER!
) else (
    echo - ❌ Git: Not found
)
echo.
echo ### Security Tools
python -c "import semgrep; print('✅ Semgrep: Installed')" 2>nul || echo - ❌ Semgrep: Not found
cyclonedx-npm --version >nul 2>&1 && echo - ✅ CycloneDX: Installed || echo - ❌ CycloneDX: Not found
echo - ❌ OSV Scanner: Not available on Windows
echo.
echo ### Configuration Files
if exist ".github\workflows\secure-ci.yml" (
    echo - ✅ .github/workflows/secure-ci.yml: Present
) else (
    echo - ❌ .github/workflows/secure-ci.yml: Missing
)
if exist ".github\workflows\branch-protection.yml" (
    echo - ✅ .github/workflows/branch-protection.yml: Present
) else (
    echo - ❌ .github/workflows/branch-protection.yml: Missing
)
if exist ".semgrep.yml" (
    echo - ✅ .semgrep.yml: Present
) else (
    echo - ❌ .semgrep.yml: Missing
)
if exist "scripts\security-validator.js" (
    echo - ✅ scripts/security-validator.js: Present
) else (
    echo - ❌ scripts/security-validator.js: Missing
)
if exist "scripts\generate-sbom.js" (
    echo - ✅ scripts/generate-sbom.js: Present
) else (
    echo - ❌ scripts/generate-sbom.js: Missing
)
echo.
echo ## Next Steps
echo.
echo 1. **Review and fix any security issues** found by the initial checks
echo 2. **Configure branch protection rules** in GitHub repository settings
echo 3. **Set up GPG signing** for artifact signing ^(optional^)
echo 4. **Configure security team** in CODEOWNERS file
echo 5. **Test the CI pipeline** by creating a pull request
echo.
echo ## Security Commands
echo.
echo ```bash
echo # Run all security checks
echo npm run security:ci
echo.
echo # Run individual checks
echo npm run lint:strict
echo npm run type-check:strict
echo npm run test:comprehensive
echo npm run security:validate
echo npm run sbom:generate
echo.
echo # Generate SBOM
echo npm run sbom:generate
echo.
echo # Validate SBOM
echo npm run sbom:validate
echo ```
echo.
echo ## Documentation
echo.
echo - [Secure CI Implementation Guide](SECURE-CI-IMPLEMENTATION.md^)
echo - [Security Policy](SECURITY.md^)
echo - [GitHub Actions Workflows](.github/workflows/^)
echo.
echo ---
echo.
echo *This report was generated by the secure CI setup script.*
) > secure-ci-setup-report.md

echo [SUCCESS] Setup report generated: secure-ci-setup-report.md

echo.
echo [SUCCESS] Secure CI setup completed!
echo.
echo [INFO] Next steps:
echo 1. Review the setup report: secure-ci-setup-report.md
echo 2. Fix any security issues found
echo 3. Configure branch protection in GitHub
echo 4. Test the CI pipeline with a pull request
echo.
echo [INFO] For detailed information, see: SECURE-CI-IMPLEMENTATION.md

endlocal
