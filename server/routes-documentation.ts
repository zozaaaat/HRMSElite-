/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentication and authorization endpoints
 *   - name: Companies
 *     description: Company management endpoints
 *   - name: Employees
 *     description: Employee management endpoints
 *   - name: Attendance
 *     description: Attendance tracking endpoints
 *   - name: Leaves
 *     description: Leave management endpoints
 *   - name: Payroll
 *     description: Payroll management endpoints
 *   - name: Licenses
 *     description: License management endpoints
 *   - name: Documents
 *     description: Document management endpoints
 *   - name: Notifications
 *     description: Notification management endpoints
 *   - name: AI Analytics
 *     description: AI-powered analytics endpoints
 *   - name: System
 *     description: System health and monitoring endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     description: تسجيل دخول المستخدم إلى النظام
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *               companyId:
 *                 type: string
 *                 example: "company-1"
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: بيانات الدخول غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: تسجيل الخروج
 *     description: تسجيل خروج المستخدم من النظام
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: تم تسجيل الخروج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */

/**
 * @swagger
 * /api/auth/current-user:
 *   get:
 *     summary: المستخدم الحالي
 *     description: الحصول على معلومات المستخدم الحالي
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: معلومات المستخدم
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: غير مسجل دخول
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: قائمة الشركات
 *     description: الحصول على قائمة جميع الشركات
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: قائمة الشركات
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *   post:
 *     summary: إنشاء شركة جديدة
 *     description: إنشاء شركة جديدة (للمدير العام فقط)
 *     tags: [Companies]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       201:
 *         description: تم إنشاء الشركة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       403:
 *         description: غير مصرح لك بإنشاء شركة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/companies/{companyId}:
 *   get:
 *     summary: تفاصيل الشركة
 *     description: الحصول على تفاصيل شركة محددة
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *     responses:
 *       200:
 *         description: تفاصيل الشركة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: الشركة غير موجودة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/companies/{companyId}/stats:
 *   get:
 *     summary: إحصائيات الشركة
 *     description: الحصول على إحصائيات شركة محددة
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *     responses:
 *       200:
 *         description: إحصائيات الشركة
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEmployees:
 *                   type: integer
 *                   example: 45
 *                 activeEmployees:
 *                   type: integer
 *                   example: 42
 *                 inactiveEmployees:
 *                   type: integer
 *                   example: 3
 *                 totalDepartments:
 *                   type: integer
 *                   example: 8
 *                 presentToday:
 *                   type: integer
 *                   example: 38
 *                 absentToday:
 *                   type: integer
 *                   example: 4
 *                 lateToday:
 *                   type: integer
 *                   example: 3
 *                 pendingLeaves:
 *                   type: integer
 *                   example: 2
 *                 thisMonthHires:
 *                   type: integer
 *                   example: 3
 *                 thisMonthTerminations:
 *                   type: integer
 *                   example: 1
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: قائمة الموظفين
 *     description: الحصول على قائمة جميع الموظفين
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *         description: تضمين الموظفين المؤرشفين
 *         example: false
 *     responses:
 *       200:
 *         description: قائمة الموظفين
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 */

/**
 * @swagger
 * /api/companies/{companyId}/employees:
 *   get:
 *     summary: موظفي الشركة
 *     description: الحصول على قائمة موظفي شركة محددة
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *         description: تضمين الموظفين المؤرشفين
 *         example: false
 *     responses:
 *       200:
 *         description: قائمة موظفي الشركة
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 *   post:
 *     summary: إضافة موظف جديد
 *     description: إضافة موظف جديد إلى الشركة
 *     tags: [Employees]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: تم إضافة الموظف بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 */

/**
 * @swagger
 * /api/employees/{employeeId}:
 *   get:
 *     summary: تفاصيل الموظف
 *     description: الحصول على تفاصيل موظف محدد
 *     tags: [Employees]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الموظف
 *         example: "emp-1"
 *     responses:
 *       200:
 *         description: تفاصيل الموظف
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: الموظف غير موجود
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: تحديث بيانات الموظف
 *     description: تحديث بيانات موظف محدد
 *     tags: [Employees]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الموظف
 *         example: "emp-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: تم تحديث بيانات الموظف بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 */

/**
 * @swagger
 * /api/attendance/today:
 *   get:
 *     summary: حضور اليوم
 *     description: الحصول على بيانات حضور اليوم
 *     tags: [Attendance]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: بيانات حضور اليوم
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2025-01-28"
 *                 totalEmployees:
 *                   type: integer
 *                   example: 125
 *                 present:
 *                   type: integer
 *                   example: 98
 *                 absent:
 *                   type: integer
 *                   example: 22
 *                 late:
 *                   type: integer
 *                   example: 5
 *                 onLeave:
 *                   type: integer
 *                   example: 8
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 */

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: تسجيل الحضور
 *     description: تسجيل حضور الموظف
 *     tags: [Attendance]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: "emp-1"
 *               location:
 *                 type: string
 *                 example: "المكتب الرئيسي"
 *     responses:
 *       200:
 *         description: تم تسجيل الحضور بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 employeeId:
 *                   type: string
 *                   example: "emp-1"
 *                 checkInTime:
 *                   type: string
 *                   format: date-time
 *                 location:
 *                   type: string
 *                   example: "المكتب الرئيسي"
 *                 message:
 *                   type: string
 *                   example: "تم تسجيل الحضور بنجاح"
 */

