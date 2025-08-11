# 📝 دليل JSDoc - HRMS Elite

## 🎯 نظرة عامة

دليل شامل لكتابة توثيق JSDoc في مشروع HRMS Elite. يغطي هذا الدليل أفضل الممارسات وأمثلة عملية لتوثيق الكود.

## 📋 الأنواع الأساسية

### 1. توثيق الملفات

```typescript
/**
 * @fileoverview نظام إدارة الموارد البشرية المتقدم
 * @description يوفر واجهات برمجة شاملة لإدارة الموظفين والشركات والرواتب
 * @author HRMS Elite Team
 * @version 1.0.0
 * @license MIT
 * @since 2025-01-28
 */
```

### 2. توثيق الدوال

```typescript
/**
 * حساب الراتب الإجمالي للموظف
 * @description يحسب الراتب الإجمالي بناءً على الراتب الأساسي والبدلات والخصومات
 * @param {number} basicSalary - الراتب الأساسي
 * @param {number} allowances - إجمالي البدلات
 * @param {number} deductions - إجمالي الخصومات
 * @returns {number} الراتب الإجمالي بعد الحسابات
 * @throws {Error} إذا كان الراتب الأساسي سالب
 * @example
 * ```typescript
 * const totalSalary = calculateTotalSalary(3000, 500, 200);
 * console.log(totalSalary); // 3300
 * ```
 * @since 1.0.0
 */
function calculateTotalSalary(
  basicSalary: number,
  allowances: number,
  deductions: number
): number {
  if (basicSalary < 0) {
    throw new Error('الراتب الأساسي لا يمكن أن يكون سالب');
  }
  return basicSalary + allowances - deductions;
}
```

### 3. توثيق الواجهات (Interfaces)

```typescript
/**
 * واجهة بيانات الموظف
 * @description تحدد هيكل بيانات الموظف في النظام
 * @interface Employee
 * @since 1.0.0
 */
interface Employee {
  /** المعرف الفريد للموظف */
  id: string;
  
  /** الاسم الكامل للموظف */
  fullName: string;
  
  /** الموقع الوظيفي */
  position: string;
  
  /** القسم الذي يعمل فيه */
  department: string;
  
  /** الراتب الأساسي */
  salary: number;
  
  /** حالة الموظف */
  status: 'active' | 'inactive' | 'archived';
  
  /** تاريخ التعيين */
  hireDate: string;
  
  /** معرف الشركة */
  companyId: string;
}
```

### 4. توثيق الفئات (Classes)

```typescript
/**
 * مدير الموظفين
 * @description يوفر وظائف إدارة الموظفين في النظام
 * @class EmployeeManager
 * @since 1.0.0
 */
class EmployeeManager {
  private db: Database;
  
  /**
   * إنشاء مدير موظفين جديد
   * @param {Database} database - قاعدة البيانات
   * @constructor
   */
  constructor(database: Database) {
    this.db = database;
  }
  
  /**
   * إضافة موظف جديد
   * @description يضيف موظف جديد إلى قاعدة البيانات
   * @param {Omit<Employee, 'id'>} employeeData - بيانات الموظف
   * @returns {Promise<Employee>} الموظف المضاف
   * @throws {ValidationError} إذا كانت البيانات غير صحيحة
   * @example
   * ```typescript
   * const manager = new EmployeeManager(db);
   * const employee = await manager.addEmployee({
   *   fullName: 'أحمد محمد',
   *   position: 'مهندس',
   *   salary: 3000
   * });
   * ```
   */
  async addEmployee(employeeData: Omit<Employee, 'id'>): Promise<Employee> {
    // التنفيذ
  }
}
```

## 🔧 أنواع البيانات المتقدمة

### 1. الأنواع المركبة

```typescript
/**
 * خيارات البحث المتقدم
 * @typedef {Object} SearchOptions
 * @property {string} [query] - نص البحث
 * @property {string[]} [departments] - الأقسام المطلوبة
 * @property {number} [minSalary] - الحد الأدنى للراتب
 * @property {number} [maxSalary] - الحد الأقصى للراتب
 * @property {string} [status] - حالة الموظف
 * @property {number} [limit] - عدد النتائج المطلوبة
 * @property {number} [offset] - إزاحة النتائج
 */
type SearchOptions = {
  query?: string;
  departments?: string[];
  minSalary?: number;
  maxSalary?: number;
  status?: string;
  limit?: number;
  offset?: number;
};
```

### 2. الأنواع المحددة

```typescript
/**
 * أنواع الإجازات المتاحة
 * @typedef {'annual' | 'sick' | 'emergency' | 'maternity'} LeaveType
 */
type LeaveType = 'annual' | 'sick' | 'emergency' | 'maternity';

/**
 * حالات طلب الإجازة
 * @typedef {'pending' | 'approved' | 'rejected'} LeaveStatus
 */
type LeaveStatus = 'pending' | 'approved' | 'rejected';
```

