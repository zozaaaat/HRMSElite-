# دليل التحقق من المدخلات - HRMS Elite

## نظرة عامة

تم تفعيل نظام التحقق من المدخلات باستخدام Zod لضمان سلامة البيانات وأمان التطبيق. يوفر النظام تحقق شامل من جميع المدخلات مع رسائل خطأ واضحة باللغة العربية.

## المكونات الرئيسية

### 1. ملف التحقق الأساسي
`server/middleware/validateInput.ts`

يحتوي على الدوال التالية:
- `validate()` - للتحقق من body
- `validateQuery()` - للتحقق من query parameters
- `validateParams()` - للتحقق من URL parameters
- `validateMultiple()` - للتحقق من مصادر متعددة
- `sanitizeInput()` - لتنظيف المدخلات

### 2. مخططات التحقق الجاهزة
`shared/schema.ts`

يحتوي على مخططات Zod جاهزة للاستخدام:
- `insertEmployeeSchema`
- `insertCompanySchema`
- `insertLicenseSchema`
- `insertEmployeeLeaveSchema`
- `insertEmployeeDeductionSchema`
- `insertEmployeeViolationSchema`
- `insertDocumentSchema`

## كيفية الاستخدام

### 1. التحقق من Body (البيانات المرسلة)

```typescript
import { validateInput } from "../middleware/validateInput";
import { insertEmployeeSchema } from "@shared/schema";

app.post('/api/employees', 
  validateInput.sanitize, // تنظيف المدخلات أولاً
  validateInput.body(insertEmployeeSchema), // التحقق من البيانات
  async (req, res) => {
    // req.body الآن محقق ومنظف
    const newEmployee = await storage.createEmployee(req.body);
    res.status(201).json({ message: "تم إنشاء الموظف بنجاح", employee: newEmployee });
  }
);
```

### 2. التحقق من Query Parameters

```typescript
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1, "يجب إدخال نص للبحث"),
  department: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20)
});

app.get('/api/employees/search',
  validateInput.query(searchSchema),
  async (req, res) => {
    // req.query الآن محقق
    const { query, department, page, limit } = req.query;
    // ... باقي المنطق
  }
);
```

### 3. التحقق من URL Parameters

```typescript
app.put('/api/employees/:id',
  validateInput.params(z.object({ id: z.string().min(1, "معرف الموظف مطلوب") })),
  validateInput.body(updateSchema),
  async (req, res) => {
    const { id } = req.params; // محقق
    const updateData = req.body; // محقق ومنظف
    // ... باقي المنطق
  }
);
```

### 4. التحقق من مصادر متعددة

```typescript
app.put('/api/employees/:id/status',
  validateInput.multiple({
    params: z.object({ id: z.string().min(1, "معرف الموظف مطلوب") }),
    body: z.object({ 
      status: z.enum(["active", "inactive", "on_leave", "terminated", "archived"]),
      reason: z.string().min(10, "سبب التغيير يجب أن يكون على الأقل 10 أحرف")
    })
  }),
  async (req, res) => {
    const { id } = req.params; // محقق
    const { status, reason } = req.body; // محقق ومنظف
    // ... باقي المنطق
  }
);
```

## مخططات التحقق المخصصة

### 1. مخطط البحث عن الموظفين

```typescript
const employeeSearchSchema = z.object({
  query: z.string().min(1, "يجب إدخال نص للبحث").max(100, "نص البحث طويل جداً"),
  department: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave", "terminated", "archived"]).optional(),
  companyId: z.string().optional(),
  page: z.number().min(1, "رقم الصفحة يجب أن يكون أكبر من 0").optional().default(1),
  limit: z.number().min(1, "عدد النتائج يجب أن يكون أكبر من 0").max(100, "عدد النتائج كبير جداً").optional().default(20)
});
```

### 2. مخطط تحديث بيانات الموظف

```typescript
const employeeUpdateSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
  position: z.string().min(2, "المنصب يجب أن يكون على الأقل حرفين").max(100, "المنصب طويل جداً"),
  department: z.string().min(2, "القسم يجب أن يكون على الأقل حرفين").max(100, "القسم طويل جداً"),
  salary: z.number().min(0, "الراتب يجب أن يكون موجب"),
  status: z.enum(["active", "inactive", "on_leave", "terminated", "archived"]),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ التوظيف يجب أن يكون بصيغة YYYY-MM-DD")
});
```

