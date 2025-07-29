@echo off
chcp 65001 >nul
title Zeylab HRMS Demo - نسخة تجريبية
color 0A
cls
echo.
echo ===============================================
echo        Zeylab HRMS - نسخة تجريبية  
echo        نظام إدارة الموارد البشرية الشامل
echo ===============================================
echo.
echo 🚀 جاري تشغيل النظام...
echo.
echo 💡 سيتم فتح النظام في نافذة جديدة
echo ⏱️  يرجى الانتظار...
echo.

node server.js

if errorlevel 1 (
    echo.
    echo ❌ خطأ في التشغيل
    echo 📋 تأكد من تثبيت Node.js على النظام
    echo 🌐 يمكنك تحميله من: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo ✅ تم إغلاق النظام بنجاح
    echo 📧 للحصول على النسخة الكاملة: info@zeylab.com
    echo.
    timeout /t 3 /nobreak >nul
)