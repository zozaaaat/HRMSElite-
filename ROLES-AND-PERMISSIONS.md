# نظام الأدوار والصلاحيات - HRMS Elite

## نظرة عامة

تم تطوير نظام شامل للأدوار والصلاحيات في تطبيق HRMS Elite لضمان الأمان والتحكم في الوصول للمستخدمين المختلفين.

## الأدوار المتاحة

### 1. المسؤول العام (Super Admin)
- **المستوى**: 5 (الأعلى)
- **الوصف**: لديه صلاحيات كاملة على النظام وجميع الشركات
- **الصلاحيات**: جميع الصلاحيات المتاحة في النظام

### 2. مدير الشركة (Company Manager)
- **المستوى**: 4
- **الوصف**: يدير شركة واحدة وموظفيها
- **الصلاحيات**: إدارة الموظفين، التقارير، الحضور، الرواتب، المستندات، التدريب، التوظيف، الأداء

### 3. موظف إداري (Employee)
- **المستوى**: 3
- **الوصف**: موظف إداري مع صلاحيات محدودة
- **الصلاحيات**: عرض الموظفين، التقارير، الحضور، طلبات الإجازة، الرواتب، المستندات، التدريب، الأداء

### 4. مشرف (Supervisor)
- **المستوى**: 2
- **الوصف**: يشرف على مجموعة من العمال
- **الصلاحيات**: عرض الموظفين، التقارير، الحضور، الموافقة على الإجازات، الرواتب، المستندات، التدريب، الأداء

### 5. عامل (Worker)
- **المستوى**: 1 (الأدنى)
- **الوصف**: عامل عادي مع صلاحيات أساسية
- **الصلاحيات**: الحضور، طلبات الإجازة، الرواتب، المستندات، التدريب، الأداء

## الصلاحيات المتاحة

### صلاحيات لوحة التحكم
- `dashboard:view` - عرض لوحة التحكم

### صلاحيات إدارة الشركات
- `companies:view` - عرض الشركات
- `companies:create` - إنشاء شركة جديدة
- `companies:edit` - تعديل بيانات الشركة
- `companies:delete` - حذف شركة

### صلاحيات إدارة الموظفين
- `employees:view` - عرض الموظفين
- `employees:create` - إضافة موظف جديد
- `employees:edit` - تعديل بيانات الموظف
- `employees:delete` - حذف موظف

### صلاحيات التقارير
- `reports:view` - عرض التقارير
- `reports:create` - إنشاء تقرير جديد
- `reports:export` - تصدير التقارير

### صلاحيات الإعدادات
- `settings:view` - عرض الإعدادات
- `settings:edit` - تعديل الإعدادات

### صلاحيات الحضور
- `attendance:view` - عرض سجلات الحضور
- `attendance:edit` - تعديل سجلات الحضور

### صلاحيات طلبات الإجازة
- `leave_requests:view` - عرض طلبات الإجازة
- `leave_requests:approve` - الموافقة على طلبات الإجازة
- `leave_requests:create` - إنشاء طلب إجازة

### صلاحيات الرواتب
- `payroll:view` - عرض الرواتب
- `payroll:edit` - تعديل الرواتب
- `payroll:process` - معالجة الرواتب

### صلاحيات المستندات
- `documents:view` - عرض المستندات
- `documents:upload` - رفع مستندات
- `documents:delete` - حذف مستندات

### صلاحيات التدريب
- `training:view` - عرض التدريب
- `training:create` - إنشاء دورة تدريبية
- `training:assign` - تعيين موظفين للتدريب

### صلاحيات التوظيف
- `recruitment:view` - عرض التوظيف
- `recruitment:create` - إنشاء وظيفة جديدة
- `recruitment:approve` - الموافقة على التوظيف

### صلاحيات الأداء
- `performance:view` - عرض تقييمات الأداء
- `performance:edit` - تعديل تقييمات الأداء

### صلاحيات البحث المتقدم
- `advanced_search:view` - استخدام البحث المتقدم

