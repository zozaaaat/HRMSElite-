import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./mock-storage";
import { registerAdvancedRoutes } from "./advanced-routes";
import { insertCompanySchema, insertEmployeeSchema, insertLicenseSchema, insertEmployeeLeaveSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

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
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/companies', isAuthenticated, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
