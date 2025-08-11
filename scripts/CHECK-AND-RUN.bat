@echo off
cls
title Zeylab HRMS - Check and Run

echo ============================================
echo    Zeylab HRMS - System Check
echo ============================================
echo.

echo [INFO] فحص النظام...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js غير مثبت على النظام!
    echo.
    echo [SOLUTION] يرجى تثبيت Node.js من الموقع الرسمي:
    echo https://nodejs.org/
    echo.
    echo [INFO] بعد التثبيت، أعد تشغيل هذا الملف
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js مثبت بنجاح
node --version
echo.

REM Check if files exist
if not exist "backup\standalone-versions\ZeylabHRMS-Standalone.cjs" (
    echo [ERROR] ملفات النظام غير موجودة!
    echo [INFO] تأكد من وجود مجلد backup\standalone-versions
    pause
    exit /b 1
)

echo [SUCCESS] ملفات النظام موجودة
echo.

echo [INFO] بدء تشغيل النظام...
echo [INFO] الخادم سيعمل على المنفذ 5000
echo [INFO] المتصفح سيفتح تلقائياً...
echo.

cd backup\standalone-versions
node ZeylabHRMS-Standalone.cjs 