### صلاحيات لوحة التحكم الذكية
- `ai_dashboard:view` - عرض لوحة التحكم الذكية

### صلاحيات الأنظمة المحاسبية
- `accounting_systems:view` - عرض الأنظمة المحاسبية
- `accounting_systems:edit` - تعديل الأنظمة المحاسبية

### صلاحيات النماذج الحكومية
- `government_forms:view` - عرض النماذج الحكومية
- `government_forms:submit` - تقديم النماذج الحكومية

## الملفات الرئيسية

### 1. `client/src/lib/roles.ts`
- تعريف جميع الصلاحيات والأدوار
- دوال التحقق من الصلاحيات
- دوال الحصول على معلومات الأدوار

### 2. `client/src/hooks/usePermissions.ts`
- Hook للتعامل مع الصلاحيات
- دوال مساعدة للتحقق من الأدوار
- دوال الحصول على معلومات الصلاحيات

### 3. `client/src/components/shared/ProtectedRoute.tsx`
- مكون حماية المسارات
- التحقق من الصلاحيات قبل عرض الصفحات
- التوجيه التلقائي للمستخدمين غير المصرح لهم

### 4. `client/src/components/shared/ProtectedPage.tsx`
- مكونات محمية جاهزة للاستخدام
- تغليف الصفحات بحماية الصلاحيات

### 5. `client/src/components/shared/PermissionTest.tsx`
- مكون اختبار الصلاحيات
- عرض معلومات الدور والصلاحيات المتاحة

## كيفية الاستخدام

### 1. حماية صفحة
```tsx
import { ProtectedRoute } from '../components/shared/ProtectedRoute';

function MyPage() {
  return (
    <ProtectedRoute pageId="employees">
      <div>محتوى الصفحة</div>
    </ProtectedRoute>
  );
}
```

### 2. استخدام hook الصلاحيات
```tsx
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { 
    currentRole, 
    roleLabel, 
    checkPermission, 
    canAccess,
    isSuperAdmin 
  } = usePermissions();

  if (!checkPermission('employees:create')) {
    return <div>غير مصرح لك بإنشاء موظفين</div>;
  }

  return <div>يمكنك إنشاء موظفين</div>;
}
```

### 3. حماية عنصر معين
```tsx
import { PermissionGuard } from '../components/shared/ProtectedRoute';

function MyComponent() {
  return (
    <div>
      <h1>عنوان الصفحة</h1>
      
      <PermissionGuard permission="employees:create">
        <button>إضافة موظف جديد</button>
      </PermissionGuard>
      
      <PermissionGuard permission="employees:delete">
        <button>حذف موظف</button>
      </PermissionGuard>
    </div>
  );
}
```

## اختبار النظام

### صفحة اختبار الصلاحيات
يمكن الوصول لصفحة اختبار الصلاحيات عبر:
```
/permission-test
```

هذه الصفحة تعرض:
- معلومات الدور الحالي
- الصلاحيات المتاحة
- الصفحات المتاحة
- اختبار الوصول للصفحات المختلفة

## التحديثات المستقبلية

### إضافة صلاحيات جديدة
1. إضافة الصلاحية في `client/src/lib/roles.ts`
2. تحديث `rolePermissions` لكل دور
3. إضافة الصلاحية في `pagePermissions` إذا كانت مطلوبة لصفحة

### إضافة دور جديد
1. إضافة الدور في `client/src/lib/routes.ts`
2. إضافة الصلاحيات في `client/src/lib/roles.ts`
3. تحديث `navigation-config.ts` إذا لزم الأمر

## الأمان

- جميع الصفحات محمية تلقائياً
- التحقق من الصلاحيات يتم على مستوى المكونات
- التوجيه التلقائي للمستخدمين غير المصرح لهم
- لا يمكن الوصول للصفحات عبر URL مباشرة بدون صلاحيات

## الدعم

لأي استفسارات حول نظام الصلاحيات، يمكن:
1. مراجعة هذا الملف
2. استخدام صفحة اختبار الصلاحيات
3. مراجعة الكود في الملفات المذكورة أعلاه 