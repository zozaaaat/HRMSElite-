# 📚 JSDoc Comprehensive Documentation - HRMS Elite

## 🌐 نظرة عامة

هذا الدليل يوفر توثيق JSDoc شامل لجميع الدوال المهمة في نظام HRMS Elite، مع أمثلة تفصيلية وأفضل الممارسات.

## 🚀 إعداد JSDoc

### تثبيت JSDoc
```bash
npm install --save-dev jsdoc
```

### إعداد JSDoc
```json
// jsdoc.json
{
  "tags": {
    "allowUnknownTags": true
  },
  "source": {
    "include": [
      "client/src",
      "server",
      "shared"
    ],
    "includePattern": "\\.(js|ts|tsx)$",
    "excludePattern": "(node_modules/|docs/)"
  },
  "plugins": [
    "plugins/markdown"
  ],
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  },
  "opts": {
    "destination": "./docs/jsdoc",
    "recurse": true,
    "readme": "./docs/README.md"
  }
}
```

### تشغيل JSDoc
```bash
# إنشاء التوثيق
npm run jsdoc

# تشغيل خادم التوثيق
npm run jsdoc:serve
```

## 📊 نماذج التوثيق

### 1. دوال إدارة الشركات

#### إنشاء شركة جديدة
```typescript
/**
 * إنشاء شركة جديدة في النظام
 * @async
 * @function createCompany
 * @param {Object} companyData - بيانات الشركة
 * @param {string} companyData.name - اسم الشركة
 * @param {string} companyData.commercialFileName - الاسم التجاري
 * @param {string} companyData.department - قسم الشركة
 * @param {string} companyData.classification - تصنيف الشركة
 * @param {string} companyData.industry - الصناعة
 * @param {string} companyData.establishmentDate - تاريخ التأسيس
 * @param {string} [companyData.status='active'] - حالة الشركة
 * @returns {Promise<Company>} الشركة المنشأة
 * @throws {ValidationError} عند وجود أخطاء في البيانات
 * @throws {DatabaseError} عند فشل حفظ البيانات
 * 
 * @example
 * ```typescript
 * const newCompany = await createCompany({
 *   name: "شركة الاتحاد الخليجي",
 *   commercialFileName: "الاتحاد الخليجي للتجارة",
 *   department: "التجارة العامة",
 *   classification: "شركة ذات مسؤولية محدودة",
 *   industry: "التجارة",
 *   establishmentDate: "2020-01-15"
 * });
 * console.log(newCompany.id); // "company-1"
 * ```
 * 
 * @since 1.0.0
 * @author فريق التطوير
 * @category Companies
 */
async function createCompany(companyData: CreateCompanyData): Promise<Company> {
  // التنفيذ
}
```

#### تحديث بيانات شركة
```typescript
/**
 * تحديث بيانات شركة موجودة
 * @async
 * @function updateCompany
 * @param {string} companyId - معرف الشركة
 * @param {Partial<Company>} updateData - البيانات المحدثة
 * @returns {Promise<Company>} الشركة المحدثة
 * @throws {NotFoundError} عند عدم وجود الشركة
 * @throws {ValidationError} عند وجود أخطاء في البيانات
 * 
 * @example
 * ```typescript
 * const updatedCompany = await updateCompany("company-1", {
 *   name: "شركة الاتحاد الخليجي المحدثة",
 *   status: "inactive"
 * });
 * ```
 * 
 * @since 1.0.0
 * @category Companies
 */
async function updateCompany(companyId: string, updateData: Partial<Company>): Promise<Company> {
  // التنفيذ
}
```

#### حذف شركة
```typescript
/**
 * حذف شركة من النظام
 * @async
 * @function deleteCompany
 * @param {string} companyId - معرف الشركة
 * @returns {Promise<boolean>} true إذا تم الحذف بنجاح
 * @throws {NotFoundError} عند عدم وجود الشركة
 * @throws {BusinessLogicError} عند وجود موظفين في الشركة
 * 
 * @example
 * ```typescript
 * const deleted = await deleteCompany("company-1");
 * if (deleted) {
 *   console.log("تم حذف الشركة بنجاح");
 * }
 * ```
 * 
 * @since 1.0.0
 * @category Companies
 */
async function deleteCompany(companyId: string): Promise<boolean> {
  // التنفيذ
}
```

### 2. دوال إدارة الموظفين

