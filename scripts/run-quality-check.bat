@echo off
chcp 65001 >nul
title HRMS Elite - Quality Monitor

echo.
echo ========================================
echo    📊 HRMS Elite Quality Monitor
echo ========================================
echo.

echo 🔍 Running comprehensive quality checks...
echo.

:: Run ESLint check
echo [1/4] Checking ESLint...
call npm run lint >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ ESLint: No errors found
) else (
    echo    ❌ ESLint: Errors detected
)

:: Run TypeScript check
echo [2/4] Checking TypeScript...
call npm run type-check >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ TypeScript: No errors found
) else (
    echo    ❌ TypeScript: Errors detected
)

:: Run test coverage
echo [3/4] Checking test coverage...
call npm run test:coverage >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Test Coverage: Passed
) else (
    echo    ❌ Test Coverage: Failed
)

:: Run quality monitor script
echo [4/4] Running quality monitor...
call node scripts/quality-monitor.js

echo.
echo ========================================
echo    📋 Quality Check Complete
echo ========================================
echo.

:: Check if quality report exists
if exist "quality-report.json" (
    echo 📄 Quality report generated: quality-report.json
    echo 🌐 View dashboard at: http://localhost:3000/quality-monitor
) else (
    echo ⚠️  Quality report not generated
)

echo.
echo 💡 Tips:
echo    - Run 'npm run quality:fix' to auto-fix issues
echo    - Run 'npm run test:coverage' for detailed coverage
echo    - Run 'npm run lint -- --fix' to fix ESLint issues
echo.

pause 