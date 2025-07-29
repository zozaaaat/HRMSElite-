const http = require('http');
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
  html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Zeylab HRMS - نظام إدارة الموارد البشرية</title>
    
    <!-- PWA Meta Tags -->
    <meta name="description" content="نظام إدارة الموارد البشرية الشامل للشركات العربية - Zeylab HRMS">
    <meta name="theme-color" content="#0066CC">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Zeylab HRMS">
    <link rel="manifest" href="/manifest.json">
    
    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.svg">
    <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.svg">
    <script type="module" crossorigin src="/assets/index-JIxFVuiR.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-Busa3mxy.css">
  </head>
  <body>
    <div id="root"></div>
    <!-- This is a replit script which adds a banner on the top of the page when opened in development mode outside the replit environment -->
    <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  </body>
</html>`,
  css: `/* Embedded CSS */
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
`,
  js: `// Embedded JavaScript
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
`
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
  console.log(`
===============================================
       Zeylab HRMS Demo - نسخة تجريبية
       نظام إدارة الموارد البشرية الشامل
===============================================

🚀 تم تشغيل الخادم بنجاح!
🌐 الرابط: http://localhost:${PORT}
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
  `);
  
  // فتح المتصفح تلقائياً
  setTimeout(() => {
    exec(`start http://localhost:${PORT}`, (error) => {
      if (error) {
        console.log('\n💡 يرجى فتح المتصفح يدوياً والذهاب إلى: http://localhost:' + PORT);
      }
    });
  }, 2000);
});

// معالجة الإغلاق
process.on('SIGINT', () => {
  console.log('\n🛑 تم إيقاف النظام بنجاح');
  console.log('📧 شكراً لاستخدام Zeylab HRMS Demo');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 تم إيقاف النظام');
  process.exit(0);
});