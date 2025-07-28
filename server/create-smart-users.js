import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load corrected employees data
const employeesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'corrected-employees.json'), 'utf8')
);

// نظام توليد أسماء المستخدمين الذكي
function generateUsername(employee, companyId) {
  // استخدام رقم الموظف ورمز الشركة
  const empNumber = employee.id.split('-')[2] || Math.floor(Math.random() * 1000);
  const companyCode = {
    "1": "GU", // Gulf Union
    "2": "NB", // Nile Blue
    "3": "SN", // Summit Nile
    "4": "MA", // Mohamed Ahmed
    "5": "ML"  // Milano
  }[companyId] || "ZL";
  
  return `${companyCode}_${empNumber}`.toLowerCase();
}

// تحديد دور المستخدم بناءً على المسمى الوظيفي
function determineUserRole(position) {
  if (!position) return 'worker';
  
  const pos = position.toLowerCase();
  
  // مديرو الشركات
  if (pos.includes('شريك') || pos.includes('مدير عام') || pos.includes('رئيس')) {
    return 'company_manager';
  }
  
  // الموظفون الإداريون
  if (pos.includes('محاسب') || pos.includes('مسئول') || pos.includes('موظف') || 
      pos.includes('كاتب') || pos.includes('سكرتير') || pos.includes('مدير')) {
    return 'administrative_employee';
  }
  
  // المشرفون
  if (pos.includes('مشرف') || pos.includes('رئيس قسم') || pos.includes('مراقب')) {
    return 'supervisor';
  }
  
  // العمال
  return 'worker';
}

// تحديد الصلاحيات للموظفين الإداريين
function determinePermissions(position, department) {
  const permissions = {
    hr: false,
    accounting: false,
    inventory: false,
    reports: false,
    purchases: false,
    government_forms: false
  };
  
  if (!position) return null;
  
  const pos = position.toLowerCase();
  const dept = department ? department.toLowerCase() : '';
  
  // المحاسبون
  if (pos.includes('محاسب')) {
    permissions.accounting = true;
    permissions.reports = true;
  }
  
  // مسؤولو المشتريات
  if (pos.includes('مشتريات')) {
    permissions.purchases = true;
    permissions.inventory = true;
  }
  
  // مسؤولو المعرض والمبيعات
  if (pos.includes('معرض') || pos.includes('مبيعات')) {
    permissions.reports = true;
  }
  
  // المخازن
  if (dept.includes('مخزن') || dept.includes('مخازن')) {
    permissions.inventory = true;
  }
  
  // الإداريون العامون
  if (pos.includes('مسئول') || pos.includes('موظف')) {
    permissions.hr = true;
    permissions.reports = true;
    permissions.government_forms = true;
  }
  
  return permissions;
}

// تحديد الفرع بناءً على البيانات
function determineBranch(employee, companyId) {
  const branches = {
    "1": "GU-Main",     // Gulf Union Main
    "2": "NB-Main",     // Nile Blue Main
    "3": "SN-Main",     // Summit Nile Main
    "4": "MA-Main",     // Mohamed Ahmed Main
    "5": "ML-Main"      // Milano Main
  };
  
  return branches[companyId] || `BR-${companyId}`;
}