#### إنشاء موظف جديد
```typescript
/**
 * إنشاء موظف جديد في النظام
 * @async
 * @function createEmployee
 * @param {Object} employeeData - بيانات الموظف
 * @param {string} employeeData.fullName - الاسم الكامل
 * @param {string} employeeData.position - الموقع الوظيفي
 * @param {string} employeeData.department - القسم
 * @param {number} employeeData.salary - الراتب الأساسي
 * @param {string} employeeData.companyId - معرف الشركة
 * @param {string} [employeeData.hireDate] - تاريخ التعيين
 * @param {string} [employeeData.status='active'] - حالة الموظف
 * @returns {Promise<Employee>} الموظف المنشأ
 * @throws {ValidationError} عند وجود أخطاء في البيانات
 * @throws {CompanyNotFoundError} عند عدم وجود الشركة
 * 
 * @example
 * ```typescript
 * const newEmployee = await createEmployee({
 *   fullName: "أحمد محمد علي",
 *   position: "مهندس برمجيات",
 *   department: "تكنولوجيا المعلومات",
 *   salary: 3500,
 *   companyId: "company-1",
 *   hireDate: "2023-01-15"
 * });
 * ```
 * 
 * @since 1.0.0
 * @category Employees
 */
async function createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
  // التنفيذ
}
```

#### حساب الراتب الإجمالي
```typescript
/**
 * حساب الراتب الإجمالي للموظف
 * @function calculateTotalSalary
 * @param {number} basicSalary - الراتب الأساسي
 * @param {number} allowances - البدلات
 * @param {number} deductions - الخصومات
 * @param {number} [overtimeHours=0] - ساعات العمل الإضافي
 * @param {number} [overtimeRate=1.5] - معدل العمل الإضافي
 * @returns {number} الراتب الإجمالي
 * 
 * @example
 * ```typescript
 * const totalSalary = calculateTotalSalary(3000, 500, 200, 10, 1.5);
 * console.log(totalSalary); // 3450
 * ```
 * 
 * @since 1.0.0
 * @category Payroll
 */
function calculateTotalSalary(
  basicSalary: number,
  allowances: number,
  deductions: number,
  overtimeHours: number = 0,
  overtimeRate: number = 1.5
): number {
  const overtimePay = overtimeHours * (basicSalary / 160) * overtimeRate;
  return basicSalary + allowances + overtimePay - deductions;
}
```

### 3. دوال إدارة الإجازات

#### طلب إجازة جديدة
```typescript
/**
 * تقديم طلب إجازة جديدة
 * @async
 * @function requestLeave
 * @param {string} employeeId - معرف الموظف
 * @param {Object} leaveData - بيانات الإجازة
 * @param {LeaveType} leaveData.type - نوع الإجازة
 * @param {string} leaveData.startDate - تاريخ بداية الإجازة
 * @param {string} leaveData.endDate - تاريخ نهاية الإجازة
 * @param {string} leaveData.reason - سبب الإجازة
 * @returns {Promise<Leave>} طلب الإجازة المنشأ
 * @throws {InsufficientLeaveBalanceError} عند عدم كفاية رصيد الإجازات
 * @throws {InvalidDateRangeError} عند عدم صحة نطاق التواريخ
 * 
 * @example
 * ```typescript
 * const leaveRequest = await requestLeave("emp-1", {
 *   type: "annual",
 *   startDate: "2025-02-10",
 *   endDate: "2025-02-12",
 *   reason: "إجازة شخصية"
 * });
 * ```
 * 
 * @since 1.0.0
 * @category Leaves
 */
async function requestLeave(employeeId: string, leaveData: CreateLeaveData): Promise<Leave> {
  // التنفيذ
}
```

#### حساب رصيد الإجازات
```typescript
/**
 * حساب رصيد الإجازات المتبقي للموظف
 * @async
 * @function calculateLeaveBalance
 * @param {string} employeeId - معرف الموظف
 * @param {LeaveType} leaveType - نوع الإجازة
 * @param {number} [year=new Date().getFullYear()] - السنة
 * @returns {Promise<LeaveBalance>} رصيد الإجازات
 * 
 * @example
 * ```typescript
 * const balance = await calculateLeaveBalance("emp-1", "annual", 2025);
 * console.log(balance.remaining); // 15
 * console.log(balance.used); // 5
 * ```
 * 
 * @since 1.0.0
 * @category Leaves
 */
async function calculateLeaveBalance(
  employeeId: string,
  leaveType: LeaveType,
  year: number = new Date().getFullYear()
): Promise<LeaveBalance> {
  // التنفيذ
}
```

### 4. دوال إدارة الحضور

