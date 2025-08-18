/**
 * @fileoverview Database storage layer for HRMS Elite application
 * @description Provides data access layer for all HRMS entities including companies,
 * employees, users, leaves, and deductions
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import {
  users,
  companies,
  employees,
  employeeLeaves,
  employeeDeductions,
  employeeViolations,
  companyUsers,
  type User,
  type Company,
  type InsertCompany,
  type Employee,
  type InsertEmployee,
  type EmployeeLeave,
  type InsertEmployeeLeave,
  type EmployeeDeduction,
  type InsertEmployeeDeduction,
  type EmployeeViolation,
  type InsertEmployeeViolation,
} from "../../../shared/schema";
import { db } from "../../../server/models/db";
import { eq, and } from "drizzle-orm";
import logger from '../../../server/utils/logger';


/**
 * Database storage class for HRMS Elite application
 * @description Provides methods for all database operations including CRUD operations
 * for companies, employees, users, leaves, and deductions
 * @class DatabaseStorage
 */
export class DatabaseStorage {
  /**
   * Get all active companies
   * @description Retrieves all active companies from the database
   * @async
   * @returns {Promise<Company[]>} Array of active companies
   * @throws {Error} When database operation fails
   * @example
   * const companies = await storage.getAllCompanies();
   * logger.info(companies); // [{ id: "1", name: "شركة الاتحاد الخليجي", ... }]
   */
  async getAllCompanies(): Promise<Company[]> {
    try {
      const results = await db.select().from(companies).where(eq(companies.isActive, true));
      return results;
    } catch (error) {
      logger.error("Error fetching companies:", error);
      throw new Error("Failed to fetch companies");
    }
  }

  /**
   * Get a single company by ID
   * @description Retrieves a specific company by its unique identifier
   * @async
   * @param {string} id - Company unique identifier
   * @returns {Promise<Company | null>} Company object or null if not found
   * @throws {Error} When database operation fails
   * @example
   * const company = await storage.getCompany("company-1");
   * if (company) {
   *   logger.info(company.name); // "شركة الاتحاد الخليجي"
   * }
   */
  async getCompany(id: string): Promise<Company | null> {
    try {
      const results = await db.select().from(companies).where(eq(companies.id, id));
      return results[0] || null;
    } catch (error) {
      logger.error("Error fetching company:", error);
      throw new Error("Failed to fetch company");
    }
  }

  /**
   * Create a new company
   * @description Creates a new company record in the database
   * @async
   * @param {InsertCompany} data - Company data to insert
   * @returns {Promise<Company>} Created company object
   * @throws {Error} When database operation fails
   * @example
   * const newCompany = await storage.createCompany({
   *   name: "شركة جديدة",
   *   commercialFileName: "الاسم التجاري",
   *   department: "التجارة العامة",
   *   classification: "شركة ذات مسؤولية محدودة"
   * });
   */
  async createCompany(data: InsertCompany): Promise<Company> {
    try {
      const results = await db.insert(companies).values(data).returning();
      return results[0];
    } catch (error) {
      logger.error("Error creating company:", error);
      throw new Error("Failed to create company");
    }
  }

  /**
   * Get all employees
   * @description Retrieves all employees from the database
   * @async
   * @returns {Promise<Employee[]>} Array of all employees
   * @throws {Error} When database operation fails
   * @example
   * const employees = await storage.getAllEmployees();
   * logger.info(employees.length); // 45
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const results = await db.select().from(employees);
      return results;
    } catch (error) {
      logger.error("Error fetching employees:", error);
      throw new Error("Failed to fetch employees");
    }
  }

  /**
   * Get a single employee by ID
   * @description Retrieves a specific employee by their unique identifier
   * @async
   * @param {string} id - Employee unique identifier
   * @returns {Promise<Employee | null>} Employee object or null if not found
   * @throws {Error} When database operation fails
   * @example
   * const employee = await storage.getEmployee("emp-1");
   * if (employee) {
   *   logger.info(employee.fullName); // "أحمد محمد علي"
   * }
   */
  async getEmployee(id: string): Promise<Employee | null> {
    try {
      const results = await db.select().from(employees).where(eq(employees.id, id));
      return results[0] || null;
    } catch (error) {
      logger.error("Error fetching employee:", error);
      throw new Error("Failed to fetch employee");
    }
  }

