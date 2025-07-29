@echo off
title Zeylab HRMS Demo
color 0A
cls

echo.
echo ===============================================
echo           Zeylab HRMS Demo System
echo      Human Resource Management System
echo ===============================================
echo.
echo Starting the system...
echo Browser will open automatically at http://localhost:3000
echo Please wait...
echo.

node server.js

if errorlevel 1 (
    echo.
    echo Error: Could not start the system
    echo Make sure Node.js is installed first
    echo Download from: https://nodejs.org
    echo.
    echo Login credentials:
    echo Username: admin
    echo Password: admin123
    echo.
    pause
) else (
    echo.
    echo System closed successfully
    echo Support: info@zeylab.com
    echo.
    timeout /t 3 /nobreak >nul 2>&1
)