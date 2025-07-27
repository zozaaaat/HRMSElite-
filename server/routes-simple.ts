import type { Express } from "express";
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
      req.session.user = user;
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
      const mockCompanies = [
        {
          id: "1",
          name: "شركة التقنية المتقدمة",
          description: "رائدة في حلول تقنية المعلومات والبرمجيات",
          address: "الرياض، المملكة العربية السعودية",
          phone: "+966123456789",
          email: "info@techadvanced.sa",
          website: "www.techadvanced.sa",
          industry: "تقنية المعلومات",
          size: "كبيرة",
          status: "active",
          employeeCount: 450,
        },
        {
          id: "2",
          name: "الشركة التجارية الكبرى",
          description: "متخصصة في التجارة والاستيراد والتصدير",
          address: "جدة، المملكة العربية السعودية",
          phone: "+966987654321",
          email: "info@trading.sa",
          website: "www.trading.sa",
          industry: "التجارة",
          size: "متوسطة",
          status: "active",
          employeeCount: 230,
        },
        {
          id: "3",
          name: "المؤسسة الصناعية",
          description: "تصنيع وإنتاج المواد الصناعية والكيميائية",
          address: "الدمام، المملكة العربية السعودية",
          phone: "+966555123456",
          email: "info@industrial.sa",
          website: "www.industrial.sa",
          industry: "الصناعة",
          size: "كبيرة",
          status: "active",
          employeeCount: 680,
        },
        {
          id: "4",
          name: "مؤسسة الخدمات المالية",
          description: "خدمات مصرفية ومالية متكاملة",
          address: "الرياض، المملكة العربية السعودية",
          phone: "+966444567890",
          email: "info@financial.sa",
          website: "www.financial.sa",
          industry: "المالية",
          size: "متوسطة",
          status: "pending",
          employeeCount: 320,
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
      const mockEmployees = [
        {
          id: "1",
          companyId: req.params.companyId,
          fullName: "أحمد محمد العلي",
          email: "ahmed@company.sa",
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

  const httpServer = createServer(app);
  return httpServer;
}