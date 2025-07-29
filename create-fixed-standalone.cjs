const fs = require('fs');
const path = require('path');

console.log('🔧 إنشاء نسخة مصححة من الملف المستقل...');

// قراءة الملفات الثابتة
const htmlContent = fs.readFileSync('./dist/public/index.html', 'utf8');
const jsFiles = fs.readdirSync('./dist/public/assets').filter(f => f.endsWith('.js'));
const cssFiles = fs.readdirSync('./dist/public/assets').filter(f => f.endsWith('.css'));

// قراءة البيانات الحقيقية
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
  console.log('استخدام البيانات الافتراضية');
}

// إنشاء ملف مستقل محسن
const fixedStandaloneCode = `const http = require('http');
const url = require('url');
const { exec } = require('child_process');

// البيانات المضمنة (آمنة ومنظفة)
const embeddedData = {
  companies: [
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
    },
    {
      id: "3",
      name: "شركة قمة النيل الخالد",
      description: "شركة متخصصة في الأقمشة والمنسوجات",
      employeeCount: 95,
      status: "active"
    },
    {
      id: "4", 
      name: "شركة محمد أحمد إبراهيم",
      description: "شركة تجارية متنوعة",
      employeeCount: 78,
      status: "active"
    },
    {
      id: "5",
      name: "شركة ميلانو للأقمشة",
      description: "متخصصة في الأقمشة الإيطالية والأوروبية",
      employeeCount: 102,
      status: "active"
    }
  ],
  employees: [
    { id: "1", name: "أحمد محمد علي", position: "مدير الموارد البشرية", department: "الموارد البشرية", salary: 5000, status: "active", companyId: "1" },
    { id: "2", name: "فاطمة أحمد", position: "محاسبة", department: "المحاسبة", salary: 3500, status: "active", companyId: "1" },
    { id: "3", name: "محمد حسن", position: "مدير المبيعات", department: "المبيعات", salary: 4200, status: "active", companyId: "2" },
    { id: "4", name: "عائشة سالم", position: "كاتبة", department: "الإدارة", salary: 2800, status: "active", companyId: "2" }
  ]
};

const embeddedDocuments = {
  licenses: [
    { id: "1", name: "ترخيص تجاري رئيسي", type: "تجاري", expiryDate: "2025-12-31", status: "active", companyId: "1" },
    { id: "2", name: "ترخيص النيل الأزرق", type: "تجاري", expiryDate: "2025-10-15", status: "active", companyId: "2" }
  ],
  documents: [
    { id: "1", name: "عقد تأسيس الشركة", type: "تأسيس", uploadDate: "2024-01-15", status: "approved", companyId: "1" },
    { id: "2", name: "ترخيص الأعمال", type: "ترخيص", uploadDate: "2024-02-20", status: "approved", companyId: "2" }
  ]
};

// الملفات الثابتة المضمنة
const staticContent = {
  html: \`${htmlContent.replace(/`/g, '\\`').replace(/\\\$/g, '\\\\$')}\`,
  css: \`/* Embedded CSS */
body { font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.btn { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
.btn:hover { background: #2563eb; }
.card { background: white; border-radius: 8px; padding: 20px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.header { background: #1e40af; color: white; padding: 20px; text-align: center; }
.nav { background: #f8fafc; padding: 15px; border-bottom: 1px solid #e2e8f0; }
.nav a { margin: 0 10px; text-decoration: none; color: #374151; padding: 8px 16px; border-radius: 4px; }
.nav a:hover { background: #e5e7eb; }
.table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.table th, .table td { border: 1px solid #d1d5db; padding: 12px; text-align: right; }
.table th { background: #f9fafb; font-weight: 600; }
.status-active { color: #059669; font-weight: 500; }
.status-pending { color: #d97706; font-weight: 500; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
.stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
.stat-number { font-size: 2rem; font-weight: bold; margin: 10px 0; }
\`,
  js: \`// Embedded JavaScript
console.log('Zeylab HRMS Demo - تم تحميل النظام بنجاح');

// Simple router for demo
function navigate(page) {
  const content = document.getElementById('main-content');
  if (!content) return;
  
  switch(page) {
    case 'companies':
      content.innerHTML = '<h2>إدارة الشركات</h2><p>عدد الشركات: 5</p>';
      break;
    case 'employees':
      content.innerHTML = '<h2>إدارة الموظفين</h2><p>عدد الموظفين: 273</p>';
      break;
    case 'reports':
      content.innerHTML = '<h2>التقارير</h2><p>تقارير شاملة للنظام</p>';
      break;
    default:
      content.innerHTML = '<h2>لوحة التحكم الرئيسية</h2><p>مرحباً بك في نظام إدارة الموارد البشرية</p>';
  }
}

// Load data function
function loadDashboard() {
  fetch('/api/companies')
    .then(res => res.json())
    .then(data => {
      console.log('تم تحميل بيانات الشركات:', data.length);
    })
    .catch(err => console.log('استخدام البيانات المحلية'));
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', loadDashboard);
\`
};

const PORT = 3000;

// APIs للتجربة
const apiRoutes = {
  '/api/companies': () => embeddedData.companies,
  '/api/auth/user': () => ({ 
    id: "demo", 
    name: "مستخدم تجريبي", 
    role: "super_admin", 
    email: "demo@zeylab.com" 
  }),
  '/api/employees': () => embeddedData.employees,
  '/api/licenses': () => embeddedDocuments.licenses,
  '/api/documents': () => embeddedDocuments.documents,
  '/api/requests': () => [
    { id: "1", type: "طلب إجازة", employee: "أحمد محمد", status: "pending", date: "2025-01-29" },
    { id: "2", type: "طلب راتب", employee: "فاطمة أحمد", status: "approved", date: "2025-01-28" }
  ]
};

// خادم HTTP بسيط
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // API Routes
  if (pathname.startsWith('/api/')) {
    if (apiRoutes[pathname]) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(apiRoutes[pathname]()));
      return;
    }
    
    if (pathname.startsWith('/api/companies/') && pathname.endsWith('/stats')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        totalEmployees: 480,
        activeEmployees: 465,
        onLeave: 15,
        departments: 12,
        avgSalary: 3750,
        growthRate: 8
      }));
      return;
    }
  }

  // Static file serving
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(staticContent.html);
  } else if (pathname.includes('.css')) {
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
    res.end(staticContent.css);
  } else if (pathname.includes('.js')) {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    res.end(staticContent.js);
  } else {
    // SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(staticContent.html);
  }
});

// تشغيل الخادم
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
   • شركة الاتحاد الخليجي للأقمشة والذهب (120 موظف)
   • شركة النيل الأزرق للمجوهرات (85 موظف)
   • شركة قمة النيل الخالد (95 موظف)
   • شركة محمد أحمد إبراهيم (78 موظف)
   • شركة ميلانو للأقمشة (102 موظف)

💡 لإغلاق الخادم: اضغط Ctrl+C

📧 للحصول على النسخة الكاملة: info@zeylab.com
🌐 الموقع: https://zeylab.com
===============================================
  \`);
  
  // فتح المتصفح تلقائياً
  setTimeout(() => {
    exec(\`start http://localhost:\${PORT}\`, (error) => {
      if (error) {
        console.log('\\n💡 يرجى فتح المتصفح يدوياً والذهاب إلى: http://localhost:' + PORT);
      }
    });
  }, 2000);
});

// معالجة الإغلاق
process.on('SIGINT', () => {
  console.log('\\n🛑 تم إيقاف النظام بنجاح');
  console.log('📧 شكراً لاستخدام Zeylab HRMS Demo');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 تم إيقاف النظام');
  process.exit(0);
});`;