// الدالة الرئيسية لإنشاء حسابات المستخدمين
async function createSmartUserAccounts() {
  const userAccounts = [];
  const statistics = {
    total: 0,
    byRole: {
      company_manager: 0,
      administrative_employee: 0,
      supervisor: 0,
      worker: 0
    },
    byCompany: {}
  };
  
  // معالجة كل شركة
  for (const [companyId, company] of Object.entries(employeesData)) {
    console.log(`\n📁 معالجة ${company.name}...`);
    
    statistics.byCompany[companyId] = {
      name: company.name,
      total: 0,
      roles: {
        company_manager: 0,
        administrative_employee: 0,
        supervisor: 0,
        worker: 0
      }
    };
    
    // معالجة موظفي الشركة
    for (const employee of company.employees) {
      // تخطي السجل الأول إذا كان عنوان
      if (employee.name === 'الاسم' || !employee.name) continue;
      
      const username = generateUsername(employee, companyId);
      const role = determineUserRole(employee.position);
      const permissions = role === 'administrative_employee' ? 
        determinePermissions(employee.position, employee.department) : null;
      const branchId = determineBranch(employee, companyId);
      
      const userAccount = {
        // معلومات المستخدم
        id: `user_${employee.id}`,
        employeeId: employee.id,
        username: username,
        password: "Zeylab@2025", // كلمة مرور افتراضية
        email: `${username}@zeylab.com`,
        
        // معلومات الموظف
        name: employee.name,
        position: employee.position,
        department: employee.department || "غير محدد",
        
        // معلومات الدور والصلاحيات
        role: role,
        permissions: permissions,
        
        // معلومات الشركة والفرع
        companyId: companyId,
        companyName: company.name,
        branchId: branchId,
        
        // معلومات الحالة
        isActive: employee.status === 'active',
        mustChangePassword: true,
        profileComplete: false,
        
        // معلومات إضافية
        phone: employee.phone,
        nationality: employee.nationality,
        civilId: employee.civilId,
        
        // إعدادات المستخدم
        settings: {
          language: 'ar',
          notifications: true,
          theme: 'light',
          dashboardLayout: role === 'worker' ? 'simple' : 'full'
        },
        
        // بيانات تقنية
        createdAt: new Date().toISOString(),
        lastLogin: null,
        loginAttempts: 0,
        lastPasswordChange: null
      };
      
      userAccounts.push(userAccount);
      
      // تحديث الإحصائيات
      statistics.total++;
      statistics.byRole[role]++;
      statistics.byCompany[companyId].total++;
      statistics.byCompany[companyId].roles[role]++;
    }
  }
  
  // حفظ البيانات
  const output = {
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      totalUsers: statistics.total,
      system: "Zeylab HRMS"
    },
    statistics: statistics,
    accounts: userAccounts
  };
  
  const outputPath = path.join(__dirname, 'smart-user-accounts.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  
  // طباعة الإحصائيات
  console.log('\n✅ === تم إنشاء حسابات المستخدمين بنجاح ===');
  console.log(`📊 إجمالي الحسابات: ${statistics.total}`);
  console.log(`\n👥 توزيع الأدوار:`);
  console.log(`   - مديرو الشركات: ${statistics.byRole.company_manager}`);
  console.log(`   - موظفون إداريون: ${statistics.byRole.administrative_employee}`);
  console.log(`   - مشرفون: ${statistics.byRole.supervisor}`);
  console.log(`   - عمال: ${statistics.byRole.worker}`);
  
  console.log(`\n🏢 توزيع الشركات:`);
  for (const [companyId, stats] of Object.entries(statistics.byCompany)) {
    console.log(`   ${stats.name}: ${stats.total} موظف`);
  }
  
  // إنشاء ملف CSV للطباعة
  createUserListCSV(userAccounts);
  
  // إنشاء دليل المستخدم
  createUserGuide(userAccounts, statistics);
  
  return output;
}

