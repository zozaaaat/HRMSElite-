import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Missing APIs Implementation
export function setupMissingAPIs(app: Express) {

  // Enhanced Employee APIs
  app.get('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const { companyId, includeArchived } = req.query;
      const employees = await storage.getCompanyEmployees(companyId, includeArchived === 'true');
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const employee = await storage.createEmployee(req.body);
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.get('/api/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Attendance APIs
  app.get('/api/attendance/today', isAuthenticated, async (req: any, res) => {
    try {
      const { companyId } = req.query;
      const today = new Date().toISOString().split('T')[0];
      
      // Mock data for now - integrate with real attendance system
      const attendanceData = {
        date: today,
        totalEmployees: 125,
        present: 98,
        absent: 22,
        late: 5,
        onLeave: 8,
        records: [
          {
            employeeId: "emp1",
            employeeName: "أحمد محمد علي",
            checkIn: "07:45:00",
            checkOut: null,
            status: "present",
            location: "المكتب الرئيسي"
          },
          {
            employeeId: "emp2", 
            employeeName: "فاطمة أحمد حسن",
            checkIn: "08:15:00",
            checkOut: null,
            status: "late",
            location: "فرع المدينة"
          }
        ]
      };
      
      res.json(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance data" });
    }
  });

  app.post('/api/attendance/checkin', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId, location, photo } = req.body;
      const checkInTime = new Date();
      
      // Mock check-in logic
      const result = {
        success: true,
        employeeId,
        checkInTime: checkInTime.toISOString(),
        location,
        message: "تم تسجيل الحضور بنجاح"
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  app.post('/api/attendance/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId } = req.body;
      const checkOutTime = new Date();
      
      // Mock check-out logic
      const result = {
        success: true,
        employeeId,
        checkOutTime: checkOutTime.toISOString(),
        workingHours: "8:30",
        message: "تم تسجيل الانصراف بنجاح"
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });

  // Leave Request APIs
  app.get('/api/leave-requests', isAuthenticated, async (req: any, res) => {
    try {
      const { companyId, status, employeeId } = req.query;
      
      // Mock leave requests data
      const leaveRequests = [
        {
          id: "lr1",
          employeeId: "emp1",
          employeeName: "أحمد محمد علي",
          department: "المبيعات",
          leaveType: "إجازة سنوية",
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          days: 5,
          reason: "إجازة عائلية",
          status: "pending",
          requestDate: "2025-01-28",
          approvedBy: null
        },
        {
          id: "lr2",
          employeeId: "emp2",
          employeeName: "فاطمة أحمد حسن",
          department: "المحاسبة",
          leaveType: "إجازة مرضية",
          startDate: "2025-01-30",
          endDate: "2025-01-31",
          days: 2,
          reason: "مرض",
          status: "approved",
          requestDate: "2025-01-28",
          approvedBy: "مدير الموارد البشرية"
        }
      ];
      
      res.json(leaveRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.get('/api/leave-balance/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      
      // Mock leave balance data
      const leaveBalance = {
        employeeId,
        annualLeave: {
          total: 30,
          used: 8,
          remaining: 22
        },
        sickLeave: {
          total: 15,
          used: 3,
          remaining: 12
        },
        casualLeave: {
          total: 7,
          used: 2,
          remaining: 5
        }
      };
      
      res.json(leaveBalance);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      res.status(500).json({ message: "Failed to fetch leave balance" });
    }
  });

  // Payroll APIs
  app.get('/api/payroll/overview', isAuthenticated, async (req: any, res) => {
    try {
      const { companyId, month, year } = req.query;
      
      // Mock payroll overview
      const overview = {
        month: month || new Date().getMonth() + 1,
        year: year || new Date().getFullYear(),
        totalEmployees: 125,
        totalSalary: 875000,
        totalDeductions: 125000,
        netPay: 750000,
        processed: 98,
        pending: 27,
        status: "in_progress"
      };
      
      res.json(overview);
    } catch (error) {
      console.error("Error fetching payroll overview:", error);
      res.status(500).json({ message: "Failed to fetch payroll overview" });
    }
  });

  // Mobile specific APIs
  app.get('/api/mobile/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const integrations = [
        {
          id: "mobile1",
          name: "تطبيق الموظفين",
          type: "PWA",
          status: "active",
          users: 85,
          lastSync: new Date().toISOString(),
          features: ["تسجيل الحضور", "طلب إجازة", "عرض الراتب", "الإشعارات"]
        },
        {
          id: "mobile2",
          name: "تطبيق المشرفين",
          type: "Native App",
          status: "active", 
          users: 12,
          lastSync: new Date().toISOString(),
          features: ["متابعة العمال", "الموافقة على الطلبات", "التقارير"]
        }
      ];
      
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching mobile integrations:", error);
      res.status(500).json({ message: "Failed to fetch mobile integrations" });
    }
  });

  app.get('/api/mobile/device-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const devices = [
        {
          id: "device1",
          deviceName: "جهاز تسجيل الحضور - المدخل الرئيسي",
          location: "المبنى الرئيسي - الطابق الأول",
          status: "online",
          registeredUsers: 125,
          lastPing: new Date().toISOString()
        },
        {
          id: "device2",
          deviceName: "جهاز تسجيل الحضور - فرع المدينة",
          location: "فرع المدينة - مدخل الموظفين",
          status: "online",
          registeredUsers: 67,
          lastPing: new Date(Date.now() - 300000).toISOString()
        }
      ];
      
      res.json(devices);
    } catch (error) {
      console.error("Error fetching device registrations:", error);
      res.status(500).json({ message: "Failed to fetch device registrations" });
    }
  });

  app.get('/api/mobile/stats/:companyId', isAuthenticated, async (req: any, res) => {
    try {
      const stats = {
        activeUsers: 156,
        dailyCheckIns: 142,
        appInstalls: 189,
        notificationsSent: 45
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching mobile stats:", error);
      res.status(500).json({ message: "Failed to fetch mobile stats" });
    }
  });

  app.get('/api/mobile/attendance/:companyId', isAuthenticated, async (req: any, res) => {
    try {
      const attendance = [
        {
          employeeId: "emp1",
          employeeName: "أحمد محمد علي",
          checkIn: "07:45",
          location: "المكتب الرئيسي",
          device: "mobile_app"
        },
        {
          employeeId: "emp2",
          employeeName: "فاطمة أحمد حسن", 
          checkIn: "08:15",
          location: "فرع المدينة",
          device: "biometric_device"
        }
      ];
      
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching mobile attendance:", error);
      res.status(500).json({ message: "Failed to fetch mobile attendance" });
    }
  });

}