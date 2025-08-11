# 📚 Swagger UI API Documentation - HRMS Elite

## 🌐 نظرة عامة

هذا الدليل يوفر توثيق تفاعلي شامل لـ API الخاص بنظام HRMS Elite باستخدام Swagger UI.

## 🔗 الوصول إلى Swagger UI

### الروابط المباشرة
- **التطوير**: `http://localhost:3000/api-docs`
- **الإنتاج**: `https://api.hrmselite.com/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/api-docs/swagger.json`

## 🚀 إعداد Swagger UI

### تثبيت المكتبات المطلوبة
```bash
npm install swagger-ui-express swagger-jsdoc
```

### إعداد Swagger في الخادم
```typescript
// server/swagger-setup.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS Elite API',
      version: '1.0.0',
      description: 'نظام إدارة الموارد البشرية المتكامل مع دعم الذكاء الاصطناعي',
      contact: {
        name: 'API Support',
        email: 'api-support@hrmselite.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.hrmselite.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token'
        }
      }
    },
    security: [
      {
        sessionAuth: [],
        csrfToken: []
      }
    ]
  },
  apis: ['./server/routes/*.ts', './server/models/*.ts']
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
```

### إضافة Swagger إلى التطبيق
```typescript
// server/index.ts
import { swaggerUi, specs } from './swagger-setup';

// إضافة Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HRMS Elite API Documentation'
}));
```

## 📊 نماذج البيانات (Schemas)

### Company Schema
```yaml
Company:
  type: object
  properties:
    id:
      type: string
      description: معرف الشركة الفريد
      example: "company-1"
    name:
      type: string
      description: اسم الشركة
      example: "شركة الاتحاد الخليجي"
    commercialFileName:
      type: string
      description: الاسم التجاري
      example: "الاتحاد الخليجي للتجارة"
    department:
      type: string
      description: قسم الشركة
      example: "التجارة العامة"
    classification:
      type: string
      description: تصنيف الشركة
      example: "شركة ذات مسؤولية محدودة"
    status:
      type: string
      enum: [active, inactive]
      description: حالة الشركة
      example: "active"
    employeeCount:
      type: integer
      description: عدد الموظفين
      example: 45
    industry:
      type: string
      description: الصناعة
      example: "التجارة"
    establishmentDate:
      type: string
      format: date
      description: تاريخ التأسيس
      example: "2020-01-15"
  required:
    - name
    - commercialFileName
    - classification
    - industry
    - establishmentDate
```

### Employee Schema
```yaml
Employee:
  type: object
  properties:
    id:
      type: string
      description: معرف الموظف الفريد
      example: "emp-1"
    fullName:
      type: string
      description: الاسم الكامل للموظف
      example: "أحمد محمد علي"
    position:
      type: string
      description: الموقع الوظيفي
      example: "مهندس برمجيات"
    department:
      type: string
      description: القسم
      example: "تكنولوجيا المعلومات"
    salary:
      type: number
      description: الراتب الأساسي
      example: 3500
    status:
      type: string
      enum: [active, inactive, archived]
      description: حالة الموظف
      example: "active"
    hireDate:
      type: string
      format: date
      description: تاريخ التعيين
      example: "2023-01-15"
    companyId:
      type: string
      description: معرف الشركة
      example: "company-1"
  required:
    - fullName
    - position
    - department
    - salary
    - companyId
```

