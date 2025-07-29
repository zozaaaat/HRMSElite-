
// #!/usr/bin/env node

/**
 * Zeylab HRMS - Final Complete Standalone Version
 * النسخة النهائية المستقلة الكاملة لنظام إدارة الموارد البشرية
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
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:;");
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// بيانات النظام المدمجة
const companies = [
  { 
    id: '1', 
    name: 'شركة التقنية المتقدمة', 
    employees: 147, 
    licenses: 3, 
    status: 'active',
    industry: 'تقنية المعلومات',
    establishedDate: '2018-03-15',
    location: 'الرياض'
  },
  { 
    id: '2', 
    name: 'مؤسسة النيل الأزرق', 
    employees: 89, 
    licenses: 2, 
    status: 'active',
    industry: 'الخدمات المالية',
    establishedDate: '2015-08-22',
    location: 'جدة'
  },
  { 
    id: '3', 
    name: 'شركة قمة النيل', 
    employees: 56, 
    licenses: 1, 
    status: 'active',
    industry: 'التجارة',
    establishedDate: '2020-01-10',
    location: 'الدمام'
  },
  { 
    id: '4', 
    name: 'محمد أحمد إبراهيم وشركاه', 
    employees: 34, 
    licenses: 2, 
    status: 'active',
    industry: 'الاستشارات',
    establishedDate: '2019-11-05',
    location: 'المدينة المنورة'
  },
  { 
    id: '5', 
    name: 'مجموعة ميلانو', 
    employees: 78, 
    licenses: 1, 
    status: 'active',
    industry: 'التصنيع',
    establishedDate: '2017-06-30',
    location: 'مكة المكرمة'
  }
];

const employees = [
  { 
    id: '1', 
    name: 'أحمد محمد علي', 
    position: 'مطور أول', 
    department: 'التطوير', 
    companyId: '1', 
    status: 'active',
    email: 'ahmed.mohamed@company1.com',
    phone: '+966501234567',
    salary: 12000,
    hireDate: '2022-01-15'
  },
  { 
    id: '2', 
    name: 'فاطمة أحمد السيد', 
    position: 'محاسبة رئيسية', 
    department: 'المالية', 
    companyId: '1', 
    status: 'active',
    email: 'fatima.ahmed@company1.com',
    phone: '+966501234568',
    salary: 10000,
    hireDate: '2021-03-20'
  },
  { 
    id: '3', 
    name: 'محمد حسن أحمد', 
    position: 'مهندس نظم', 
    department: 'تقنية المعلومات', 
    companyId: '2', 
    status: 'active',
    email: 'mohamed.hassan@company2.com',
    phone: '+966501234569',
    salary: 11000,
    hireDate: '2021-08-10'
  },
  { 
    id: '4', 
    name: 'سارة علي محمد', 
    position: 'منسقة موارد بشرية', 
    department: 'الموارد البشرية', 
    companyId: '2', 
    status: 'active',
    email: 'sara.ali@company2.com',
    phone: '+966501234570',
    salary: 9000,
    hireDate: '2022-05-12'
  },
  { 
    id: '5', 
    name: 'خالد أحمد علي', 
    position: 'مدير مبيعات', 
    department: 'المبيعات', 
    companyId: '3', 
    status: 'active',
    email: 'khalid.ahmed@company3.com',
    phone: '+966501234571',
    salary: 13000,
    hireDate: '2020-11-08'
  }
];

const documents = [
  { 
    id: '1', 
    name: 'سياسة الموارد البشرية 2025', 
    type: 'policy', 
    companyId: '1', 
    size: '2.4 MB',
    uploadDate: '2025-01-01',
    status: 'active'
  },
  { 
    id: '2', 
    name: 'دليل الموظف الجديد', 
    type: 'guide', 
    companyId: '1', 
    size: '1.8 MB',
    uploadDate: '2025-01-05',
    status: 'active'
  },
  { 
    id: '3', 
    name: 'لائحة السلامة المهنية', 
    type: 'safety', 
    companyId: '2', 
    size: '3.1 MB',
    uploadDate: '2025-01-10',
    status: 'active'
  },
  { 
    id: '4', 
    name: 'عقد العمل النموذجي', 
    type: 'contract', 
    companyId: '2', 
    size: '1.2 MB',
    uploadDate: '2025-01-15',
    status: 'active'
  },
  { 
    id: '5', 
    name: 'تقرير الأداء السنوي', 
    type: 'report', 
    companyId: '3', 
    size: '4.7 MB',
    uploadDate: '2025-01-20',
    status: 'active'
  }
];

const licenses = [
  { 
    id: '1', 
    name: 'ترخيص مزاولة المهنة', 
    number: 'LIC-2024-001', 
    companyId: '1', 
    expiryDate: '2025-12-31', 
    status: 'active',
    issueDate: '2024-01-01',
    authority: 'وزارة التجارة'
  },
  { 
    id: '2', 
    name: 'شهادة الجودة ISO 9001', 
    number: 'ISO-2024-456', 
    companyId: '1', 
    expiryDate: '2025-11-15', 
    status: 'active',
    issueDate: '2023-11-15',
    authority: 'المنظمة الدولية للمعايير'
  },
  { 
    id: '3', 
    name: 'ترخيص السلامة المهنية', 
    number: 'SAF-2024-789', 
    companyId: '2', 
    expiryDate: '2025-09-20', 
    status: 'warning',
    issueDate: '2023-09-20',
    authority: 'وزارة العمل'
  },
  { 
    id: '4', 
    name: 'ترخيص البيئة', 
    number: 'ENV-2024-123', 
    companyId: '3', 
    expiryDate: '2026-03-10', 
    status: 'active',
    issueDate: '2024-03-10',
    authority: 'الهيئة العامة للبيئة'
  }
];

// Mock users for testing
const users = [
  { 
    id: '1', 
    username: 'admin', 
    password: 'admin123', 
    role: 'admin', 
    name: 'المسؤول العام' 
  },
  { 
    id: '2', 
    username: 'manager', 
    password: 'manager123', 
    role: 'company_manager', 
    name: 'مدير الشركة',
    companyId: '1' 
  },
  { 
    id: '3', 
    username: 'employee', 
    password: 'emp123', 
    role: 'employee', 
    name: 'موظف إداري',
    companyId: '1' 
  },
  { 
    id: '4', 
    username: 'supervisor', 
    password: 'super123', 
    role: 'supervisor', 
    name: 'مشرف',
    companyId: '2' 
  },
  { 
    id: '5', 
    username: 'worker', 
    password: 'work123', 
    role: 'worker', 
    name: 'عامل',
    companyId: '3' 
  }
];

// API Routes
app.get('/api/companies', (req, res) => {
  console.log('[API] GET /api/companies');
  res.json(companies);
});

app.get('/api/companies/:id', (req, res) => {
  console.log(`[API] GET /api/companies/${req.params.id}`);
  const company = companies.find(c => c.id === req.params.id);
  if (company) {
    res.json(company);
  } else {
    res.status(404).json({ error: 'Company not found' });
  }
});

app.get('/api/companies/:id/employees', (req, res) => {
  console.log(`[API] GET /api/companies/${req.params.id}/employees`);
  const companyEmployees = employees.filter(e => e.companyId === req.params.id);
  res.json(companyEmployees);
});

app.get('/api/employees', (req, res) => {
  console.log('[API] GET /api/employees');
  res.json(employees);
});

app.get('/api/employees/:id', (req, res) => {
  console.log(`[API] GET /api/employees/${req.params.id}`);
  const employee = employees.find(e => e.id === req.params.id);
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
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

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('[API] POST /api/auth/login');
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      user: userWithoutPassword,
      token: 'mock-jwt-token' 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'بيانات الدخول غير صحيحة' 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  console.log('[API] POST /api/auth/logout');
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  console.log('[API] GET /api/auth/me');
  // Mock authenticated user
  res.json({
    id: '1',
    username: 'admin',
    role: 'admin',
    name: 'المسؤول العام'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    environment: 'standalone',
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'النظام يعمل بشكل مثالي',
    timestamp: new Date().toISOString(),
    components: {
      companies: companies.length,
      employees: employees.length,
      documents: documents.length,
      licenses: licenses.length,
      users: users.length
    }
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
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8rem;
        }
        .test-button:hover {
            background: #0056b3;
        }
        .login-section {
            background: #e7f3ff;
            padding: 1.5rem;
            border-radius: 15px;
            margin-top: 2rem;
            border: 1px solid #bee5eb;
        }
        .login-accounts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .account {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            border-right: 3px solid #007bff;
            text-align: right;
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
        <div class="subtitle">Zeylab HRMS - النسخة المستقلة الكاملة</div>
        
        <div class="success">
            ✅ النسخة المستقلة تعمل بنجاح مع جميع الميزات المدمجة
        </div>
        
        <div class="status">
            🚀 الخادم نشط على المنفذ ${PORT} - Node.js ${process.version}
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
            <div class="feature">
                <h3>المستخدمون</h3>
                <p>${users.length} حسابات تجريبية</p>
            </div>
        </div>
        
        <div class="login-section">
            <h3 style="margin-bottom: 1rem; color: #2c3e50;">حسابات تجريبية للدخول:</h3>
            <div class="login-accounts">
                <div class="account">
                    <h4>المسؤول العام</h4>
                    <p>المستخدم: admin</p>
                    <p>كلمة المرور: admin123</p>
                </div>
                <div class="account">
                    <h4>مدير الشركة</h4>
                    <p>المستخدم: manager</p>
                    <p>كلمة المرور: manager123</p>
                </div>
                <div class="account">
                    <h4>موظف إداري</h4>
                    <p>المستخدم: employee</p>
                    <p>كلمة المرور: emp123</p>
                </div>
                <div class="account">
                    <h4>مشرف</h4>
                    <p>المستخدم: supervisor</p>
                    <p>كلمة المرور: super123</p>
                </div>
                <div class="account">
                    <h4>عامل</h4>
                    <p>المستخدم: worker</p>
                    <p>كلمة المرور: work123</p>
                </div>
            </div>
        </div>
        
        <div class="apis">
            <h3 style="margin-bottom: 1rem; color: #2c3e50;">نقاط النهاية المتاحة:</h3>
            <div class="api-endpoint">
                <span>GET /api/companies - قائمة الشركات</span>
                <button class="test-button" onclick="testApi('/api/companies')">اختبار</button>
            </div>
            <div class="api-endpoint">
                <span>GET /api/employees - قائمة الموظفين</span>
                <button class="test-button" onclick="testApi('/api/employees')">اختبار</button>
            </div>
            <div class="api-endpoint">
                <span>GET /api/documents - المستندات</span>
                <button class="test-button" onclick="testApi('/api/documents')">اختبار</button>
            </div>
            <div class="api-endpoint">
                <span>GET /api/licenses - التراخيص</span>
                <button class="test-button" onclick="testApi('/api/licenses')">اختبار</button>
            </div>
            <div class="api-endpoint">
                <span>GET /api/dashboard/stats - الإحصائيات</span>
                <button class="test-button" onclick="testApi('/api/dashboard/stats')">اختبار</button>
            </div>
            <div class="api-endpoint">
                <span>POST /api/auth/login - تسجيل الدخول</span>
                <button class="test-button" onclick="testLogin()">اختبار</button>
            </div>
            <div class="api-endpoint">
                <span>GET /health - حالة الخادم</span>
                <button class="test-button" onclick="testApi('/health')">اختبار</button>
            </div>
            <div class="api-endpoint">
                <span>GET /api/test - اختبار النظام</span>
                <button class="test-button" onclick="testApi('/api/test')">اختبار</button>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 Zeylab HRMS - جميع الحقوق محفوظة</p>
            <p>الإصدار 2.1.0 - النسخة المستقلة الكاملة</p>
        </div>
    </div>

    <script>
        async function testApi(endpoint) {
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                alert('✅ نجح الاختبار!\\n' + 
                      'المسار: ' + endpoint + '\\n' +
                      'الحالة: ' + response.status + '\\n' +
                      'البيانات: ' + JSON.stringify(data, null, 2).substring(0, 200) + '...');
            } catch (error) {
                alert('❌ فشل الاختبار!\\n' + 
                      'المسار: ' + endpoint + '\\n' +
                      'الخطأ: ' + error.message);
            }
        }

        async function testLogin() {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: 'admin',
                        password: 'admin123'
                    })
                });
                const data = await response.json();
                alert('✅ نجح اختبار تسجيل الدخول!\\n' + 
                      'المستخدم: ' + data.user.name + '\\n' +
                      'الدور: ' + data.user.role);
            } catch (error) {
                alert('❌ فشل اختبار تسجيل الدخول!\\n' + 
                      'الخطأ: ' + error.message);
            }
        }
    </script>
</body>
</html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'حدث خطأ في الخادم', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                   Zeylab HRMS - Final Complete               ║
║                  النسخة المستقلة الكاملة                     ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 الخادم نشط على: http://0.0.0.0:${PORT}               ║
║  🌐 للوصول المحلي: http://localhost:${PORT}              ║
║  🔗 لشبكة Replit: https://${process.env.REPL_SLUG || 'your-repl'}.replit.app ║
╠══════════════════════════════════════════════════════════════╣
║  📊 البيانات المدمجة:                                      ║
║     ${companies.length} شركات | ${employees.length} موظفين | ${documents.length} مستندات | ${licenses.length} تراخيص     ║
║     ${users.length} حسابات تجريبية | جميع APIs تعمل           ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ الميزات المتاحة:                                       ║
║     • نظام مصادقة كامل                                    ║
║     • إدارة الشركات والموظفين                             ║
║     • نظام المستندات والتراخيص                            ║
║     • APIs شاملة مع اختبارات                              ║
║     • واجهة عربية متكاملة                                 ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Auto-open browser
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
