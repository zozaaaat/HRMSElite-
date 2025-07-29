@echo off
title Zeylab HRMS Standalone Demo
color 0A
cls

echo.
echo ===============================================
echo        Zeylab HRMS Standalone Demo
echo     Human Resource Management System
echo ===============================================
echo.
echo Starting Zeylab HRMS System...
echo Browser will open automatically at http://localhost:3000
echo Please wait...
echo.

node ZeylabHRMS-Standalone.js

if errorlevel 1 (
    echo.
    echo Error: Could not start the system
    echo Make sure Node.js is installed
    echo Download from: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo System closed successfully
    echo For full version contact: info@zeylab.com
    echo.
    timeout /t 3 /nobreak >nul 2>&1
)