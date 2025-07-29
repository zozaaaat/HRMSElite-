@echo off
title Zeylab HRMS Demo - Fixed Version
cls

echo ===============================================
echo        Zeylab HRMS Demo - Fixed Version
echo     Human Resource Management System
echo ===============================================
echo.
echo Starting enhanced demo server...
echo URL: http://localhost:3000
echo.
echo Demo Login Credentials:
echo - Super Admin: admin / admin123
echo - Company Manager: manager / manager123
echo - Employee: employee / emp123
echo.
echo Real Demo Data:
echo - 5 Companies with 480 total employees
echo - Complete HR management system
echo - Arabic interface with RTL support
echo.

node ZeylabHRMS-Fixed.js

if errorlevel 1 (
    echo.
    echo ERROR: System could not start
    echo Please ensure Node.js is installed
    echo Download: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo Demo completed successfully
    echo Contact: info@zeylab.com
    timeout /t 3 >nul
)