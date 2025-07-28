import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./mock-storage";
import { registerAdvancedRoutes } from "./advanced-routes";
import { insertCompanySchema, insertEmployeeSchema, insertLicenseSchema, insertEmployeeLeaveSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  // Temporary auth simulation for development
  const isAuthenticated = (req: any, res: any, next: any) => {
    // Mock authentication for development
    req.user = {
      claims: {
        sub: "1",
        role: "super_admin"
      }
    };
    next();
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's companies and roles
      const userCompanies = await storage.getUserCompanies(userId);
      
      res.json({
        ...user,
        companies: userCompanies
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // System dashboard routes (Super Admin)
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = {
        totalCompanies: 10,
        totalEmployees: 250,
        activeCompanies: 8,
        pendingApprovals: 5
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/companies', async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is super admin
      const userRole = req.user?.claims?.role || "user";
      if (userRole !== "super_admin") {
        return res.status(403).json({ message: "Only Super Admin can add companies" });
      }

      const companyData = req.body; // Use direct body for now
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Company-specific routes
  app.get('/api/companies/:companyId', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.get('/api/companies/:companyId/stats', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const stats = await storage.getCompanyStats(companyId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching company stats:", error);
      res.status(500).json({ message: "Failed to fetch company stats" });
    }
  });

  // Employee routes
  app.get('/api/companies/:companyId/employees', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const includeArchived = req.query.archived === 'true';
      const employees = await storage.getCompanyEmployees(companyId, includeArchived);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/employees/:employeeId', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post('/api/companies/:companyId/employees', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const employeeData = insertEmployeeSchema.parse({ ...req.body, companyId });
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put('/api/employees/:employeeId', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const updates = req.body;
      const employee = await storage.updateEmployee(employeeId, updates);
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.post('/api/employees/:employeeId/archive', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { reason } = req.body;
      const employee = await storage.archiveEmployee(employeeId, reason);
      res.json(employee);
    } catch (error) {
      console.error("Error archiving employee:", error);
      res.status(500).json({ message: "Failed to archive employee" });
    }
  });

  // License routes
  app.get('/api/companies/:companyId/licenses', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const licenses = await storage.getCompanyLicenses(companyId);
      res.json(licenses);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      res.status(500).json({ message: "Failed to fetch licenses" });
    }
  });

  app.get('/api/licenses/:licenseId', isAuthenticated, async (req, res) => {
    try {
      const { licenseId } = req.params;
      const license = await storage.getLicense(licenseId);
      if (!license) {
        return res.status(404).json({ message: "License not found" });
      }
      res.json(license);
    } catch (error) {
      console.error("Error fetching license:", error);
      res.status(500).json({ message: "Failed to fetch license" });
    }
  });

  app.post('/api/companies/:companyId/licenses', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const licenseData = insertLicenseSchema.parse({ ...req.body, companyId });
      const license = await storage.createLicense(licenseData);
      res.status(201).json(license);
    } catch (error) {
      console.error("Error creating license:", error);
      res.status(500).json({ message: "Failed to create license" });
    }
  });

  // Leave management routes
  app.get('/api/companies/:companyId/leaves', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const status = req.query.status as string;
      const leaves = await storage.getCompanyLeaves(companyId, status);
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({ message: "Failed to fetch leaves" });
    }
  });

  app.get('/api/employees/:employeeId/leaves', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const leaves = await storage.getEmployeeLeaves(employeeId);
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching employee leaves:", error);
      res.status(500).json({ message: "Failed to fetch employee leaves" });
    }
  });

  app.post('/api/employees/:employeeId/leaves', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const leaveData = insertEmployeeLeaveSchema.parse({ ...req.body, employeeId });
      const leave = await storage.createLeave(leaveData);
      res.status(201).json(leave);
    } catch (error) {
      console.error("Error creating leave:", error);
      res.status(500).json({ message: "Failed to create leave" });
    }
  });

  app.post('/api/leaves/:leaveId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { leaveId } = req.params;
      const approverId = req.user.claims.sub;
      const leave = await storage.approveLeave(leaveId, approverId);
      res.json(leave);
    } catch (error) {
      console.error("Error approving leave:", error);
      res.status(500).json({ message: "Failed to approve leave" });
    }
  });

  app.post('/api/leaves/:leaveId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const { leaveId } = req.params;
      const { reason } = req.body;
      const approverId = req.user.claims.sub;
      const leave = await storage.rejectLeave(leaveId, approverId, reason);
      res.json(leave);
    } catch (error) {
      console.error("Error rejecting leave:", error);
      res.status(500).json({ message: "Failed to reject leave" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyId = req.query.companyId as string;
      const notifications = await storage.getUserNotifications(userId, companyId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyId = req.query.companyId as string;
      const count = await storage.getUnreadNotificationCount(userId, companyId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  app.post('/api/notifications/:notificationId/read', isAuthenticated, async (req, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Document routes
  app.get('/api/:entityType/:entityId/documents', isAuthenticated, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      if (!['employee', 'company', 'license'].includes(entityType)) {
        return res.status(400).json({ message: "Invalid entity type" });
      }
      const documents = await storage.getEntityDocuments(entityId, entityType as 'employee' | 'company' | 'license');
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Register advanced routes
  registerAdvancedRoutes(app);

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password, companyId } = req.body;
      
      // Mock user authentication
      const users = {
        'admin': { 
          id: '1', 
          name: 'مدير النظام', 
          role: 'super_admin', 
          password: 'admin123',
          email: 'admin@system.com'
        },
        'manager': { 
          id: '2', 
          name: 'أحمد محمد', 
          role: 'company_manager', 
          password: 'manager123',
          email: 'manager@company.com',
          companyId 
        },
        'employee': { 
          id: '3', 
          name: 'سارة أحمد', 
          role: 'employee', 
          password: 'emp123',
          email: 'sara@company.com',
          companyId 
        },
        'supervisor': { 
          id: '4', 
          name: 'محمد علي', 
          role: 'supervisor', 
          password: 'super123',
          email: 'supervisor@company.com',
          companyId 
        },
        'worker': { 
          id: '5', 
          name: 'عبدالله سالم', 
          role: 'worker', 
          password: 'work123',
          email: 'worker@company.com',
          companyId 
        }
      };

      const user = users[username as keyof typeof users];
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // Store user session
      (req.session as any).user = user;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          companyId: user.companyId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ في تسجيل الدخول" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy(() => {
      res.json({ success: true });
    });
  });

  // Current user route
  app.get('/api/auth/current-user', (req, res) => {
    if ((req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: "غير مسجل دخول" });
    }
  });

  // Government Forms API endpoints
  app.get('/api/government-forms/templates', async (req, res) => {
    try {
      const templates = [
        {
          id: "manpower_license",
          nameAr: "رخصة القوى العاملة",
          ministry: "وزارة الداخلية - الهيئة العامة للقوى العاملة",
          fields: ["company_name", "license_number", "activity_type", "employee_count"]
        },
        {
          id: "residence_permit",
          nameAr: "تصريح إقامة",
          ministry: "وزارة الداخلية - الأمن العام",
          fields: ["employee_name", "passport_number", "nationality", "job_title", "salary"]
        }
      ];
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/government-forms/fill', async (req, res) => {
    try {
      const { formId, employeeId, formData } = req.body;
      console.log(`Filling form ${formId} for employee ${employeeId}`, formData);
      res.json({ success: true, message: "تم ملء النموذج بنجاح" });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Administrative Employees & Permissions APIs
  app.get('/api/administrative-employees', async (req, res) => {
    try {
      const adminEmployees = [
        {
          id: "admin1",
          fullName: "أحمد محمد علي",
          jobTitle: "مسؤول الموارد البشرية",
          role: "administrative_employee",
          permissions: ["hr", "reports"]
        },
        {
          id: "admin2", 
          fullName: "فاطمة سالم",
          jobTitle: "مسؤولة المحاسبة",
          role: "administrative_employee",
          permissions: ["accounting", "reports"]
        },
        {
          id: "admin3",
          fullName: "محمد خالد",
          jobTitle: "مسؤول المشتريات",
          role: "administrative_employee", 
          permissions: ["purchasing", "inventory"]
        }
      ];
      res.json(adminEmployees);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/permissions/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      // Mock permissions data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
      const mockPermissions = {
        admin1: {
          hr: {
            employees_view: true,
            employees_create: true,
            employees_edit: true,
            employees_delete: false,
            leaves_approve: true,
            payroll_process: false,
            violations_manage: true
          },
          reports: {
            reports_view: true,
            reports_create: false,
            reports_export: true,
            analytics_access: false
          }
        },
        admin2: {
          accounting: {
            financial_view: true,
            invoices_create: true,
            expenses_approve: true,
            budgets_manage: false,
            taxes_process: true,
            financial_export: true
          },
          reports: {
            reports_view: true,
            reports_create: true,
            reports_export: true,
            analytics_access: true
          }
        },
        admin3: {
          purchasing: {
            purchases_view: true,
            orders_create: true,
            orders_approve: false,
            vendors_manage: true
          },
          inventory: {
            inventory_view: true,
            items_add: true,
            stock_adjust: false,
            orders_approve: false,
            suppliers_manage: true
          }
        }
      };

      res.json(mockPermissions[employeeId] || {});
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/permissions/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      const permissions = req.body;
      
      console.log(`Updating permissions for employee ${employeeId}:`, permissions);
      
      // هنا ستتم معالجة حفظ الصلاحيات في قاعدة البيانات
      res.json({ success: true, message: "تم تحديث الصلاحيات بنجاح" });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // AI Analytics routes
  app.get('/api/ai-analytics/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      const analyticsData = {
        overview: {
          totalEmployees: 450,
          employeeTrend: 12.5,
          avgSalary: 2800,
          salaryTrend: 8.3,
          turnoverRate: 3.2,
          turnoverTrend: -15.4,
          satisfaction: 87,
          satisfactionTrend: 5.7
        },
        charts: {
          employeeGrowth: [
            { month: 'يناير', employees: 420, predictions: 435 },
            { month: 'فبراير', employees: 425, predictions: 440 },
            { month: 'مارس', employees: 430, predictions: 445 },
            { month: 'أبريل', employees: 435, predictions: 450 },
            { month: 'مايو', employees: 440, predictions: 455 },
            { month: 'يونيو', employees: 450, predictions: 465 }
          ],
          departmentDistribution: [
            { name: 'تقنية المعلومات', value: 150, color: '#0088FE' },
            { name: 'المبيعات', value: 120, color: '#00C49F' },
            { name: 'التسويق', value: 80, color: '#FFBB28' },
            { name: 'الموارد البشرية', value: 50, color: '#FF8042' },
            { name: 'المالية', value: 50, color: '#8884d8' }
          ],
          salaryAnalysis: [
            { department: 'تقنية المعلومات', current: 3500, predicted: 3700 },
            { department: 'المبيعات', current: 2800, predicted: 2950 },
            { department: 'التسويق', current: 2600, predicted: 2750 },
            { department: 'الموارد البشرية', current: 2400, predicted: 2520 },
            { department: 'المالية', current: 3200, predicted: 3350 }
          ]
        }
      };
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching AI analytics:", error);
      res.status(500).json({ message: "Failed to fetch AI analytics" });
    }
  });

  app.get('/api/ai-predictions/:companyId', async (req, res) => {
    try {
      const predictions = [
        {
          id: 1,
          type: "employee_turnover",
          title: "توقع معدل دوران الموظفين",
          prediction: "انخفاض بنسبة 15% في الربع القادم",
          confidence: 85,
          impact: "positive",
          timeframe: "3 أشهر",
          details: "بناء على تحليل رضا الموظفين وسياسات الشركة الجديدة"
        },
        {
          id: 2,
          type: "salary_optimization",
          title: "تحسين هيكل الرواتب",
          prediction: "إمكانية توفير 180,000 ريال سنوياً",
          confidence: 78,
          impact: "positive",
          timeframe: "6 أشهر",
          details: "من خلال إعادة توزيع الرواتب وتحسين نظام المكافآت"
        },
        {
          id: 3,
          type: "recruitment_needs",
          title: "احتياجات التوظيف",
          prediction: "الحاجة لتوظيف 25 موظف جديد",
          confidence: 92,
          impact: "neutral",
          timeframe: "4 أشهر",
          details: "لمواكبة النمو المتوقع في المشاريع الجديدة"
        }
      ];
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching AI predictions:", error);
      res.status(500).json({ message: "Failed to fetch AI predictions" });
    }
  });

  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, companyId } = req.body;
      
      // Simulate AI processing
      const responses = {
        "ما هو معدل دوران الموظفين الحالي؟": "معدل دوران الموظفين الحالي هو 3.2% وهو منخفض بنسبة 15.4% مقارنة بالشهر الماضي، مما يدل على تحسن في رضا الموظفين.",
        "أعطني تحليل رضا الموظفين": "رضا الموظفين الحالي 87% مع ارتفاع 5.7%. أعلى الأقسام رضا: تقنية المعلومات (92%)، أقلها: المبيعات (78%). ننصح بتحسين بيئة العمل في قسم المبيعات.",
        "ما هي توقعات النمو للشهر القادم؟": "نتوقع نمو بنسبة 3.5% في عدد الموظفين الشهر القادم، مع التركيز على توظيف مطورين وموظفي مبيعات. النمو مدفوع بمشاريع جديدة."
      };

      const response = responses[message] || "عذراً، لم أفهم سؤالك. يمكنني مساعدتك في تحليل البيانات، معدل دوران الموظفين، الرواتب، والتوقعات المستقبلية.";
      
      res.json({ 
        response,
        timestamp: new Date().toISOString(),
        processed: true
      });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  app.post('/api/ai-insights/generate', async (req, res) => {
    try {
      const { type, companyId } = req.body;
      
      const insights = {
        comprehensive: {
          message: "تم توليد رؤى جديدة بنجاح",
          insights: [
            "قسم تقنية المعلومات يحقق أفضل النتائج",
            "فرصة تحسين الرواتب في قسم التسويق",
            "الحاجة لبرامج تدريب إضافية"
          ]
        }
      };

      res.json(insights[type] || { message: "تم توليد الرؤى بنجاح" });
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Early Warning System routes
  app.get('/api/early-warnings/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      
      const alerts = [
        {
          id: 1,
          type: "turnover_risk",
          severity: "high",
          title: "خطر ارتفاع معدل دوران الموظفين",
          description: "معدل دوران الموظفين في قسم المبيعات وصل إلى 8.5% هذا الشهر",
          impact: "قد يؤثر على الأداء العام للقسم",
          recommendation: "مراجعة رواتب ومكافآت قسم المبيعات",
          timestamp: new Date().toISOString(),
          department: "المبيعات",
          value: 8.5,
          threshold: 5.0,
          trend: "increasing"
        },
        {
          id: 2,
          type: "budget_variance",
          severity: "medium",
          title: "تجاوز الميزانية المخصصة للرواتب",
          description: "الإنفاق على الرواتب تجاوز الميزانية بنسبة 12%",
          impact: "ضغط على الميزانية العامة للشركة",
          recommendation: "مراجعة هيكل الرواتب والمكافآت",
          timestamp: new Date().toISOString(),
          department: "المالية",
          value: 112,
          threshold: 100,
          trend: "increasing"
        },
        {
          id: 3,
          type: "satisfaction_drop",
          severity: "medium",
          title: "انخفاض رضا الموظفين",
          description: "رضا الموظفين في قسم التسويق انخفض إلى 68%",
          impact: "قد يؤدي إلى زيادة معدل الاستقالات",
          recommendation: "إجراء جلسات استماع مع موظفي التسويق",
          timestamp: new Date().toISOString(),
          department: "التسويق",
          value: 68,
          threshold: 70,
          trend: "decreasing"
        }
      ];

      res.json(alerts);
    } catch (error) {
      console.error("Error fetching early warnings:", error);
      res.status(500).json({ message: "Failed to fetch early warnings" });
    }
  });

  app.get('/api/trend-analysis/:companyId', async (req, res) => {
    try {
      const trends = {
        turnover: [
          { month: 'سبتمبر', value: 3.2, threshold: 5.0 },
          { month: 'أكتوبر', value: 4.1, threshold: 5.0 },
          { month: 'نوفمبر', value: 5.8, threshold: 5.0 },
          { month: 'ديسمبر', value: 6.2, threshold: 5.0 },
          { month: 'يناير', value: 7.1, threshold: 5.0 }
        ],
        satisfaction: [
          { month: 'سبتمبر', value: 85, threshold: 70 },
          { month: 'أكتوبر', value: 82, threshold: 70 },
          { month: 'نوفمبر', value: 78, threshold: 70 },
          { month: 'ديسمبر', value: 74, threshold: 70 },
          { month: 'يناير', value: 71, threshold: 70 }
        ],
        budget: [
          { month: 'سبتمبر', value: 95, threshold: 100 },
          { month: 'أكتوبر', value: 98, threshold: 100 },
          { month: 'نوفمبر', value: 103, threshold: 100 },
          { month: 'ديسمبر', value: 108, threshold: 100 },
          { month: 'يناير', value: 112, threshold: 100 }
        ]
      };

      res.json(trends);
    } catch (error) {
      console.error("Error fetching trend analysis:", error);
      res.status(500).json({ message: "Failed to fetch trend analysis" });
    }
  });

  app.post('/api/early-warnings/settings', async (req, res) => {
    try {
      const { settings, companyId } = req.body;
      
      console.log(`Updating early warning settings for company ${companyId}:`, settings);
      
      res.json({ 
        success: true, 
        message: "تم حفظ إعدادات التنبيه بنجاح" 
      });
    } catch (error) {
      console.error("Error updating early warning settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Register advanced routes
  registerAdvancedRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
