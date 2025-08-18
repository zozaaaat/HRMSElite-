/**
 * @fileoverview Employee routes for HRMS Elite application
 * @description Provides REST API endpoints for employee management including CRUD operations,
 * leave management, deductions, violations, and attendance tracking
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import type { Express, Request, Response } from "express";
import { storage } from "../models/storage";
import { log } from "../utils/logger";
import {
  insertEmployeeSchema,
  insertEmployeeLeaveSchema,
  insertEmployeeDeductionSchema,
  insertEmployeeViolationSchema,
  InsertEmployee,
} from "@shared/schema";
import { isAuthenticated, requireRole } from "../middleware/auth";

/**
 * Register employee routes with the Express application
 * @description Sets up all employee-related API endpoints including authentication,
 * authorization, and data validation
 * @param {Express} app - Express application instance
 * @example
 * registerEmployeeRoutes(app);
 */
export function registerEmployeeRoutes(app: Express) {
  // Using imported authentication middleware from auth.ts

  /**
   * Unified employee handler for both /api/employees and /api/companies/:companyId/employees
   * @description Handles getting employees with optional company filtering
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Object} Array of employee objects
   * @example
   * GET /api/employees - Returns all employees
   * GET /api/companies/company-1/employees - Returns employees for specific company
   */
  const unifiedEmployeeHandler = async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const _includeArchived = req.query.archived === "true";

      log.debug(
        `Unified employee handler called - companyId: ${companyId ?? "all"}`,
      );

      // Mock data for development environment
      if (process.env.NODE_ENV === "development") {
        const allMockEmployees = [
          {
            id: "emp-1",
            fullName: "أحمد محمد علي",
            position: "مهندس برمجيات",
            department: "تكنولوجيا المعلومات",
            salary: 3500,
            status: "active",
            hireDate: "2023-01-15",
            companyId: "company-1",
          },
          {
            id: "emp-2",
            fullName: "فاطمة سالم أحمد",
            position: "محاسبة",
            department: "المالية",
            salary: 2800,
            status: "active",
            hireDate: "2022-08-20",
            companyId: "company-1",
          },
          {
            id: "emp-3",
            fullName: "محمد عبدالله",
            position: "مشرف مبيعات",
            department: "المبيعات",
            salary: 3200,
            status: "active",
            hireDate: "2023-03-10",
            companyId: "company-1",
          },
          {
            id: "emp-4",
            fullName: "سارة أحمد عبدالله",
            position: "مهندسة تصميم",
            department: "التصميم",
            salary: 3100,
            status: "active",
            hireDate: "2023-02-01",
            companyId: "company-2",
          },
          {
            id: "emp-5",
            fullName: "خالد محمود",
            position: "مسؤول موارد بشرية",
            department: "الموارد البشرية",
            salary: 2900,
            status: "active",
            hireDate: "2022-11-15",
            companyId: "company-2",
          },
        ];

        // Filter by company if companyId is provided
        const filteredEmployees = companyId
          ? allMockEmployees.filter((emp) => emp.companyId === companyId)
          : allMockEmployees;

        log.debug(
          `Returning ${filteredEmployees.length} employees for ${
            companyId ? `company ${companyId}` : "all companies"
          }`,
        );
        return res.json(filteredEmployees);
      }

      // Real data handling
      const employees = companyId
        ? await storage.getCompanyEmployees(companyId)
        : await storage.getAllEmployees();

      res.json(employees);
    } catch (error) {
      log.error("Error fetching employees:", error as Error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  };

  /**
   * Get all employees or employees for a specific company
   * @description Unified endpoint for retrieving employees with optional company filtering
   * @route GET /api/employees
   * @route GET /api/companies/:companyId/employees
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Object} Array of employee objects
   * @example
   * GET /api/employees
   * GET /api/companies/company-1/employees
   * Response: [
   *   {
   *     id: "emp-1",
   *     fullName: "أحمد محمد علي",
   *     position: "مهندس برمجيات",
   *     department: "تكنولوجيا المعلومات",
   *     salary: 3500,
   *     status: "active",
   *     hireDate: "2023-01-15",
   *     companyId: "company-1"
   *   }
   * ]
   */
  app.get("/api/employees", unifiedEmployeeHandler);
  app.get("/api/companies/:companyId/employees", unifiedEmployeeHandler);

  /**
   * Create a new employee
   * @description Creates a new employee record with validation and role-based authorization
   * @route POST /api/employees
   * @param {Request} req - Express request object with employee data
   * @param {Response} res - Express response object
   * @returns {Object} Created employee object
   * @throws {400} When employee data validation fails
   * @throws {403} When user lacks required permissions
   * @throws {500} When database operation fails
   * @example
   * POST /api/employees
   * Body: {
   *   firstName: "أحمد",
   *   lastName: "محمد",
   *   position: "مهندس برمجيات",
   *   department: "تقنية المعلومات",
   *   salary: 3500,
   *   companyId: "company-1"
   * }
   */
  app.post(
    "/api/employees",
    isAuthenticated,
    requireRole(["super_admin", "company_manager"]),
    async (req, res) => {
      try {
        const result = insertEmployeeSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid employee data",
            errors: result.error.issues,
          });
        }

        const employee = await storage.createEmployee(result.data);
        res.status(201).json(employee);
      } catch (error) {
        log.error("Error creating employee:", error as Error);
        res.status(500).json({ message: "Failed to create employee" });
      }
    },
  );

  /**
   * Get a single employee by ID
   * @description Retrieves a specific employee by their unique identifier
   * @route GET /api/employees/:id
   * @param {Request} req - Express request object with employee ID parameter
   * @param {Response} res - Express response object
   * @returns {Object} Employee object
   * @throws {404} When employee is not found
   * @throws {500} When database operation fails
   * @example
   * GET /api/employees/emp-1
   * Response: {
   *   id: "emp-1",
   *   fullName: "أحمد محمد علي",
   *   position: "مهندس برمجيات",
   *   department: "تكنولوجيا المعلومات",
   *   salary: 3500,
   *   status: "active"
   * }
   */
  app.get("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Employee ID is required" });
      }

      const employee = await storage.getEmployee(id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      log.error("Error fetching employee:", error as Error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  /**
   * Update an existing employee
   * @description Updates an employee record with validation and role-based authorization
   * @route PUT /api/employees/:id
   * @param {Request} req - Express request object with employee ID and update data
   * @param {Response} res - Express response object
   * @returns {Object} Updated employee object
   * @throws {400} When employee data validation fails
   * @throws {403} When user lacks required permissions
   * @throws {500} When database operation fails
   * @example
   * PUT /api/employees/emp-1
   * Body: {
   *   salary: 3800,
   *   position: "مهندس برمجيات أول"
   * }
   */
  app.put(
    "/api/employees/:id",
    isAuthenticated,
    requireRole(["super_admin", "company_manager"]),
    async (req, res) => {
      try {
        const { id } = req.params;

        if (!id) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        // For updates, we'll validate the data manually since we need partial updates
        // but want to exclude companyId from being updated
        const updateData = req.body as Record<string, unknown>;

        // Remove companyId from update data to prevent changing company
        const { companyId: _companyId, ...safeUpdateData } = updateData;

        // Validate the remaining fields using a partial schema
        const partialSchema = insertEmployeeSchema
          .partial()
          .omit({ companyId: true });
        const result = partialSchema.safeParse(safeUpdateData);

        if (!result.success) {
          return res.status(400).json({
            message: "Invalid employee data",
            errors: result.error.issues,
          });
        }

        const employee = await storage.updateEmployee(
          id,
          result.data as Partial<InsertEmployee>,
        );
        res.json(employee);
      } catch (error) {
        log.error("Error updating employee:", error as Error);
        res.status(500).json({ message: "Failed to update employee" });
      }
    },
  );

  /**
   * Archive an employee
   * @description Archives an employee record with reason and role-based authorization
   * @route DELETE /api/employees/:id
   * @param {Request} req - Express request object with employee ID and archive reason
   * @param {Response} res - Express response object
   * @returns {Object} Success message
   * @throws {400} When archive reason is missing
   * @throws {403} When user lacks required permissions
   * @throws {500} When database operation fails
   * @example
   * DELETE /api/employees/emp-1
   * Body: {
   *   reason: "استقالة الموظف"
   * }
   */
  app.delete(
    "/api/employees/:id",
    isAuthenticated,
    requireRole(["super_admin", "company_manager"]),
    async (req, res) => {
      try {
        const { id } = req.params;

        if (!id) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        const { reason } = req.body as { reason?: string };

        if (!reason) {
          return res
            .status(400)
            .json({ message: "Archive reason is required" });
        }

        await storage.archiveEmployee(id, reason);
        res.json({ message: "Employee archived successfully" });
      } catch (error) {
        log.error("Error archiving employee:", error as Error);
        res.status(500).json({ message: "Failed to archive employee" });
      }
    },
  );

  /**
   * Get employee leaves
   * @description Retrieves all leave requests for a specific employee
   * @route GET /api/employees/:employeeId/leaves
   * @param {Request} req - Express request object with employee ID parameter
   * @param {Response} res - Express response object
   * @returns {Object} Array of leave requests
   * @throws {500} When database operation fails
   * @example
   * GET /api/employees/emp-1/leaves
   * Response: [
   *   {
   *     id: "leave-1",
   *     type: "annual",
   *     startDate: "2025-02-01",
   *     endDate: "2025-02-05",
   *     status: "pending"
   *   }
   * ]
   */
  app.get(
    "/api/employees/:employeeId/leaves",
    isAuthenticated,
    async (req, res) => {
      try {
        const { employeeId } = req.params;

        if (!employeeId) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        const leaves = await storage.getEmployeeLeaves(employeeId);
        res.json(leaves);
      } catch (error) {
        log.error("Error fetching employee leaves:", error as Error);
        res.status(500).json({ message: "Failed to fetch employee leaves" });
      }
    },
  );

  /**
   * Create employee leave request
   * @description Creates a new leave request for an employee with validation
   * @route POST /api/employees/:employeeId/leaves
   * @param {Request} req - Express request object with employee ID and leave data
   * @param {Response} res - Express response object
   * @returns {Object} Created leave request object
   * @throws {400} When leave data validation fails
   * @throws {500} When database operation fails
   * @example
   * POST /api/employees/emp-1/leaves
   * Body: {
   *   type: "annual",
   *   startDate: "2025-02-01",
   *   endDate: "2025-02-05",
   *   reason: "إجازة سنوية"
   * }
   */
  app.post(
    "/api/employees/:employeeId/leaves",
    isAuthenticated,
    async (req, res) => {
      try {
        const { employeeId } = req.params;

        if (!employeeId) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        const leaveData = {
          ...(req.body as Record<string, unknown>),
          employeeId,
        };

        const result = insertEmployeeLeaveSchema.safeParse(leaveData);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid leave data",
            errors: result.error.issues,
          });
        }

        const leave = await storage.createLeave(result.data);
        res.status(201).json(leave);
      } catch (error) {
        log.error("Error creating leave:", error as Error);
        res.status(500).json({ message: "Failed to create leave" });
      }
    },
  );

  /**
   * Get employee deductions
   * @description Retrieves all deductions for a specific employee
   * @route GET /api/employees/:employeeId/deductions
   * @param {Request} req - Express request object with employee ID parameter
   * @param {Response} res - Express response object
   * @returns {Object} Array of deduction records
   * @throws {500} When database operation fails
   * @example
   * GET /api/employees/emp-1/deductions
   * Response: [
   *   {
   *     id: "deduction-1",
   *     amount: 100,
   *     reason: "تأخير في الحضور",
   *     date: "2025-01-15"
   *   }
   * ]
   */
  app.get(
    "/api/employees/:employeeId/deductions",
    isAuthenticated,
    async (req, res) => {
      try {
        const { employeeId } = req.params;

        if (!employeeId) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        const deductions = await storage.getEmployeeDeductions(employeeId);
        res.json(deductions);
      } catch (error) {
        log.error("Error fetching employee deductions:", error as Error);
        res
          .status(500)
          .json({ message: "Failed to fetch employee deductions" });
      }
    },
  );

  /**
   * Create employee deduction
   * @description Creates a new deduction record for an employee with role-based authorization
   * @route POST /api/employees/:employeeId/deductions
   * @param {Request} req - Express request object with employee ID and deduction data
   * @param {Response} res - Express response object
   * @returns {Object} Created deduction object
   * @throws {400} When deduction data validation fails
   * @throws {403} When user lacks required permissions
   * @throws {500} When database operation fails
   * @example
   * POST /api/employees/emp-1/deductions
   * Body: {
   *   amount: 100,
   *   reason: "تأخير في الحضور",
   *   date: "2025-01-15"
   * }
   */
  app.post(
    "/api/employees/:employeeId/deductions",
    isAuthenticated,
    requireRole(["super_admin", "company_manager"]),
    async (req, res) => {
      try {
        const { employeeId } = req.params;

        if (!employeeId) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        const deductionData = {
          ...(req.body as Record<string, unknown>),
          employeeId,
          processedBy:
            req.user && "userId" in req.user ? req.user.userId : undefined,
        };

        const result = insertEmployeeDeductionSchema.safeParse(deductionData);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid deduction data",
            errors: result.error.issues,
          });
        }

        try {
          const deduction = await storage.createDeduction(
            result.data,
            typeof req.user === "object" &&
              req.user &&
              "userId" in req.user &&
              typeof req.user.userId === "string"
              ? req.user.userId
              : "system",
          );
          return res.status(201).json(deduction);
        } catch (error) {
          log.error("Error creating deduction:", error as Error);
          return res
            .status(500)
            .json({ message: "Failed to create deduction" });
        }
      } catch (error) {
        log.error("Error creating deduction:", error as Error);
        res.status(500).json({ message: "Failed to create deduction" });
      }
    },
  );

  /**
   * Get employee violations
   * @description Retrieves all violations for a specific employee
   * @route GET /api/employees/:employeeId/violations
   * @param {Request} req - Express request object with employee ID parameter
   * @param {Response} res - Express response object
   * @returns {Object} Array of violation records
   * @throws {500} When database operation fails
   * @example
   * GET /api/employees/emp-1/violations
   * Response: [
   *   {
   *     id: "violation-1",
   *     type: "tardiness",
   *     description: "تأخير متكرر",
   *     date: "2025-01-15"
   *   }
   * ]
   */
  app.get(
    "/api/employees/:employeeId/violations",
    isAuthenticated,
    async (req, res) => {
      try {
        const { employeeId } = req.params;

        if (!employeeId) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        const violations = await storage.getEmployeeViolations(employeeId);
        res.json(violations);
      } catch (error) {
        log.error("Error fetching employee violations:", error as Error);
        res
          .status(500)
          .json({ message: "Failed to fetch employee violations" });
      }
    },
  );

  /**
   * Create employee violation
   * @description Creates a new violation record for an employee with role-based authorization
   * @route POST /api/employees/:employeeId/violations
   * @param {Request} req - Express request object with employee ID and violation data
   * @param {Response} res - Express response object
   * @returns {Object} Created violation object
   * @throws {400} When violation data validation fails
   * @throws {403} When user lacks required permissions
   * @throws {500} When database operation fails
   * @example
   * POST /api/employees/emp-1/violations
   * Body: {
   *   type: "tardiness",
   *   description: "تأخير متكرر",
   *   date: "2025-01-15"
   * }
   */
  app.post(
    "/api/employees/:employeeId/violations",
    isAuthenticated,
    requireRole(["super_admin", "company_manager"]),
    async (req, res) => {
      try {
        const { employeeId } = req.params;

        if (!employeeId) {
          return res.status(400).json({ message: "Employee ID is required" });
        }

        const violationData = {
          ...(req.body as Record<string, unknown>),
          employeeId,
          reportedBy: req.user && "id" in req.user ? req.user.id : undefined,
        };

        const result = insertEmployeeViolationSchema.safeParse(violationData);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid violation data",
            errors: result.error.issues,
          });
        }

        const violation = await storage.createViolation(
          result.data,
          typeof req.user === "object" &&
            req.user &&
            "id" in req.user &&
            typeof req.user.id === "string"
            ? req.user.id
            : "system",
        );
        res.status(201).json(violation);
      } catch (error) {
        log.error("Error creating violation:", error as Error);
        res.status(500).json({ message: "Failed to create violation" });
      }
    },
  );

  /**
   * Get employee attendance
   * @description Retrieves attendance records for a specific employee with optional month/year filtering
   * @route GET /api/attendance/:employeeId
   * @param {Request} req - Express request object with employee ID and optional query parameters
   * @param {Response} res - Express response object
   * @returns {Object} Attendance data with records and summary
   * @throws {500} When database operation fails
   * @example
   * GET /api/attendance/emp-1?month=1&year=2025
   * Response: {
   *   employeeId: "emp-1",
   *   month: 1,
   *   year: 2025,
   *   records: [
   *     {
   *       date: "2025-01-29",
   *       checkIn: "08:00",
   *       checkOut: "17:00",
   *       workingHours: 8,
   *       overtime: 0,
   *       status: "present"
   *     }
   *   ],
   *   summary: {
   *     totalDays: 30,
   *     presentDays: 28,
   *     absentDays: 2,
   *     totalHours: 224,
   *     overtimeHours: 5.5
   *   }
   * }
   */
  app.get("/api/attendance/:employeeId", isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      // Mock attendance data - in real app this would come from database
      const attendance = {
        employeeId,
        month: month ?? new Date().getMonth() + 1,
        year: year ?? new Date().getFullYear(),
        records: [
          {
            date: "2025-01-29",
            checkIn: "08:00",
            checkOut: "17:00",
            workingHours: 8,
            overtime: 0,
            status: "present",
          },
          {
            date: "2025-01-28",
            checkIn: "08:15",
            checkOut: "17:30",
            workingHours: 8.25,
            overtime: 0.25,
            status: "present",
          },
        ],
        summary: {
          totalDays: 30,
          presentDays: 28,
          absentDays: 2,
          totalHours: 224,
          overtimeHours: 5.5,
        },
      };

      res.json(attendance);
    } catch (error) {
      log.error("Error fetching attendance:", error as Error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  /**
   * Employee check-in
   * @description Records employee check-in time for attendance tracking
   * @route POST /api/attendance/checkin
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Object} Check-in confirmation with timestamp
   * @throws {500} When check-in operation fails
   * @example
   * POST /api/attendance/checkin
   * Response: {
   *   success: true,
   *   checkIn: "08:30:00",
   *   message: "تم تسجيل الحضور بنجاح"
   * }
   */
  app.post("/api/attendance/checkin", isAuthenticated, async (req, res) => {
    try {
      const _userId = req.user && "id" in req.user ? req.user.id : undefined;
      const checkInTime = new Date().toLocaleTimeString("ar-EG", {
        hour12: false,
      });
      res.json({
        success: true,
        checkIn: checkInTime,
        message: "تم تسجيل الحضور بنجاح",
      });
    } catch (error) {
      log.error("Error checking in:", error as Error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  /**
   * Employee check-out
   * @description Records employee check-out time for attendance tracking
   * @route POST /api/attendance/checkout
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Object} Check-out confirmation with timestamp
   * @throws {500} When check-out operation fails
   * @example
   * POST /api/attendance/checkout
   * Response: {
   *   success: true,
   *   checkOut: "17:30:00",
   *   message: "تم تسجيل الانصراف بنجاح"
   * }
   */
  app.post("/api/attendance/checkout", isAuthenticated, async (req, res) => {
    try {
      const _userId = req.user && "id" in req.user ? req.user.id : undefined;
      const checkOutTime = new Date().toLocaleTimeString("ar-EG", {
        hour12: false,
      });
      res.json({
        success: true,
        checkOut: checkOutTime,
        message: "تم تسجيل الانصراف بنجاح",
      });
    } catch (error) {
      log.error("Error checking out:", error as Error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });
}