### Leave Schema
```yaml
Leave:
  type: object
  properties:
    id:
      type: string
      description: معرف الإجازة الفريد
      example: "leave-1"
    employeeId:
      type: string
      description: معرف الموظف
      example: "emp-1"
    employeeName:
      type: string
      description: اسم الموظف
      example: "أحمد محمد علي"
    type:
      type: string
      enum: [annual, sick, emergency, maternity]
      description: نوع الإجازة
      example: "annual"
    startDate:
      type: string
      format: date
      description: تاريخ بداية الإجازة
      example: "2025-02-10"
    endDate:
      type: string
      format: date
      description: تاريخ نهاية الإجازة
      example: "2025-02-12"
    days:
      type: integer
      description: عدد أيام الإجازة
      example: 3
    reason:
      type: string
      description: سبب الإجازة
      example: "إجازة شخصية"
    status:
      type: string
      enum: [pending, approved, rejected]
      description: حالة الإجازة
      example: "pending"
    appliedDate:
      type: string
      format: date-time
      description: تاريخ تقديم الطلب
      example: "2025-01-28T10:30:00.000Z"
  required:
    - employeeId
    - type
    - startDate
    - endDate
    - reason
```

## 🚀 نقاط النهاية (Endpoints)

### 1. إدارة الشركات

#### GET /api/companies
```yaml
get:
  tags:
    - Companies
  summary: الحصول على جميع الشركات
  description: استرجاع قائمة بجميع الشركات مع إمكانية التصفية والترتيب
  parameters:
    - name: status
      in: query
      schema:
        type: string
        enum: [active, inactive]
      description: تصفية حسب الحالة
    - name: industry
      in: query
      schema:
        type: string
      description: تصفية حسب الصناعة
    - name: page
      in: query
      schema:
        type: integer
        minimum: 1
        default: 1
      description: رقم الصفحة
    - name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: عدد العناصر في الصفحة
  responses:
    '200':
      description: نجح الطلب
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: true
              data:
                type: array
                items:
                  $ref: '#/components/schemas/Company'
              pagination:
                type: object
                properties:
                  page:
                    type: integer
                  limit:
                    type: integer
                  total:
                    type: integer
                  pages:
                    type: integer
    '400':
      description: خطأ في الطلب
    '401':
      description: غير مصرح
    '500':
      description: خطأ في الخادم
```

#### POST /api/companies
```yaml
post:
  tags:
    - Companies
  summary: إنشاء شركة جديدة
  description: إضافة شركة جديدة إلى النظام
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            name:
              type: string
              description: اسم الشركة
              example: "شركة جديدة"
            commercialFileName:
              type: string
              description: الاسم التجاري
              example: "اسم تجاري"
            department:
              type: string
              description: قسم الشركة
              example: "قسم الشركة"
            classification:
              type: string
              description: تصنيف الشركة
              example: "شركة ذات مسؤولية محدودة"
            industry:
              type: string
              description: الصناعة
              example: "التكنولوجيا"
            establishmentDate:
              type: string
              format: date
              description: تاريخ التأسيس
              example: "2025-01-01"
          required:
            - name
            - commercialFileName
            - classification
            - industry
            - establishmentDate
  responses:
    '201':
      description: تم إنشاء الشركة بنجاح
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: true
              data:
                $ref: '#/components/schemas/Company'
              message:
                type: string
                example: "تم إنشاء الشركة بنجاح"
    '400':
      description: بيانات غير صحيحة
    '401':
      description: غير مصرح
    '500':
      description: خطأ في الخادم
```

#### PUT /api/companies/{id}
```yaml
put:
  tags:
    - Companies
  summary: تحديث بيانات شركة
  description: تحديث معلومات شركة موجودة
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
      description: معرف الشركة
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            name:
              type: string
            commercialFileName:
              type: string
            department:
              type: string
            classification:
              type: string
            industry:
              type: string
            status:
              type: string
              enum: [active, inactive]
  responses:
    '200':
      description: تم التحديث بنجاح
    '404':
      description: الشركة غير موجودة
    '400':
      description: بيانات غير صحيحة
```

#### DELETE /api/companies/{id}
```yaml
delete:
  tags:
    - Companies
  summary: حذف شركة
  description: حذف شركة من النظام
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
      description: معرف الشركة
  responses:
    '200':
      description: تم الحذف بنجاح
    '404':
      description: الشركة غير موجودة
    '400':
      description: لا يمكن حذف شركة لديها موظفين
```

