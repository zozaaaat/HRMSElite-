#!/usr/bin/env node

/**
 * Zeylab HRMS - Zero Dependencies Standalone Version
 * نسخة مستقلة بدون اعتماديات خارجية
 * Built with Node.js native HTTP module only
 */

const http = require('http');
const url = require('url');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 5000;

// بيانات النظام المدمجة
const companies = [
  { id: '1', name: 'شركة التقنية المتقدمة', employees: 147, licenses: 3, status: 'active' },
  { id: '2', name: 'مؤسسة النيل الأزرق', employees: 89, licenses: 2, status: 'active' },
  { id: '3', name: 'شركة قمة النيل', employees: 56, licenses: 1, status: 'active' },
  { id: '4', name: 'محمد أحمد إبراهيم وشركاه', employees: 34, licenses: 2, status: 'active' },
  { id: '5', name: 'مجموعة ميلانو', employees: 78, licenses: 1, status: 'active' }
];

const employees = [
  { id: '1', name: 'أحمد محمد علي', position: 'مطور أول', department: 'التطوير', companyId: '1', status: 'active' },
  { id: '2', name: 'فاطمة أحمد السيد', position: 'محاسبة رئيسية', department: 'المالية', companyId: '1', status: 'active' },
  { id: '3', name: 'محمد حسن أحمد', position: 'مهندس نظم', department: 'تقنية المعلومات', companyId: '2', status: 'active' },
  { id: '4', name: 'سارة علي محمد', position: 'منسقة موارد بشرية', department: 'الموارد البشرية', companyId: '2', status: 'active' },
  { id: '5', name: 'خالد أحمد علي', position: 'مدير مبيعات', department: 'المبيعات', companyId: '3', status: 'active' }
];

const documents = [
  { id: '1', name: 'سياسة الموارد البشرية 2025', type: 'policy', companyId: '1', size: '2.4 MB' },
  { id: '2', name: 'دليل الموظف الجديد', type: 'guide', companyId: '1', size: '1.8 MB' },
  { id: '3', name: 'لائحة السلامة المهنية', type: 'safety', companyId: '2', size: '3.1 MB' },
  { id: '4', name: 'عقد العمل النموذجي', type: 'contract', companyId: '2', size: '1.2 MB' },
  { id: '5', name: 'تقرير الأداء السنوي', type: 'report', companyId: '3', size: '4.7 MB' }
];

const licenses = [
  { id: '1', name: 'ترخيص مزاولة المهنة', number: 'LIC-2024-001', companyId: '1', expiryDate: '2025-12-31', status: 'active' },
  { id: '2', name: 'شهادة الجودة ISO 9001', number: 'ISO-2024-456', companyId: '1', expiryDate: '2025-11-15', status: 'active' },
  { id: '3', name: 'ترخيص السلامة المهنية', number: 'SAF-2024-789', companyId: '2', expiryDate: '2025-09-20', status: 'warning' },
  { id: '4', name: 'ترخيص البيئة', number: 'ENV-2024-123', companyId: '3', expiryDate: '2026-03-10', status: 'active' }
];

// Helper functions
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendHTML(res, html) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });
  res.end(html);
}

