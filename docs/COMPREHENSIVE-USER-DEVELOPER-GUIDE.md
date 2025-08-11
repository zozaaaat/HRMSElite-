# 📚 دليل شامل للمستخدم والمطور - HRMS Elite

## 🌐 نظرة عامة

هذا الدليل يوفر مرجعاً شاملاً لكل من المستخدمين النهائيين والمطورين الذين يعملون مع نظام HRMS Elite. يغطي جميع الجوانب من الاستخدام الأساسي إلى التطوير المتقدم.

## 👥 دليل المستخدم النهائي

### 🚀 بدء الاستخدام

#### 1. تسجيل الدخول
```bash
# الوصول إلى النظام
http://localhost:3000

# بيانات الاعتماد الافتراضية
اسم المستخدم: admin
كلمة المرور: admin123
```

#### 2. الواجهة الرئيسية
- **القائمة الجانبية**: للتنقل بين الأقسام
- **شريط البحث**: للبحث السريع
- **الإشعارات**: لعرض التنبيهات المهمة
- **الملف الشخصي**: لإدارة الحساب

### 🏢 إدارة الشركات

#### إضافة شركة جديدة
1. انقر على "الشركات" في القائمة الجانبية
2. انقر على "إضافة شركة جديدة"
3. املأ البيانات المطلوبة:
   - اسم الشركة
   - الاسم التجاري
   - القسم
   - التصنيف
   - الصناعة
   - تاريخ التأسيس
4. انقر على "حفظ"

#### تعديل بيانات الشركة
1. اختر الشركة من القائمة
2. انقر على "تعديل"
3. عدّل البيانات المطلوبة
4. احفظ التغييرات

### 👥 إدارة الموظفين

#### إضافة موظف جديد
1. انتقل إلى "الموظفون"
2. انقر على "إضافة موظف جديد"
3. املأ البيانات:
   - الاسم الكامل
   - الموقع الوظيفي
   - القسم
   - الراتب الأساسي
   - الشركة
   - تاريخ التعيين
4. احفظ الموظف

#### البحث والتصفية
- استخدم شريط البحث للبحث بالاسم
- استخدم الفلاتر للتصفية حسب:
  - القسم
  - الموقع الوظيفي
  - الحالة
  - نطاق الراتب

### ⏰ إدارة الحضور

#### تسجيل الحضور
- **للموظفين**: انقر على "تسجيل دخول" في صفحة الحضور
- **للمديرين**: مراقبة الحضور لجميع الموظفين

#### تقارير الحضور
1. اختر الفترة الزمنية
2. اختر الموظفين أو الأقسام
3. انقر على "إنشاء تقرير"
4. اختر تنسيق التصدير (PDF/Excel/CSV)

### 🏖️ إدارة الإجازات

#### طلب إجازة
1. انقر على "طلب إجازة جديدة"
2. املأ البيانات:
   - نوع الإجازة (سنوية/مرضية/طارئة/أمومة)
   - تاريخ البداية والنهاية
   - السبب
3. أرسل الطلب

#### الموافقة على الإجازات (للمديرين)
1. انتقل إلى "طلبات الإجازات"
2. راجع الطلب
3. اتخذ القرار (موافقة/رفض/طلب معلومات إضافية)

### 💰 إدارة الرواتب

#### عرض الرواتب
1. انتقل إلى "الرواتب"
2. اختر الشهر والسنة
3. انقر على موظف لعرض تفاصيل راتبه

#### إدارة البدلات والخصومات
- **إضافة بدلة**: انقر على "إضافة بدلة"
- **إضافة خصم**: انقر على "إضافة خصم"

### 📄 إدارة المستندات

#### رفع مستند
1. انتقل إلى "المستندات"
2. انقر على "رفع مستند"
3. اختر نوع المستند
4. املأ البيانات المطلوبة
5. ارفع الملف

#### إدارة المستندات
- تصفية حسب النوع
- البحث بالاسم
- ترتيب حسب التاريخ
- تحميل المستندات

### 🤖 الذكاء الاصطناعي

#### لوحة التحكم الذكية
1. انتقل إلى "AI Dashboard"
2. استعرض التحليلات المتقدمة:
   - تحليل الأداء
   - تنبؤات الموارد
   - تحليل الرواتب
   - تحليل الحضور

#### المساعد الذكي
1. انقر على أيقونة المساعد
2. اطرح أسئلة مثل:
   - "كم عدد الموظفين في قسم تكنولوجيا المعلومات؟"
   - "من هم الموظفون الذين تأخروا هذا الشهر؟"
   - "ما هو متوسط الراتب في الشركة؟"

## 👨‍💻 دليل المطور