### 2. إدارة الموظفين

#### GET /api/employees
```yaml
get:
  tags:
    - Employees
  summary: الحصول على جميع الموظفين
  description: استرجاع قائمة بجميع الموظفين مع إمكانية التصفية
  parameters:
    - name: companyId
      in: query
      schema:
        type: string
      description: تصفية حسب الشركة
    - name: department
      in: query
      schema:
        type: string
      description: تصفية حسب القسم
    - name: status
      in: query
      schema:
        type: string
        enum: [active, inactive, archived]
      description: تصفية حسب الحالة
    - name: search
      in: query
      schema:
        type: string
      description: البحث بالاسم
  responses:
    '200':
      description: نجح الطلب
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
              data:
                type: array
                items:
                  $ref: '#/components/schemas/Employee'
```

#### POST /api/employees
```yaml
post:
  tags:
    - Employees
  summary: إنشاء موظف جديد
  description: إضافة موظف جديد إلى النظام
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            fullName:
              type: string
              example: "أحمد محمد علي"
            position:
              type: string
              example: "مهندس برمجيات"
            department:
              type: string
              example: "تكنولوجيا المعلومات"
            salary:
              type: number
              example: 3500
            companyId:
              type: string
              example: "company-1"
            hireDate:
              type: string
              format: date
              example: "2023-01-15"
          required:
            - fullName
            - position
            - department
            - salary
            - companyId
  responses:
    '201':
      description: تم إنشاء الموظف بنجاح
    '400':
      description: بيانات غير صحيحة
```

### 3. إدارة الإجازات

#### GET /api/employees/{id}/leaves
```yaml
get:
  tags:
    - Leaves
  summary: الحصول على إجازات موظف
  description: استرجاع جميع إجازات موظف معين
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
      description: معرف الموظف
    - name: status
      in: query
      schema:
        type: string
        enum: [pending, approved, rejected]
      description: تصفية حسب الحالة
  responses:
    '200':
      description: نجح الطلب
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
              data:
                type: array
                items:
                  $ref: '#/components/schemas/Leave'
```

#### POST /api/employees/{id}/leaves
```yaml
post:
  tags:
    - Leaves
  summary: طلب إجازة جديدة
  description: تقديم طلب إجازة جديدة لموظف
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
      description: معرف الموظف
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            type:
              type: string
              enum: [annual, sick, emergency, maternity]
              example: "annual"
            startDate:
              type: string
              format: date
              example: "2025-02-10"
            endDate:
              type: string
              format: date
              example: "2025-02-12"
            reason:
              type: string
              example: "إجازة شخصية"
          required:
            - type
            - startDate
            - endDate
            - reason
  responses:
    '201':
      description: تم تقديم طلب الإجازة بنجاح
    '400':
      description: بيانات غير صحيحة أو رصيد إجازات غير كافي
```

### 4. إدارة الحضور

#### POST /api/employees/{id}/attendance/check-in
```yaml
post:
  tags:
    - Attendance
  summary: تسجيل دخول موظف
  description: تسجيل وقت دخول موظف للعمل
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
      description: معرف الموظف
  responses:
    '200':
      description: تم تسجيل الدخول بنجاح
    '400':
      description: الموظف مسجل دخول بالفعل
    '404':
      description: الموظف غير موجود
```

#### POST /api/employees/{id}/attendance/check-out
```yaml
post:
  tags:
    - Attendance
  summary: تسجيل خروج موظف
  description: تسجيل وقت خروج موظف من العمل
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
      description: معرف الموظف
  responses:
    '200':
      description: تم تسجيل الخروج بنجاح
    '400':
      description: الموظف غير مسجل دخول
    '404':
      description: الموظف غير موجود
```

### 5. إدارة المستندات

