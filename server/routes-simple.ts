import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  
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
        employeeCount: 450,
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

  const httpServer = createServer(app);
  return httpServer;
}