## 📊 توثيق API Endpoints

### 1. Express Routes

```typescript
/**
 * الحصول على جميع الموظفين
 * @description يسترجع قائمة بجميع الموظفين مع إمكانية التصفية والترتيب
 * @route GET /api/employees
 * @param {Request} req - طلب Express
 * @param {Response} res - استجابة Express
 * @param {NextFunction} next - الدالة التالية
 * @returns {Promise<void>}
 * 
 * @query {string} [department] - تصفية حسب القسم
 * @query {string} [status] - تصفية حسب الحالة
 * @query {number} [limit] - عدد النتائج (الافتراضي: 50)
 * @query {number} [offset] - إزاحة النتائج (الافتراضي: 0)
 * @query {string} [sortBy] - حقل الترتيب (الافتراضي: 'fullName')
 * @query {'asc' | 'desc'} [sortOrder] - اتجاه الترتيب (الافتراضي: 'asc')
 * 
 * @example
 * ```http
 * GET /api/employees?department=IT&limit=10&sortBy=salary&sortOrder=desc
 * ```
 * 
 * @response {200} success - نجح الطلب
 * @response {400} badRequest - بيانات غير صحيحة
 * @response {401} unauthorized - غير مصرح
 * @response {500} serverError - خطأ في الخادم
 * 
 * @since 1.0.0
 */
app.get('/api/employees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department, status, limit = 50, offset = 0, sortBy = 'fullName', sortOrder = 'asc' } = req.query;
    
    // التنفيذ
    
    res.json({
      success: true,
      data: employees,
      pagination: {
        total: totalCount,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    next(error);
  }
});
```

### 2. Middleware Functions

```typescript
/**
 * وسيط التحقق من الصلاحيات
 * @description يتحقق من صلاحيات المستخدم للوصول إلى الموارد
 * @param {string[]} requiredRoles - الأدوار المطلوبة
 * @returns {RequestHandler} وسيط Express
 * 
 * @example
 * ```typescript
 * app.get('/api/admin/users', 
 *   requireRole(['admin', 'manager']), 
 *   getUsers
 * );
 * ```
 * 
 * @since 1.0.0
 */
function requireRole(requiredRoles: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول'
      });
    }
    
    next();
  };
}
```

## 🧪 توثيق الاختبارات

### 1. Unit Tests

```typescript
/**
 * اختبارات حاسبة الرواتب
 * @description اختبارات شاملة لحاسبة الرواتب
 * @group Salary
 * @since 1.0.0
 */
describe('Salary Calculator', () => {
  /**
   * اختبار حساب الراتب الأساسي
   * @description يتحقق من صحة حساب الراتب الإجمالي
   * @test
   */
  it('should calculate total salary correctly', () => {
    const basicSalary = 3000;
    const allowances = 500;
    const deductions = 200;
    
    const result = calculateTotalSalary(basicSalary, allowances, deductions);
    
    expect(result).toBe(3300);
  });
  
  /**
   * اختبار معالجة الراتب السالب
   * @description يتحقق من رفض الراتب السالب
   * @test
   */
  it('should throw error for negative salary', () => {
    expect(() => {
      calculateTotalSalary(-1000, 0, 0);
    }).toThrow('الراتب الأساسي لا يمكن أن يكون سالب');
  });
});
```

### 2. Integration Tests

```typescript
/**
 * اختبارات API الموظفين
 * @description اختبارات تكامل لـ API الموظفين
 * @group API
 * @group Integration
 * @since 1.0.0
 */
describe('Employee API Integration', () => {
  /**
   * اختبار إنشاء موظف جديد
   * @description يتحقق من إنشاء موظف جديد بنجاح
   * @test
   */
  it('should create new employee successfully', async () => {
    const employeeData = {
      fullName: 'أحمد محمد علي',
      position: 'مهندس برمجيات',
      department: 'تكنولوجيا المعلومات',
      salary: 3500,
      companyId: 'company-1'
    };
    
    const response = await request(app)
      .post('/api/employees')
      .send(employeeData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.fullName).toBe(employeeData.fullName);
  });
});
```

## 🔧 توثيق الأدوات المساعدة

### 1. Utility Functions

```typescript
/**
 * تنسيق التاريخ العربي
 * @description يحول التاريخ إلى تنسيق عربي مقروء
 * @param {Date | string} date - التاريخ المراد تنسيقه
 * @param {string} [locale='ar-SA'] - اللغة المطلوبة
 * @returns {string} التاريخ المنسق
 * 
 * @example
 * ```typescript
 * const formattedDate = formatArabicDate(new Date());
 * console.log(formattedDate); // "٢٨ يناير ٢٠٢٥"
 * ```
 * 
 * @since 1.0.0
 */
function formatArabicDate(date: Date | string, locale: string = 'ar-SA'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
```

### 2. Validation Functions

