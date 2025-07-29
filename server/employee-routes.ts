import type { Express } from "express";
import { storage } from "./storage";
import { insertEmployeeSchema, insertEmployeeLeaveSchema, insertEmployeeDeductionSchema, insertEmployeeViolationSchema } from "@shared/schema";

export function registerEmployeeRoutes(app: Express) {
  
  // Enhanced auth middleware with role-based access
  const isAuthenticated = (req: any, res: any, next: any) => {
    // Enhanced authentication for development with role simulation
    const userRole = req.headers['x-user-role'] || 'company_manager';
    const userId = req.headers['x-user-id'] || '1';
    
    req.user = {
      sub: userId,
      role: userRole,
      email: "user@company.com",
      firstName: "محمد",
      lastName: "أحمد"
    };
    next();
  };

  // Role-based authorization middleware
  const requireRole = (allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => {
      const userRole = req.user?.role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }
      next();
    };
  };

  // Employee management routes
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const userRole = (req.user as any)?.role;
      // Only super_admin and company_manager can view all employees
      if (!['super_admin', 'company_manager', 'administrative_employee'].includes(userRole)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const employees = await storage.getCompanyEmployees("company-1", false);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching all employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', isAuthenticated, requireRole(['super_admin', 'company_manager']), async (req, res) => {
    try {
      const result = insertEmployeeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid employee data", 
          errors: result.error.issues 
        });
      }

      const employee = await storage.createEmployee(result.data);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.get('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.put('/api/employees/:id', isAuthenticated, requireRole(['super_admin', 'company_manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertEmployeeSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid employee data", 
          errors: result.error.issues 
        });
      }

      const employee = await storage.updateEmployee(id, result.data);
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, requireRole(['super_admin', 'company_manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Archive reason is required" });
      }

      await storage.archiveEmployee(id, reason);
      res.json({ message: "Employee archived successfully" });
    } catch (error) {
      console.error("Error archiving employee:", error);
      res.status(500).json({ message: "Failed to archive employee" });
    }
  });

  // Employee leave routes
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
      const leaveData = { ...req.body, employeeId };
      
      const result = insertEmployeeLeaveSchema.safeParse(leaveData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid leave data", 
          errors: result.error.issues 
        });
      }

      const leave = await storage.createLeave(result.data);
      res.status(201).json(leave);
    } catch (error) {
      console.error("Error creating leave:", error);
      res.status(500).json({ message: "Failed to create leave" });
    }
  });

  // Employee deduction routes
  app.get('/api/employees/:employeeId/deductions', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const deductions = await storage.getEmployeeDeductions(employeeId);
      res.json(deductions);
    } catch (error) {
      console.error("Error fetching employee deductions:", error);
      res.status(500).json({ message: "Failed to fetch employee deductions" });
    }
  });

  app.post('/api/employees/:employeeId/deductions', isAuthenticated, requireRole(['super_admin', 'company_manager']), async (req, res) => {
    try {
      const { employeeId } = req.params;
      const deductionData = { 
        ...req.body, 
        employeeId,
        processedBy: (req.user as any)?.sub 
      };
      
      const result = insertEmployeeDeductionSchema.safeParse(deductionData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid deduction data", 
          errors: result.error.issues 
        });
      }

      const deduction = await storage.createDeduction(result.data);
      res.status(201).json(deduction);
    } catch (error) {
      console.error("Error creating deduction:", error);
      res.status(500).json({ message: "Failed to create deduction" });
    }
  });

  // Employee violation routes
  app.get('/api/employees/:employeeId/violations', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const violations = await storage.getEmployeeViolations(employeeId);
      res.json(violations);
    } catch (error) {
      console.error("Error fetching employee violations:", error);
      res.status(500).json({ message: "Failed to fetch employee violations" });
    }
  });

  app.post('/api/employees/:employeeId/violations', isAuthenticated, requireRole(['super_admin', 'company_manager']), async (req, res) => {
    try {
      const { employeeId } = req.params;
      const violationData = { 
        ...req.body, 
        employeeId,
        reportedBy: (req.user as any)?.sub 
      };
      
      const result = insertEmployeeViolationSchema.safeParse(violationData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid violation data", 
          errors: result.error.issues 
        });
      }

      const violation = await storage.createViolation(result.data);
      res.status(201).json(violation);
    } catch (error) {
      console.error("Error creating violation:", error);
      res.status(500).json({ message: "Failed to create violation" });
    }
  });

  // Attendance routes
  app.get('/api/attendance/:employeeId', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;
      
      // Mock attendance data - in real app this would come from database
      const attendance = {
        employeeId,
        month: month || new Date().getMonth() + 1,
        year: year || new Date().getFullYear(),
        records: [
          {
            date: '2025-01-29',
            checkIn: '08:00',
            checkOut: '17:00',
            workingHours: 8,
            overtime: 0,
            status: 'present'
          },
          {
            date: '2025-01-28',
            checkIn: '08:15',
            checkOut: '17:30',
            workingHours: 8.25,
            overtime: 0.25,
            status: 'present'
          }
        ],
        summary: {
          totalDays: 30,
          presentDays: 28,
          absentDays: 2,
          totalHours: 224,
          overtimeHours: 5.5
        }
      };
      
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance/checkin', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).sub;
      const checkInTime = new Date().toLocaleTimeString('ar-EG', { hour12: false });
      res.json({ 
        success: true, 
        checkIn: checkInTime,
        message: "تم تسجيل الحضور بنجاح" 
      });
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  app.post('/api/attendance/checkout', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).sub;
      const checkOutTime = new Date().toLocaleTimeString('ar-EG', { hour12: false });
      res.json({ 
        success: true, 
        checkOut: checkOutTime,
        message: "تم تسجيل الانصراف بنجاح" 
      });
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });

}