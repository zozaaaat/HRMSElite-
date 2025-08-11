# Zeylab HRMS - PowerShell Startup Script
# نظام إدارة الموارد البشرية - سكريبت تشغيل PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    Zeylab HRMS - Complete System" -ForegroundColor Cyan
Write-Host "    Version 2.1.0 - Full Features" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] فحص النظام..." -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[SUCCESS] Node.js مثبت بنجاح: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js غير مثبت على النظام!" -ForegroundColor Red
    Write-Host ""
    Write-Host "[SOLUTION] يرجى تثبيت Node.js من الموقع الرسمي:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor Blue
    Write-Host ""
    Write-Host "[INFO] بعد التثبيت، أعد تشغيل هذا الملف" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host ""

# Check if files exist
$standaloneFile = "backup\standalone-versions\ZeylabHRMS-Standalone.cjs"
if (-not (Test-Path $standaloneFile)) {
    Write-Host "[ERROR] ملفات النظام غير موجودة!" -ForegroundColor Red
    Write-Host "[INFO] تأكد من وجود مجلد backup\standalone-versions" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host "[SUCCESS] ملفات النظام موجودة" -ForegroundColor Green
Write-Host ""

Write-Host "[INFO] بدء تشغيل النظام..." -ForegroundColor Yellow
Write-Host "[INFO] الخادم سيعمل على المنفذ 5000" -ForegroundColor Yellow
Write-Host "[INFO] المتصفح سيفتح تلقائياً..." -ForegroundColor Yellow
Write-Host ""

# Change directory and start the server
Set-Location "backup\standalone-versions"
node ZeylabHRMS-Standalone.cjs 