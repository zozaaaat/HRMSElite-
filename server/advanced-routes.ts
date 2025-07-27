import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { 
  aiInsights, 
  workflows, 
  courses, 
  payrollRecords, 
  attendanceRecords,
  companies,
  employees
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export function registerAdvancedRoutes(app: Express) {
  // AI Insights Routes
  app.get("/api/ai/insights/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const insights = await db
        .select()
        .from(aiInsights)
        .where(eq(aiInsights.companyId, companyId))
        .orderBy(desc(aiInsights.createdAt))
        .limit(10);
      
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  app.get("/api/ai/insights/system", isAuthenticated, async (req, res) => {
    try {
      // Mock system-level insights for demo
      const systemInsights = {
        alerts: [
          {
            title: "معدل غياب مرتفع",
            description: "الشركة أ تسجل معدل غياب 15% هذا الشهر",
            priority: "high",
            type: "attendance"
          },
          {
            title: "دورات تدريبية مطلوبة",
            description: "20 موظف يحتاجون إلى تدريب في السلامة",
            priority: "medium",
            type: "training"
          },
          {
            title: "تجديد التراخيص",
            description: "5 تراخيص تنتهي خلال 30 يوم",
            priority: "high",
            type: "licenses"
          }
        ],
        recommendations: [
          {
            title: "تحسين الحضور",
            description: "تطبيق نظام حوافز للحضور المنتظم",
            impact: "high"
          },
          {
            title: "برنامج تدريب شامل",
            description: "إنشاء برنامج تدريب ربع سنوي",
            impact: "medium"
          }
        ]
      };
      
      res.json(systemInsights);
    } catch (error) {
      console.error("Error fetching system insights:", error);
      res.status(500).json({ message: "Failed to fetch system insights" });
    }
  });

  // Workflow Routes
  app.get("/api/workflows/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const workflowsList = await db
        .select()
        .from(workflows)
        .where(eq(workflows.companyId, companyId))
        .orderBy(desc(workflows.createdAt));
      
      res.json(workflowsList);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.post("/api/workflows", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const workflowData = {
        ...req.body,
        createdBy: userId
      };
      
      const [newWorkflow] = await db
        .insert(workflows)
        .values(workflowData)
        .returning();
      
      res.json(newWorkflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  // Learning Management Routes
  app.get("/api/courses/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const coursesList = await db
        .select()
        .from(courses)
        .where(eq(courses.companyId, companyId))
        .orderBy(desc(courses.createdAt));
      
      res.json(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/learning/stats/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      
      // Mock learning statistics for demo
      const stats = {
        activeCourses: 24,
        activeTrainees: 156,
        certificationsEarned: 89,
        completionRate: 78.5
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching learning stats:", error);
      res.status(500).json({ message: "Failed to fetch learning stats" });
    }
  });

  // Financial Management Routes
  app.get("/api/payroll/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const payrollData = await db
        .select()
        .from(payrollRecords)
        .where(eq(payrollRecords.companyId, companyId))
        .orderBy(desc(payrollRecords.createdAt))
        .limit(50);
      
      res.json(payrollData);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      res.status(500).json({ message: "Failed to fetch payroll data" });
    }
  });

  app.get("/api/financial-stats/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      
      // Mock financial statistics for demo
      const stats = {
        totalSalaries: 125000,
        averageEmployeeCost: 4850,
        annualIncreases: 8.5,
        employeesPaid: { paid: 45, total: 48 }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching financial stats:", error);
      res.status(500).json({ message: "Failed to fetch financial stats" });
    }
  });

  // Mobile App Routes
  app.get("/api/mobile/stats/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      
      // Mock mobile app statistics for demo
      const stats = {
        appsInstalled: { installed: 42, total: 48 },
        todayAttendance: { present: 38, total: 42 },
        notificationsSent: 156,
        responseRate: 94.2
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching mobile stats:", error);
      res.status(500).json({ message: "Failed to fetch mobile stats" });
    }
  });

  app.get("/api/mobile/attendance/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const attendanceData = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.companyId, companyId))
        .orderBy(desc(attendanceRecords.createdAt))
        .limit(100);
      
      res.json(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      res.status(500).json({ message: "Failed to fetch attendance data" });
    }
  });

  // Business Intelligence Routes
  app.get("/api/bi/analytics/:companyId", isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      
      // Mock BI analytics for demo
      const analytics = {
        kpis: {
          employeeRetention: 92.5,
          averagePerformance: 87.3,
          trainingEffectiveness: 89.1,
          customerSatisfaction: 94.2
        },
        trends: {
          employeeGrowth: [
            { month: "يناير", value: 45 },
            { month: "فبراير", value: 47 },
            { month: "مارس", value: 48 },
            { month: "أبريل", value: 52 },
            { month: "مايو", value: 55 }
          ],
          performanceMetrics: [
            { metric: "الإنتاجية", current: 87.5, target: 90 },
            { metric: "جودة العمل", current: 92.3, target: 95 },
            { metric: "الالتزام بالمواعيد", current: 94.1, target: 96 }
          ]
        },
        predictions: [
          {
            title: "توقع احتياج التوظيف",
            description: "ستحتاج الشركة 8-10 موظفين جدد خلال الربع القادم",
            confidence: 85
          },
          {
            title: "توقع معدل الأداء",
            description: "متوقع تحسن الأداء بنسبة 5% خلال الشهرين القادمين",
            confidence: 78
          }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching BI analytics:", error);
      res.status(500).json({ message: "Failed to fetch BI analytics" });
    }
  });

  // Employee 360 View Routes
  app.get("/api/employee/360/:employeeId", isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      // Get employee basic info
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, employeeId));

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Mock 360 view data for demo
      const employee360 = {
        ...employee,
        performance: {
          overall: 87.5,
          goals: [
            { title: "زيادة الإنتاجية", progress: 85, target: 90 },
            { title: "تطوير المهارات", progress: 70, target: 80 },
            { title: "تحسين الجودة", progress: 92, target: 95 }
          ],
          reviews: [
            {
              period: "Q1 2025",
              score: 4.2,
              reviewer: "أحمد محمد",
              comments: "أداء ممتاز في المشاريع المكلف بها"
            }
          ]
        },
        skills: [
          { name: "القيادة", level: 85 },
          { name: "التواصل", level: 92 },
          { name: "التقنية", level: 78 },
          { name: "حل المشاكل", level: 88 }
        ],
        training: {
          completed: 12,
          inProgress: 2,
          planned: 3
        },
        attendance: {
          rate: 96.5,
          lateArrivals: 2,
          absences: 1
        }
      };
      
      res.json(employee360);
    } catch (error) {
      console.error("Error fetching employee 360 view:", error);
      res.status(500).json({ message: "Failed to fetch employee 360 view" });
    }
  });
}