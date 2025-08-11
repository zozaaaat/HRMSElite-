# تنفيذ مكون إدارة الموظفين وربطه بـ API CRUD

## نظرة عامة

تم إنشاء نظام إدارة الموظفين الكامل مع ربطه بـ API CRUD operations. يتضمن النظام المكونات التالية:

### 1. مكون EmployeeForm (`components/employee-form.tsx`)

مكون شامل لإضافة وتحديث بيانات الموظفين مع الميزات التالية:

#### الميزات:
- **نموذج شامل**: يحتوي على جميع حقول بيانات الموظف
- **التحقق من صحة البيانات**: باستخدام Zod schema validation
- **وضعين للعمل**: إضافة موظف جديد وتحديث موظف موجود
- **ربط بـ API**: استخدام React Query للتعامل مع الخادم
- **إدارة الحالة**: عرض حالات التحميل والأخطاء
- **أرشفة الموظفين**: إمكانية أرشفة الموظفين

#### الحقول المطلوبة:
- الاسم الأول والأخير
- البريد الإلكتروني والهاتف
- المنصب والقسم
- تاريخ التوظيف والراتب
- رقم الهوية الوطنية وتاريخ الميلاد
- العنوان ورقم الطوارئ
- سنوات الخبرة والمؤهل العلمي

### 2. صفحة إدارة الموظفين (`pages/employee-management.tsx`)

صفحة شاملة لإدارة الموظفين مع الميزات التالية:

#### الميزات:
- **عرض قائمة الموظفين**: جدول منظم مع معلومات شاملة
- **البحث والتصفية**: بحث متقدم مع فلاتر متعددة
- **إحصائيات**: عرض إحصائيات الموظفين
- **إجراءات جماعية**: تحديد وحذف متعدد
- **تصدير البيانات**: تصدير إلى CSV
- **عرض التفاصيل**: نافذة منبثقة لعرض تفاصيل الموظف

### 3. خدمة الموظفين المحدثة (`services/employee.ts`)

تم تحديث واجهة Employee لتشمل جميع الحقول المطلوبة:

```typescript
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  companyId: string;
  avatar?: string;
  employeeId?: string;
  nationalId?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  experience?: number;
  education?: string;
}
```

## ربط API CRUD

### 1. عمليات القراءة (GET)

```typescript
// جلب جميع الموظفين
const { data: employees } = useQuery({
  queryKey: ['employees'],
  queryFn: () => EmployeeService.getAllEmployees(),
  staleTime: 5 * 60 * 1000, // 5 دقائق
});

// جلب موظف واحد
const { data: employee } = useQuery({
  queryKey: ['employee', id],
  queryFn: () => EmployeeService.getEmployeeById(id),
});
```

### 2. عمليات الإنشاء (CREATE)

```typescript
const createEmployeeMutation = useMutation({
  mutationFn: (data: CreateEmployeeData) => EmployeeService.createEmployee(data),
  onSuccess: (newEmployee) => {
    toast({
      title: 'تم بنجاح',
      description: 'تم إضافة الموظف الجديد بنجاح',
      variant: 'default'
    });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  },
  onError: (error) => {
    toast({
      title: 'خطأ',
      description: 'حدث خطأ أثناء إضافة الموظف',
      variant: 'destructive'
    });
  }
});
```

### 3. عمليات التحديث (UPDATE)

```typescript
const updateEmployeeMutation = useMutation({
  mutationFn: (data: UpdateEmployeeData) => EmployeeService.updateEmployee(data),
  onSuccess: (updatedEmployee) => {
    toast({
      title: 'تم بنجاح',
      description: 'تم تحديث بيانات الموظف بنجاح',
      variant: 'default'
    });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['employee', employee?.id] });
  },
  onError: (error) => {
    toast({
      title: 'خطأ',
      description: 'حدث خطأ أثناء تحديث بيانات الموظف',
      variant: 'destructive'
    });
  }
});
```

### 4. عمليات الحذف (DELETE)

```typescript
const deleteEmployeeMutation = useMutation({
  mutationFn: (id: string) => EmployeeService.deleteEmployee(id),
  onSuccess: () => {
    toast({
      title: 'تم بنجاح',
      description: 'تم حذف الموظف بنجاح',
      variant: 'default'
    });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  },
  onError: (error) => {
    toast({
      title: 'خطأ',
      description: 'حدث خطأ أثناء حذف الموظف',
      variant: 'destructive'
    });
  }
});
```

