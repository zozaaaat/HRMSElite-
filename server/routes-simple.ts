import type { Express } from "express";
// Enhanced HRMS system with special attention to gold and fabrics companies
import { createServer, type Server } from "http";

// Mock users for authentication
const mockUsers = [
  { id: "1", username: "admin", password: "admin123", name: "المسؤول العام", role: "super_admin", email: "admin@zeylab.com" },
  { id: "2", username: "manager", password: "manager123", name: "مدير الشركة", role: "company_manager", email: "manager@company.com" },
  { id: "3", username: "employee", password: "emp123", name: "الموظف", role: "employee", email: "employee@company.com" },
  { id: "4", username: "supervisor", password: "super123", name: "المشرف", role: "supervisor", email: "supervisor@company.com" },
  { id: "5", username: "worker", password: "work123", name: "العامل", role: "worker", email: "worker@company.com" }
];

// Simple authentication middleware for demo
const isAuthenticated = (req: any, res: any, next: any) => {
  const userFromSession = req.session?.user;
  const authHeader = req.headers.authorization;
  
  if (userFromSession) {
    req.user = userFromSession;
    return next();
  }
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = mockUsers.find(u => u.username === token);
    if (user) {
      req.user = user;
      return next();
    }
  }
  
  res.status(401).json({ message: "غير مسجل دخول" });
};

