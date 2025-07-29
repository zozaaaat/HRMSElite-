@echo off
chcp 65001 >nul
title Zeylab HRMS - Production Server

echo ============================================
echo    Zeylab HRMS Production Server
echo    نسخة الانتاج المتقدمة
echo ============================================
echo.

echo [INFO] Starting Zeylab HRMS Production Server...
echo [INFO] بدء تشغيل نظام ادارة الموارد البشرية...

node ZeylabHRMS-Production.js

echo.
echo [INFO] Server stopped. Press any key to exit.
echo [INFO] تم ايقاف الخادم. اضغط اي مفتاح للخروج.
pause >nul