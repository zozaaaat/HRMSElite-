# 📚 HRMS Elite API Documentation

## 🌐 نظرة عامة

HRMS Elite API هو نظام RESTful متكامل لإدارة الموارد البشرية مع دعم الذكاء الاصطناعي. يوفر النظام واجهات برمجة شاملة لإدارة الموظفين والشركات والرواتب والحضور والإجازات والمستندات.

## 🔗 الوصول إلى API

### بيئات التشغيل
- **التطوير**: `http://localhost:3000`
- **الإنتاج**: `https://api.hrmselite.com`

### التوثيق التفاعلي
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/api-docs/swagger.json`

## 🔐 المصادقة والأمان

### أنواع المصادقة
1. **Session Authentication**: مصادقة الجلسات
2. **CSRF Protection**: حماية من هجمات CSRF
3. **Role-Based Access Control**: نظام أدوار وصلاحيات

### رؤوس HTTP المطلوبة
```http
X-CSRF-Token: <csrf-token>
Cookie: connect.sid=<session-id>
Content-Type: application/json
```

## 📊 نماذج البيانات

### Company (الشركة)
```typescript
interface Company {
  id: string;
  name: string;
  commercialFileName: string;
  department: string;
  classification: string;
  status: 'active' | 'inactive';
  employeeCount: number;
  industry: string;
  establishmentDate: string;
}
```

### Employee (الموظف)
```typescript
interface Employee {
  id: string;
  fullName: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive' | 'archived';
  hireDate: string;
  companyId: string;
}
```

### Leave (الإجازة)
```typescript
interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'emergency' | 'maternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}
```

## 🚀 نقاط النهاية الرئيسية

### 1. إدارة الشركات

#### الحصول على جميع الشركات
```http
GET /api/companies
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [
    {
      "id": "company-1",
      "name": "شركة الاتحاد الخليجي",
      "commercialFileName": "الاتحاد الخليجي للتجارة",
      "department": "التجارة العامة",
      "classification": "شركة ذات مسؤولية محدودة",
      "status": "active",
      "employeeCount": 45,
      "industry": "التجارة",
      "establishmentDate": "2020-01-15"
    }
  ]
}
```

#### إنشاء شركة جديدة
```http
POST /api/companies
Content-Type: application/json

{
  "name": "شركة جديدة",
  "commercialFileName": "اسم تجاري",
  "department": "قسم الشركة",
  "classification": "نوع الشركة",
  "industry": "الصناعة",
  "establishmentDate": "2025-01-01"
}
```

### 2. إدارة الموظفين

#### الحصول على جميع الموظفين
```http
GET /api/employees
```

#### إنشاء موظف جديد
```http
POST /api/employees
Content-Type: application/json

{
  "fullName": "أحمد محمد علي",
  "position": "مهندس برمجيات",
  "department": "تكنولوجيا المعلومات",
  "salary": 3500,
  "companyId": "company-1",
  "hireDate": "2023-01-15"
}
```

#### تحديث بيانات موظف
```http
PUT /api/employees/:id
Content-Type: application/json

{
  "fullName": "أحمد محمد علي",
  "position": "مهندس برمجيات كبير",
  "salary": 4000
}
```

### 3. إدارة الإجازات

#### الحصول على إجازات موظف
```http
GET /api/employees/:id/leaves
```

#### طلب إجازة جديدة
```http
POST /api/employees/:id/leaves
Content-Type: application/json

{
  "type": "annual",
  "startDate": "2025-02-10",
  "endDate": "2025-02-12",
  "reason": "إجازة شخصية"
}
```

### 4. إدارة الحضور

#### تسجيل دخول
```http
POST /api/employees/:id/attendance/check-in
```

#### تسجيل خروج
```http
POST /api/employees/:id/attendance/check-out
```

#### الحصول على سجل الحضور
```http
GET /api/employees/:id/attendance?month=2025-01&year=2025
```

### 5. إدارة المستندات

#### رفع مستند
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: <file>
companyId: company-1
type: license
```

#### الحصول على مستندات شركة
```http
GET /api/companies/:id/documents
```

### 6. الذكاء الاصطناعي

#### تحليل البيانات
```http
POST /api/ai/analyze
Content-Type: application/json

{
  "type": "employee_performance",
  "companyId": "company-1",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  }
}
```

#### تقرير ذكي
```http
POST /api/ai/report
Content-Type: application/json

{
  "reportType": "payroll_summary",
  "parameters": {
    "companyId": "company-1",
    "month": "2025-01"
  }
}
```

## 🔧 معالجة الأخطاء

### رموز الحالة
- `200` - نجح الطلب
- `201` - تم الإنشاء بنجاح
- `400` - خطأ في الطلب
- `401` - غير مصرح
- `403` - محظور
- `404` - غير موجود
- `429` - تجاوز حد الطلبات
- `500` - خطأ في الخادم

### نموذج الخطأ
```json
{
  "error": {
    "message": "رسالة الخطأ",
    "code": "ERROR_CODE",
    "details": {
      "field": "تفاصيل إضافية"
    }
  }
}
```

## ⚡ تحديد معدل الطلبات

### حدود الطلبات
- **عام**: 100 طلب/دقيقة
- **المستندات**: 10 طلب/دقيقة
- **البحث**: 30 طلب/دقيقة
- **الذكاء الاصطناعي**: 5 طلب/دقيقة

### رؤوس الاستجابة
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🧪 اختبار API

### باستخدام cURL
```bash
# الحصول على الشركات
curl -X GET http://localhost:3000/api/companies \
  -H "Content-Type: application/json"

# إنشاء موظف جديد
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
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
```http
GET /health
```

**الاستجابة:**
```json
{
  "status": "healthy",
  "uptime": 12345.67,
  "timestamp": "2025-01-28T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
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

**HRMS Elite API** - نظام إدارة موارد بشرية متكامل مع دعم الذكاء الاصطناعي 🚀 