  /**
   * Get employees for a specific company
   * @description Retrieves all employees belonging to a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<Employee[]>} Array of employees for the company
   * @throws {Error} When database operation fails
   * @example
   * const companyEmployees = await storage.getCompanyEmployees("company-1");
   * logger.info(companyEmployees.length); // 25
   */
  async getCompanyEmployees(companyId: string): Promise<Employee[]> {
    try {
      const results = await db.select().from(employees).where(eq(employees.companyId, companyId));
      return results;
    } catch (error) {
      logger.error("Error fetching company employees:", error);
      throw new Error("Failed to fetch company employees");
    }
  }

  /**
   * Create a new employee
   * @description Creates a new employee record in the database
   * @async
   * @param {InsertEmployee} data - Employee data to insert
   * @returns {Promise<Employee>} Created employee object
   * @throws {Error} When database operation fails
   * @example
   * const newEmployee = await storage.createEmployee({
   *   companyId: "company-1",
   *   firstName: "أحمد",
   *   lastName: "محمد",
   *   position: "مهندس برمجيات",
   *   department: "تقنية المعلومات",
   *   salary: 3500
   * });
   */
  async createEmployee(data: InsertEmployee): Promise<Employee> {
    try {
      const results = await db.insert(employees).values(data).returning();
      return results[0];
    } catch (error) {
      logger.error("Error creating employee:", error);
      throw new Error("Failed to create employee");
    }
  }

