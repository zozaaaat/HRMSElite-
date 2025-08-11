@echo off
cls
title Zeylab HRMS - Complete Standalone System

echo ============================================
echo    Zeylab HRMS - Complete System
echo    Version 2.1.0 - Full Features
echo ============================================
echo.
echo [1] تشغيل النظام العادي
echo [2] تشغيل مع اختبار شامل
echo [3] اختبار النظام فقط (يجب أن يكون النظام يعمل)
echo [4] عرض معلومات النظام
echo [5] تشغيل النسخة البسيطة
echo.
set /p choice="اختر رقم (1-5): "

if "%choice%"=="1" goto normal
if "%choice%"=="2" goto test
if "%choice%"=="3" goto testonly
if "%choice%"=="4" goto info
if "%choice%"=="5" goto simple
goto normal

:normal
echo.
echo [INFO] بدء تشغيل نظام إدارة الموارد البشرية...
echo [INFO] الخادم سيعمل على المنفذ 5000
echo [INFO] المتصفح سيفتح تلقائياً...
echo.
cd backup\standalone-versions
node ZeylabHRMS-Final.cjs
goto end

:test
echo.
echo [INFO] بدء تشغيل النظام مع الاختبار الشامل...
echo [INFO] سيتم تشغيل النظام أولاً ثم الاختبار...
echo.
cd backup\standalone-versions
start "HRMS Server" node ZeylabHRMS-Final.cjs
echo [INFO] انتظار 8 ثوانِ لتشغيل الخادم...
timeout /t 8 /nobreak >nul
echo [INFO] بدء الاختبار الشامل...
node TEST-STANDALONE.js
goto end

:testonly
echo.
echo [INFO] تشغيل الاختبار الشامل فقط...
echo [INFO] تأكد من أن النظام يعمل على المنفذ 5000
echo.
cd backup\standalone-versions
node TEST-STANDALONE.js
goto end

:simple
echo.
echo [INFO] تشغيل النسخة البسيطة...
echo [INFO] الخادم سيعمل على المنفذ 5000
echo [INFO] المتصفح سيفتح تلقائياً...
echo.
cd backup\standalone-versions
node ZeylabHRMS-Standalone.cjs
goto end

:info
echo.
echo ============================================
echo          معلومات النظام
echo ============================================
echo.
echo النسخة: 2.1.0
echo النوع: نسخة مستقلة كاملة
echo المنفذ: 5000
echo الرابط المحلي: http://localhost:5000
echo.
echo الميزات المتاحة:
echo • إدارة 5 شركات
echo • إدارة 5 موظفين  
echo • 5 مستندات
echo • 4 تراخيص
echo • 5 حسابات تجريبية
echo • نظام مصادقة كامل
echo • APIs شاملة
echo • واجهة عربية
echo.
echo الحسابات التجريبية:
echo • admin / admin123 (مسؤول عام)
echo • manager / manager123 (مدير شركة)
echo • employee / emp123 (موظف إداري)
echo • supervisor / super123 (مشرف)
echo • worker / work123 (عامل)
echo.
echo الملفات المتاحة:
echo • ZeylabHRMS-Final.cjs (النسخة الكاملة)
echo • ZeylabHRMS-Standalone.cjs (النسخة البسيطة)
echo • TEST-STANDALONE.js (اختبار النظام)
echo.
pause
goto start

:end
echo.
echo [INFO] تم إنهاء العملية. اضغط أي مفتاح للخروج.
pause >nul 