### 🛠️ إعداد البيئة

#### المتطلبات الأساسية
```bash
# تثبيت Node.js 18+
node --version

# تثبيت Git
git --version

# تثبيت VS Code (موصى به)
code --version
```

#### إعداد المشروع
```bash
# استنساخ المستودع
git clone https://github.com/your-org/hrms-elite.git
cd hrms-elite

# تثبيت التبعيات
npm install

# إعداد قاعدة البيانات
npm run db:push
npm run db:seed

# إعداد متغيرات البيئة
cp .env.example .env
```

#### ملف البيئة المطلوب
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=file:./dev.db

# Security
SESSION_SECRET=your-super-secret-key
CSRF_SECRET=your-csrf-secret

# AI Configuration
OPENAI_API_KEY=your-openai-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 🏗️ هيكل المشروع

#### التنظيم العام
```
HRMSElite/
├── 📁 client/                 # واجهة React الأمامية
│   ├── src/
│   │   ├── components/        # مكونات واجهة المستخدم
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── hooks/            # Hooks مخصصة
│   │   ├── services/         # خدمات API
│   │   ├── stores/           # إدارة الحالة
│   │   └── types/            # أنواع TypeScript
│   └── tests/                # اختبارات الواجهة الأمامية
├── 📁 server/                # خادم Express الخلفي
│   ├── middleware/           # وسائط الخادم
│   ├── models/              # نماذج قاعدة البيانات
│   ├── routes/              # مسارات API
│   └── utils/               # أدوات مساعدة
├── 📁 shared/               # كود مشترك
├── 📁 tests/                # اختبارات API
└── 📁 docs/                 # الوثائق
```

### 🔄 سير العمل

#### دورة التطوير
```bash
# 1. إنشاء فرع جديد
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. التطوير
npm run dev:full

# 3. الاختبار
npm test
npm run test:coverage
npm run lint

# 4. الالتزام
git add .
git commit -m "feat: إضافة ميزة جديدة

- وصف التغييرات
- إضافة اختبارات
- تحديث الوثائق"
git push origin feature/new-feature
```

#### رسائل الالتزام
```bash
# التنسيق
<type>(<scope>): <description>

# الأنواع
feat: ميزة جديدة
fix: إصلاح خطأ
docs: تحديث الوثائق
style: تنسيق الكود
refactor: إعادة هيكلة
test: إضافة اختبارات
chore: مهام الصيانة

# أمثلة
feat(auth): إضافة مصادقة متعددة العوامل
fix(api): إصلاح خطأ في معالجة التواريخ
docs(readme): تحديث دليل التثبيت
```

### 🧪 الاختبارات

#### أنواع الاختبارات
```typescript
// 1. اختبارات الوحدة
describe('Salary Calculator', () => {
  it('should calculate basic salary correctly', () => {
    const result = calculateSalary(3000, 500, 200);
    expect(result).toBe(3700);
  });
});

// 2. اختبارات التكامل
describe('Employee API', () => {
  it('should create new employee', async () => {
    const response = await request(app)
      .post('/api/employees')
      .send({
        fullName: 'أحمد محمد',
        position: 'مهندس',
        salary: 3000
      });
    
    expect(response.status).toBe(201);
  });
});

// 3. اختبارات واجهة المستخدم
test('should submit employee form', async ({ page }) => {
  await page.goto('/employees/new');
  await page.fill('[data-testid="fullName"]', 'أحمد محمد');
  await page.click('[data-testid="submit"]');
  
  await expect(page).toHaveURL('/employees');
});
```

#### تشغيل الاختبارات
```bash
# جميع الاختبارات
npm test

# اختبارات الوحدة فقط
npm run test:unit

# اختبارات API
npm run test:api

# اختبارات واجهة المستخدم
npm run test:ui

# اختبارات التغطية
npm run test:coverage

# مراقبة التغييرات
npm run test:watch
```

### 📝 أفضل الممارسات

#### الكود
```typescript
// ✅ جيد - تحديد الأنواع
interface Employee {
  id: string;
  fullName: string;
  position: string;
  salary: number;
}

function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  // التنفيذ
}

// ❌ سيء - عدم تحديد الأنواع
function updateEmployee(id, data) {
  // التنفيذ
}
```

#### معالجة الأخطاء
```typescript
// ✅ جيد - معالجة شاملة للأخطاء
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', { error, context: 'employee-update' });
  throw new AppError('فشل في تحديث الموظف', 500);
}

// ❌ سيء - تجاهل الأخطاء
const result = await riskyOperation();
return result;
```

