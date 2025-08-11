# HRMS Elite API Documentation

## نظرة عامة

تم تنفيذ توثيق شامل لـ API باستخدام Swagger/OpenAPI 3.0 لنظام إدارة الموارد البشرية المتقدم (HRMS Elite).

## الميزات المطبقة

### ✅ 1. توثيق Swagger شامل
- **Swagger UI**: واجهة تفاعلية لاستكشاف API
- **OpenAPI 3.0**: أحدث معيار لتوثيق API
- **JSDoc Comments**: تعليقات توثيق شاملة لجميع المسارات

### ✅ 2. التصنيفات والتنظيم
- **Authentication**: تسجيل الدخول والخروج
- **Companies**: إدارة الشركات
- **Employees**: إدارة الموظفين
- **Attendance**: تتبع الحضور
- **Leaves**: إدارة الإجازات
- **Payroll**: إدارة الرواتب
- **Licenses**: إدارة التراخيص
- **Documents**: إدارة المستندات
- **Notifications**: إدارة الإشعارات
- **AI Analytics**: التحليلات الذكية
- **System**: صحة النظام والمراقبة

### ✅ 3. نماذج البيانات (Schemas)
- Company: نموذج الشركة
- Employee: نموذج الموظف
- Leave: نموذج الإجازة
- Attendance: نموذج الحضور
- License: نموذج الترخيص
- Payroll: نموذج الراتب
- Notification: نموذج الإشعار
- User: نموذج المستخدم
- Error: نموذج الخطأ

### ✅ 4. الأمان والتحقق
- **Session Authentication**: مصادقة الجلسة
- **CSRF Protection**: حماية من CSRF
- **Role-based Access**: صلاحيات حسب الدور

## كيفية الوصول للتوثيق

### في بيئة التطوير
```bash
# تشغيل الخادم
npm run dev

# الوصول للتوثيق
http://localhost:3000/api-docs
```

### في بيئة الإنتاج
```bash
# تشغيل الخادم
npm start

# الوصول للتوثيق
https://your-domain.com/api-docs
```

## الملفات المضافة/المعدلة

### 1. `server/swagger.ts`
```typescript
// تكوين Swagger الأساسي
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS Elite API',
      version: '1.0.0',
      description: 'نظام إدارة الموارد البشرية المتقدم - API توثيق شامل'
    },
    // ... المزيد من التكوين
  },
  apis: [
    './server/routes.ts',
    './server/routes/*.ts',
    './server/index.ts',
    './server/routes-documentation.ts'
  ]
};
```

### 2. `server/index.ts`
```typescript
// إضافة Swagger UI
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';

// إعداد Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HRMS Elite API Documentation',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));
```

### 3. `server/routes-documentation.ts`
```typescript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     description: تسجيل دخول المستخدم إلى النظام
 *     tags: [Authentication]
 *     // ... المزيد من التوثيق
 */
```

## التبعيات المضافة

```json
{
  "dependencies": {
    "swagger-ui-express": "^5.0.1",
    "swagger-jsdoc": "^6.2.8"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.1.6",
    "@types/swagger-jsdoc": "^6.0.4"
  }
}
```

## ميزات Swagger UI

### 1. واجهة تفاعلية
- **Try It Out**: تجربة API مباشرة
- **Filter**: تصفية المسارات
- **Search**: البحث في المسارات
- **Expand/Collapse**: توسيع/طي الأقسام

### 2. تخصيص الواجهة
- **Custom CSS**: إخفاء شريط العنوان
- **Custom Title**: عنوان مخصص
- **RTL Support**: دعم اللغة العربية

### 3. أمان متكامل
- **Session Auth**: مصادقة الجلسة
- **CSRF Token**: حماية من CSRF
- **Role-based**: صلاحيات حسب الدور

## أمثلة على الاستخدام

### 1. تسجيل الدخول
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "companyId": "company-1"
}
```

### 2. الحصول على قائمة الموظفين
```bash
GET /api/companies/company-1/employees
Authorization: Bearer <session-token>
X-CSRF-Token: <csrf-token>
```

### 3. تسجيل الحضور
```bash
POST /api/attendance/checkin
Content-Type: application/json
Authorization: Bearer <session-token>
X-CSRF-Token: <csrf-token>

{
  "employeeId": "emp-1",
  "location": "المكتب الرئيسي"
}
```

## إضافة مسارات جديدة

لإضافة مسار جديد للتوثيق:

### 1. إضافة JSDoc في `server/routes-documentation.ts`
```typescript
/**
 * @swagger
 * /api/new-endpoint:
 *   get:
 *     summary: وصف المسار
 *     description: وصف مفصل للمسار
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: نجح الطلب
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseModel'
 */
```

### 2. إضافة النموذج في `server/swagger.ts`
```typescript
components: {
  schemas: {
    ResponseModel: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1' },
        name: { type: 'string', example: 'اسم' }
      }
    }
  }
}
```

## استكشاف الأخطاء

### 1. مشاكل في التحميل
```bash
# التحقق من التبعيات
npm list swagger-ui-express swagger-jsdoc

# إعادة تثبيت التبعيات
npm install swagger-ui-express swagger-jsdoc
```

### 2. مشاكل في التوثيق
- التحقق من صحة JSDoc comments
- التأكد من تضمين الملفات في `apis` array
- مراجعة console للبحث عن أخطاء

### 3. مشاكل في الوصول
- التأكد من تشغيل الخادم
- التحقق من المسار `/api-docs`
- مراجعة إعدادات CORS إذا لزم الأمر

## التطوير المستقبلي

### 1. تحسينات مقترحة
- [ ] إضافة المزيد من الأمثلة
- [ ] تحسين التصميم للغة العربية
- [ ] إضافة اختبارات API تلقائية
- [ ] دعم التصدير إلى PDF

### 2. ميزات إضافية
- [ ] دعم WebSocket documentation
- [ ] إضافة rate limiting documentation
- [ ] دعم file upload documentation
- [ ] إضافة webhook documentation

## الخلاصة

تم تنفيذ نظام توثيق API شامل ومتقدم لنظام HRMS Elite باستخدام Swagger/OpenAPI 3.0. النظام يوفر:

- ✅ توثيق تفاعلي شامل
- ✅ دعم اللغة العربية
- ✅ أمان متكامل
- ✅ تنظيم ممتاز للمسارات
- ✅ نماذج بيانات واضحة
- ✅ أمثلة عملية للاستخدام

يمكن الوصول للتوثيق عبر `/api-docs` بعد تشغيل الخادم. 