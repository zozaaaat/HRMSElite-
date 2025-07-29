@echo off
title Zeylab HRMS Demo System
cls

echo ===============================================
echo           Zeylab HRMS Demo System
echo      Human Resource Management System
echo ===============================================
echo.
echo Starting demo server...
echo Browser will open automatically
echo URL: http://localhost:3000
echo.
echo Demo Login Credentials:
echo - Super Admin: admin / admin123
echo - Company Manager: manager / manager123
echo - Employee: employee / emp123
echo - Supervisor: supervisor / super123
echo - Worker: worker / work123
echo.

node server.js

if errorlevel 1 (
    echo.
    echo ERROR: Could not start the system
    echo Make sure Node.js is installed
    echo Download from: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo Demo closed successfully
    echo Support: info@zeylab.com
    timeout /t 3 >nul
)