#### التعليقات
```typescript
/**
 * حساب الراتب الإجمالي للموظف
 * @param basicSalary - الراتب الأساسي
 * @param allowances - البدلات
 * @param deductions - الخصومات
 * @returns الراتب الإجمالي
 */
function calculateTotalSalary(
  basicSalary: number,
  allowances: number,
  deductions: number
): number {
  return basicSalary + allowances - deductions;
}
```

### 🔒 الأمان

#### التحقق من المدخلات
```typescript
// ✅ جيد - التحقق من المدخلات
import { z } from 'zod';

const EmployeeSchema = z.object({
  fullName: z.string().min(2).max(100),
  salary: z.number().positive(),
  email: z.string().email()
});

function createEmployee(data: unknown) {
  const validatedData = EmployeeSchema.parse(data);
  // المتابعة مع البيانات المتحقق منها
}
```

#### حماية من SQL Injection
```typescript
// ✅ جيد - استخدام ORM
const employee = await db.employee.findUnique({
  where: { id: employeeId }
});

// ❌ سيء - استعلام خام
const employee = await db.query(`SELECT * FROM employees WHERE id = '${id}'`);
```

### ⚡ الأداء

#### تحسين الاستعلامات
```typescript
// ✅ جيد - استعلام محسن
const employees = await db.employee.findMany({
  where: { companyId },
  select: {
    id: true,
    fullName: true,
    position: true
  },
  take: 50
});

// ❌ سيء - استعلام غير محسن
const employees = await db.employee.findMany({
  where: { companyId }
});
```

#### التخزين المؤقت
```typescript
// ✅ جيد - استخدام التخزين المؤقت
import { cache } from '../utils/cache';

async function getCompanyStats(companyId: string) {
  const cacheKey = `company-stats-${companyId}`;
  
  let stats = await cache.get(cacheKey);
  if (!stats) {
    stats = await calculateCompanyStats(companyId);
    await cache.set(cacheKey, stats, 3600); // ساعة واحدة
  }
  
  return stats;
}
```

### 🔧 الأدوات والخدمات

#### إعداد ESLint
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

#### إعداد Prettier
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

#### إعداد Husky
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  }
}
```

### 🚀 النشر

#### بيئات النشر
```bash
# التطوير
npm run dev:full

# الاختبار
npm run build
npm run start:staging

# الإنتاج
npm run build
npm run start:production
```

#### متغيرات البيئة للإنتاج
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=super-secret-production-key
CSRF_SECRET=production-csrf-secret
```

## 📚 الموارد الإضافية

### الوثائق
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

### أدوات مفيدة
- [Postman](https://www.postman.com/) - اختبار API
- [Insomnia](https://insomnia.rest/) - بديل Postman
- [DBeaver](https://dbeaver.io/) - إدارة قواعد البيانات
- [TablePlus](https://tableplus.com/) - بديل DBeaver

### مجتمعات
- [React Community](https://reactjs.org/community/)
- [TypeScript Community](https://www.typescriptlang.org/community/)
- [Node.js Community](https://nodejs.org/en/community/)

## 🆘 الدعم والمساعدة

### الأسئلة الشائعة

#### للمستخدمين
**س: كيف يمكنني إضافة موظف جديد؟**
ج: انتقل إلى قسم "الموظفون" → انقر على "إضافة موظف جديد" → املأ البيانات المطلوبة → احفظ

**س: كيف يمكنني طلب إجازة؟**
ج: انتقل إلى قسم "الإجازات" → انقر على "طلب إجازة جديدة" → املأ بيانات الإجازة → أرسل الطلب

**س: كيف يمكنني عرض تقرير الرواتب؟**
ج: انتقل إلى قسم "الرواتب" → اختر الشهر والسنة → انقر على "إنشاء تقرير" → اختر التنسيق

#### للمطورين
**س: كيف يمكنني إضافة ميزة جديدة؟**
ج: 1. أنشئ فرع جديد 2. اكتب الكود 3. أضف الاختبارات 4. اكتب الوثائق 5. أرسل Pull Request

**س: كيف يمكنني تشغيل الاختبارات؟**
ج: استخدم `npm test` لجميع الاختبارات، أو `npm run test:unit` للاختبارات الوحدة فقط

**س: كيف يمكنني إصلاح خطأ في الكود؟**
ج: 1. حدد المشكلة 2. اكتب اختبار يوضح الخطأ 3. أصلح الكود 4. تأكد من نجاح الاختبارات

### التواصل
- **البريد الإلكتروني**: support@hrmselite.com
- **المسائل**: GitHub Issues
- **الدردشة**: Discord Community
- **التوثيق**: `/docs`

---

**HRMS Elite Comprehensive User & Developer Guide** - دليل شامل للمستخدم والمطور 🚀 