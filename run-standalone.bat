@echo off
chcp 65001 >nul
title Zeylab HRMS Standalone - نسخة مستقلة
color 0A
cls

echo.
echo ===============================================
echo        Zeylab HRMS Standalone
echo     نسخة مستقلة - بدون تثبيت Node.js
echo ===============================================
echo.
echo 🚀 تشغيل النظام المستقل...
echo 💡 لا يحتاج تثبيت أي برامج إضافية
echo.

ZeylabHRMS-Standalone.exe

if errorlevel 1 (
    echo.
    echo ❌ خطأ في التشغيل
    echo 💡 جرب تشغيل الملف كمسؤول
    echo.
    pause
) else (
    echo.
    echo ✅ تم إغلاق النظام بنجاح
    echo 📧 للنسخة الكاملة: info@zeylab.com
    echo.
    timeout /t 3 /nobreak >nul
)