@echo off
cls
title Zeylab HRMS - Production Ready System

echo ============================================
echo    Zeylab HRMS Production System
echo    Version 2.1.0 - Production Ready
echo ============================================
echo.
echo Starting server...
echo Server will run on port 5000
echo.
echo Browser will open automatically...
echo If not, open: http://localhost:5000
echo.

start "" /B node ZeylabHRMS-Production.js

timeout /t 3 /nobreak >nul
start http://localhost:5000

echo.
echo Server is running. Close this window to stop the server.
echo Press Ctrl+C to stop the server manually.
pause >nul