### 3. مخطط طلب الإجازة

```typescript
const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, "معرف الموظف مطلوب"),
  leaveType: z.enum(["annual", "sick", "maternity", "emergency", "unpaid"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ البداية يجب أن يكون بصيغة YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ النهاية يجب أن يكون بصيغة YYYY-MM-DD"),
  reason: z.string().min(10, "سبب الإجازة يجب أن يكون على الأقل 10 أحرف").max(500, "سبب الإجازة طويل جداً"),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional()
});
```

## رسائل الخطأ

### تنسيق رسالة الخطأ

```json
{
  "error": "Validation failed",
  "message": "بيانات غير صحيحة",
  "details": [
    {
      "field": "fullName",
      "message": "الاسم يجب أن يكون على الأقل حرفين",
      "code": "too_small"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### أنواع الأخطاء الشائعة

1. **الحقول المطلوبة**: `"field": "fullName", "message": "الاسم مطلوب"`
2. **الحد الأدنى**: `"field": "fullName", "message": "الاسم يجب أن يكون على الأقل حرفين"`
3. **الحد الأقصى**: `"field": "fullName", "message": "الاسم طويل جداً"`
4. **التنسيق**: `"field": "email", "message": "البريد الإلكتروني غير صحيح"`
5. **القيم المسموحة**: `"field": "status", "message": "الحالة يجب أن تكون: active, inactive, on_leave, terminated, archived"`

## الأمان

### 1. تنظيف المدخلات

يتم تنظيف جميع المدخلات من:
- Script tags: `<script>alert('xss')</script>`
- JavaScript events: `onclick="alert('xss')"`
- Data URLs: `data:text/html,<script>alert('xss')</script>`
- VBScript: `vbscript:alert('xss')`
- CSS expressions: `expression(alert('xss'))`

### 2. التحقق من النوع

```typescript
// تحقق من نوع البيانات
z.string().min(1, "الحقل مطلوب")
z.number().min(0, "القيمة يجب أن تكون موجب")
z.boolean()
z.enum(["active", "inactive"], { errorMap: () => ({ message: "قيمة غير صحيحة" }) })
```

### 3. التحقق من التنسيق

```typescript
// تحقق من البريد الإلكتروني
z.string().email("البريد الإلكتروني غير صحيح")

// تحقق من التاريخ
z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ يجب أن يكون بصيغة YYYY-MM-DD")

// تحقق من الرقم
z.string().regex(/^\d+$/, "يجب أن يكون رقماً")
```

## أمثلة عملية

### 1. إنشاء موظف جديد

```typescript
app.post('/api/employees', 
  validateInput.sanitize,
  validateInput.body(insertEmployeeSchema),
  async (req, res) => {
    try {
      const newEmployee = await storage.createEmployee(req.body);
      res.status(201).json({
        message: "تم إنشاء الموظف بنجاح",
        employee: newEmployee
      });
    } catch (error) {
      res.status(500).json({ message: "فشل في إنشاء الموظف" });
    }
  }
);
```

### 2. البحث عن الموظفين

```typescript
app.get('/api/employees/search',
  validateInput.query(employeeSearchSchema),
  async (req, res) => {
    try {
      const { query, department, status, page, limit } = req.query;
      const employees = await storage.searchEmployees({
        query: query as string,
        department: department as string,
        status: status as string,
        page: page as number,
        limit: limit as number
      });
      
      res.json({
        employees,
        pagination: { page: page as number, limit: limit as number, total: employees.length }
      });
    } catch (error) {
      res.status(500).json({ message: "فشل في البحث عن الموظفين" });
    }
  }
);
```

### 3. تحديث حالة الموظف

```typescript
app.put('/api/employees/:id/status',
  validateInput.multiple({
    params: z.object({ id: z.string().min(1, "معرف الموظف مطلوب") }),
    body: z.object({ 
      status: z.enum(["active", "inactive", "on_leave", "terminated", "archived"]),
      reason: z.string().min(10, "سبب التغيير يجب أن يكون على الأقل 10 أحرف")
    })
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      const updatedEmployee = await storage.updateEmployeeStatus(id, status, reason);
      
      res.json({
        message: "تم تحديث حالة الموظف بنجاح",
        employee: updatedEmployee
      });
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث حالة الموظف" });
    }
  }
);
```

## أفضل الممارسات

### 1. ترتيب Middleware

```typescript
app.post('/api/employees',
  validateInput.sanitize,        // 1. تنظيف المدخلات أولاً
  validateInput.body(schema),    // 2. التحقق من البيانات
  authenticate,                  // 3. التحقق من الهوية
  authorize,                     // 4. التحقق من الصلاحيات
  async (req, res) => {         // 5. معالجة الطلب
    // المنطق هنا
  }
);
```

### 2. استخدام مخططات مخصصة

```typescript
// مخطط مخصص للبحث
const searchSchema = z.object({
  query: z.string().min(1, "نص البحث مطلوب"),
  filters: z.object({
    department: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional()
  }).optional()
});

