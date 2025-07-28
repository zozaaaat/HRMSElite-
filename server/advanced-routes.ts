import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";

export function registerAdvancedRoutes(app: Express) {
  // نظام الإجازات
  app.get("/api/leave-requests", async (req, res) => {
    const leaveRequests = [
      {
        id: "1",
        employeeName: "أحمد محمد علي",
        leaveType: "annual",
        startDate: "2025-02-01",
        endDate: "2025-02-05",
        reason: "إجازة سنوية للسفر مع العائلة",
        status: "pending",
        requestDate: "2025-01-28",
      },
      {
        id: "2",
        employeeName: "فاطمة أحمد سالم",
        leaveType: "sick",
        startDate: "2025-01-25",
        endDate: "2025-01-27",
        reason: "إجازة مرضية - تقرير طبي مرفق",
        status: "approved",
        requestDate: "2025-01-24",
        approvedBy: "مدير الموارد البشرية"
      },
      {
        id: "3",
        employeeName: "محمد عبدالله الحربي",
        leaveType: "emergency",
        startDate: "2025-01-20",
        endDate: "2025-01-20",
        reason: "ظرف طارئ عائلي",
        status: "rejected",
        requestDate: "2025-01-20",
        rejectionReason: "لم يتم تقديم المستندات المطلوبة"
      }
    ];
    res.json(leaveRequests);
  });

  app.get("/api/leave-balance", async (req, res) => {
    const balance = {
      annual: 21,
      sick: 30,
      emergency: 7,
      usedAnnual: 5,
      usedSick: 2,
      usedEmergency: 1
    };
    res.json(balance);
  });

  app.post("/api/leave-requests", async (req, res) => {
    res.json({ success: true, message: "تم إرسال طلب الإجازة بنجاح", id: Date.now().toString() });
  });

  app.patch("/api/leave-requests/:id/approve", async (req, res) => {
    res.json({ success: true, message: "تمت الموافقة على الطلب" });
  });

  app.patch("/api/leave-requests/:id/reject", async (req, res) => {
    res.json({ success: true, message: "تم رفض الطلب" });
  });

  // نظام الحضور والانصراف
  app.get("/api/attendance", async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = [
      {
        id: "1",
        employeeId: "emp001",
        employeeName: "أحمد محمد علي",
        date: today,
        checkIn: "08:15",
        checkOut: "17:30",
        status: "present",
        workHours: "9.25",
        overtimeHours: "1.25"
      },
      {
        id: "2",
        employeeId: "emp002",
        employeeName: "فاطمة أحمد سالم",
        date: today,
        checkIn: "08:00",
        checkOut: null,
        status: "present",
        workHours: "0",
        overtimeHours: "0"
      },
      {
        id: "3",
        employeeId: "emp003",
        employeeName: "محمد عبدالله الحربي",
        date: today,
        checkIn: "09:45",
        checkOut: "18:00",
        status: "late",
        workHours: "8.25",
        overtimeHours: "0"
      },
      {
        id: "4",
        employeeId: "emp004",
        employeeName: "سارة عبدالرحمن القحطاني",
        date: today,
        checkIn: null,
        checkOut: null,
        status: "absent",
        workHours: "0",
        overtimeHours: "0"
      },
      {
        id: "5",
        employeeId: "emp005",
        employeeName: "خالد سعد المطيري",
        date: today,
        checkIn: null,
        checkOut: null,
        status: "holiday",
        workHours: "0",
        overtimeHours: "0"
      }
    ];
    res.json(attendanceRecords);
  });

  app.post("/api/attendance/check-in", async (req, res) => {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    res.json({ 
      success: true, 
      message: "تم تسجيل الحضور بنجاح",
      checkInTime: timeString,
      employeeId: "emp001"
    });
  });

  app.post("/api/attendance/check-out", async (req, res) => {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    res.json({ 
      success: true, 
      message: "تم تسجيل الانصراف بنجاح",
      checkOutTime: timeString,
      employeeId: "emp001",
      workHours: "8.5",
      overtimeHours: "0.5"
    });
  });

  // Employee stats endpoint
  app.get("/api/employees/stats", isAuthenticated, async (req, res) => {
    try {
      // Mock stats data
      const stats = {
        total: 156,
        active: 142,
        onLeave: 8,
        inactive: 6,
        newThisMonth: 12,
        avgSalary: 8750,
        avgPerformance: 87
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching employee stats:", error);
      res.status(500).json({ message: "Failed to fetch employee stats" });
    }
  });

  // Companies with enhanced data
  app.get("/api/companies/enhanced", isAuthenticated, async (req, res) => {
    try {
      // Mock enhanced companies data
      const companies = [
        {
          id: "1",
          name: "شركة التقنية المتقدمة",
          description: "رائدة في حلول تقنية المعلومات والبرمجيات",
          address: "الرياض، المملكة العربية السعودية",
          phone: "+966 11 234 5678",
          email: "info@tech-advanced.com",
          website: "https://tech-advanced.com",
          industry: "تقنية المعلومات",
          size: "large",
          status: "active",
          employeeCount: 450,
          activeLicenses: 3,
          createdAt: "2023-01-15T00:00:00Z",
          updatedAt: "2024-01-27T00:00:00Z"
        },
        {
          id: "2",
          name: "الشركة التجارية الكبرى", 
          description: "متخصصة في التجارة والاستيراد والتصدير",
          address: "جدة، المملكة العربية السعودية",
          phone: "+966 12 345 6789",
          email: "info@trade-major.com",
          website: "https://trade-major.com",
          industry: "التجارة",
          size: "medium",
          status: "active",
          employeeCount: 230,
          activeLicenses: 2,
          createdAt: "2023-03-20T00:00:00Z",
          updatedAt: "2024-01-26T00:00:00Z"
        },
        {
          id: "3",
          name: "المؤسسة الصناعية",
          description: "تصنيع وإنتاج المواد الصناعية والكيميائية",
          address: "الدمام، المملكة العربية السعودية",
          phone: "+966 13 456 7890",
          email: "info@industrial-corp.com",
          website: "https://industrial-corp.com",
          industry: "الصناعة",
          size: "large",
          status: "active",
          employeeCount: 680,
          activeLicenses: 5,
          createdAt: "2022-11-10T00:00:00Z",
          updatedAt: "2024-01-25T00:00:00Z"
        }
      ];
      
      res.json(companies);
    } catch (error) {
      console.error("Error fetching enhanced companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Dashboard analytics endpoint
  app.get("/api/analytics/:companyId/:period/:metric", isAuthenticated, async (req, res) => {
    try {
      const { companyId, period, metric } = req.params;
      
      // Mock analytics data
      const analytics = {
        overview: {
          totalEmployees: 156,
          activeEmployees: 142,
          newHires: 12,
          turnoverRate: 8.3,
          satisfactionScore: 87,
          productivity: 94
        },
        attendance: {
          averageAttendance: 94.2,
          lateArrivals: 15,
          earlyLeaves: 8,
          absences: 23
        },
        performance: {
          averageScore: 87,
          topPerformers: 23,
          needsImprovement: 12,
          completedTraining: 89
        },
        payroll: {
          totalPayroll: 1234567,
          averageSalary: 8750,
          bonusesPaid: 156780,
          deductions: 45230
        }
      };
      
      res.json(analytics[metric as keyof typeof analytics] || analytics.overview);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // KPIs endpoint
  app.get("/api/analytics/kpis/:companyId/:period", isAuthenticated, async (req, res) => {
    try {
      const kpis = [
        {
          name: "معدل دوران الموظفين",
          value: 12.5,
          target: 15,
          trend: -2.3,
          status: "good"
        },
        {
          name: "مؤشر رضا الموظفين",
          value: 87,
          target: 85,
          trend: 3.2,
          status: "excellent"
        },
        {
          name: "معدل الحضور",
          value: 94.2,
          target: 90,
          trend: 1.8,
          status: "good"
        },
        {
          name: "تكلفة التوظيف",
          value: 8500,
          target: 10000,
          trend: -15.2,
          status: "excellent"
        }
      ];
      
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  // Departments endpoint
  app.get("/api/departments/:companyId", isAuthenticated, async (req, res) => {
    try {
      const departments = [
        {
          id: "1",
          name: "الموارد البشرية",
          head: "أحمد محمد",
          employeeCount: 12,
          efficiency: 92,
          satisfaction: 89,
          productivity: 88
        },
        {
          id: "2", 
          name: "المالية",
          head: "فاطمة علي",
          employeeCount: 8,
          efficiency: 89,
          satisfaction: 91,
          productivity: 95
        },
        {
          id: "3",
          name: "التسويق",
          head: "خالد أحمد",
          employeeCount: 15,
          efficiency: 85,
          satisfaction: 87,
          productivity: 83
        },
        {
          id: "4",
          name: "العمليات",
          head: "مريم سالم",
          employeeCount: 25,
          efficiency: 91,
          satisfaction: 85,
          productivity: 92
        },
        {
          id: "5",
          name: "تقنية المعلومات",
          head: "محمد عبدالله",
          employeeCount: 18,
          efficiency: 88,
          satisfaction: 92,
          productivity: 90
        }
      ];
      
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // AI insights endpoint  
  app.get("/api/ai/insights/:companyId", isAuthenticated, async (req, res) => {
    try {
      const insights = [
        {
          type: "recommendation",
          title: "تحسين مؤشر الرضا",
          description: "يمكن تحسين مؤشر رضا الموظفين بنسبة 5% من خلال تطبيق برنامج تدريبي جديد",
          priority: "medium",
          impact: "high"
        },
        {
          type: "alert",
          title: "زيادة في معدل التأخير",
          description: "لوحظ ارتفاع معدل التأخير بنسبة 15% في قسم التسويق خلال الأسبوع الماضي",
          priority: "high", 
          impact: "medium"
        },
        {
          type: "insight",
          title: "موسم التوظيف المثلى",
          description: "بناءً على البيانات التاريخية، أفضل وقت للتوظيف هو شهر مارس وأبريل",
          priority: "low",
          impact: "high"
        }
      ];
      
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });
}