@echo off
title Zeylab HRMS Standalone Demo
cls

echo ===============================================
echo        Zeylab HRMS Standalone Demo
echo     Human Resource Management System
echo ===============================================
echo.
echo Starting Zeylab HRMS System...
echo Browser will open automatically
echo URL: http://localhost:3000
echo.
echo Login Credentials:
echo - Admin: admin / admin123
echo - Manager: manager / manager123
echo - Employee: employee / emp123
echo.

node ZeylabHRMS-Standalone.js

if errorlevel 1 (
    echo.
    echo ERROR: Could not start the system
    echo Make sure Node.js is installed
    echo Download from: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo System closed successfully
    echo For full version: info@zeylab.com
    timeout /t 3 >nul
)