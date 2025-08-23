# 👨‍💻 دليل المطور - HRMS Elite

## 🎯 نظرة عامة

دليل شامل للمطورين الذين يعملون على نظام HRMS Elite. يغطي هذا الدليل إعداد البيئة، سير العمل، وأفضل الممارسات.

## 🛠️ إعداد البيئة

### المتطلبات الأساسية

#### أدوات التطوير
- **Node.js**: الإصدار 18 أو أحدث
- **npm**: مدير الحزم
- **Git**: نظام التحكم بالإصدارات
- **VS Code**: محرر الكود الموصى به

#### إضافات VS Code الموصى بها
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### تثبيت المشروع

#### 1. استنساخ المستودع
```bash
git clone https://github.com/your-org/hrms-elite.git
cd hrms-elite
```

#### 2. تثبيت التبعيات
```bash
# تثبيت جميع التبعيات
npm install

# تثبيت تبعيات التطوير
npm install --save-dev
```

#### 3. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
npm run db:push

# إضافة بيانات تجريبية
npm run db:seed
```

#### 4. إعداد متغيرات البيئة
```bash
# نسخ ملف البيئة
cp .env.example .env

# تعديل المتغيرات حسب الحاجة
```

### ملف البيئة المطلوب
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
UPLOAD_MAX_BYTES=5242880
UPLOAD_PATH=./uploads
```

## 🏗️ هيكل المشروع

### التنظيم العام
```
HRMSElite/
├── 📁 client/                 # واجهة React الأمامية
│   ├── src/
│   │   ├── components/        # مكونات واجهة المستخدم
│   │   │   ├── ai/           # مكونات الذكاء الاصطناعي
│   │   │   ├── shared/       # مكونات مشتركة
│   │   │   └── ui/           # مكونات واجهة المستخدم الأساسية
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── hooks/            # Hooks مخصصة
│   │   ├── lib/              # أدوات مساعدة
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

### قواعد التسمية

#### الملفات والمجلدات
- **PascalCase**: للمكونات React
- **camelCase**: للدوال والمتغيرات
- **kebab-case**: للمجلدات والملفات
- **UPPER_SNAKE_CASE**: للثوابت

#### أمثلة
```
components/
├── UserProfile.tsx          # مكون React
├── useAuth.ts              # Hook مخصص
└── api-client.ts           # خدمة API

routes/
├── employee-routes.ts      # مسارات الموظفين
└── auth-routes.ts         # مسارات المصادقة
```

## 🔄 سير العمل

### دورة التطوير

#### 1. إنشاء فرع جديد
```bash
# التأكد من تحديث الفرع الرئيسي
git checkout main
git pull origin main

# إنشاء فرع للميزة الجديدة
git checkout -b feature/new-feature
```

#### 2. التطوير
```bash
# تشغيل خادم التطوير
npm run dev:full

# في terminal آخر - تشغيل الاختبارات
npm run test:watch
```

#### 3. الاختبار
```bash
# تشغيل جميع الاختبارات
npm test

# اختبارات التغطية
npm run test:coverage

# فحص جودة الكود
npm run lint
npm run type-check
```

#### 4. الالتزام
```bash
# إضافة التغييرات
git add .

# الالتزام مع رسالة وصفية
git commit -m "feat: إضافة ميزة إدارة الإجازات

- إضافة نموذج طلب الإجازة
- تنفيذ منطق الموافقة
- إضافة اختبارات الوحدة
- تحديث الوثائق"

# رفع الفرع
git push origin feature/new-feature
```

### رسائل الالتزام

#### التنسيق
```
<type>(<scope>): <description>

<body>

<footer>
```

#### الأنواع
- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: تحديث الوثائق
- `style`: تنسيق الكود
- `refactor`: إعادة هيكلة
- `test`: إضافة اختبارات
- `chore`: مهام الصيانة

#### أمثلة
```bash
feat(auth): إضافة مصادقة متعددة العوامل
fix(api): إصلاح خطأ في معالجة التواريخ
docs(readme): تحديث دليل التثبيت
```

## 🧪 الاختبارات

### أنواع الاختبارات

#### 1. اختبارات الوحدة
```typescript
// tests/unit/employee.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSalary } from '../src/utils/salary';

describe('Salary Calculator', () => {
  it('should calculate basic salary correctly', () => {
    const result = calculateSalary(3000, 500, 200);
    expect(result).toBe(3700);
  });
});
```

#### 2. اختبارات التكامل
```typescript
// tests/integration/employee-api.test.ts
import request from 'supertest';
import { app } from '../src/server';

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
    expect(response.body.data.fullName).toBe('أحمد محمد');
  });
});
```

#### 3. اختبارات واجهة المستخدم
```typescript
// tests/ui/employee-form.test.ts
import { test, expect } from '@playwright/test';

test('should submit employee form', async ({ page }) => {
  await page.goto('/employees/new');
  await page.fill('[data-testid="fullName"]', 'أحمد محمد');
  await page.fill('[data-testid="position"]', 'مهندس');
  await page.click('[data-testid="submit"]');
  
  await expect(page).toHaveURL('/employees');
});
```

### تشغيل الاختبارات

#### أوامر الاختبار
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

## 📝 أفضل الممارسات

### الكود

#### 1. TypeScript
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

#### 2. معالجة الأخطاء
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

#### 3. التعليقات
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

### الأمان

#### 1. التحقق من المدخلات
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

#### 2. حماية من SQL Injection
```typescript
// ✅ جيد - استخدام ORM
const employee = await db.employee.findUnique({
  where: { id: employeeId }
});

// ❌ سيء - استعلام خام
const employee = await db.query(`SELECT * FROM employees WHERE id = '${id}'`);
```

### الأداء

#### 1. تحسين الاستعلامات
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

#### 2. التخزين المؤقت
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

## 🔧 الأدوات والخدمات

### أدوات التطوير

#### 1. ESLint
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

#### 2. Prettier
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

#### 3. Husky (Git Hooks)
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

### خدمات المراقبة

#### 1. Logging
```typescript
import { logger } from '../utils/logger';

logger.info('User logged in', { userId, timestamp });
logger.error('Database connection failed', { error });
logger.warn('High memory usage', { usage: '85%' });
```

#### 2. Metrics
```typescript
import { metrics } from '../utils/metrics';

// قياس وقت الاستجابة
const timer = metrics.startTimer();
const result = await operation();
timer.end('operation.duration');

// عداد الطلبات
metrics.increment('api.requests', { endpoint: '/employees' });
```

## 🚀 النشر

### بيئات النشر

#### 1. التطوير
```bash
npm run dev:full
```

#### 2. الاختبار
```bash
npm run build
npm run start:staging
```

#### 3. الإنتاج
```bash
npm run build
npm run start:production
```

### متغيرات البيئة للإنتاج
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

---

**HRMS Elite Developer Guide** - دليل شامل للمطورين 🚀 