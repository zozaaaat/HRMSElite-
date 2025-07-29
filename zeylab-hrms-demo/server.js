const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple HTTP server for HRMS Demo
const PORT = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Load demo data
let demoData = {};
let demoDocuments = {};

try {
  if (fs.existsSync('all-extracted-data.json')) {
    demoData = JSON.parse(fs.readFileSync('all-extracted-data.json', 'utf8'));
  }
  if (fs.existsSync('real-documents.json')) {
    demoDocuments = JSON.parse(fs.readFileSync('real-documents.json', 'utf8'));
  }
} catch (error) {
  console.log('Using fallback demo data');
}

// Demo API responses
const apiResponses = {
  '/api/companies': () => demoData.companies || [
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

  '/api/employees': () => demoData.employees || [
    {
      id: "1",
      name: "أحمد محمد",
      position: "مدير الموارد البشرية",
      department: "الموارد البشرية", 
      salary: 5000,
      status: "active"
    },
    {
      id: "2",
      name: "فاطمة أحمد",
      position: "محاسبة",
      department: "المحاسبة",
      salary: 3500,
      status: "active"
    }
  ],

  '/api/licenses': () => demoDocuments.licenses || [
    {
      id: "1",
      name: "ترخيص تجاري رئيسي",
      type: "تجاري",
      expiryDate: "2025-12-31",
      status: "active"
    }
  ],

  '/api/documents': () => demoDocuments.documents || [
    {
      id: "1", 
      name: "عقد تأسيس الشركة",
      type: "تأسيس",
      uploadDate: "2024-01-15",
      status: "approved"
    }
  ],

  '/api/requests': () => [
    {
      id: "1",
      type: "طلب إجازة",
      employee: "أحمد محمد",
      status: "pending",
      date: "2025-01-28"
    },
    {
      id: "2",
      type: "طلب راتب", 
      employee: "فاطمة أحمد",
      status: "approved",
      date: "2025-01-27"
    }
  ]
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle API requests
  if (pathname.startsWith('/api/')) {
    const apiKey = pathname;
    if (apiResponses[apiKey]) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(apiResponses[apiKey]()));
      return;
    }
    
    // Handle dynamic API routes
    if (pathname.startsWith('/api/companies/') && pathname.endsWith('/stats')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        totalEmployees: 85,
        activeEmployees: 82,
        onLeave: 3,
        departments: 6,
        avgSalary: 3500,
        growthRate: 12
      }));
      return;
    }
    
    if (pathname.startsWith('/api/companies/') && !pathname.endsWith('/stats')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: "1",
        name: "شركة النيل الأزرق للمجوهرات",
        description: "متخصصة في صناعة وتجارة المجوهرات الذهبية والفضية", 
        employeeCount: 85,
        status: "active"
      }));
      return;
    }
  }

  // Serve static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'dist/public', filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing
        const indexPath = path.join(__dirname, 'dist/public/index.html');
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
===============================================
       Zeylab HRMS Demo - نسخة تجريبية
===============================================

🚀 تم تشغيل الخادم بنجاح!
🌐 الرابط: http://localhost:${PORT}
📱 افتح المتصفح وتوجه إلى الرابط أعلاه

🔑 بيانات الدخول:
   اسم المستخدم: admin
   كلمة المرور: admin123

💡 لإغلاق الخادم: اضغط Ctrl+C

📧 للدعم: info@zeylab.com
===============================================
  `);
  
  // Auto-open browser (Windows)
  const open = (url) => {
    const { exec } = require('child_process');
    exec(`start ${url}`, (error) => {
      if (error) {
        console.log('يرجى فتح المتصفح يدوياً والذهاب إلى:', url);
      }
    });
  };
  
  setTimeout(() => {
    open(`http://localhost:${PORT}`);
  }, 2000);
});

process.on('SIGINT', () => {
  console.log('\n🛑 تم إيقاف الخادم');
  console.log('شكراً لاستخدام Zeylab HRMS Demo');
  process.exit();
});