# دليل الاختبارات الشامل - HRMS Elite

## نظرة عامة

تم إنشاء نظام اختبار شامل لتطبيق HRMS Elite يتضمن اختبارات للواجهة الأمامية والخلفية والأداء. هذا الدليل يشرح كيفية تشغيل الاختبارات وكتابتها وفهم نتائجها.

## هيكل الاختبارات

```
📁 client/tests/
├── 📁 components/           # اختبارات المكونات
│   ├── FormComponents.test.tsx
│   ├── UIComponents.test.tsx
│   ├── EmployeeList.test.tsx
│   └── optimized-components.test.tsx
├── 📁 auth/                 # اختبارات المصادقة
│   └── login-flow.test.tsx
├── 📁 employee/             # اختبارات الموظفين
│   └── employee-status.test.tsx
├── 📁 permissions/          # اختبارات الصلاحيات
│   └── access-control.test.tsx
├── 📁 documents/            # اختبارات المستندات
│   └── licenses-documents-display.test.tsx
├── 📁 pages/                # اختبارات الصفحات
│   └── advanced-search.test.tsx
├── 📁 routing/              # اختبارات التوجيه
├── mock-data.ts             # البيانات الوهمية
├── setup.ts                 # إعداد الاختبارات
└── README.md                # هذا الملف

📁 tests/
├── 📁 api/                  # اختبارات API
│   ├── auth.test.ts
│   └── employees.test.ts
├── 📁 performance/          # اختبارات الأداء
│   └── concurrent-requests.test.ts
├── ai-routes.test.ts        # اختبارات AI
├── validation-middleware.test.ts
├── setup.ts
└── vitest.config.ts
```

## تشغيل الاختبارات

### 1. تشغيل جميع الاختبارات

```bash
# تشغيل جميع الاختبارات (الواجهة الأمامية والخلفية والأداء)
npm test

# أو استخدام السكريبت المخصص
node scripts/run-tests.js all
```

### 2. تشغيل اختبارات محددة

```bash
# اختبارات الواجهة الأمامية فقط
npm run test:client

# اختبارات الخلفية فقط
npm run test:server

# اختبارات الأداء فقط
npm run test:performance

# اختبارات API فقط
npm run test:api
```

### 3. تشغيل الاختبارات مع التغطية

```bash
# جميع الاختبارات مع التغطية
npm run test:coverage

# اختبارات الواجهة الأمامية مع التغطية
npm run test:client:coverage

# اختبارات الخلفية مع التغطية
npm run test:server:coverage
```

### 4. تشغيل الاختبارات في وضع المراقبة

```bash
# اختبارات الواجهة الأمامية في وضع المراقبة
npm run test:client:watch

# اختبارات الواجهة الأمامية مع واجهة المستخدم
npm run test:client:ui
```

### 5. تشغيل اختبارات محددة

```bash
# تشغيل اختبارات المصادقة فقط
node scripts/run-tests.js client --pattern "auth"

# تشغيل اختبارات المكونات فقط
node scripts/run-tests.js client --pattern "components"

# تشغيل اختبارات الأداء مع 200 طلب متزامن
node scripts/run-tests.js performance --concurrent 200 --duration 60
```

## أنواع الاختبارات

### 1. اختبارات المكونات (Component Tests)

تختبر المكونات الفردية للتطبيق:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<Button onClick={mockOnClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});
```

### 2. اختبارات النماذج (Form Tests)

تختبر النماذج والتحقق من صحة البيانات:

```typescript
describe('Form Validation', () => {
  it('should validate required fields', async () => {
    const mockOnSubmit = vi.fn();
    render(<MockFormComponent onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toHaveTextContent('الاسم مطلوب');
    });
  });
});
```

### 3. اختبارات API (API Tests)

تختبر نقاط النهاية في الخلفية:

```typescript
import request from 'supertest';
import { app } from '../../server/index';