/**
 * @swagger
 * /api/attendance/checkout:
 *   post:
 *     summary: تسجيل الانصراف
 *     description: تسجيل انصراف الموظف
 *     tags: [Attendance]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: "emp-1"
 *     responses:
 *       200:
 *         description: تم تسجيل الانصراف بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 employeeId:
 *                   type: string
 *                   example: "emp-1"
 *                 checkOutTime:
 *                   type: string
 *                   format: date-time
 *                 totalHours:
 *                   type: string
 *                   example: "8:30"
 *                 message:
 *                   type: string
 *                   example: "تم تسجيل الانصراف بنجاح"
 */

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: قائمة الإجازات
 *     description: الحصول على قائمة الإجازات
 *     tags: [Leaves]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *     responses:
 *       200:
 *         description: قائمة الإجازات
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Leave'
 */

/**
 * @swagger
 * /api/leave-requests:
 *   get:
 *     summary: طلبات الإجازات
 *     description: الحصول على طلبات الإجازات
 *     tags: [Leaves]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *     responses:
 *       200:
 *         description: طلبات الإجازات
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Leave'
 *   post:
 *     summary: تقديم طلب إجازة
 *     description: تقديم طلب إجازة جديد
 *     tags: [Leaves]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Leave'
 *     responses:
 *       201:
 *         description: تم تقديم طلب الإجازة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leave'
 */

/**
 * @swagger
 * /api/leave-balance/{employeeId}:
 *   get:
 *     summary: رصيد الإجازات
 *     description: الحصول على رصيد إجازات موظف محدد
 *     tags: [Leaves]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الموظف
 *         example: "emp-1"
 *     responses:
 *       200:
 *         description: رصيد الإجازات
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employeeId:
 *                   type: string
 *                   example: "emp-1"
 *                 annual:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 30
 *                     used:
 *                       type: integer
 *                       example: 8
 *                     remaining:
 *                       type: integer
 *                       example: 22
 *                 sick:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     used:
 *                       type: integer
 *                       example: 3
 *                     remaining:
 *                       type: integer
 *                       example: 12
 *                 emergency:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 7
 *                     used:
 *                       type: integer
 *                       example: 1
 *                     remaining:
 *                       type: integer
 *                       example: 6
 */

/**
 * @swagger
 * /api/payroll:
 *   get:
 *     summary: بيانات الرواتب
 *     description: الحصول على بيانات الرواتب
 *     tags: [Payroll]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *     responses:
 *       200:
 *         description: بيانات الرواتب
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payroll'
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: الإشعارات
 *     description: الحصول على قائمة الإشعارات
 *     tags: [Notifications]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: قائمة الإشعارات
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: تحديد الإشعار كمقروء
 *     description: تحديد إشعار محدد كمقروء
 *     tags: [Notifications]
 *     security:
 *       - sessionAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الإشعار
 *         example: "1"
 *     responses:
 *       200:
 *         description: تم تحديد الإشعار كمقروء
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification marked as read"
 *                 id:
 *                   type: string
 *                   example: "1"
 */

/**
 * @swagger
 * /api/ai-analytics/{companyId}:
 *   get:
 *     summary: التحليلات الذكية
 *     description: الحصول على التحليلات الذكية للشركة
 *     tags: [AI Analytics]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الشركة
 *         example: "company-1"
 *     responses:
 *       200:
 *         description: التحليلات الذكية
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalEmployees:
 *                       type: integer
 *                       example: 450
 *                     employeeTrend:
 *                       type: number
 *                       example: 12.5
 *                     avgSalary:
 *                       type: number
 *                       example: 2800
 *                     salaryTrend:
 *                       type: number
 *                       example: 8.3
 *                     turnoverRate:
 *                       type: number
 *                       example: 3.2
 *                     turnoverTrend:
 *                       type: number
 *                       example: -15.4
 *                     satisfaction:
 *                       type: number
 *                       example: 87
 *                     satisfactionTrend:
 *                       type: number
 *                       example: 5.7
 */

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: صحة النظام
 *     description: التحقق من صحة النظام
 *     tags: [System]
 *     responses:
 *       200:
 *         description: حالة النظام
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     api:
 *                       type: string
 *                       example: "operational"
 *                     auth:
 *                       type: string
 *                       example: "active"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         name:
 *           type: string
 *           example: "مدير النظام"
 *         role:
 *           type: string
 *           enum: ["super_admin", "company_manager", "employee", "supervisor", "worker"]
 *           example: "super_admin"
 *         email:
 *           type: string
 *           example: "admin@system.com"
 *         companyId:
 *           type: string
 *           example: "company-1"
 */