#### تسجيل دخول
```typescript
/**
 * تسجيل دخول موظف للعمل
 * @async
 * @function checkIn
 * @param {string} employeeId - معرف الموظف
 * @param {Object} [options] - خيارات إضافية
 * @param {string} [options.location] - موقع تسجيل الدخول
 * @param {string} [options.device] - الجهاز المستخدم
 * @returns {Promise<AttendanceRecord>} سجل الحضور
 * @throws {AlreadyCheckedInError} عند تسجيل الدخول مسبقاً
 * @throws {EmployeeNotFoundError} عند عدم وجود الموظف
 * 
 * @example
 * ```typescript
 * const attendance = await checkIn("emp-1", {
 *   location: "المكتب الرئيسي",
 *   device: "نظام الحضور"
 * });
 * console.log(attendance.checkInTime); // "2025-01-28T08:00:00.000Z"
 * ```
 * 
 * @since 1.0.0
 * @category Attendance
 */
async function checkIn(
  employeeId: string,
  options: CheckInOptions = {}
): Promise<AttendanceRecord> {
  // التنفيذ
}
```

#### تسجيل خروج
```typescript
/**
 * تسجيل خروج موظف من العمل
 * @async
 * @function checkOut
 * @param {string} employeeId - معرف الموظف
 * @param {Object} [options] - خيارات إضافية
 * @param {string} [options.location] - موقع تسجيل الخروج
 * @returns {Promise<AttendanceRecord>} سجل الحضور المحدث
 * @throws {NotCheckedInError} عند عدم تسجيل الدخول
 * @throws {EmployeeNotFoundError} عند عدم وجود الموظف
 * 
 * @example
 * ```typescript
 * const attendance = await checkOut("emp-1", {
 *   location: "المكتب الرئيسي"
 * });
 * console.log(attendance.totalHours); // 8.5
 * ```
 * 
 * @since 1.0.0
 * @category Attendance
 */
async function checkOut(
  employeeId: string,
  options: CheckOutOptions = {}
): Promise<AttendanceRecord> {
  // التنفيذ
}
```

### 5. دوال إدارة المستندات

#### رفع مستند
```typescript
/**
 * رفع مستند جديد إلى النظام
 * @async
 * @function uploadDocument
 * @param {Object} documentData - بيانات المستند
 * @param {Buffer} documentData.file - ملف المستند
 * @param {string} documentData.name - اسم المستند
 * @param {DocumentType} documentData.type - نوع المستند
 * @param {string} documentData.companyId - معرف الشركة
 * @param {string} [documentData.expiryDate] - تاريخ انتهاء الصلاحية
 * @param {string} [documentData.description] - وصف المستند
 * @returns {Promise<Document>} المستند المرفوع
 * @throws {FileTooLargeError} عند كبر حجم الملف
 * @throws {InvalidFileTypeError} عند عدم صحة نوع الملف
 * 
 * @example
 * ```typescript
 * const document = await uploadDocument({
 *   file: fileBuffer,
 *   name: "الترخيص التجاري",
 *   type: "license",
 *   companyId: "company-1",
 *   expiryDate: "2026-01-15",
 *   description: "ترخيص تجاري للشركة"
 * });
 * ```
 * 
 * @since 1.0.0
 * @category Documents
 */
async function uploadDocument(documentData: UploadDocumentData): Promise<Document> {
  // التنفيذ
}
```

#### التحقق من صلاحية المستندات
```typescript
/**
 * التحقق من صلاحية المستندات
 * @async
 * @function checkDocumentExpiry
 * @param {string} companyId - معرف الشركة
 * @param {number} [daysThreshold=30] - عدد الأيام للتنبيه
 * @returns {Promise<ExpiringDocument[]>} المستندات المنتهية الصلاحية قريباً
 * 
 * @example
 * ```typescript
 * const expiringDocs = await checkDocumentExpiry("company-1", 30);
 * expiringDocs.forEach(doc => {
 *   console.log(`${doc.name} تنتهي صلاحيته في ${doc.expiryDate}`);
 * });
 * ```
 * 
 * @since 1.0.0
 * @category Documents
 */
async function checkDocumentExpiry(
  companyId: string,
  daysThreshold: number = 30
): Promise<ExpiringDocument[]> {
  // التنفيذ
}
```

### 6. دوال الذكاء الاصطناعي