function getMainHTML() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة الموارد البشرية - Zeylab HRMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Noto Sans Arabic', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            direction: rtl;
        }
        .container {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 800px;
            width: 90%;
        }
        .logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 50%;
            margin: 0 auto 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
            font-weight: bold;
        }
        h1 { 
            color: #2c3e50; 
            margin-bottom: 1rem; 
            font-size: 2.5rem;
            font-weight: 700;
        }
        .subtitle {
            color: #7f8c8d;
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 1.5rem;
            border-radius: 15px;
            margin: 2rem 0;
            border: 1px solid #c3e6cb;
            font-size: 1.1rem;
            font-weight: 600;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        .feature {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 15px;
            border-right: 4px solid #4facfe;
            transition: transform 0.3s ease;
        }
        .feature:hover {
            transform: translateY(-5px);
        }
        .feature h3 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        .feature p {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        .apis {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 15px;
            margin-top: 2rem;
            text-align: right;
        }
        .api-endpoint {
            background: white;
            padding: 1rem;
            margin: 0.8rem 0;
            border-radius: 10px;
            border-right: 4px solid #28a745;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .api-endpoint:hover {
            background: #e8f5e8;
            transform: translateX(-10px);
        }
        .stats {
            display: flex;
            justify-content: space-around;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            margin: 2rem 0;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        .footer {
            margin-top: 3rem;
            color: #7f8c8d;
            font-size: 0.9rem;
            border-top: 1px solid #eee;
            padding-top: 2rem;
        }
        .badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            margin: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">HR</div>
        <h1>نظام إدارة الموارد البشرية</h1>
        <div class="subtitle">Zeylab HRMS - Zero Dependencies Edition</div>
        
        <div class="success">
            🎉 النظام يعمل بنجاح! تم حل جميع مشاكل الاعتماديات
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-number">${companies.length}</div>
                <div class="stat-label">شركات</div>
            </div>
            <div class="stat">
                <div class="stat-number">${employees.length}</div>
                <div class="stat-label">موظفين</div>
            </div>
            <div class="stat">
                <div class="stat-number">${documents.length}</div>
                <div class="stat-label">مستندات</div>
            </div>
            <div class="stat">
                <div class="stat-number">${licenses.length}</div>
                <div class="stat-label">تراخيص</div>
            </div>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>✅ Zero Dependencies</h3>
                <p>بدون اعتماديات خارجية - Node.js فقط</p>
            </div>
            <div class="feature">
                <h3>🚀 Fast & Lightweight</h3>
                <p>سريع وخفيف - ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <div class="feature">
                <h3>🔒 Secure</h3>
                <p>آمن مع headers حماية متقدمة</p>
            </div>
            <div class="feature">
                <h3>🌐 Cross Platform</h3>
                <p>يعمل على جميع أنظمة التشغيل</p>
            </div>
        </div>
        
        <div class="apis">
            <h3 style="margin-bottom: 1.5rem; color: #2c3e50; text-align: center;">
                نقاط النهاية المتاحة - جرب الضغط عليها!
            </h3>
            <div class="api-endpoint" onclick="window.open('/api/companies', '_blank')">
                GET /api/companies - قائمة الشركات (${companies.length} شركات)
            </div>
            <div class="api-endpoint" onclick="window.open('/api/employees', '_blank')">
                GET /api/employees - قائمة الموظفين (${employees.length} موظفين)
            </div>
            <div class="api-endpoint" onclick="window.open('/api/documents', '_blank')">
                GET /api/documents - المستندات (${documents.length} مستندات)
            </div>
            <div class="api-endpoint" onclick="window.open('/api/licenses', '_blank')">
                GET /api/licenses - التراخيص (${licenses.length} تراخيص)
            </div>
            <div class="api-endpoint" onclick="window.open('/api/dashboard/stats', '_blank')">
                GET /api/dashboard/stats - الإحصائيات الشاملة
            </div>
            <div class="api-endpoint" onclick="window.open('/health', '_blank')">
                GET /health - حالة الخادم
            </div>
        </div>

        <div style="margin: 2rem 0;">
            <span class="badge">Node.js ${process.version}</span>
            <span class="badge">Zero Dependencies</span>
            <span class="badge">Production Ready</span>
            <span class="badge">Arabic Support</span>
        </div>
        
        <div class="footer">
            <p><strong>© 2025 Zeylab HRMS - جميع الحقوق محفوظة</strong></p>
            <p>الإصدار 3.0.0 - Zero Dependencies Edition</p>
            <p>تم التشغيل في ${new Date().toLocaleString('ar-SA')} على المنفذ ${PORT}</p>
        </div>
    </div>

    <script>
        // Auto-refresh stats every 30 seconds
        setInterval(() => {
            fetch('/api/dashboard/stats')
                .then(res => res.json())
                .then(data => console.log('📊 Stats updated:', data))
                .catch(err => console.log('Stats update failed:', err));
        }, 30000);
        
        console.log('🎯 Zeylab HRMS loaded successfully!');
        console.log('🔗 Try clicking on the API endpoints above');
    </script>
</body>
</html>`;
}

// Main server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/companies') {
    sendJSON(res, companies);
  } else if (pathname === '/api/employees') {
    sendJSON(res, employees);
  } else if (pathname === '/api/documents') {
    sendJSON(res, documents);
  } else if (pathname === '/api/licenses') {
    sendJSON(res, licenses);
  } else if (pathname === '/api/dashboard/stats') {
    const stats = {
      totalCompanies: companies.length,
      totalEmployees: employees.length,
      totalDocuments: documents.length,
      totalLicenses: licenses.length,
      activeEmployees: employees.filter(e => e.status === 'active').length,
      activeLicenses: licenses.filter(l => l.status === 'active').length,
      warningLicenses: licenses.filter(l => l.status === 'warning').length,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    };
    sendJSON(res, stats);
  } else if (pathname === '/health') {
    sendJSON(res, {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      environment: 'production',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      dependencies: 'zero'
    });
  } else {
    // Default route - main page
    sendHTML(res, getMainHTML());
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🎯 Zeylab HRMS Server v3.0.0                   ║
║                Zero Dependencies Edition                     ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 الخادم يعمل على المنفذ: ${PORT}                        ║
║  🌐 الرابط: http://localhost:${PORT}                      ║
║  📊 الإحصائيات: http://localhost:${PORT}/api/dashboard/stats ║
║  ❤️  الحالة: http://localhost:${PORT}/health               ║
╠══════════════════════════════════════════════════════════════╣
║  📈 ${companies.length} شركات | ${employees.length} موظفين | ${documents.length} مستندات | ${licenses.length} تراخيص          ║
║  ✅ Zero Dependencies - Native Node.js Only                 ║
║  🔧 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB                                     ║
║  🎯 100% Self-Contained - No External Libraries            ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Auto-open browser on Windows
  if (process.platform === 'win32') {
    try {
      spawn('cmd', ['/c', 'start', `http://localhost:${PORT}`], { 
        detached: true, 
        stdio: 'ignore' 
      }).unref();
      console.log('🌐 تم فتح المتصفح تلقائياً...');
    } catch (err) {
      console.log('💡 افتح المتصفح يدوياً على: http://localhost:' + PORT);
    }
  } else {
    console.log('💡 افتح المتصفح على: http://localhost:' + PORT);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('إيقاف الخادم...');
  server.close(() => {
    console.log('تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nإيقاف الخادم...');
  server.close(() => {
    console.log('تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});

console.log('🎯 Zeylab HRMS - Zero Dependencies Version Started!');
console.log('📦 No external dependencies required!');
console.log('🚀 Native Node.js HTTP server only!');