// إنشاء ملف CSV لقائمة المستخدمين
function createUserListCSV(users) {
  const headers = ['اسم المستخدم', 'كلمة المرور', 'الاسم', 'الوظيفة', 'الشركة', 'الدور'];
  const rows = users.map(u => [
    u.username,
    u.password,
    u.name,
    u.position,
    u.companyName,
    translateRole(u.role)
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  fs.writeFileSync(
    path.join(__dirname, 'user-credentials.csv'),
    '\ufeff' + csv, // BOM for Excel Arabic support
    'utf8'
  );
  
  console.log('\n📄 تم إنشاء ملف: user-credentials.csv');
}

// إنشاء دليل المستخدم
function createUserGuide(users, stats) {
  const guide = `# دليل المستخدم - نظام Zeylab HRMS

## 🔐 معلومات تسجيل الدخول

### كلمة المرور الافتراضية
جميع المستخدمين: **Zeylab@2025**

⚠️ **مهم**: سيُطلب منك تغيير كلمة المرور عند أول تسجيل دخول

## 👥 أمثلة على حسابات المستخدمين

### 🎯 مديرو الشركات (${stats.byRole.company_manager} مستخدم)
${users.filter(u => u.role === 'company_manager').slice(0, 3).map(u => `
**${u.name}**
- اسم المستخدم: \`${u.username}\`
- الشركة: ${u.companyName}
- الوظيفة: ${u.position}
`).join('\n')}

### 💼 الموظفون الإداريون (${stats.byRole.administrative_employee} مستخدم)
${users.filter(u => u.role === 'administrative_employee').slice(0, 3).map(u => `
**${u.name}**
- اسم المستخدم: \`${u.username}\`
- الشركة: ${u.companyName}
- الوظيفة: ${u.position}
- الصلاحيات: ${formatPermissions(u.permissions)}
`).join('\n')}

### 👷 المشرفون (${stats.byRole.supervisor} مستخدم)
${users.filter(u => u.role === 'supervisor').slice(0, 3).map(u => `
**${u.name}**
- اسم المستخدم: \`${u.username}\`
- الشركة: ${u.companyName}
- الوظيفة: ${u.position}
`).join('\n')}

### 🔧 العمال (${stats.byRole.worker} مستخدم)
${users.filter(u => u.role === 'worker').slice(0, 3).map(u => `
**${u.name}**
- اسم المستخدم: \`${u.username}\`
- الشركة: ${u.companyName}
- الوظيفة: ${u.position}
`).join('\n')}

## 📱 الواجهات المتاحة

### لكل دور واجهة مخصصة:
1. **مدير الشركة**: لوحة تحكم كاملة مع جميع الميزات
2. **الموظف الإداري**: واجهة حسب الصلاحيات الممنوحة
3. **المشرف**: واجهة متابعة العمال والمهام
4. **العامل**: واجهة بسيطة للحضور والإجازات

## 🔄 خطوات تسجيل الدخول

1. افتح المتصفح واذهب إلى: **https://zeylab-hrms.replit.app**
2. أدخل اسم المستخدم وكلمة المرور
3. عند أول دخول، سيُطلب منك:
   - تغيير كلمة المرور
   - تحديث معلوماتك الشخصية
   - اختيار إعدادات اللغة والمظهر

## 📞 الدعم الفني

في حالة واجهتك أي مشكلة:
- البريد الإلكتروني: support@zeylab.com
- الهاتف: +965-XXXX-XXXX
- ساعات العمل: الأحد - الخميس (8 صباحاً - 5 مساءً)

---
تم إنشاء هذا الدليل في: ${new Date().toLocaleString('ar-KW')}
`;
  
  fs.writeFileSync(
    path.join(__dirname, 'user-guide.md'),
    guide,
    'utf8'
  );
  
  console.log('📚 تم إنشاء ملف: user-guide.md');
}

// دالات مساعدة
function translateRole(role) {
  const translations = {
    'company_manager': 'مدير شركة',
    'administrative_employee': 'موظف إداري',
    'supervisor': 'مشرف',
    'worker': 'عامل'
  };
  return translations[role] || role;
}

function formatPermissions(permissions) {
  if (!permissions) return 'لا توجد صلاحيات خاصة';
  
  const allowed = Object.entries(permissions)
    .filter(([_, value]) => value)
    .map(([key, _]) => translatePermission(key));
  
  return allowed.length > 0 ? allowed.join(', ') : 'لا توجد صلاحيات';
}

function translatePermission(permission) {
  const translations = {
    'hr': 'الموارد البشرية',
    'accounting': 'المحاسبة',
    'inventory': 'المخازن',
    'reports': 'التقارير',
    'purchases': 'المشتريات',
    'government_forms': 'النماذج الحكومية'
  };
  return translations[permission] || permission;
}

// تشغيل النظام
createSmartUserAccounts().catch(console.error);