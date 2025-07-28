import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all extracted data
const allData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'all-extracted-data.json'), 'utf8')
);

// نظام توليد أسماء المستخدمين الذكي
function generateUsername(employee, companyId) {
  // استخدام أول 3 حروف من الاسم الأول + أول 3 من الاسم الأخير + رقم الشركة
  const nameParts = employee.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  
  const firstPart = firstName.substring(0, 3).toLowerCase();
  const lastPart = lastName.substring(0, 3).toLowerCase();
  const companyPart = companyId;
  
  // إضافة رقم عشوائي لضمان التفرد
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${firstPart}${lastPart}${companyPart}_${randomNum}`;
}

// نظام توليد كلمات المرور الآمنة
function generateSecurePassword() {
  // كلمة مرور افتراضية قوية يمكن للمستخدم تغييرها لاحقاً
  return 'Zeylab@2025';
}

// تحديد دور المستخدم بناءً على المسمى الوظيفي
function determineUserRole(jobTitle) {
  if (!jobTitle) return 'worker'; // افتراضي
  const title = jobTitle.toLowerCase();
  
  // مديرو الشركات
  if (title.includes('مدير عام') || title.includes('رئيس') || title.includes('ceo')) {
    return 'company_manager';
  }
  
  // الموظفون الإداريون
  if (title.includes('محاسب') || title.includes('موارد بشرية') || title.includes('إداري') || 
      title.includes('سكرتير') || title.includes('مساعد') || title.includes('hr')) {
    return 'administrative_employee';
  }
  
  // المشرفون
  if (title.includes('مشرف') || title.includes('رئيس قسم') || title.includes('supervisor')) {
    return 'supervisor';
  }
  
  // العمال
  return 'worker';
}

// تحديد الصلاحيات للموظفين الإداريين
function determinePermissions(jobTitle) {
  const title = jobTitle.toLowerCase();
  const permissions = {
    hr: false,
    accounting: false,
    inventory: false,
    reports: false,
    purchases: false
  };
  
  if (title.includes('محاسب') || title.includes('مالية')) {
    permissions.accounting = true;
    permissions.reports = true;
  }
  
  if (title.includes('موارد بشرية') || title.includes('hr')) {
    permissions.hr = true;
    permissions.reports = true;
  }
  
  if (title.includes('مخازن') || title.includes('مستودع')) {
    permissions.inventory = true;
  }
  
  if (title.includes('مشتريات')) {
    permissions.purchases = true;
  }
  
  // الإداريون العامون يحصلون على صلاحيات أوسع
  if (title.includes('إداري') && !title.includes('مساعد')) {
    permissions.hr = true;
    permissions.reports = true;
  }
  
  return permissions;
}

// تحديد الفرع بناءً على الموقع أو القسم
function determineBranch(employee, companyId) {
  // نظام ذكي لتحديد الفرع بناءً على البيانات المتاحة
  const branches = {
    "1": [ // شركة الاتحاد الخليجي
      { id: "1-main", name: "الفرع الرئيسي - المباركية", keywords: ["مباركية", "رئيسي", "إدارة"] },
      { id: "1-store", name: "المستودع المركزي", keywords: ["مخزن", "مستودع"] }
    ],
    "2": [ // شركة النيل الأزرق
      { id: "2-main", name: "الفرع الرئيسي - سوق الذهب", keywords: ["ذهب", "رئيسي", "مبيعات"] },
      { id: "2-faheel", name: "فرع فحيحيل", keywords: ["فحيحيل", "جهراء"] }
    ],
    "3": [ // شركة قمة النيل
      { id: "3-main", name: "الفرع الرئيسي - الجهراء", keywords: ["جهراء", "رئيسي"] }
    ],
    "4": [ // شركة محمد أحمد إبراهيم
      { id: "4-main", name: "الفرع الرئيسي - الصليبية", keywords: ["صليبية", "رئيسي"] }
    ],
    "5": [ // شركة ميلانو
      { id: "5-main", name: "الفرع الرئيسي - الصفاة", keywords: ["صفاة", "رئيسي"] },
      { id: "5-workshop", name: "ورشة الخياطة", keywords: ["خياطة", "ورشة", "إنتاج"] }
    ]
  };
  
  const companyBranches = branches[companyId] || [{ id: `${companyId}-main`, name: "الفرع الرئيسي" }];
  
  // البحث عن الفرع المناسب بناءً على القسم أو الموقع
  if (employee.department) {
    for (const branch of companyBranches) {
      for (const keyword of branch.keywords) {
        if (employee.department.toLowerCase().includes(keyword)) {
          return branch.id;
        }
      }
    }
  }
  
  // الافتراضي هو الفرع الرئيسي
  return companyBranches[0].id;
}

// إنشاء حسابات المستخدمين
async function createUserAccounts() {
  const userAccounts = [];
  const usernameMap = new Map(); // لتتبع أسماء المستخدمين وتجنب التكرار
  
  // معالجة كل شركة
  for (const [companyId, company] of Object.entries(allData.companies)) {
    console.log(`\nمعالجة موظفي ${company.name}...`);
    
    for (const employee of company.employees) {
      // توليد اسم مستخدم فريد
      let username = generateUsername(employee, companyId);
      let attempt = 0;
      while (usernameMap.has(username)) {
        attempt++;
        username = `${username}_${attempt}`;
      }
      usernameMap.set(username, true);
      
      // تحديد الدور والصلاحيات
      const role = determineUserRole(employee.jobTitle);
      const permissions = role === 'administrative_employee' ? determinePermissions(employee.jobTitle) : null;
      const branchId = determineBranch(employee, companyId);
      
      // إنشاء حساب المستخدم
      const userAccount = {
        id: `user_${employee.id}`,
        employeeId: employee.id,
        username: username,
        password: generateSecurePassword(), // في الإنتاج، يجب تشفير كلمة المرور
        email: employee.email || `${username}@zeylab.com`,
        name: employee.name,
        role: role,
        companyId: companyId,
        companyName: company.name,
        branchId: branchId,
        department: employee.department,
        jobTitle: employee.jobTitle,
        permissions: permissions,
        isActive: employee.status === 'active',
        mustChangePassword: true, // يجب تغيير كلمة المرور عند أول دخول
        createdAt: new Date().toISOString(),
        lastLogin: null,
        profileComplete: false,
        settings: {
          language: 'ar',
          notifications: true,
          theme: 'light'
        }
      };
      
      userAccounts.push(userAccount);
    }
  }
  
  // حفظ حسابات المستخدمين
  const outputPath = path.join(__dirname, 'user-accounts.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    totalUsers: userAccounts.length,
    createdAt: new Date().toISOString(),
    accounts: userAccounts,
    statistics: {
      byRole: {
        company_manager: userAccounts.filter(u => u.role === 'company_manager').length,
        administrative_employee: userAccounts.filter(u => u.role === 'administrative_employee').length,
        supervisor: userAccounts.filter(u => u.role === 'supervisor').length,
        worker: userAccounts.filter(u => u.role === 'worker').length
      },
      byCompany: Object.entries(allData.companies).map(([id, company]) => ({
        companyId: id,
        companyName: company.name,
        userCount: userAccounts.filter(u => u.companyId === id).length
      }))
    }
  }, null, 2), 'utf8');
  
  console.log('\n=== تم إنشاء حسابات المستخدمين بنجاح ===');
  console.log(`إجمالي الحسابات: ${userAccounts.length}`);
  console.log(`مديرو الشركات: ${userAccounts.filter(u => u.role === 'company_manager').length}`);
  console.log(`الموظفون الإداريون: ${userAccounts.filter(u => u.role === 'administrative_employee').length}`);
  console.log(`المشرفون: ${userAccounts.filter(u => u.role === 'supervisor').length}`);
  console.log(`العمال: ${userAccounts.filter(u => u.role === 'worker').length}`);
  console.log('\nتم حفظ البيانات في: user-accounts.json');
  
  // إنشاء ملف تعليمات للمستخدمين
  const instructions = `
# تعليمات تسجيل الدخول للموظفين

## معلومات الدخول الافتراضية:
- كلمة المرور الافتراضية لجميع المستخدمين: Zeylab@2025
- يجب تغيير كلمة المرور عند أول تسجيل دخول

## أمثلة على حسابات المستخدمين:

### مديرو الشركات:
${userAccounts.filter(u => u.role === 'company_manager').slice(0, 3).map(u => 
  `- ${u.name} (${u.companyName})\n  اسم المستخدم: ${u.username}\n  الدور: مدير شركة`
).join('\n\n')}

### الموظفون الإداريون:
${userAccounts.filter(u => u.role === 'administrative_employee').slice(0, 3).map(u => 
  `- ${u.name} (${u.companyName})\n  اسم المستخدم: ${u.username}\n  الدور: موظف إداري\n  الصلاحيات: ${JSON.stringify(u.permissions, null, 2)}`
).join('\n\n')}

### المشرفون:
${userAccounts.filter(u => u.role === 'supervisor').slice(0, 3).map(u => 
  `- ${u.name} (${u.companyName})\n  اسم المستخدم: ${u.username}\n  الدور: مشرف`
).join('\n\n')}

### العمال:
${userAccounts.filter(u => u.role === 'worker').slice(0, 3).map(u => 
  `- ${u.name} (${u.companyName})\n  اسم المستخدم: ${u.username}\n  الدور: عامل`
).join('\n\n')}

## الواجهات المتاحة حسب الدور:
1. **مدير الشركة**: لوحة تحكم شاملة مع جميع الميزات
2. **الموظف الإداري**: واجهة مخصصة حسب الصلاحيات الممنوحة
3. **المشرف**: واجهة متابعة العمال والمهام
4. **العامل**: واجهة بسيطة للحضور والإجازات

## ملاحظات مهمة:
- يتم تحديد الفرع تلقائياً بناءً على بيانات الموظف
- الصلاحيات للموظفين الإداريين يمكن تعديلها من قبل مدير الشركة
- جميع الحسابات مرتبطة بالشركة والفرع المحددين
`;
  
  fs.writeFileSync(
    path.join(__dirname, 'user-login-instructions.md'),
    instructions,
    'utf8'
  );
  
  return userAccounts;
}

// تشغيل النظام
createUserAccounts().catch(console.error);