```typescript
/**
 * التحقق من صحة البريد الإلكتروني
 * @description يتحقق من صحة تنسيق البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني المراد التحقق منه
 * @returns {boolean} true إذا كان البريد صحيح
 * 
 * @example
 * ```typescript
 * const isValid = validateEmail('user@example.com');
 * console.log(isValid); // true
 * ```
 * 
 * @since 1.0.0
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

## 📝 أفضل الممارسات

### 1. التناسق في التوثيق

```typescript
/**
 * ✅ جيد - توثيق شامل ومتناسق
 * @description وصف واضح ومفصل
 * @param {Type} paramName - وصف المعامل
 * @returns {Type} وصف القيمة المرجعة
 * @throws {ErrorType} وصف الخطأ
 * @example مثال عملي
 */

/**
 * ❌ سيء - توثيق غير مكتمل
 * @param param
 * @returns
 */
```

### 2. استخدام العلامات المناسبة

```typescript
/**
 * @deprecated منذ الإصدار 2.0.0، استخدم calculateSalaryV2 بدلاً من ذلك
 * @see {@link calculateSalaryV2}
 */
function calculateSalary(): number {
  // التنفيذ القديم
}

/**
 * @since 2.0.0
 * @see {@link calculateSalary} للتنفيذ القديم
 */
function calculateSalaryV2(): number {
  // التنفيذ الجديد
}
```

### 3. توثيق الأخطاء

```typescript
/**
 * @throws {ValidationError} عندما تكون البيانات غير صحيحة
 * @throws {DatabaseError} عند فشل الاتصال بقاعدة البيانات
 * @throws {AuthenticationError} عند فشل المصادقة
 */
async function createEmployee(data: EmployeeData): Promise<Employee> {
  // التنفيذ
}
```

## 🛠️ أدوات التوثيق

### 1. TypeDoc

```json
// typedoc.json
{
  "entryPoints": ["./src/index.ts"],
  "out": "./docs/api",
  "theme": "default",
  "name": "HRMS Elite API Documentation",
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeExternals": true,
  "includeVersion": true,
  "categorizeByGroup": true,
  "categoryOrder": ["Core", "API", "Utils", "*"]
}
```

### 2. ESLint Rules

```json
// .eslintrc.json
{
  "rules": {
    "jsdoc/require-jsdoc": [
      "error",
      {
        "publicOnly": true,
        "require": {
          "FunctionDeclaration": true,
          "MethodDefinition": true,
          "ClassDeclaration": true
        }
      }
    ],
    "jsdoc/require-param-description": "error",
    "jsdoc/require-returns-description": "error",
    "jsdoc/require-example": "warn"
  }
}
```

## 📚 أمثلة عملية

### 1. Service Class

```typescript
/**
 * خدمة إدارة الموظفين
 * @description يوفر وظائف إدارة الموظفين مع قاعدة البيانات
 * @class EmployeeService
 * @since 1.0.0
 */
export class EmployeeService {
  private db: Database;
  private logger: Logger;
  
  constructor(database: Database, logger: Logger) {
    this.db = database;
    this.logger = logger;
  }
  
  /**
   * البحث عن الموظفين
   * @description يبحث عن الموظفين حسب المعايير المحددة
   * @param {SearchOptions} options - خيارات البحث
   * @returns {Promise<Employee[]>} قائمة الموظفين
   * 
   * @example
   * ```typescript
   * const service = new EmployeeService(db, logger);
   * const employees = await service.searchEmployees({
   *   query: 'أحمد',
   *   department: 'IT',
   *   limit: 10
   * });
   * ```
   */
  async searchEmployees(options: SearchOptions): Promise<Employee[]> {
    this.logger.info('Searching employees', { options });
    
    try {
      // التنفيذ
      return employees;
    } catch (error) {
      this.logger.error('Failed to search employees', { error, options });
      throw error;
    }
  }
}
```

### 2. React Component

```typescript
/**
 * مكون بطاقة الموظف
 * @description يعرض معلومات الموظف في بطاقة منسقة
 * @component EmployeeCard
 * @since 1.0.0
 */
interface EmployeeCardProps {
  /** بيانات الموظف */
  employee: Employee;
  /** دالة التعديل */
  onEdit?: (employee: Employee) => void;
  /** دالة الحذف */
  onDelete?: (employeeId: string) => void;
  /** هل يمكن التعديل */
  editable?: boolean;
}

/**
 * مكون بطاقة الموظف
 * @param {EmployeeCardProps} props - خصائص المكون
 * @returns {JSX.Element} مكون React
 * 
 * @example
 * ```tsx
 * <EmployeeCard
 *   employee={employee}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   editable={true}
 * />
 * ```
 */
export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
  editable = false
}) => {
  // التنفيذ
};
```

---

**HRMS Elite JSDoc Guide** - دليل شامل لتوثيق الكود 🚀 