// مخطط مخصص للتحديث
const updateSchema = z.object({
  fullName: z.string().min(2, "الاسم قصير جداً"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional()
});
```

### 3. رسائل خطأ واضحة

```typescript
const schema = z.object({
  fullName: z.string()
    .min(2, "الاسم يجب أن يكون على الأقل حرفين")
    .max(100, "الاسم طويل جداً"),
  email: z.string()
    .email("البريد الإلكتروني غير صحيح")
    .min(5, "البريد الإلكتروني قصير جداً")
    .max(255, "البريد الإلكتروني طويل جداً")
});
```

## الاختبار

### 1. اختبار التحقق من البيانات

```typescript
// test/validation.test.ts
import { validateInput } from "../middleware/validateInput";
import { insertEmployeeSchema } from "@shared/schema";

describe('Validation Middleware', () => {
  it('should validate employee data correctly', () => {
    const validData = {
      fullName: "أحمد محمد",
      position: "مهندس",
      department: "تكنولوجيا المعلومات",
      salary: 3000,
      status: "active",
      hireDate: "2023-01-15"
    };
    
    const result = insertEmployeeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid employee data', () => {
    const invalidData = {
      fullName: "", // خطأ: اسم فارغ
      salary: -1000, // خطأ: راتب سالب
      status: "invalid_status" // خطأ: حالة غير صحيحة
    };
    
    const result = insertEmployeeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors).toHaveLength(3);
  });
});
```

### 2. اختبار تنظيف المدخلات

```typescript
it('should sanitize malicious input', () => {
  const maliciousData = {
    fullName: "<script>alert('xss')</script>أحمد",
    email: "javascript:alert('xss')@example.com"
  };
  
  // يجب تنظيف البيانات من المحتوى الضار
  expect(maliciousData.fullName).not.toContain("<script>");
  expect(maliciousData.email).not.toContain("javascript:");
});
```

## التكامل مع النظام الحالي

### 1. تحديث الملفات الموجودة

لتفعيل التحقق في الملفات الموجودة، أضف:

```typescript
// في بداية الملف
import { validateInput } from "../middleware/validateInput";
import { insertEmployeeSchema } from "@shared/schema";

// في المسارات
app.post('/api/employees', 
  validateInput.sanitize,
  validateInput.body(insertEmployeeSchema),
  async (req, res) => {
    // المنطق الحالي
  }
);
```

### 2. إضافة مخططات جديدة

```typescript
// في shared/schema.ts
export const customValidationSchema = z.object({
  // تعريف المخطط
});

// في الملفات التي تستخدمه
import { customValidationSchema } from "@shared/schema";
```

## الخلاصة

نظام التحقق من المدخلات يوفر:

1. **الأمان**: تنظيف المدخلات من المحتوى الضار
2. **الموثوقية**: التحقق من صحة البيانات قبل المعالجة
3. **الوضوح**: رسائل خطأ واضحة باللغة العربية
4. **المرونة**: إمكانية إنشاء مخططات مخصصة
5. **التكامل**: يعمل مع النظام الحالي بدون تغييرات كبيرة

يجب استخدام هذا النظام في جميع المسارات الجديدة وتحديث المسارات الموجودة تدريجياً لتحسين أمان التطبيق. 