  /**
   * Get a single user by ID
   * @description Retrieves a specific user by their unique identifier
   * @async
   * @param {string} id - User unique identifier
   * @returns {Promise<User | null>} User object or null if not found
   * @throws {Error} When database operation fails
   * @example
   * const user = await storage.getUser("user-1");
   * if (user) {
   *   logger.info(user.email); // "user@company.com"
   * }
   */
  async getUser(id: string): Promise<User | null> {
    try {
      const results = await db.select().from(users).where(eq(users.id, id));
      return results[0] || null;
    } catch (error) {
      logger.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Get companies associated with a user
   * @description Retrieves all companies that a user has access to
   * @async
   * @param {string} userId - User unique identifier
   * @returns {Promise<Company[]>} Array of companies associated with the user
   * @throws {Error} When database operation fails
   * @example
   * const userCompanies = await storage.getUserCompanies("user-1");
   * logger.info(userCompanies.length); // 3
   */
  async getUserCompanies(userId: string): Promise<Company[]> {
    try {
      const results = await db
        .select({
          id: companies.id,
          name: companies.name,
          commercialFileName: companies.commercialFileName,
          department: companies.department,
          classification: companies.classification,
          isActive: companies.isActive,
          industryType: companies.industryType,
          location: companies.location,
          establishmentDate: companies.establishmentDate,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        })
        .from(companyUsers)
        .leftJoin(companies, eq(companyUsers.companyId, companies.id))
        .where(eq(companyUsers.userId, userId));
      
      return results.filter(company => company.id !== null) as Company[];
    } catch (error) {
      logger.error("Error fetching user companies:", error);
      throw new Error("Failed to fetch user companies");
    }
  }

  /**
   * Get leaves for a specific company
   * @description Retrieves all leave requests for employees of a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @param {string} [status] - Optional status filter (pending, approved, rejected)
   * @returns {Promise<(EmployeeLeave & { employee: Employee })[]>} Array of leave requests with employee data
   * @throws {Error} When database operation fails
   * @example
   * const companyLeaves = await storage.getCompanyLeaves("company-1", "pending");
   * logger.info(companyLeaves.length); // 5
   */
  async getCompanyLeaves(companyId: string, status?: "pending" | "approved" | "rejected"): Promise<(EmployeeLeave & {
   employee: Employee 
})[]> {
  
    const conditions = [eq(employees.companyId, companyId)];
    if (status) {
      conditions.push(eq(employeeLeaves.status, status));
    }

    const results = await db
      .select({
        id: employeeLeaves.id,
        employeeId: employeeLeaves.employeeId,
        type: employeeLeaves.type,
        status: employeeLeaves.status,
        startDate: employeeLeaves.startDate,
        endDate: employeeLeaves.endDate,
        days: employeeLeaves.days,
        reason: employeeLeaves.reason,
        approvedBy: employeeLeaves.approvedBy,
        approvedAt: employeeLeaves.approvedAt,
        rejectionReason: employeeLeaves.rejectionReason,
        createdAt: employeeLeaves.createdAt,
        updatedAt: employeeLeaves.updatedAt,
        employee: {
          id: employees.id,
          companyId: employees.companyId,
          licenseId: employees.licenseId,
          firstName: employees.firstName,
          lastName: employees.lastName,
          arabicName: employees.arabicName,
          englishName: employees.englishName,
          passportNumber: employees.passportNumber,
          civilId: employees.civilId,
          nationality: employees.nationality,
          dateOfBirth: employees.dateOfBirth,
          gender: employees.gender,
          maritalStatus: employees.maritalStatus,
          employeeType: employees.employeeType,
          status: employees.status,
          position: employees.position,
          department: employees.department,
          hireDate: employees.hireDate,
          salary: employees.salary,
          phone: employees.phone,
          email: employees.email,
          address: employees.address,
          emergencyContact: employees.emergencyContact,
          emergencyPhone: employees.emergencyPhone,
          photoUrl: employees.photoUrl,
          documents: employees.documents,
          skills: employees.skills,
          notes: employees.notes,
          isArchived: employees.isArchived,
          archiveReason: employees.archiveReason,
          createdAt: employees.createdAt,
          updatedAt: employees.updatedAt,
        },
      })
      .from(employeeLeaves)
      .leftJoin(employees, eq(employeeLeaves.employeeId, employees.id))
      .where(and(...conditions));

    return results
      .filter((result) => result.employee !== null)
      .map((result) => ({
        id: result.id,
        employeeId: result.employeeId,
        type: result.type,
        status: result.status,
        startDate: result.startDate,
        endDate: result.endDate,
        days: result.days,
        reason: result.reason,
        approvedBy: result.approvedBy,
        approvedAt: result.approvedAt,
        rejectionReason: result.rejectionReason,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        employee: result.employee as Employee,
      }));
  }

  /**
   * Update an existing employee
   * @description Updates an employee record in the database
   * @async
   * @param {string} id - Employee unique identifier
   * @param {Partial<InsertEmployee>} data - Employee data to update
   * @returns {Promise<Employee>} Updated employee object
   * @throws {Error} When database operation fails
   * @example
   * const updatedEmployee = await storage.updateEmployee("emp-1", {
   *   salary: 3800,
   *   position: "مهندس برمجيات أول"
   * });
   */
  async updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee> {
    try {
      const results = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
      return results[0];
    } catch (error) {
      logger.error("Error updating employee:", error);
      throw new Error("Failed to update employee");
    }
  }

  /**
   * Archive an employee
   * @description Archives an employee record with reason
   * @async
   * @param {string} id - Employee unique identifier
   * @param {string} reason - Archive reason
   * @returns {Promise<Employee>} Archived employee object
   * @throws {Error} When database operation fails
   * @example
   * const archivedEmployee = await storage.archiveEmployee("emp-1", "استقالة الموظف");
   */
  async archiveEmployee(id: string, reason: string): Promise<Employee> {
    try {
      const results = await db.update(employees)
        .set({ 
          isArchived: true, 
          archiveReason: reason,
          updatedAt: new Date()
        })
        .where(eq(employees.id, id))
        .returning();
      return results[0];
    } catch (error) {
      logger.error("Error archiving employee:", error);
      throw new Error("Failed to archive employee");
    }
  }

  /**
   * Get employee leaves
   * @description Retrieves all leave requests for a specific employee
   * @async
   * @param {string} employeeId - Employee unique identifier
   * @returns {Promise<EmployeeLeave[]>} Array of leave requests
   * @throws {Error} When database operation fails
   * @example
   * const employeeLeaves = await storage.getEmployeeLeaves("emp-1");
   * logger.info(employeeLeaves.length); // 3
   */
  async getEmployeeLeaves(employeeId: string): Promise<EmployeeLeave[]> {
    try {
      const results = await db.select().from(employeeLeaves).where(eq(employeeLeaves.employeeId,
   employeeId));
      return results;
    } catch (error) {
      logger.error("Error fetching employee leaves:", error);
      throw new Error("Failed to fetch employee leaves");
    }
  }

  /**
   * Create a new leave request
   * @description Creates a new leave request for an employee
   * @async
   * @param {InsertEmployeeLeave} data - Leave request data
   * @returns {Promise<EmployeeLeave>} Created leave request object
   * @throws {Error} When database operation fails
   * @example
   * const newLeave = await storage.createLeave({
   *   employeeId: "emp-1",
   *   type: "annual",
   *   startDate: "2025-02-01",
   *   endDate: "2025-02-05",
   *   reason: "إجازة سنوية"
   * });
   */
  async createLeave(data: InsertEmployeeLeave): Promise<EmployeeLeave> {
    try {
      const results = await db.insert(employeeLeaves).values(data).returning();
      return results[0];
    } catch (error) {
      logger.error("Error creating leave:", error);
      throw new Error("Failed to create leave");
    }
  }

  /**
   * Get employee deductions
   * @description Retrieves all deductions for a specific employee
   * @async
   * @param {string} employeeId - Employee unique identifier
   * @returns {Promise<EmployeeDeduction[]>} Array of deduction records
   * @throws {Error} When database operation fails
   * @example
   * const employeeDeductions = await storage.getEmployeeDeductions("emp-1");
   * logger.info(employeeDeductions.length); // 2
   */
  async getEmployeeDeductions(employeeId: string): Promise<EmployeeDeduction[]> {
    try {
      const results = await db.select().from(employeeDeductions).where(eq(employeeDeductions.employeeId,
   employeeId));
      return results;
    } catch (error) {
      logger.error("Error fetching employee deductions:", error);
      throw new Error("Failed to fetch employee deductions");
    }
  }

  /**
   * Create a new deduction record
   * @description Creates a new deduction record for an employee
   * @async
   * @param {InsertEmployeeDeduction} data - Deduction data
   * @param {string} processedBy - User ID who processed the deduction
   * @returns {Promise<EmployeeDeduction>} Created deduction object
   * @throws {Error} When database operation fails
   * @example
   * const newDeduction = await storage.createDeduction({
   *   employeeId: "emp-1",
   *   amount: 100,
   *   reason: "تأخير في الحضور",
   *   date: "2025-01-15"
   * }, "user-1");
   */
  async createDeduction(data: InsertEmployeeDeduction,
   processedBy: string): Promise<EmployeeDeduction> {
    try {
      const results = await db.insert(employeeDeductions).values({
        ...data,
        processedBy,
        createdAt: new Date()
      }).returning();
      return results[0];
    } catch (error) {
      logger.error("Error creating deduction:", error);
      throw new Error("Failed to create deduction");
    }
  }

  /**
   * Get employee violations
   * @description Retrieves all violations for a specific employee
   * @async
   * @param {string} employeeId - Employee unique identifier
   * @returns {Promise<EmployeeViolation[]>} Array of violation records
   * @throws {Error} When database operation fails
   * @example
   * const employeeViolations = await storage.getEmployeeViolations("emp-1");
   * logger.info(employeeViolations.length); // 1
   */
  async getEmployeeViolations(employeeId: string): Promise<EmployeeViolation[]> {
    try {
      const results = await db.select().from(employeeViolations).where(eq(employeeViolations.employeeId,
   employeeId));
      return results;
    } catch (error) {
      logger.error("Error fetching employee violations:", error);
      throw new Error("Failed to fetch employee violations");
    }
  }

  /**
   * Create a new violation record
   * @description Creates a new violation record for an employee
   * @async
   * @param {InsertEmployeeViolation} data - Violation data
   * @param {string} reportedBy - User ID who reported the violation
   * @returns {Promise<EmployeeViolation>} Created violation object
   * @throws {Error} When database operation fails
   * @example
   * const newViolation = await storage.createViolation({
   *   employeeId: "emp-1",
   *   type: "tardiness",
   *   description: "تأخير متكرر",
   *   date: "2025-01-15"
   * }, "user-1");
   */
  async createViolation(data: InsertEmployeeViolation,
   reportedBy: string): Promise<EmployeeViolation> {
    try {
      const results = await db.insert(employeeViolations).values({
        ...data,
        reportedBy,
        createdAt: new Date()
      }).returning();
      return results[0];
    } catch (error) {
      logger.error("Error creating violation:", error);
      throw new Error("Failed to create violation");
    }
  }
}

/**
 * Database storage instance
 * @description Singleton instance of DatabaseStorage for use throughout the application
 * @type {DatabaseStorage}
 * @example
 * import { storage } from './models/storage';
 * const companies = await storage.getAllCompanies();
 */
export const storage = new DatabaseStorage();