export async function registerRoutes(app: Express): Promise<Server> {

  // Login route
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = mockUsers.find(u => 
      u.username === username && u.password === password
    );
    
    if (user) {
      (req.session as any).user = user;
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role,
          email: user.email
        } 
      });
    } else {
      res.status(401).json({ success: false, message: "بيانات دخول غير صحيحة" });
    }
  });

  // Get current user
  app.get('/api/auth/current-user', isAuthenticated, (req: any, res) => {
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    });
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', (req, res) => {
    res.json({
      totalCompanies: 4,
      totalEmployees: 1680,
      activeLicenses: 12,
      systemRevenue: 250000,
      urgentAlerts: 3
    });
  });
  
  // Companies route - return mock data
  app.get('/api/companies', async (req, res) => {
    try {
      // Real companies extracted from business documents - Focus on Gold & Fabrics
      const mockCompanies = [
        {
          id: "1",
          name: "شركة الاتحاد الخليجي للأقمشة",
          description: "شركة متخصصة في تجارة الأقمشة والمنسوجات بالجملة والتجزئة",
          address: "المباركية، سوق الأقمشة، الكويت",
          phone: "+965-2240-5678",
          email: "info@gulf-union-fabrics.com",
          website: "www.gulf-union-fabrics.com",
          industry: "أقمشة ومنسوجات",
          size: "متوسطة",
          status: "active",
          employeeCount: 15,
          businessActivity: "تجارة الأقمشة بالجملة والتجزئة",
          location: "المباركية",
          licenseTypes: ["تجاري", "استيراد"],
          // Enhanced inventory management for fabrics business
          specialtyItems: ["أقمشة حريرية", "أقمشة قطنية", "مواد خام"],
          businessType: "أقمشة"
        },
        {
          id: "2",
          name: "شركة النيل الأزرق للمجوهرات",
          description: "شركة متخصصة في تجارة وتصنيع المجوهرات والذهب والفضة",
          address: "المباركية، سوق الذهب، محل رقم 3 - فحيحيل - الجهراء",
          phone: "+965-2243-9876",
          email: "contact@blue-nile-jewelry.com",
          website: "www.blue-nile-jewelry.com",
          industry: "مجوهرات وذهب",
          size: "صغيرة",
          status: "active",
          employeeCount: 12,
          businessActivity: "تجارة وتصنيع المجوهرات والذهب والفضة",
          location: "المباركية - فحيحيل - الجهراء",
          licenseTypes: ["تجاري", "صناعي", "مجوهرات"],
          // Enhanced inventory management for gold business
          specialtyItems: ["ذهب خام", "مجوهرات جاهزة", "أحجار كريمة"],
          businessType: "ذهب ومجوهرات"
        },
        {
          id: "3",
          name: "شركة قمة النيل الخالد",
          description: "شركة تجارية متعددة الأنشطة في البضائع العامة",
          address: "الجهراء، السوق التجاري، الكويت",
          phone: "+965-2455-1234",
          email: "info@peak-nile.com",
          website: "www.peak-nile.com",
          industry: "تجارة عامة",
          size: "صغيرة",
          status: "active",
          employeeCount: 8,
          businessActivity: "تجارة البضائع العامة والمواد الاستهلاكية",
          location: "الجهراء",
          licenseTypes: ["تجاري", "استيراد"]
        },
        {
          id: "4",
          name: "شركة محمد أحمد إبراهيم",
          description: "مؤسسة فردية متخصصة في الاستيراد والتصدير",
          address: "الصليبية، المنطقة التجارية، الكويت",
          phone: "+965-2234-7890",
          email: "contact@mai-trading.com",
          website: "www.mai-trading.com",
          industry: "استيراد وتصدير",
          size: "صغيرة",
          status: "active",
          employeeCount: 6,
          businessActivity: "استيراد وتصدير البضائع المختلفة",
          location: "الصليبية",
          licenseTypes: ["استيراد", "تصدير", "تجاري"]
        },
        {
          id: "5",
          name: "شركة ميلانو للأزياء",
          description: "شركة متخصصة في تجارة الملابس والأزياء الجاهزة",
          address: "الصفاة، مجمع الأزياء، الكويت",
          phone: "+965-2267-3456",
          email: "info@milano-fashion.com",
          website: "www.milano-fashion.com",
          industry: "أزياء وملابس",
          size: "متوسطة",
          status: "active",
          employeeCount: 18,
          businessActivity: "تجارة الملابس والأزياء الجاهزة",
          location: "الصفاة",
          licenseTypes: ["تجاري", "خياطة"]
        }
      ];
      res.json(mockCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Company details route
  app.get('/api/companies/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      const mockCompany = {
        id: companyId,
        name: "شركة التقنية المتقدمة",
        description: "رائدة في حلول تقنية المعلومات والبرمجيات",
        address: "الرياض، المملكة العربية السعودية",
        phone: "+966123456789",
        email: "info@techadvanced.sa",
        website: "www.techadvanced.sa",
        industry: "تقنية المعلومات",
        size: "كبيرة",
        status: "active",
        totalEmployees: 450,
        activeEmployees: 420,
      };
      res.json(mockCompany);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Company not found" });
    }
  });

  // Company stats route
  app.get('/api/companies/:companyId/stats', async (req, res) => {
    try {
      const mockStats = {
        totalEmployees: 450,
        activeEmployees: 420,
        pendingLeaves: 12,
        expiringLicenses: 3,
      };
      res.json(mockStats);
    } catch (error) {
      console.error("Error fetching company stats:", error);
      res.status(500).json({ message: "Failed to fetch company stats" });
    }
  });

  // Employees route
  app.get('/api/companies/:companyId/employees', async (req, res) => {
    try {
      // Real employees data based on Excel files from business documents
      const mockEmployees = [
        {
          id: "1",
          companyId: req.params.companyId,
          fullName: "جورج يوسف إبراهيم", // مدير عام شركة النيل الأزرق
          email: "george@blue-nile-jewelry.com",
          phone: "+966501234567",
          position: "مطور برمجيات",
          department: "التقنية",
          hireDate: "2022-01-15",
          status: "active",
          salary: 8000,
        },
        {
          id: "2",
          companyId: req.params.companyId,
          fullName: "سارة أحمد الزهراني",
          email: "sara@company.sa",
          phone: "+966507654321",
          position: "محاسبة",
          department: "المالية",
          hireDate: "2021-06-10",
          status: "active",
          salary: 6500,
        }
      ];
      res.json(mockEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Notifications route
  app.get('/api/notifications', async (req, res) => {
    try {
      const mockNotifications = [
        {
          id: "1",
          title: "طلب إجازة جديد",
          message: "لديك طلب إجازة جديد من أحمد محمد",
          type: "leave_request",
          priority: "medium",
          createdAt: new Date().toISOString(),
          readAt: null,
        },
        {
          id: "2",
          title: "انتهاء صلاحية رخصة",
          message: "رخصة العمل رقم 12345 ستنتهي خلال 30 يوم",
          type: "license_expiry",
          priority: "high",
          createdAt: new Date().toISOString(),
          readAt: null,
        }
      ];
      res.json(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

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
          companyId: 'companyId' in user ? user.companyId : undefined
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
    if ((req.session as any)?.user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: "غير مسجل دخول" });
    }
  });

  // Dashboard stats for Super Admin
  app.get('/api/dashboard/stats', (req, res) => {
    const mockStats = {
      totalCompanies: 4,
      totalEmployees: 1680,
      activeEmployees: 1520,
      pendingLeaves: 23,
      expiringLicenses: 8,
      urgentAlerts: 5,
      monthlyGrowth: 12.5,
      satisfactionRate: 94.2
    };
    res.json(mockStats);
  });

  // AI Analytics endpoints
  app.get('/api/ai/predictions', (req, res) => {
    const predictions = [
      {
        id: "1",
        title: "معدل دوران الموظفين",
        type: "turnover",
        prediction: "ارتفاع متوقع بنسبة 15% خلال الربع القادم",
        confidence: 85,
        impact: "high",
        timeframe: "3 أشهر",
        recommendation: "تطبيق برامج الاحتفاظ بالمواهب وتحسين بيئة العمل",
        data: [
          { month: "يناير", actual: 5, predicted: 6 },
          { month: "فبراير", actual: 7, predicted: 8 },
          { month: "مارس", actual: 6, predicted: 9 },
          { month: "أبريل", actual: null, predicted: 12 },
          { month: "مايو", actual: null, predicted: 14 },
          { month: "يونيو", actual: null, predicted: 15 }
        ]
      },
      {
        id: "2", 
        title: "احتياجات التوظيف",
        type: "recruitment",
        prediction: "الحاجة لتوظيف 25 موظف جديد خلال الشهرين القادمين",
        confidence: 78,
        impact: "medium",
        timeframe: "2 شهر",
        recommendation: "بدء حملة توظيف مبكرة والتواصل مع وكالات التوظيف",
        data: [
          { month: "أبريل", openings: 8, filled: 5 },
          { month: "مايو", openings: 12, filled: 0 },
          { month: "يونيو", openings: 15, filled: 0 }
        ]
      }
    ];
    res.json(predictions);
  });

  app.get('/api/ai/insights', (req, res) => {
    const insights = [
      {
        id: "1",
        category: "attendance", 
        title: "انخفاض في معدل الحضور",
        description: "انخفاض ملحوظ في معدل الحضور بنسبة 8% خلال الأسبوعين الماضيين في قسم التسويق",
        severity: "warning",
        actionRequired: true,
        suggestion: "مراجعة سياسات الحضور والتحدث مع مديري القسم لفهم الأسباب",
        confidence: 92
      },
      {
        id: "2",
        category: "performance",
        title: "تحسن في الأداء العام",
        description: "ارتفاع في مؤشرات الأداء بنسبة 12% بعد تطبيق البرنامج التدريبي الجديد",
        severity: "success", 
        actionRequired: false,
        suggestion: "مواصلة البرنامج التدريبي وتوسيعه لأقسام أخرى",
        confidence: 88
      }
    ];
    res.json(insights);
  });

  app.get('/api/ai/performance-metrics', (req, res) => {
    const metrics = [
      { name: "يناير", productivity: 85, satisfaction: 78, retention: 92 },
      { name: "فبراير", productivity: 88, satisfaction: 82, retention: 89 },
      { name: "مارس", productivity: 91, satisfaction: 85, retention: 87 },
      { name: "أبريل", productivity: 87, satisfaction: 79, retention: 90 },
      { name: "مايو", productivity: 93, satisfaction: 88, retention: 94 },
      { name: "يونيو", productivity: 89, satisfaction: 86, retention: 91 }
    ];
    res.json(metrics);
  });

  app.get('/api/ai/department-analysis', (req, res) => {
    const analysis = [
      { name: "الموارد البشرية", employees: 12, avgSalary: 8500, satisfaction: 88, turnover: 5 },
      { name: "التسويق", employees: 18, avgSalary: 7200, satisfaction: 75, turnover: 12 },
      { name: "المبيعات", employees: 25, avgSalary: 6800, satisfaction: 82, turnover: 8 },
      { name: "التطوير", employees: 15, avgSalary: 9200, satisfaction: 91, turnover: 3 },
      { name: "المالية", employees: 8, avgSalary: 8800, satisfaction: 85, turnover: 6 }
    ];
    res.json(analysis);
  });

  // AI Analytics endpoints - new ones
  app.get('/api/ai/performance-data', (req, res) => {
    res.json([
      { month: 'يناير', productivity: 85, satisfaction: 78, retention: 92 },
      { month: 'فبراير', productivity: 88, satisfaction: 82, retention: 89 },
      { month: 'مارس', productivity: 92, satisfaction: 85, retention: 94 },
      { month: 'أبريل', productivity: 89, satisfaction: 80, retention: 91 },
      { month: 'مايو', productivity: 94, satisfaction: 88, retention: 96 },
      { month: 'يونيو', productivity: 96, satisfaction: 91, retention: 98 }
    ]);
  });

  app.get('/api/ai/turnover-prediction', (req, res) => {
    res.json([
      { department: 'المبيعات', risk: 85, employees: 24, prediction: 'عالي' },
      { department: 'التقنية', risk: 35, employees: 18, prediction: 'منخفض' },
      { department: 'المحاسبة', risk: 62, employees: 12, prediction: 'متوسط' },
      { department: 'الموارد البشرية', risk: 28, employees: 8, prediction: 'منخفض' },
      { department: 'التسويق', risk: 71, employees: 15, prediction: 'متوسط' }
    ]);
  });

  app.get('/api/ai/salary-analysis', (req, res) => {
    res.json([
      { position: 'مطور برمجيات', current: 8500, market: 9200, gap: 700, recommendation: 'زيادة راتب' },
      { position: 'مدير مبيعات', current: 12000, market: 11500, gap: -500, recommendation: 'راتب مناسب' },
      { position: 'محاسب', current: 6500, market: 7000, gap: 500, recommendation: 'مراجعة راتب' },
      { position: 'مصمم جرافيك', current: 5500, market: 5800, gap: 300, recommendation: 'زيادة طفيفة' }
    ]);
  });

  app.get('/api/ai/hiring-forecast', (req, res) => {
    res.json([
      { month: 'يوليو', planned: 8, predicted: 6, budget: 45000 },
      { month: 'أغسطس', planned: 12, predicted: 10, budget: 68000 },
      { month: 'سبتمبر', planned: 6, predicted: 8, budget: 52000 },
      { month: 'أكتوبر', planned: 15, predicted: 12, budget: 82000 }
    ]);
  });

  app.post('/api/ai/run-analysis', (req, res) => {
    // Simulate AI analysis processing
    setTimeout(() => {
      res.json({
        success: true,
        analysisId: Date.now().toString(),
        insights: [
          {
            type: 'success',
            title: 'تحسن الإنتاجية',
            description: 'ارتفاع الإنتاجية بنسبة 12% خلال الشهرين الماضيين',
            impact: 'إيجابي',
            confidence: 94
          },
          {
            type: 'warning',
            title: 'خطر دوران عالي',
            description: 'قسم المبيعات يواجه خطر دوران موظفين عالي (85%)',
            impact: 'سلبي',
            confidence: 87
          }
        ],
        timestamp: new Date().toISOString()
      });
    }, 2000);
  });

  app.post('/api/ai/generate-insights', (req, res) => {
    // Simulate AI processing time
    setTimeout(() => {
      const newInsights = [
        {
          id: "new-1",
          category: "cost",
          title: "فرصة توفير جديدة",
          description: "اكتشاف فرصة لتوفير 15% من تكاليف التدريب عبر الأتمتة",
          severity: "info",
          actionRequired: false,
          suggestion: "تطبيق منصة تدريب إلكترونية موحدة",
          confidence: 82
        }
      ];
      res.json(newInsights);
    }, 2000);
  });

  // AI Insights
  app.get('/api/ai/insights/system', (req, res) => {
    const mockInsights = [
      {
        id: "1",
        type: "prediction",
        title: "توقع زيادة معدل الإجازات",
        description: "متوقع زيادة 15% في طلبات الإجازات الشهر القادم",
        priority: "medium",
        recommendations: ["تعديل جدولة المناوبات", "توظيف موظفين مؤقتين"]
      },
      {
        id: "2", 
        type: "alert",
        title: "تحسين الأداء المالي",
        description: "إمكانية توفير 8% من تكاليف الرواتب",
        priority: "high",
        recommendations: ["مراجعة هيكل الرواتب", "تحسين نظام المكافآت"]
      }
    ];
    res.json(mockInsights);
  });

  // Analytics endpoints
  app.get('/api/analytics/kpis/:companyId/:period', (req, res) => {
    const mockKPIs = {
      employeeRetention: 92.3,
      avgSalary: 7500,
      productivityIndex: 87.5,
      trainingHours: 240,
      absenceRate: 4.2,
      overtimeHours: 180
    };
    res.json(mockKPIs);
  });

  app.get('/api/analytics/:companyId/:period/:type', (req, res) => {
    const mockAnalytics = {
      attendance: [
        { month: "يناير", present: 420, absent: 30 },
        { month: "فبراير", present: 435, absent: 15 },
        { month: "مارس", present: 410, absent: 40 }
      ],
      performance: [
        { department: "التقنية", score: 92 },
        { department: "المالية", score: 88 },
        { department: "الموارد البشرية", score: 95 }
      ]
    };
    res.json(mockAnalytics);
  });

  // Department management
  app.get('/api/departments/:companyId', (req, res) => {
    const mockDepartments = [
      { id: "1", name: "التقنية", manager: "أحمد محمد", employees: 45, budget: 500000 },
      { id: "2", name: "المالية", manager: "سارة أحمد", employees: 25, budget: 300000 },
      { id: "3", name: "الموارد البشرية", manager: "محمد علي", employees: 15, budget: 200000 }
    ];
    res.json(mockDepartments);
  });

  // Payroll system
  app.get('/api/payroll/:companyId', (req, res) => {
    const mockPayroll = [
      {
        employeeId: "1",
        name: "أحمد محمد",
        baseSalary: 8000,
        allowances: 1500,
        deductions: 500,
        totalSalary: 9000,
        status: "processed"
      },
      {
        employeeId: "2", 
        name: "سارة أحمد",
        baseSalary: 6500,
        allowances: 1000,
        deductions: 300,
        totalSalary: 7200,
        status: "pending"
      }
    ];
    res.json(mockPayroll);
  });

  // Financial statistics
  app.get('/api/financial-stats/:companyId', (req, res) => {
    const mockFinancials = {
      totalPayroll: 3200000,
      benefits: 480000,
      taxes: 256000,
      netCost: 3936000,
      monthlyBudget: 4000000,
      remainingBudget: 64000
    };
    res.json(mockFinancials);
  });

  // Mobile app endpoints
  app.get('/api/mobile/attendance/:companyId', (req, res) => {
    const mockAttendance = [
      { date: "2025-01-27", checkIn: "08:00", checkOut: "17:00", status: "present" },
      { date: "2025-01-26", checkIn: "08:15", checkOut: "17:30", status: "late" },
      { date: "2025-01-25", checkIn: "08:00", checkOut: "17:00", status: "present" }
    ];
    res.json(mockAttendance);
  });

  app.get('/api/mobile/stats/:companyId', (req, res) => {
    const mockMobileStats = {
      activeUsers: 420,
      dailyCheckIns: 395,
      avgResponseTime: "2.3s",
      satisfactionScore: 4.6,
      pushNotifications: 1250
    };
    res.json(mockMobileStats);
  });

  // Projects API
  app.get('/api/projects', (req, res) => {
    const mockProjects = [
      {
        id: "1",
        name: "تطوير تطبيق الموارد البشرية",
        description: "مشروع لتطوير نظام إدارة الموارد البشرية المتكامل",
        status: "active",
        progress: 75,
        startDate: "2025-01-01",
        endDate: "2025-06-30",
        teamSize: 8,
        budget: 500000,
        manager: "أحمد محمد العلي"
      },
      {
        id: "2",
        name: "تحديث أنظمة المحاسبة",
        description: "ربط الأنظمة المحاسبية الخارجية مع النظام الداخلي",
        status: "planning",
        progress: 25,
        startDate: "2025-02-01",
        endDate: "2025-08-31",
        teamSize: 5,
        budget: 300000,
        manager: "سارة أحمد الزهراني"
      }
    ];
    res.json(mockProjects);
  });

  app.get('/api/projects/:id/tasks', (req, res) => {
    const mockTasks = [
      {
        id: "1",
        projectId: req.params.id,
        title: "تصميم واجهة المستخدم",
        description: "إنشاء تصميم متجاوب لواجهة النظام",
        status: "completed",
        priority: "high",
        assignee: "محمد علي",
        dueDate: "2025-02-15",
        progress: 100
      },
      {
        id: "2",
        projectId: req.params.id,
        title: "تطوير قاعدة البيانات",
        description: "إنشاء هيكل قاعدة البيانات والجداول",
        status: "in_progress",
        priority: "high",
        assignee: "فاطمة خالد",
        dueDate: "2025-02-28",
        progress: 60
      }
    ];
    res.json(mockTasks);
  });

  // Mobile App Integration API
  app.get('/api/mobile/integrations', (req, res) => {
    const mockIntegrations = [
      {
        id: "1",
        name: "تطبيق الحضور والانصراف",
        type: "attendance",
        status: "active",
        users: 420,
        lastSync: "2025-01-27T14:30:00Z",
        features: ["تسجيل الحضور", "إشعارات فورية", "تتبع الموقع"]
      },
      {
        id: "2",
        name: "تطبيق إدارة المهام",
        type: "tasks",
        status: "active",
        users: 125,
        lastSync: "2025-01-27T14:25:00Z",
        features: ["متابعة المهام", "تحديث التقدم", "التواصل الفوري"]
      }
    ];
    res.json(mockIntegrations);
  });

  app.get('/api/mobile/device-registrations', (req, res) => {
    const mockDevices = [
      {
        id: "1",
        deviceName: "جهاز الاستقبال - المدخل الرئيسي",
        location: "البوابة الرئيسية",
        type: "attendance_kiosk",
        status: "online",
        lastPing: "2025-01-27T14:30:00Z",
        registeredUsers: 420
      },
      {
        id: "2",
        deviceName: "جهاز الاستقبال - مكتب الإدارة",
        location: "الطابق الثاني",
        type: "attendance_kiosk",
        status: "online",
        lastPing: "2025-01-27T14:29:00Z",
        registeredUsers: 85
      }
    ];
    res.json(mockDevices);
  });

  // Accounting Integration API
  app.get('/api/accounting/integrations', (req, res) => {
    const mockAccountingIntegrations = [
      {
        id: "quickbooks",
        name: "QuickBooks",
        type: "cloud",
        status: "connected",
        lastSync: "2025-01-27T12:00:00Z",
        syncFrequency: "daily",
        dataTypes: ["employees", "payroll", "expenses", "taxes"],
        connectionHealth: "excellent"
      },
      {
        id: "sap",
        name: "SAP Business One",
        type: "enterprise",
        status: "disconnected",
        lastSync: null,
        syncFrequency: "real-time",
        dataTypes: ["full_integration"],
        connectionHealth: "not_connected"
      },
      {
        id: "xero",
        name: "Xero",
        type: "cloud",
        status: "pending",
        lastSync: null,
        syncFrequency: "weekly",
        dataTypes: ["basic_payroll"],
        connectionHealth: "configuring"
      }
    ];
    res.json(mockAccountingIntegrations);
  });

  app.get('/api/accounting/sync-status', (req, res) => {
    const mockSyncStatus = {
      isRunning: false,
      lastRun: "2025-01-27T12:00:00Z",
      nextRun: "2025-01-28T12:00:00Z",
      status: "completed",
      recordsProcessed: 1250,
      errors: 0,
      warnings: 2,
      duration: "45 seconds"
    };
    res.json(mockSyncStatus);
  });

  app.post('/api/accounting/sync', (req, res) => {
    // Simulate sync process
    setTimeout(() => {
      res.json({
        success: true,
        message: "تم بدء عملية المزامنة بنجاح",
        jobId: "sync_" + Date.now()
      });
    }, 1000);
  });

  app.get('/api/accounting/mapping', (req, res) => {
    const mockMapping = [
      {
        hrmsField: "basicSalary",
        accountingField: "base_wages",
        system: "quickbooks",
        mapped: true,
        dataType: "currency"
      },
      {
        hrmsField: "allowances",
        accountingField: "allowances_account",
        system: "quickbooks",
        mapped: true,
        dataType: "currency"
      },
      {
        hrmsField: "deductions",
        accountingField: "deductions_account",
        system: "quickbooks",
        mapped: false,
        dataType: "currency"
      }
    ];
    res.json(mockMapping);
  });

  // Mock assets data
  const mockAssets = [
    {
      id: "1",
      companyId: "1",
      name: "جهاز كمبيوتر محمول Dell",
      description: "جهاز كمبيوتر محمول للاستخدام المكتبي",
      assetCode: "LAP-001",
      type: "electronics",
      category: "أجهزة الكمبيوتر",
      brand: "Dell",
      model: "Latitude 5520",
      serialNumber: "DL123456789",
      purchaseDate: "2023-01-15",
      purchasePrice: "3500.00",
      currentValue: "2800.00",
      depreciation: "700.00",
      warrantyExpiry: "2026-01-15",
      location: "المكتب الرئيسي - الطابق الثاني",
      department: "تقنية المعلومات",
      assignedTo: "1",
      status: "in_use",
      condition: "جيد",
      notes: "جهاز محمول للاستخدام اليومي",
      imageUrl: "",
      documentUrl: "",
      lastMaintenanceDate: "2024-06-15",
      nextMaintenanceDate: "2025-06-15",
      isActive: true,
      createdBy: "1",
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      companyId: "1",
      name: "طابعة HP LaserJet",
      description: "طابعة ليزر للمكتب",
      assetCode: "PRT-002",
      type: "equipment",
      category: "معدات المكتب",
      brand: "HP",
      model: "LaserJet Pro M404n",
      serialNumber: "HP987654321",
      purchaseDate: "2023-03-10",
      purchasePrice: "1200.00",
      currentValue: "900.00",
      depreciation: "300.00",
      warrantyExpiry: "2025-03-10",
      location: "المكتب الرئيسي - الطابق الأول",
      department: "الإدارة",
      assignedTo: null,
      status: "available",
      condition: "ممتاز",
      notes: "طابعة مشتركة للاستخدام العام",
      imageUrl: "",
      documentUrl: "",
      lastMaintenanceDate: "2024-03-10",
      nextMaintenanceDate: "2025-03-10",
      isActive: true,
      createdBy: "1",
      createdAt: "2023-03-10T10:00:00Z",
      updatedAt: "2024-03-10T10:00:00Z"
    },
    {
      id: "3",
      companyId: "1",
      name: "سيارة تويوتا كامري",
      description: "سيارة للاستخدام الرسمي",
      assetCode: "VEH-003",
      type: "vehicle",
      category: "المركبات",
      brand: "Toyota",
      model: "Camry 2023",
      serialNumber: "TOY2023CAM456",
      purchaseDate: "2023-05-20",
      purchasePrice: "85000.00",
      currentValue: "75000.00",
      depreciation: "10000.00",
      warrantyExpiry: "2026-05-20",
      location: "موقف السيارات",
      department: "الإدارة التنفيذية",
      assignedTo: "2",
      status: "in_use",
      condition: "ممتاز",
      notes: "سيارة للاستخدام الرسمي والاجتماعات",
      imageUrl: "",
      documentUrl: "",
      lastMaintenanceDate: "2024-11-20",
      nextMaintenanceDate: "2025-02-20",
      isActive: true,
      createdBy: "1",
      createdAt: "2023-05-20T10:00:00Z",
      updatedAt: "2024-11-20T10:00:00Z"
    },
    {
      id: "4",
      companyId: "1",
      name: "خادم Dell PowerEdge",
      description: "خادم لقاعدة البيانات والتطبيقات",
      assetCode: "SRV-004",
      type: "equipment",
      category: "خوادم",
      brand: "Dell",
      model: "PowerEdge R740",
      serialNumber: "DL-SRV-789123",
      purchaseDate: "2022-11-15",
      purchasePrice: "25000.00",
      currentValue: "18000.00",
      depreciation: "7000.00",
      warrantyExpiry: "2025-11-15",
      location: "غرفة الخوادم - الطابق السفلي",
      department: "تقنية المعلومات",
      assignedTo: null,
      status: "maintenance",
      condition: "يحتاج صيانة",
      notes: "خادم رئيسي للنظام - قيد الصيانة الدورية",
      imageUrl: "",
      documentUrl: "",
      lastMaintenanceDate: "2024-12-01",
      nextMaintenanceDate: "2025-06-01",
      isActive: true,
      createdBy: "1",
      createdAt: "2022-11-15T10:00:00Z",
      updatedAt: "2024-12-01T10:00:00Z"
    }
  ];

  // Assets endpoints
  app.get('/api/assets', isAuthenticated, (req: any, res) => {
    res.json(mockAssets);
  });

  app.post('/api/assets', isAuthenticated, (req: any, res) => {
    const newAsset = {
      id: (mockAssets.length + 1).toString(),
      companyId: "1",
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    mockAssets.push(newAsset);
    res.status(201).json(newAsset);
  });

  app.get('/api/assets/:id', isAuthenticated, (req: any, res) => {
    const asset = mockAssets.find(a => a.id === req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "الأصل غير موجود" });
    }
    res.json(asset);
  });

  app.put('/api/assets/:id', isAuthenticated, (req: any, res) => {
    const assetIndex = mockAssets.findIndex(a => a.id === req.params.id);
    if (assetIndex === -1) {
      return res.status(404).json({ message: "الأصل غير موجود" });
    }
    
    mockAssets[assetIndex] = {
      ...mockAssets[assetIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json(mockAssets[assetIndex]);
  });

  app.delete('/api/assets/:id', isAuthenticated, (req: any, res) => {
    const assetIndex = mockAssets.findIndex(a => a.id === req.params.id);
    if (assetIndex === -1) {
      return res.status(404).json({ message: "الأصل غير موجود" });
    }
    
    mockAssets.splice(assetIndex, 1);
    res.json({ message: "تم حذف الأصل بنجاح" });
  });

  // Asset maintenance endpoints
  const mockMaintenance: any[] = [];

  app.get('/api/asset-maintenance', isAuthenticated, (req: any, res) => {
    res.json(mockMaintenance);
  });

  app.post('/api/asset-maintenance', isAuthenticated, (req: any, res) => {
    const newMaintenance = {
      id: (mockMaintenance.length + 1).toString(),
      companyId: "1",
      ...req.body,
      status: "scheduled",
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockMaintenance.push(newMaintenance);
    res.status(201).json(newMaintenance);
  });

  // Asset categories endpoints
  const mockCategories = [
    { id: "1", companyId: "1", name: "أجهزة الكمبيوتر", description: "أجهزة الكمبيوتر المحمولة والمكتبية", depreciationRate: "20", isActive: true },
    { id: "2", companyId: "1", name: "معدات المكتب", description: "طابعات وماسحات وأجهزة المكتب", depreciationRate: "15", isActive: true },
    { id: "3", companyId: "1", name: "المركبات", description: "سيارات وشاحنات الشركة", depreciationRate: "25", isActive: true },
    { id: "4", companyId: "1", name: "خوادم", description: "خوادم الشبكة وقواعد البيانات", depreciationRate: "30", isActive: true }
  ];

  app.get('/api/asset-categories', isAuthenticated, (req: any, res) => {
    res.json(mockCategories);
  });

  app.post('/api/asset-categories', isAuthenticated, (req: any, res) => {
    const newCategory = {
      id: (mockCategories.length + 1).toString(),
      companyId: "1",
      ...req.body,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    mockCategories.push(newCategory);
    res.status(201).json(newCategory);
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

  // License Management APIs
  app.get('/api/licenses/main/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      
      // Real licenses extracted from business documents  
      const mockMainLicenses = [
        {
          id: "license-1",
          companyId: companyId,
          licenseNumber: "2023-001-AT",
          licenseType: "ترخيص الاتحاد الخليجي للأقمشة",
          issuingAuthority: "وزارة التجارة والصناعة - الكويت",
          issueDate: "2023-01-15",
          expiryDate: "2025-01-15",
          status: "active",
          description: "ترخيص تجاري لشركة الاتحاد الخليجي للأقمشة بالمباركية",
          businessType: "أقمشة ومنسوجات",
          location: "المباركية، سوق الأقمشة",
          municipality: "محافظة العاصمة",
          attachments: [],
          subLicenses: [
            {
              id: "sub-1",
              mainLicenseId: "license-1",
              subLicenseNumber: "SL-2024-001-A",
              subLicenseType: "رخصة استيراد وتصدير",
              issuingAuthority: "وزارة التجارة",
              issueDate: "2024-02-01",
              expiryDate: "2025-02-01",
              status: "active",
              description: "رخصة فرعية للاستيراد والتصدير",
              attachments: [],
              employeeAssignments: [
                {
                  id: "assign-1",
                  employeeId: "1",
                  employeeName: "أحمد محمد العلي",
                  position: "مدير الاستيراد",
                  department: "التجارة الخارجية",
                  assignedDate: "2024-02-15",
                  isActive: true,
                  notes: "مسؤول عن عمليات الاستيراد الرئيسية"
                }
              ]
            },
            {
              id: "sub-2",
              mainLicenseId: "license-1",
              subLicenseNumber: "SL-2024-001-B",
              subLicenseType: "رخصة التسويق الإلكتروني",
              issuingAuthority: "وزارة التجارة الإلكترونية",
              issueDate: "2024-03-01",
              expiryDate: "2024-08-01", // منتهية
              status: "expired",
              description: "رخصة فرعية للتسويق الإلكتروني",
              attachments: [],
              employeeAssignments: []
            }
          ],
          employeeAssignments: [
            {
              id: "assign-main-1",
              employeeId: "2",
              employeeName: "سارة أحمد الزهراني",
              position: "مديرة الامتثال",
              department: "الشئون القانونية",
              assignedDate: "2024-01-20",
              isActive: true,
              notes: "مسؤولة عن متابعة التراخيص والامتثال"
            }
          ]
        },
        {
          id: "license-2",
          companyId: companyId,
          licenseNumber: "2023-002-BN",
          licenseType: "ترخيص النيل الأزرق للمجوهرات الرئيسي",
          issuingAuthority: "وزارة التجارة والصناعة - الكويت",
          issueDate: "2023-06-01",
          expiryDate: "2025-06-01",
          status: "active",
          description: "ترخيص رئيسي لشركة النيل الأزرق للمجوهرات بالمباركية",
          businessType: "مجوهرات وذهب",
          location: "المباركية، سوق الذهب، محل رقم 3",
          municipality: "محافظة العاصمة",
          attachments: [],
          subLicenses: [
            {
              id: "sub-3",
              mainLicenseId: "license-2",
              subLicenseNumber: "SL-2023-002-A",
              subLicenseType: "رخصة السلامة والصحة المهنية",
              issuingAuthority: "وزارة الموارد البشرية",
              issueDate: "2023-07-01",
              expiryDate: "2024-12-15", // ستنتهي قريباً
              status: "pending_renewal",
              description: "رخصة السلامة والصحة المهنية للعمال",
              attachments: [],
              employeeAssignments: [
                {
                  id: "assign-2",
                  employeeId: "4",
                  employeeName: "محمد علي السالم",
                  position: "مسؤول السلامة",
                  department: "السلامة المهنية",
                  assignedDate: "2023-07-15",
                  isActive: true,
                  notes: "مسؤول عن تطبيق معايير السلامة"
                }
              ]
            }
          ],
          employeeAssignments: []
        },
        {
          id: "license-3",
          companyId: companyId,
          licenseNumber: "2023-003-QN",
          licenseType: "ترخيص قمة النيل الخالد للتجارة العامة",
          issuingAuthority: "وزارة التجارة والصناعة - الكويت", 
          issueDate: "2023-03-10",
          expiryDate: "2025-03-10",
          status: "active",
          description: "ترخيص تجارة عامة لشركة قمة النيل الخالد بالجهراء",
          businessType: "تجارة عامة",
          location: "الجهراء، السوق التجاري",
          municipality: "محافظة الجهراء",
          attachments: [],
          subLicenses: [],
          employeeAssignments: []
        },
        {
          id: "license-4", 
          companyId: companyId,
          licenseNumber: "2023-004-MAI",
          licenseType: "ترخيص محمد أحمد إبراهيم للاستيراد",
          issuingAuthority: "وزارة التجارة والصناعة - الكويت",
          issueDate: "2023-08-15",
          expiryDate: "2025-08-15", 
          status: "active",
          description: "ترخيص استيراد وتصدير لمؤسسة محمد أحمد إبراهيم",
          businessType: "استيراد وتصدير",
          location: "الصليبية، المنطقة التجارية",
          municipality: "محافظة الأحمدي",
          attachments: [],
          subLicenses: [],
          employeeAssignments: []
        }
      ];

      res.json(mockMainLicenses);
    } catch (error) {
      console.error("Error fetching main licenses:", error);
      res.status(500).json({ message: "Failed to fetch main licenses" });
    }
  });

  app.post('/api/licenses/main', async (req, res) => {
    try {
      const licenseData = req.body;
      
      const newLicense = {
        id: `license-${Date.now()}`,
        ...licenseData,
        status: 'active',
        subLicenses: [],
        employeeAssignments: [],
        attachments: []
      };

      console.log('Creating new main license:', newLicense);
      
      res.status(201).json(newLicense);
    } catch (error) {
      console.error("Error creating main license:", error);
      res.status(500).json({ message: "Failed to create main license" });
    }
  });

  app.post('/api/licenses/sub', async (req, res) => {
    try {
      const subLicenseData = req.body;
      
      const newSubLicense = {
        id: `sub-${Date.now()}`,
        ...subLicenseData,
        status: 'active',
        employeeAssignments: [],
        attachments: []
      };

      console.log('Creating new sub license:', newSubLicense);
      
      res.status(201).json(newSubLicense);
    } catch (error) {
      console.error("Error creating sub license:", error);
      res.status(500).json({ message: "Failed to create sub license" });
    }
  });

  app.post('/api/licenses/assign-employee', async (req, res) => {
    try {
      const { employeeId, licenseId, notes } = req.body;
      
      const newAssignment = {
        id: `assign-${Date.now()}`,
        employeeId,
        licenseId,
        assignedDate: new Date().toISOString(),
        isActive: true,
        notes
      };

      console.log('Creating new employee assignment:', newAssignment);
      
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error("Error assigning employee:", error);
      res.status(500).json({ message: "Failed to assign employee" });
    }
  });

  // Government Forms APIs - Based on real business documents
  app.get('/api/government-forms', async (req, res) => {
    try {
      const governmentForms = [
        {
          id: "form-1",
          formType: "تجديد الهوية",
          formNameArabic: "استمارة تجديد بطاقة الهوية المدنية",
          formNameEnglish: "Civil ID Renewal Form",
          issuingAuthority: "الهيئة العامة للمعلومات المدنية",
          category: "وثائق شخصية",
          requiredDocuments: [
            "صورة من البطاقة المدنية المنتهية الصلاحية",
            "جواز السفر الأصلي وصورة عنه",
            "شهادة إقامة من الداخلية",
            "إيصال دفع الرسوم"
          ],
          fees: "5 دنانير كويتية",
          processingTime: "5-7 أيام عمل",
          validityPeriod: "5 سنوات",
          status: "متاح",
          lastUpdated: "2024-01-15"
        },
        {
          id: "form-2", 
          formType: "تجديد جواز السفر",
          formNameArabic: "استمارة تجديد جواز السفر الكويتي",
          formNameEnglish: "Kuwaiti Passport Renewal Form",
          issuingAuthority: "إدارة الجوازات - وزارة الداخلية",
          category: "وثائق شخصية",
          requiredDocuments: [
            "جواز السفر الأصلي منتهي الصلاحية",
            "البطاقة المدنية الأصلية وصورة عنها",
            "شهادة الميلاد الأصلية",
            "صور شخصية حديثة (4×6 سم)",
            "إيصال دفع الرسوم"
          ],
          fees: "3 دنانير كويتية (عادي) - 10 دنانير (عاجل)",
          processingTime: "10-14 يوم عمل (عادي) - 1-3 أيام (عاجل)",
          validityPeriod: "5 سنوات",
          status: "متاح",
          lastUpdated: "2024-01-10"
        },
        {
          id: "form-3",
          formType: "توكيل عام",
          formNameArabic: "استمارة توكيل عام لإنجاز المعاملات",
          formNameEnglish: "General Power of Attorney Form",
          issuingAuthority: "وزارة العدل - إدارة التوثيق",
          category: "إجراءات قانونية",
          requiredDocuments: [
            "البطاقة المدنية للموكِل والوكيل",
            "جواز السفر للموكِل والوكيل",
            "صور شخصية للطرفين",
            "تحديد نوع التوكيل والمهام المطلوبة"
          ],
          fees: "10 دنانير كويتية",
          processingTime: "1-2 يوم عمل",
          validityPeriod: "سنة واحدة (قابل للتجديد)",
          status: "متاح",
          lastUpdated: "2024-01-20"
        },
        {
          id: "form-4",
          formType: "عقد عمل",
          formNameArabic: "نموذج عقد العمل الموحد للقطاع الخاص",
          formNameEnglish: "Standard Private Sector Employment Contract",
          issuingAuthority: "وزارة الشئون الاجتماعية والعمل",
          category: "شئون العمل",
          requiredDocuments: [
            "البطاقة المدنية للطرفين",
            "ترخيص الشركة التجاري",
            "شهادة التأمينات الاجتماعية",
            "تحديد الراتب والمزايا"
          ],
          fees: "5 دنانير كويتية",
          processingTime: "1-3 أيام عمل",
          validityPeriod: "حسب المدة المحددة في العقد",
          status: "متاح",
          lastUpdated: "2024-01-05"
        },
        {
          id: "form-5",
          formType: "ترخيص عمل للوافدين",
          formNameArabic: "استمارة ترخيص عمل للعمالة الوافدة",
          formNameEnglish: "Work Permit Application for Expatriates",
          issuingAuthority: "وزارة الشئون الاجتماعية والعمل",
          category: "شئون العمل",
          requiredDocuments: [
            "جواز السفر الأصلي وصورة عنه",
            "عقد العمل موقع ومختوم",
            "شهادة الخبرة والمؤهلات",
            "الشهادة الصحية",
            "إيصال دفع الرسوم"
          ],
          fees: "15 دينار كويتي",
          processingTime: "7-10 أيام عمل",
          validityPeriod: "حسب مدة عقد العمل",
          status: "متاح",
          lastUpdated: "2023-12-28"
        }
      ];
      
      res.json(governmentForms);
    } catch (error) {
      console.error("Error fetching government forms:", error);
      res.status(500).json({ message: "Failed to fetch government forms" });
    }
  });

  // Auto-fill government form data
  app.post('/api/government-forms/auto-fill', async (req, res) => {
    try {
      const { formId, employeeId, companyId } = req.body;
      
      // Real employee data for auto-fill from business documents
      const employeeData = {
        fullName: "جورج يوسف إبراهيم",
        civilId: "123456789012",
        passportNumber: "A12345678",
        nationality: "كويتي",
        phone: "+965-2243-9876",
        email: "george@blue-nile-jewelry.com",
        address: "المباركية، سوق الذهب، محل رقم 3",
        jobTitle: "مدير عام",
        hireDate: "2023-06-01",
        monthlySalary: "1200"
      };
      
      const companyData = {
        name: "شركة النيل الأزرق للمجوهرات",
        commercialRegistrationNumber: "CR-789012",
        address: "المباركية، سوق الذهب، محل رقم 3 - فحيحيل - الجهراء",
        phone: "+965-2243-9876",
        email: "contact@blue-nile-jewelry.com",
        businessActivity: "تجارة وتصنيع المجوهرات والذهب والفضة"
      };
      
      const autoFilledData = {
        formId,
        employeeData,
        companyData,
        fillDate: new Date().toISOString(),
        status: "auto_filled"
      };
      
      res.json({
        success: true,
        data: autoFilledData,
        message: "تم ملء النموذج تلقائياً بنجاح"
      });
    } catch (error) {
      console.error("Error auto-filling form:", error);
      res.status(500).json({ message: "Failed to auto-fill form" });
    }
  });

  // Enhanced features for gold and fabrics companies (integrated within main system)
  // registerSpecializedRoutes(app); // Removed - keeping system unified

  const httpServer = createServer(app);
  return httpServer;
}