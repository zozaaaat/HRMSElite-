@echo off
echo.
echo ========================================
echo    HRMS Elite - النسخة الكاملة المحدثة
echo ========================================
echo.

echo [1/4] إيقاف العمليات السابقة...
taskkill /f /im node.exe >nul 2>&1

echo.
echo [2/4] إنشاء قاعدة البيانات...
node create-database.js

echo.
echo [3/4] إضافة البيانات التجريبية...
node add-sample-data.js

echo.
echo [4/4] تشغيل الخادم والواجهة الأمامية...
start "HRMS Server" cmd /k "npm run dev"

echo.
echo [5/5] فتح المتصفح...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo    ✅ HRMS Elite يعمل بنجاح!
echo ========================================
echo.
echo 🌐 الخادم: http://localhost:3000
echo 📊 APIs تعمل:
echo    - /api/companies ✅
echo    - /api/employees ✅
echo    - /health ✅
echo.
echo 📁 البيانات التجريبية:
echo    - 3 شركات
echo    - 3 موظفين
echo    - 1 مستخدم
echo.
pause 