#### تحليل أداء الموظفين
```typescript
/**
 * تحليل أداء الموظفين باستخدام الذكاء الاصطناعي
 * @async
 * @function analyzeEmployeePerformance
 * @param {string} companyId - معرف الشركة
 * @param {Object} analysisParams - معاملات التحليل
 * @param {string} analysisParams.department - القسم (اختياري)
 * @param {DateRange} analysisParams.dateRange - نطاق التاريخ
 * @param {string[]} analysisParams.metrics - المقاييس المطلوبة
 * @returns {Promise<PerformanceAnalysis>} نتائج التحليل
 * 
 * @example
 * ```typescript
 * const analysis = await analyzeEmployeePerformance("company-1", {
 *   department: "تكنولوجيا المعلومات",
 *   dateRange: {
 *     start: "2025-01-01",
 *     end: "2025-01-31"
 *   },
 *   metrics: ["attendance", "productivity", "satisfaction"]
 * });
 * 
 * console.log(analysis.topPerformers);
 * console.log(analysis.recommendations);
 * ```
 * 
 * @since 1.0.0
 * @category AI
 */
async function analyzeEmployeePerformance(
  companyId: string,
  analysisParams: PerformanceAnalysisParams
): Promise<PerformanceAnalysis> {
  // التنفيذ
}
```

#### إنشاء تقرير ذكي
```typescript
/**
 * إنشاء تقرير ذكي باستخدام الذكاء الاصطناعي
 * @async
 * @function generateSmartReport
 * @param {ReportType} reportType - نوع التقرير
 * @param {Object} reportParams - معاملات التقرير
 * @param {string} reportParams.companyId - معرف الشركة
 * @param {string} [reportParams.format='pdf'] - تنسيق التقرير
 * @returns {Promise<SmartReport>} التقرير المولد
 * 
 * @example
 * ```typescript
 * const report = await generateSmartReport("payroll_summary", {
 *   companyId: "company-1",
 *   format: "pdf"
 * });
 * 
 * console.log(report.downloadUrl);
 * console.log(report.insights);
 * ```
 * 
 * @since 1.0.0
 * @category AI
 */
async function generateSmartReport(
  reportType: ReportType,
  reportParams: SmartReportParams
): Promise<SmartReport> {
  // التنفيذ
}
```

### 7. دوال المصادقة والأمان

#### التحقق من الصلاحيات
```typescript
/**
 * التحقق من صلاحيات المستخدم
 * @async
 * @function checkUserPermissions
 * @param {string} userId - معرف المستخدم
 * @param {string} resource - المورد المطلوب
 * @param {PermissionAction} action - الإجراء المطلوب
 * @returns {Promise<boolean>} true إذا كان لديه الصلاحية
 * 
 * @example
 * ```typescript
 * const canEdit = await checkUserPermissions("user-1", "employees", "edit");
 * if (canEdit) {
 *   // السماح بالتعديل
 * }
 * ```
 * 
 * @since 1.0.0
 * @category Security
 */
async function checkUserPermissions(
  userId: string,
  resource: string,
  action: PermissionAction
): Promise<boolean> {
  // التنفيذ
}
```

#### تشفير كلمة المرور
```typescript
/**
 * تشفير كلمة المرور باستخدام bcrypt
 * @async
 * @function hashPassword
 * @param {string} password - كلمة المرور الأصلية
 * @param {number} [saltRounds=12] - عدد جولات التشفير
 * @returns {Promise<string>} كلمة المرور المشفرة
 * 
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword("myPassword123");
 * // حفظ كلمة المرور المشفرة في قاعدة البيانات
 * ```
 * 
 * @since 1.0.0
 * @category Security
 */
async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  // التنفيذ
}
```

### 8. دوال التحقق من البيانات

#### التحقق من صحة البريد الإلكتروني
```typescript
/**
 * التحقق من صحة تنسيق البريد الإلكتروني
 * @function validateEmail
 * @param {string} email - البريد الإلكتروني للتحقق
 * @returns {boolean} true إذا كان التنسيق صحيح
 * 
 * @example
 * ```typescript
 * const isValid = validateEmail("user@example.com");
 * console.log(isValid); // true
 * 
 * const isInvalid = validateEmail("invalid-email");
 * console.log(isInvalid); // false
 * ```
 * 
 * @since 1.0.0
 * @category Validation
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

#### التحقق من صحة رقم الهاتف
```typescript
/**
 * التحقق من صحة رقم الهاتف السعودي
 * @function validatePhoneNumber
 * @param {string} phoneNumber - رقم الهاتف للتحقق
 * @returns {boolean} true إذا كان الرقم صحيح
 * 
 * @example
 * ```typescript
 * const isValid = validatePhoneNumber("+966501234567");
 * console.log(isValid); // true
 * 
 * const isInvalid = validatePhoneNumber("123456");
 * console.log(isInvalid); // false
 * ```
 * 
 * @since 1.0.0
 * @category Validation
 */