#### POST /api/documents/upload
```yaml
post:
  tags:
    - Documents
  summary: رفع مستند جديد
  description: رفع مستند جديد إلى النظام
  requestBody:
    required: true
    content:
      multipart/form-data:
        schema:
          type: object
          properties:
            file:
              type: string
              format: binary
              description: ملف المستند
            companyId:
              type: string
              description: معرف الشركة
            type:
              type: string
              enum: [license, contract, certificate, other]
              description: نوع المستند
            name:
              type: string
              description: اسم المستند
            expiryDate:
              type: string
              format: date
              description: تاريخ انتهاء الصلاحية
          required:
            - file
            - companyId
            - type
            - name
  responses:
    '201':
      description: تم رفع المستند بنجاح
    '400':
      description: خطأ في الملف أو البيانات
    '413':
      description: حجم الملف كبير جداً
```

#### GET /api/companies/{id}/documents
```yaml
get:
  tags:
    - Documents
  summary: الحصول على مستندات شركة
  description: استرجاع جميع مستندات شركة معينة
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
      description: معرف الشركة
    - name: type
      in: query
      schema:
        type: string
        enum: [license, contract, certificate, other]
      description: تصفية حسب النوع
  responses:
    '200':
      description: نجح الطلب
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
              data:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                    name:
                      type: string
                    type:
                      type: string
                    fileName:
                      type: string
                    uploadDate:
                      type: string
                      format: date-time
                    expiryDate:
                      type: string
                      format: date
```

### 6. الذكاء الاصطناعي

#### POST /api/ai/analyze
```yaml
post:
  tags:
    - AI
  summary: تحليل البيانات بالذكاء الاصطناعي
  description: تحليل البيانات باستخدام الذكاء الاصطناعي
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            type:
              type: string
              enum: [employee_performance, attendance_pattern, salary_analysis, turnover_prediction]
              description: نوع التحليل
            companyId:
              type: string
              description: معرف الشركة
            dateRange:
              type: object
              properties:
                start:
                  type: string
                  format: date
                end:
                  type: string
                  format: date
              description: نطاق التاريخ للتحليل
            parameters:
              type: object
              description: معاملات إضافية للتحليل
          required:
            - type
            - companyId
  responses:
    '200':
      description: نجح التحليل
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
              data:
                type: object
                properties:
                  analysis:
                    type: object
                  insights:
                    type: array
                    items:
                      type: string
                  recommendations:
                    type: array
                    items:
                      type: string
```

#### POST /api/ai/report
```yaml
post:
  tags:
    - AI
  summary: إنشاء تقرير ذكي
  description: إنشاء تقرير ذكي باستخدام الذكاء الاصطناعي
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            reportType:
              type: string
              enum: [payroll_summary, attendance_report, performance_analysis, compliance_report]
              description: نوع التقرير
            parameters:
              type: object
              properties:
                companyId:
                  type: string
                month:
                  type: string
                  pattern: '^\\d{4}-\\d{2}$'
                year:
                  type: integer
                department:
                  type: string
              description: معاملات التقرير
            format:
              type: string
              enum: [pdf, excel, csv]
              default: pdf
              description: تنسيق التقرير
          required:
            - reportType
            - parameters
  responses:
    '200':
      description: تم إنشاء التقرير بنجاح
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
              data:
                type: object
                properties:
                  reportUrl:
                    type: string
                  downloadUrl:
                    type: string
                  generatedAt:
                    type: string
                    format: date-time
```

## 🔐 المصادقة والأمان

### أنواع المصادقة المدعومة

#### 1. Session Authentication
```yaml
components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: connect.sid
      description: معرف الجلسة المخزن في الكوكي
```

#### 2. CSRF Protection
```yaml
components:
  securitySchemes:
    csrfToken:
      type: apiKey
      in: header
      name: X-CSRF-Token
      description: رمز CSRF للحماية من الهجمات
```

### تطبيق الأمان على النقاط النهائية
```yaml
security:
  - sessionAuth: []
    csrfToken: []
```

## ⚡ تحديد معدل الطلبات