describe('Authentication API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'TestPassword123!'
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('username', 'testuser');
  });
});
```

### 4. اختبارات الأداء (Performance Tests)

تختبر أداء النظام تحت الحمل:

```typescript
describe('Concurrent Requests', () => {
  it('should handle 100 concurrent login requests', async () => {
    const concurrentRequests = 100;
    const startTime = Date.now();

    const loginPromises = Array.from({ length: concurrentRequests }, (_, i) => 
      request(app)
        .post('/api/auth/login')
        .send({
          username: `testuser${i % 10}`,
          password: 'TestPassword123!'
        })
    );

    const responses = await Promise.all(loginPromises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const successRate = (responses.filter(r => r.status === 200).length / concurrentRequests) * 100;
    expect(successRate).toBeGreaterThan(95);
    expect(totalTime).toBeLessThan(30000);
  });
});
```

## كتابة الاختبارات

### 1. هيكل الاختبار

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Component Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something specific', async () => {
    // Arrange - إعداد البيانات
    const mockFunction = vi.fn();
    
    // Act - تنفيذ الإجراء
    render(<Component onAction={mockFunction} />);
    fireEvent.click(screen.getByText('Button'));
    
    // Assert - التحقق من النتيجة
    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalled();
    });
  });
});
```

### 2. استخدام البيانات الوهمية

```typescript
import { mockUsers, mockCompanies } from './mock-data';

describe('User List', () => {
  it('should display users correctly', () => {
    render(<UserList users={mockUsers} />);
    
    mockUsers.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
    });
  });
});
```

### 3. اختبار الأخطاء

```typescript
it('should handle errors gracefully', async () => {
  const mockError = new Error('Network error');
  vi.spyOn(api, 'fetchUsers').mockRejectedValue(mockError);

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('حدث خطأ في تحميل البيانات')).toBeInTheDocument();
  });
});
```

### 4. اختبار التفاعلات المعقدة

```typescript
it('should handle complex user interactions', async () => {
  render(<ComplexForm />);

  // Fill form
  fireEvent.change(screen.getByLabelText('الاسم'), { target: { value: 'أحمد' } });
  fireEvent.change(screen.getByLabelText('البريد الإلكتروني'), { target: { value: 'ahmed@example.com' } });

  // Submit form
  fireEvent.click(screen.getByText('إرسال'));

  // Verify success
  await waitFor(() => {
    expect(screen.getByText('تم الإرسال بنجاح')).toBeInTheDocument();
  });
});
```

## أفضل الممارسات

### 1. تسمية الاختبارات

```typescript
// ✅ جيد
it('should display error message when login fails', () => {});
it('should redirect to dashboard after successful login', () => {});

// ❌ سيء
it('should work', () => {});
it('test 1', () => {});
```

### 2. تنظيم الاختبارات

```typescript
describe('User Authentication', () => {
  describe('Login', () => {
    it('should succeed with valid credentials', () => {});
    it('should fail with invalid credentials', () => {});
    it('should show validation errors', () => {});
  });

  describe('Logout', () => {
    it('should clear user session', () => {});
    it('should redirect to login page', () => {});
  });
});
```

### 3. استخدام test-ids

```typescript
// في المكون
<button data-testid="submit-button" onClick={handleSubmit}>
  إرسال
</button>

// في الاختبار
fireEvent.click(screen.getByTestId('submit-button'));
```

### 4. تنظيف البيانات

```typescript
describe('Database Tests', () => {
  beforeEach(async () => {
    // تنظيف قاعدة البيانات قبل كل اختبار
    await db.delete(users);
  });

  afterEach(async () => {
    // تنظيف قاعدة البيانات بعد كل اختبار
    await db.delete(users);
  });
});
```

## فهم نتائج الاختبارات

### 1. تقارير التغطية

```bash
npm run test:coverage
```

سيتم إنشاء تقرير التغطية في مجلد `coverage/` يحتوي على:

- **Statements**: نسبة العبارات المختبرة
- **Branches**: نسبة الفروع المختبرة
- **Functions**: نسبة الدوال المختبرة
- **Lines**: نسبة الأسطر المختبرة

### 2. تقارير الأداء

```bash
npm run test:performance
```

سيتم عرض:

- **Success Rate**: نسبة الطلبات الناجحة
- **Average Response Time**: متوسط وقت الاستجابة
- **Requests per Second**: عدد الطلبات في الثانية
- **Memory Usage**: استخدام الذاكرة

### 3. تفسير النتائج

```bash
# نتائج جيدة
✅ Success Rate: 98.5%
✅ Average Response Time: 245ms
✅ Requests per Second: 15.2
✅ Memory Increase: 12.3MB

# نتائج تحتاج تحسين
⚠️  Success Rate: 85.2%
⚠️  Average Response Time: 1200ms
⚠️  Requests per Second: 5.1
⚠️  Memory Increase: 45.7MB
```

## استكشاف الأخطاء

### 1. اختبارات فاشلة

```bash
# تشغيل اختبار محدد لمعرفة السبب
npm run test:client -- --run tests/components/Button.test.tsx

# تشغيل في وضع المراقبة
npm run test:client:watch
```

### 2. مشاكل الأداء

```bash
# تشغيل اختبارات الأداء مع تفاصيل أكثر
node scripts/run-tests.js performance --concurrent 50 --duration 10

# فحص استخدام الذاكرة
npm run analyze
```

### 3. مشاكل قاعدة البيانات

```bash
# تنظيف البيانات الوهمية
npm run test:clean

# إعادة إنشاء قاعدة البيانات
npm run db:push
```

## أدوات مساعدة

### 1. سكريبت تشغيل الاختبارات

```bash
# عرض المساعدة
node scripts/run-tests.js help

# تشغيل اختبارات محددة
node scripts/run-tests.js client --pattern "auth"

# تنظيف الملفات المؤقتة
node scripts/run-tests.js clean
```

### 2. تحليل الأداء

```bash
# تحليل حجم الحزمة
npm run analyze:bundle

# تحليل الأداء العام
npm run analyze
```

### 3. فحص الأنواع

```bash
# فحص أنواع TypeScript
npm run type-check

# فحص الكود
npm run lint
```

## التكامل المستمر

### 1. GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### 2. فحص الجودة

```bash
# تشغيل جميع فحوصات الجودة
npm run lint && npm run type-check && npm test
```

## الخلاصة

نظام الاختبارات في HRMS Elite مصمم لضمان:

- **الموثوقية**: اختبارات شاملة لجميع الوظائف
- **الأداء**: اختبارات تحميل واختبارات الأداء
- **الجودة**: تغطية عالية للكود
- **الصيانة**: اختبارات سهلة الفهم والصيانة

استخدم هذا الدليل لكتابة وتشغيل الاختبارات بفعالية، وستساعدك في بناء تطبيق قوي وموثوق. 