function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+966[0-9]{9}$/;
  return phoneRegex.test(phoneNumber);
}
```

### 9. دوال المساعدة

#### تنسيق التاريخ
```typescript
/**
 * تنسيق التاريخ باللغة العربية
 * @function formatDate
 * @param {Date | string} date - التاريخ للتنسيق
 * @param {string} [format='full'] - نوع التنسيق
 * @returns {string} التاريخ المنسق
 * 
 * @example
 * ```typescript
 * const formatted = formatDate("2025-01-28", "full");
 * console.log(formatted); // "28 يناير 2025"
 * 
 * const short = formatDate("2025-01-28", "short");
 * console.log(short); // "28/01/2025"
 * ```
 * 
 * @since 1.0.0
 * @category Utils
 */
function formatDate(date: Date | string, format: 'full' | 'short' = 'full'): string {
  // التنفيذ
}
```

#### تنسيق العملة
```typescript
/**
 * تنسيق العملة بالريال السعودي
 * @function formatCurrency
 * @param {number} amount - المبلغ للتنسيق
 * @param {string} [locale='ar-SA'] - اللغة والمنطقة
 * @returns {string} المبلغ المنسق
 * 
 * @example
 * ```typescript
 * const formatted = formatCurrency(3500);
 * console.log(formatted); // "٣٬٥٠٠٫٠٠ ر.س"
 * ```
 * 
 * @since 1.0.0
 * @category Utils
 */
function formatCurrency(amount: number, locale: string = 'ar-SA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR'
  }).format(amount);
}
```

## 📝 أفضل الممارسات لـ JSDoc

### 1. تنسيق التعليقات
```typescript
/**
 * وصف مختصر للدالة
 * 
 * وصف تفصيلي للدالة وما تقوم به، يمكن أن يمتد لعدة أسطر
 * لتوضيح جميع التفاصيل المهمة.
 * 
 * @param {string} param1 - وصف المعامل الأول
 * @param {number} param2 - وصف المعامل الثاني
 * @returns {Promise<ResultType>} وصف القيمة المُرجعة
 * @throws {ErrorType} وصف الخطأ الذي قد يحدث
 * 
 * @example
 * ```typescript
 * // مثال على الاستخدام
 * const result = await myFunction("value", 42);
 * console.log(result);
 * ```
 * 
 * @since 1.0.0
 * @author اسم المطور
 * @category Category
 */
```

### 2. توثيق الأنواع المعقدة
```typescript
/**
 * @typedef {Object} UserData
 * @property {string} id - معرف المستخدم الفريد
 * @property {string} name - اسم المستخدم
 * @property {string} email - البريد الإلكتروني
 * @property {string[]} roles - الأدوار المخصصة للمستخدم
 */

/**
 * إنشاء مستخدم جديد
 * @param {UserData} userData - بيانات المستخدم
 * @returns {Promise<User>} المستخدم المنشأ
 */
async function createUser(userData: UserData): Promise<User> {
  // التنفيذ
}
```

### 3. توثيق الأخطاء
```typescript
/**
 * @typedef {Error} ValidationError
 * @property {string} message - رسالة الخطأ
 * @property {Object} details - تفاصيل الأخطاء
 * @property {string} field - الحقل الذي حدث فيه الخطأ
 */

/**
 * التحقق من صحة البيانات
 * @throws {ValidationError} عند وجود أخطاء في البيانات
 */
function validateData(data: any): void {
  if (!data.name) {
    throw new ValidationError("الاسم مطلوب", { field: "name" });
  }
}
```

## 🔧 إعدادات متقدمة

### 1. إعداد TypeScript مع JSDoc
```json
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 2. إعداد ESLint مع JSDoc
```json
// .eslintrc.json
{
  "plugins": [
    "jsdoc"
  ],
  "extends": [
    "plugin:jsdoc/recommended"
  ],
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
    "jsdoc/require-returns-description": "error"
  }
}
```

### 3. إعداد Prettier مع JSDoc
```json
// .prettierrc
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid",
  "proseWrap": "preserve"
}
```

## 📚 الموارد الإضافية

### روابط مفيدة
- [JSDoc Documentation](https://jsdoc.app/)
- [TypeScript JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [ESLint JSDoc Plugin](https://github.com/gajus/eslint-plugin-jsdoc)

### أدوات مفيدة
- [JSDoc Generator](https://github.com/jsdoc/jsdoc)
- [TypeDoc](https://typedoc.org/) - بديل لـ JSDoc مع دعم TypeScript
- [VSCode JSDoc Extension](https://marketplace.visualstudio.com/items?itemName=steoates.autoimport)

---

**HRMS Elite JSDoc Comprehensive Documentation** - توثيق شامل للدوال المهمة 🚀 