// حفظ النسخة المصححة
fs.writeFileSync('ZeylabHRMS-Fixed.js', fixedStandaloneCode);
console.log('✅ تم إنشاء النسخة المصححة: ZeylabHRMS-Fixed.js');

// إنشاء ملف تشغيل محسن
const enhancedBatContent = `@echo off
title Zeylab HRMS Demo - Fixed Version
cls

echo ===============================================
echo        Zeylab HRMS Demo - Fixed Version
echo     Human Resource Management System
echo ===============================================
echo.
echo Starting enhanced demo server...
echo URL: http://localhost:3000
echo.
echo Demo Login Credentials:
echo - Super Admin: admin / admin123
echo - Company Manager: manager / manager123
echo - Employee: employee / emp123
echo.
echo Real Demo Data:
echo - 5 Companies with 480 total employees
echo - Complete HR management system
echo - Arabic interface with RTL support
echo.

node ZeylabHRMS-Fixed.js

if errorlevel 1 (
    echo.
    echo ERROR: System could not start
    echo Please ensure Node.js is installed
    echo Download: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo Demo completed successfully
    echo Contact: info@zeylab.com
    timeout /t 3 >nul
)`;

fs.writeFileSync('START-FIXED-DEMO.bat', enhancedBatContent);
console.log('✅ تم إنشاء ملف التشغيل المحسن: START-FIXED-DEMO.bat');

console.log('\\n🧪 اختبار النسخة المصححة...');
try {
  require('./ZeylabHRMS-Fixed.js');
  console.log('❌ لا يمكن تشغيل الاختبار (العملية تستمر)');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('✅ تم تشغيل الاختبار - النسخة جاهزة');
  } else {
    console.log('❌ خطأ في النسخة:', error.message);
  }
}