## الميزات المتقدمة

### 1. التحقق من صحة البيانات

```typescript
const employeeSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب و يجب أن يكون على الأقل حرفين'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب و يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(8, 'رقم الهاتف مطلوب'),
  position: z.string().min(2, 'المنصب مطلوب'),
  department: z.string().min(2, 'القسم مطلوب'),
  hireDate: z.string().min(1, 'تاريخ التوظيف مطلوب'),
  salary: z.number().min(0, 'الراتب يجب أن يكون رقم موجب'),
  nationalId: z.string().min(10, 'رقم الهوية الوطنية مطلوب'),
  birthDate: z.string().min(1, 'تاريخ الميلاد مطلوب'),
  address: z.string().min(5, 'العنوان مطلوب'),
  emergencyContact: z.string().min(8, 'رقم الطوارئ مطلوب'),
  experience: z.number().min(0, 'الخبرة يجب أن تكون رقم موجب'),
  education: z.string().min(2, 'المؤهل العلمي مطلوب'),
  companyId: z.string().min(1, 'الشركة مطلوبة')
});
```

### 2. إدارة الحالة

- **حالات التحميل**: عرض مؤشر تحميل أثناء العمليات
- **إدارة الأخطاء**: عرض رسائل خطأ واضحة
- **التحديث التلقائي**: تحديث البيانات بعد العمليات
- **التنبيهات**: استخدام toast notifications

### 3. البحث والتصفية

```typescript
const filteredEmployees = employees
  .filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.phone.includes(searchQuery);
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    const matchesSalary = (!salaryRange.min || employee.salary >= parseFloat(salaryRange.min)) &&
                         (!salaryRange.max || employee.salary <= parseFloat(salaryRange.max));
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesSalary;
  })
  .sort((a, b) => {
    // منطق الترتيب
  });
```

## كيفية الاستخدام

### 1. إضافة موظف جديد

```typescript
<Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
  <DialogTrigger asChild>
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      إضافة موظف
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <EmployeeForm
      mode="create"
      onSuccess={() => setIsAddEmployeeOpen(false)}
      onCancel={() => setIsAddEmployeeOpen(false)}
    />
  </DialogContent>
</Dialog>
```

### 2. تحديث موظف موجود

```typescript
{editingEmployee && (
  <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <EmployeeForm
        employee={editingEmployee}
        mode="update"
        onSuccess={() => setEditingEmployee(null)}
        onCancel={() => setEditingEmployee(null)}
      />
    </DialogContent>
  </Dialog>
)}
```

### 3. عرض تفاصيل الموظف

```typescript
{viewingEmployee && (
  <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>تفاصيل الموظف</DialogTitle>
        <DialogDescription>
          عرض كافة معلومات الموظف
        </DialogDescription>
      </DialogHeader>
      {/* محتوى التفاصيل */}
    </DialogContent>
  </Dialog>
)}
```

## الملفات المحدثة

1. `client/src/components/employee-form.tsx` - مكون النموذج الجديد
2. `client/src/services/employee.ts` - خدمة الموظفين المحدثة
3. `client/src/pages/employee-management.tsx` - صفحة إدارة الموظفين الجديدة
4. `client/src/components/index.ts` - تصدير المكون الجديد

## الخطوات التالية

1. **اختبار المكونات**: التأكد من عمل جميع العمليات بشكل صحيح
2. **تحسين الأداء**: إضافة pagination للقوائم الكبيرة
3. **إضافة ميزات**: مثل رفع الصور والملفات المرفقة
4. **تحسين UX**: إضافة animations وتحسين التفاعل
5. **التوثيق**: إنشاء دليل المستخدم النهائي

## ملاحظات تقنية

- تم استخدام React Hook Form مع Zod للتحقق من صحة البيانات
- تم استخدام React Query لإدارة حالة الخادم
- تم استخدام Tailwind CSS للتصميم
- تم استخدام Lucide React للأيقونات
- تم استخدام date-fns لتنسيق التواريخ 