### حدود الطلبات
```yaml
components:
  parameters:
    rateLimit:
      name: X-RateLimit-Limit
      in: header
      schema:
        type: integer
      description: الحد الأقصى للطلبات
    rateRemaining:
      name: X-RateLimit-Remaining
      in: header
      schema:
        type: integer
      description: عدد الطلبات المتبقية
    rateReset:
      name: X-RateLimit-Reset
      in: header
      schema:
        type: integer
      description: وقت إعادة تعيين العداد
```

### حدود حسب النوع
- **عام**: 100 طلب/دقيقة
- **المستندات**: 10 طلب/دقيقة
- **البحث**: 30 طلب/دقيقة
- **الذكاء الاصطناعي**: 5 طلب/دقيقة

## 🔧 معالجة الأخطاء

### رموز الحالة
```yaml
responses:
  '400':
    description: خطأ في الطلب
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: object
              properties:
                message:
                  type: string
                code:
                  type: string
                details:
                  type: object
  '401':
    description: غير مصرح
  '403':
    description: محظور
  '404':
    description: غير موجود
  '429':
    description: تجاوز حد الطلبات
  '500':
    description: خطأ في الخادم
```

### أمثلة الأخطاء
```json
{
  "error": {
    "message": "البيانات المقدمة غير صحيحة",
    "code": "VALIDATION_ERROR",
    "details": {
      "fullName": "الاسم مطلوب",
      "salary": "الراتب يجب أن يكون رقم موجب"
    }
  }
}
```

## 🧪 اختبار API

### باستخدام Swagger UI
1. انتقل إلى `/api-docs`
2. اختر النقطة النهائية المطلوبة
3. انقر على "Try it out"
4. املأ المعاملات المطلوبة
5. انقر على "Execute"

### باستخدام cURL
```bash
# الحصول على الشركات
curl -X GET "http://localhost:3000/api/companies" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-csrf-token" \
  -b "connect.sid=your-session-id"

# إنشاء موظف جديد
curl -X POST "http://localhost:3000/api/employees" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-csrf-token" \
  -b "connect.sid=your-session-id" \
  -d '{
    "fullName": "أحمد محمد علي",
    "position": "مهندس برمجيات",
    "department": "تكنولوجيا المعلومات",
    "salary": 3500,
    "companyId": "company-1"
  }'
```

### باستخدام Postman
1. استيراد مجموعة Postman من `/api-docs`
2. إعداد متغيرات البيئة
3. تشغيل الاختبارات

## 📈 مراقبة الأداء

### نقاط النهاية الصحية
```yaml
/health:
  get:
    tags:
      - Health
    summary: فحص صحة النظام
    description: التحقق من حالة النظام وقاعدة البيانات
    responses:
      '200':
        description: النظام يعمل بشكل طبيعي
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: "healthy"
                uptime:
                  type: number
                  example: 12345.67
                timestamp:
                  type: string
                  format: date-time
                version:
                  type: string
                  example: "1.0.0"
                environment:
                  type: string
                  example: "development"
```

## 🔄 التحديثات والإصدارات

### إصدار API
- **الإصدار الحالي**: v1.0.0
- **تاريخ الإطلاق**: يناير 2025
- **الاستقرار**: مستقر للإنتاج

### جدول التحديثات
| الإصدار | التاريخ | التغييرات |
|---------|---------|-----------|
| 1.0.0 | 2025-01-28 | الإصدار الأول |

## 📞 الدعم والمساعدة

### موارد إضافية
- **التوثيق التفاعلي**: `/api-docs`
- **أمثلة الكود**: `/docs/examples`
- **اختبارات API**: `/tests/api`

### التواصل
- **البريد الإلكتروني**: api-support@hrmselite.com
- **المسائل**: GitHub Issues
- **الدردشة**: Discord Community

---

**HRMS Elite Swagger API Documentation** - توثيق تفاعلي شامل للـ API 🚀 