#!/usr/bin/env node

/**
 * Zeylab HRMS - Standalone CommonJS Version
 * النسخة المستقلة المتوافقة مع جميع بيئات Node.js
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

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

// API Routes
app.get('/api/companies', (req, res) => {
  console.log('[API] GET /api/companies');
  res.json(companies);
});

app.get('/api/employees', (req, res) => {
  console.log('[API] GET /api/employees');
  res.json(employees);
});

app.get('/api/documents', (req, res) => {
  console.log('[API] GET /api/documents');
  res.json(documents);
});

app.get('/api/licenses', (req, res) => {
  console.log('[API] GET /api/licenses');
  res.json(licenses);
});

app.get('/api/dashboard/stats', (req, res) => {
  console.log('[API] GET /api/dashboard/stats');
  const stats = {
    totalCompanies: companies.length,
    totalEmployees: employees.length,
    totalDocuments: documents.length,
    totalLicenses: licenses.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    activeLicenses: licenses.filter(l => l.status === 'active').length,
    warningLicenses: licenses.filter(l => l.status === 'warning').length
  };
  res.json(stats);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    environment: 'production',
    nodeVersion: process.version
  });
});

// Frontend route
app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
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
            max-width: 600px;
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
        .status {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 10px;
            margin: 2rem 0;
            border: 1px solid #c3e6cb;
        }
        .success {
            background: #d1ecf1;
            color: #0c5460;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
            border: 1px solid #bee5eb;
        }
        .apis {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 15px;
            margin-top: 2rem;
            text-align: right;
        }
        .api-endpoint {
            background: white;
            padding: 0.8rem;
            margin: 0.5rem 0;
            border-radius: 8px;
            border-right: 3px solid #28a745;
            font-family: monospace;
            font-size: 0.9rem;
        }
        .footer {
            margin-top: 2rem;
            color: #7f8c8d;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">HR</div>
        <h1>نظام إدارة الموارد البشرية</h1>
        <div class="subtitle">Zeylab HRMS - النسخة المتوافقة</div>
        
        <div class="success">
            ✅ تم حل مشكلة ES Module! الخادم يعمل بنجاح
        </div>
        
        <div class="status">
            🚀 النظام جاهز - المنفذ ${PORT} - Node.js ${process.version}
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>إدارة الشركات</h3>
                <p>${companies.length} شركات مسجلة</p>
            </div>
            <div class="feature">
                <h3>إدارة الموظفين</h3>
                <p>${employees.length} موظفين نشطين</p>
            </div>
            <div class="feature">
                <h3>المستندات</h3>
                <p>${documents.length} مستند متاح</p>
            </div>
            <div class="feature">
                <h3>التراخيص</h3>
                <p>${licenses.length} تراخيص مسجلة</p>
            </div>
        </div>
        
        <div class="apis">
            <h3 style="margin-bottom: 1rem; color: #2c3e50;">نقاط النهاية المتاحة:</h3>
            <div class="api-endpoint">GET /api/companies - قائمة الشركات</div>
            <div class="api-endpoint">GET /api/employees - قائمة الموظفين</div>
            <div class="api-endpoint">GET /api/documents - المستندات</div>
            <div class="api-endpoint">GET /api/licenses - التراخيص</div>
            <div class="api-endpoint">GET /api/dashboard/stats - الإحصائيات</div>
            <div class="api-endpoint">GET /health - حالة الخادم</div>
        </div>
        
        <div class="footer">
            <p>© 2025 Zeylab HRMS - جميع الحقوق محفوظة</p>
            <p>الإصدار 2.1.0 - CommonJS Compatible</p>
        </div>
    </div>
</body>
</html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'حدث خطأ في الخادم', message: err.message });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Zeylab HRMS Server                        ║
║              CommonJS Compatible Version                     ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 الخادم يعمل على المنفذ: ${PORT}                        ║
║  🌐 الرابط: http://localhost:${PORT}                      ║
║  📊 الإحصائيات: http://localhost:${PORT}/api/dashboard/stats ║
║  ❤️  الحالة: http://localhost:${PORT}/health               ║
╠══════════════════════════════════════════════════════════════╣
║  📈 ${companies.length} شركات | ${employees.length} موظفين | ${documents.length} مستندات | ${licenses.length} تراخيص          ║
║  ✅ مشكلة ES Module محلولة                                 ║
║  🔧 CommonJS متوافق مع جميع البيئات                       ║
║  🎯 جاهز للاستخدام الإنتاجي                               ║
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

module.exports = app;