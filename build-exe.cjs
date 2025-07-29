const fs = require('fs');
const path = require('path');

console.log('🔨 بناء نسخة مستقلة للتطبيق...');

// إنشاء ملف standalone يحتوي على جميع الملفات المضمنة
const htmlContent = fs.readFileSync('./dist/public/index.html', 'utf8');
const jsFiles = fs.readdirSync('./dist/public/assets').filter(f => f.endsWith('.js'));
const cssFiles = fs.readdirSync('./dist/public/assets').filter(f => f.endsWith('.css'));

const jsContent = jsFiles.length > 0 ? fs.readFileSync(`./dist/public/assets/${jsFiles[0]}`, 'utf8') : '';
const cssContent = cssFiles.length > 0 ? fs.readFileSync(`./dist/public/assets/${cssFiles[0]}`, 'utf8') : '';

// تحميل البيانات الحقيقية
let realData = {};
let realDocuments = {};

try {
  if (fs.existsSync('./server/all-extracted-data.json')) {
    realData = JSON.parse(fs.readFileSync('./server/all-extracted-data.json', 'utf8'));
  }
  if (fs.existsSync('./server/real-documents.json')) {
    realDocuments = JSON.parse(fs.readFileSync('./server/real-documents.json', 'utf8'));
  }
} catch (error) {
  console.log('استخدام البيانات التجريبية الافتراضية');
}

const standaloneCode = `const http = require('http');
const url = require('url');
const { exec } = require('child_process');

// البيانات المضمنة في التطبيق
const embeddedData = ${JSON.stringify(realData, null, 2)};
const embeddedDocuments = ${JSON.stringify(realDocuments, null, 2)};

// الملفات الثابتة المضمنة
const staticFiles = {
  html: \`${htmlContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
  js: \`${jsContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
  css: \`${cssContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
};

const PORT = 3000;

const apiResponses = {
  '/api/companies': () => embeddedData.companies || [
    {
      id: "1",
      name: "شركة الاتحاد الخليجي للأقمشة والذهب",
      description: "شركة رائدة في تجارة الأقمشة الفاخرة والمجوهرات الذهبية",
      employeeCount: 120,
      status: "active"
    },
    {
      id: "2",
      name: "شركة النيل الأزرق للمجوهرات",
      description: "متخصصة في صناعة وتجارة المجوهرات الذهبية والفضية",
      employeeCount: 85,
      status: "active"
    }
  ],
  
  '/api/auth/user': () => ({
    id: "demo",
    name: "مستخدم تجريبي",
    role: "super_admin",
    email: "demo@zeylab.com"
  }),

  '/api/employees': () => embeddedData.employees || [
    { id: "1", name: "أحمد محمد", position: "مدير الموارد البشرية", department: "الموارد البشرية", salary: 5000, status: "active" },
    { id: "2", name: "فاطمة أحمد", position: "محاسبة", department: "المحاسبة", salary: 3500, status: "active" }
  ],

  '/api/licenses': () => embeddedDocuments.licenses || [
    { id: "1", name: "ترخيص تجاري رئيسي", type: "تجاري", expiryDate: "2025-12-31", status: "active" }
  ],

  '/api/documents': () => embeddedDocuments.documents || [
    { id: "1", name: "عقد تأسيس الشركة", type: "تأسيس", uploadDate: "2024-01-15", status: "approved" }
  ],

  '/api/requests': () => [
    { id: "1", type: "طلب إجازة", employee: "أحمد محمد", status: "pending", date: "2025-01-28" },
    { id: "2", type: "طلب راتب", employee: "فاطمة أحمد", status: "approved", date: "2025-01-27" }
  ]
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // تمكين CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // معالجة طلبات API
  if (pathname.startsWith('/api/')) {
    if (apiResponses[pathname]) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(apiResponses[pathname]()));
      return;
    }
    
    // معالجة المسارات الديناميكية
    if (pathname.startsWith('/api/companies/') && pathname.endsWith('/stats')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        totalEmployees: 85, activeEmployees: 82, onLeave: 3,
        departments: 6, avgSalary: 3500, growthRate: 12
      }));
      return;
    }
    
    if (pathname.startsWith('/api/companies/') && !pathname.endsWith('/stats')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        id: "1", name: "شركة النيل الأزرق للمجوهرات",
        description: "متخصصة في صناعة وتجارة المجوهرات الذهبية والفضية",
        employeeCount: 85, status: "active"
      }));
      return;
    }
  }

  // تقديم الملفات الثابتة
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(staticFiles.html);
  } else if (pathname.includes('.js')) {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    res.end(staticFiles.js);
  } else if (pathname.includes('.css')) {
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
    res.end(staticFiles.css);
  } else {
    // SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(staticFiles.html);
  }
});

server.listen(PORT, () => {
  console.log(\`
===============================================
       Zeylab HRMS Demo - نسخة تجريبية
       نظام إدارة الموارد البشرية الشامل
===============================================

🚀 تم تشغيل الخادم بنجاح!
🌐 الرابط: http://localhost:\${PORT}
📱 افتح المتصفح وتوجه إلى الرابط أعلاه

🔑 بيانات الدخول التجريبية:
   اسم المستخدم: admin
   كلمة المرور: admin123

🏢 الشركات المتاحة:
   • شركة الاتحاد الخليجي للأقمشة والذهب
   • شركة النيل الأزرق للمجوهرات

💡 لإغلاق الخادم: اضغط Ctrl+C

📧 للحصول على النسخة الكاملة: info@zeylab.com
🌐 الموقع: https://zeylab.com
===============================================
  \`);
  
  // فتح المتصفح تلقائياً (ويندوز)
  setTimeout(() => {
    exec(\`start http://localhost:\${PORT}\`, (error) => {
      if (error) {
        console.log('\\n💡 يرجى فتح المتصفح يدوياً والذهاب إلى: http://localhost:' + PORT);
      }
    });
  }, 2000);
});

// معالجة إغلاق التطبيق
process.on('SIGINT', () => {
  console.log('\\n');
  console.log('🛑 تم إيقاف النظام بنجاح');
  console.log('📧 شكراً لاستخدام Zeylab HRMS Demo');
  console.log('💼 للحصول على النسخة الكاملة: info@zeylab.com');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 تم إيقاف النظام');
  process.exit(0);
});`;

// حفظ الملف المستقل
fs.writeFileSync('ZeylabHRMS-Standalone.js', standaloneCode);
console.log('✅ تم إنشاء الملف المستقل: ZeylabHRMS-Standalone.js');

// إنشاء ملف تشغيل للنسخة المستقلة
const runBatContent = `@echo off
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
)`;

fs.writeFileSync('run-standalone.bat', runBatContent);
console.log('✅ تم إنشاء ملف تشغيل: run-standalone.bat');

console.log('\\n📋 التعليمات:');
console.log('1️⃣ اختبار النسخة الحالية:');
console.log('   node ZeylabHRMS-Standalone.js');
console.log('');
console.log('2️⃣ لإنشاء ملف .exe (يتطلب pkg):');
console.log('   npm install -g pkg');
console.log('   pkg ZeylabHRMS-Standalone.js --target node18-win-x64 --output ZeylabHRMS-Standalone.exe');
console.log('');
console.log('3️⃣ بعد إنشاء الـ exe:');
console.log('   انقر مضاعف على: run-standalone.bat');
console.log('');
console.log('🎯 هذا الملف يحتوي على:');
console.log('   ✅ خادم HTTP مضمن');
console.log('   ✅ جميع البيانات الحقيقية');
console.log('   ✅ واجهة كاملة مع APIs');
console.log('   ✅ فتح المتصفح تلقائياً');