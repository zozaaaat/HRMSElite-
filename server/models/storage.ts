/**
 * @fileoverview Database storage layer for HRMS Elite application
 * @description Provides data access layer for all HRMS entities including companies,
 * employees, users, licenses, leaves, and documents
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import {
  users,
  companies,
  employees,
  licenses,
  employeeLeaves,
  employeeDeductions,
  employeeViolations,
  documents,
  notifications,
  companyUsers,
  refreshTokens,
  type User,
  type UpsertUser,
  type InsertUser,
  type Company,
  type InsertCompany,
  type Employee,
  type InsertEmployee,
  type License,
  type InsertLicense,
  type EmployeeLeave,
  type InsertEmployeeLeave,
  type EmployeeDeduction,
  type InsertEmployeeDeduction,
  type EmployeeViolation,
  type InsertEmployeeViolation,
  type Document,
  type InsertDocument,
  type Notification,
  type InsertNotification,
  type RefreshToken,
  type InsertRefreshToken
} from '@shared/schema';
import {db} from './db';
import { metricsUtils } from '../middleware/metrics';

async function withDbMetrics<T>(operation: string, table: string, query: () => Promise<T>): Promise<T> {
  const start = process.hrtime.bigint();
  try {
    const result = await query();
    metricsUtils.incrementDbQuery(operation, table, 'success');
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    metricsUtils.recordDbDuration(operation, table, duration);
    return result;
  } catch (error) {
    metricsUtils.incrementDbQuery(operation, table, 'error');
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    metricsUtils.recordDbDuration(operation, table, duration);
    throw error;
  }
}
import {eq, and, gt, isNull} from 'drizzle-orm';
import {log} from '../utils/logger';
import crypto from 'node:crypto';
import { env } from '../utils/env';

function hashTokenInternal(token: string): string {
  return crypto.createHmac('sha256', env.REFRESH_JWT_SECRET).update(token).digest('hex');
}


/**
 * Database storage class for HRMS Elite application
 * @description Provides methods for all database operations including CRUD operations
 * for companies, employees, users, licenses, leaves, and documents
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
   */
  async getAllCompanies (): Promise<Company[]> {

    try {

      const results = await db.select().from(companies).where(eq(companies.isActive, true));
      return results;

    } catch (error) {

      log.error('Error fetching companies:', error as Error);
      throw new Error('Failed to fetch companies');

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
   * if (compunknown) {
   * }
   */
  async getCompany (id: string): Promise<Company | null> {

    try {

      const results = await db.select().from(companies).where(eq(companies.id, id));
      return results[0] ?? null;

    } catch (error) {

      log.error('Error fetching company:', error as Error);
      throw new Error('Failed to fetch company');

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
  async createCompany (data: InsertCompany): Promise<Company> {

    try {

      const results = await db.insert(companies).values(data).returning();
      if (!results[0]) {
        throw new Error('Failed to create company');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating company:', error as Error);
      throw new Error('Failed to create company');

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
   */
  async getAllEmployees (): Promise<Employee[]> {

    try {

      const results = await db.select().from(employees);
      return results;

    } catch (error) {

      log.error('Error fetching employees:', error as Error);
      throw new Error('Failed to fetch employees');

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
   * }
   */
  async getEmployee (id: string): Promise<Employee | null> {

    try {

      const results = await db.select().from(employees).where(eq(employees.id, id));
      return results[0] ?? null;

    } catch (error) {

      log.error('Error fetching employee:', error as Error);
      throw new Error('Failed to fetch employee');

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
   */
  async getCompanyEmployees (companyId: string): Promise<Employee[]> {

    try {

      const results = await db.select().from(employees).where(eq(employees.companyId, companyId));
      return results;

    } catch (error) {

      log.error('Error fetching company employees:', error as Error);
      throw new Error('Failed to fetch company employees');

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
  async createEmployee (data: InsertEmployee): Promise<Employee> {

    try {

      const results = await db.insert(employees).values(data).returning();
      if (!results[0]) {
        throw new Error('Failed to create employee');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating employee:', error as Error);
      throw new Error('Failed to create employee');

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
   * }
   */
  async getUser (id: string): Promise<User | null> {

    try {

      const results = await db.select().from(users).where(eq(users.id, id));
      return results[0] ?? null;

    } catch (error) {

      log.error('Error fetching user:', error as Error);
      throw new Error('Failed to fetch user');

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
   */
  async getUserCompanies (userId: string): Promise<Company[]> {

    try {

      const results = await db
        .select({
          'id': companies.id,
          'name': companies.name,
          'commercialFileName': companies.commercialFileName,
          'department': companies.department,
          'classification': companies.classification,
          'isActive': companies.isActive,
          'industryType': companies.industryType,
          'location': companies.location,
          'establishmentDate': companies.establishmentDate,
          'createdAt': companies.createdAt,
          'updatedAt': companies.updatedAt
        })
        .from(companyUsers)
        .leftJoin(companies, eq(companyUsers.companyId, companies.id))
        .where(eq(companyUsers.userId, userId));

      return results.filter(company => company.id !== null) as Company[];

    } catch (error) {

      log.error('Error fetching user companies:', error as Error);
      throw new Error('Failed to fetch user companies');

    }

  }

  /**
   * Get leaves for a specific company
   * @description Retrieves all leave requests for employees of a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @param {string} [status] - Optional status filter (pending, approved, rejected)
   * @returns {
  Promise<(EmployeeLeave & {
   employee: Employee 
})[]>
} Array of leave requests with employee data
   * @throws {Error} When database operation fails
   * @example
   * const companyLeaves = await storage.getCompanyLeaves("company-1", "pending");
   */
  async getCompanyLeaves (companyId: string, status?: string): Promise<(EmployeeLeave & {
   employee: Employee 
})[]> {
  

    try {

      const conditions = [eq(employees.companyId, companyId)];
      if (status) {

        conditions.push(eq(employeeLeaves.status, status as 'pending' | 'approved' | 'rejected'));

      }

      const results = await db
        .select({
          'id': employeeLeaves.id,
          'employeeId': employeeLeaves.employeeId,
          'type': employeeLeaves.type,
          'status': employeeLeaves.status,
          'startDate': employeeLeaves.startDate,
          'endDate': employeeLeaves.endDate,
          'days': employeeLeaves.days,
          'reason': employeeLeaves.reason,
          'approvedBy': employeeLeaves.approvedBy,
          'approvedAt': employeeLeaves.approvedAt,
          'rejectionReason': employeeLeaves.rejectionReason,
          'createdAt': employeeLeaves.createdAt,
          'updatedAt': employeeLeaves.updatedAt,
          'employee': {
            'id': employees.id,
            'companyId': employees.companyId,
            'licenseId': employees.licenseId,
            'firstName': employees.firstName,
            'lastName': employees.lastName,
            'arabicName': employees.arabicName,
            'englishName': employees.englishName,
            'passportNumber': employees.passportNumber,
            'civilId': employees.civilId,
            'nationality': employees.nationality,
            'dateOfBirth': employees.dateOfBirth,
            'gender': employees.gender,
            'maritalStatus': employees.maritalStatus,
            'employeeType': employees.employeeType,
            'status': employees.status,
            'position': employees.position,
            'department': employees.department,
            'hireDate': employees.hireDate,
            'salary': employees.salary,
            'phone': employees.phone,
            'email': employees.email,
            'address': employees.address,
            'emergencyContact': employees.emergencyContact,
            'emergencyPhone': employees.emergencyPhone,
            'photoUrl': employees.photoUrl,
            'documents': employees.documents,
            'skills': employees.skills,
            'notes': employees.notes,
            'isArchived': employees.isArchived,
            'archiveReason': employees.archiveReason,
            'createdAt': employees.createdAt,
            'updatedAt': employees.updatedAt
          }
        })
        .from(employeeLeaves)
        .leftJoin(employees, eq(employeeLeaves.employeeId, employees.id))
        .where(and(...conditions));

      return results
        .filter((leave) => leave.employee !== null)
        .map((leave) => ({
          ...leave,
          'employee': leave.employee as Employee
        }));

    } catch (error) {

      log.error('Error fetching company leaves:', error as Error);
      throw new Error('Failed to fetch company leaves');

    }

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
  async updateEmployee (id: string, data: Partial<InsertEmployee>): Promise<Employee> {

    try {

      const results = await db.update(employees)
        .set({
          ...data,
          'updatedAt': new Date()
        })
        .where(eq(employees.id, id)).returning();
      if (!results[0]) {
        throw new Error('Failed to update employee');
      }
      return results[0];

    } catch (error) {

      log.error('Error updating employee:', error as Error);
      throw new Error('Failed to update employee');

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
  async archiveEmployee (id: string, reason: string): Promise<Employee> {

    try {

      const results = await db.update(employees)
        .set({
          'isArchived': true,
          'archiveReason': reason,
          'updatedAt': new Date()
        })
        .where(eq(employees.id, id))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to archive employee');
      }
      return results[0];

    } catch (error) {

      log.error('Error archiving employee:', error as Error);
      throw new Error('Failed to archive employee');

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
   */
  async getEmployeeLeaves (employeeId: string): Promise<EmployeeLeave[]> {

    try {

      const results = await db.select().from(employeeLeaves).where(eq(employeeLeaves.employeeId,
   employeeId));
      return results;

    } catch (error) {

      log.error('Error fetching employee leaves:', error as Error);
      throw new Error('Failed to fetch employee leaves');

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
  async createLeave (data: InsertEmployeeLeave): Promise<EmployeeLeave> {

    try {

      const results = await db.insert(employeeLeaves).values(data).returning();
      if (!results[0]) {
        throw new Error('Failed to create leave');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating leave:', error as Error);
      throw new Error('Failed to create leave');

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
   */
  async getEmployeeDeductions (employeeId: string): Promise<EmployeeDeduction[]> {

    try {

      const results = await db.select().from(employeeDeductions).where(eq(employeeDeductions.employeeId,
   employeeId));
      return results;

    } catch (error) {

      log.error('Error fetching employee deductions:', error as Error);
      throw new Error('Failed to fetch employee deductions');

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
  async createDeduction (data: InsertEmployeeDeduction,
   processedBy: string): Promise<EmployeeDeduction> {

    try {

      const results = await db.insert(employeeDeductions).values({
        ...data,
        processedBy,
        'createdAt': new Date()
      }).returning();
      if (!results[0]) {
        throw new Error('Failed to create deduction');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating deduction:', error as Error);
      throw new Error('Failed to create deduction');

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
   */
  async getEmployeeViolations (employeeId: string): Promise<EmployeeViolation[]> {

    try {

      const results = await db.select().from(employeeViolations).where(eq(employeeViolations.employeeId,
   employeeId));
      return results;

    } catch (error) {

      log.error('Error fetching employee violations:', error as Error);
      throw new Error('Failed to fetch employee violations');

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
  async createViolation (data: InsertEmployeeViolation,
   reportedBy: string): Promise<EmployeeViolation> {

    try {

      const results = await db.insert(employeeViolations).values({
        ...data,
        reportedBy,
        'createdAt': new Date()
      }).returning();
      if (!results[0]) {
        throw new Error('Failed to create violation');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating violation:', error as Error);
      throw new Error('Failed to create violation');

    }

  }

  /**
   * Get all licenses for a company
   * @description Retrieves all licenses belonging to a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<License[]>} Array of licenses for the company
   * @throws {Error} When database operation fails
   * @example
   * const companyLicenses = await storage.getCompanyLicenses("company-1");
   */
  async getCompanyLicenses (companyId: string): Promise<License[]> {

    try {

      const results = await db.select().from(licenses).where(eq(licenses.companyId, companyId));
      return results;

    } catch (error) {

      log.error('Error fetching company licenses:', error as Error);
      throw new Error('Failed to fetch company licenses');

    }

  }

  /**
   * Get a single license by ID
   * @description Retrieves a specific license by its unique identifier
   * @async
   * @param {string} id - License unique identifier
   * @returns {Promise<License | null>} License object or null if not found
   * @throws {Error} When database operation fails
   * @example
   * const license = await storage.getLicense("license-1");
   */
  async getLicense (id: string): Promise<License | null> {

    try {

      const results = await db.select().from(licenses).where(eq(licenses.id, id));
      return results[0] ?? null;

    } catch (error) {

      log.error('Error fetching license:', error as Error);
      throw new Error('Failed to fetch license');

    }

  }

  /**
   * Create a new license
   * @description Creates a new license record in the database
   * @async
   * @param {InsertLicense} data - License data to insert
   * @returns {Promise<License>} Created license object
   * @throws {Error} When database operation fails
   * @example
   * const newLicense = await storage.createLicense({
   *   companyId: "company-1",
   *   name: "رخصة تجارية",
   *   type: "commercial",
   *   number: "LIC-001"
   * });
   */
  async createLicense (data: InsertLicense): Promise<License> {

    try {

      const results = await db.insert(licenses).values(data).returning();
      if (!results[0]) {
        throw new Error('Failed to create license');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating license:', error as Error);
      throw new Error('Failed to create license');

    }

  }

  /**
   * Update an existing license
   * @description Updates a license record in the database
   * @async
   * @param {string} id - License unique identifier
   * @param {Partial<InsertLicense>} data - License data to update
   * @returns {Promise<License>} Updated license object
   * @throws {Error} When database operation fails
   * @example
   * const updatedLicense = await storage.updateLicense("license-1", {
   *   status: "expired",
   *   expiryDate: "2025-12-31"
   * });
   */
  async updateLicense (id: string, data: Partial<InsertLicense>): Promise<License> {

    try {

      const results = await db.update(licenses).set(data).where(eq(licenses.id, id)).returning();
      if (!results[0]) {
        throw new Error('Failed to update license');
      }
      return results[0];

    } catch (error) {

      log.error('Error updating license:', error as Error);
      throw new Error('Failed to update license');

    }

  }

  /**
   * Get all documents for a company
   * @description Retrieves all documents belonging to a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<Document[]>} Array of documents for the company
   * @throws {Error} When database operation fails
   * @example
   * const companyDocuments = await storage.getCompanyDocuments("company-1");
   */
  async getCompanyDocuments (companyId: string): Promise<Document[]> {

    try {

      // Note: This method assumes documents table has companyId field
      // If not, you may need to join with employees table
      const results = await db.select().from(documents);
      return results.filter(doc => doc.entityId === companyId && doc.entityType === 'company');

    } catch (error) {

      log.error('Error fetching company documents:', error as Error);
      throw new Error('Failed to fetch company documents');

    }

  }

  /**
   * Get documents for a specific employee
   * @description Retrieves all documents belonging to a specific employee
   * @async
   * @param {string} employeeId - Employee unique identifier
   * @returns {Promise<Document[]>} Array of documents for the employee
   * @throws {Error} When database operation fails
   * @example
   * const employeeDocuments = await storage.getEmployeeDocuments("emp-1");
   */
  async getEmployeeDocuments (employeeId: string): Promise<Document[]> {

    try {

      // Note: This method assumes documents table has employeeId field
      // If not, you may need to adjust the query
      const results = await db.select().from(documents);
      return results.filter(doc => doc.entityId === employeeId && doc.entityType === 'employee');

    } catch (error) {

      log.error('Error fetching employee documents:', error as Error);
      throw new Error('Failed to fetch employee documents');

    }

  }

  /**
   * Create a new document
   * @description Creates a new document record in the database
   * @async
   * @param {InsertDocument} data - Document data to insert
   * @returns {Promise<Document>} Created document object
   * @throws {Error} When database operation fails
   * @example
   * const newDocument = await storage.createDocument({
   *   companyId: "company-1",
   *   employeeId: "emp-1",
   *   name: "جواز السفر",
   *   type: "passport",
   *   fileUrl: "https://example.com/passport.pdf"
   * });
   */
  async createDocument (data: InsertDocument): Promise<Document> {

    try {

      const results = await db.insert(documents).values(data).returning();
      if (!results[0]) {
        throw new Error('Failed to create document');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating document:', error as Error);
      throw new Error('Failed to create document');

    }

  }

  /**
   * Get a document by ID
   * @description Retrieves a specific document by its ID
   * @async
   * @param {string} id - Document unique identifier
   * @returns {Promise<Document | null>} Document object or null if not found
   * @throws {Error} When database operation fails
   * @example
   * const document = await storage.getDocument("doc-1");
   */
  async getDocument (id: string): Promise<Document | null> {

    try {

      const results = await db.select().from(documents).where(eq(documents.id, id));
      return results[0] ?? null;

    } catch (error) {

      log.error('Error fetching document:', error as Error);
      throw new Error('Failed to fetch document');

    }

  }

  /**
   * Update a document
   * @description Updates an existing document record
   * @async
   * @param {string} id - Document unique identifier
   * @param {Partial<InsertDocument>} data - Document data to update
   * @returns {Promise<Document>} Updated document object
   * @throws {Error} When database operation fails
   * @example
   * const updatedDocument = await storage.updateDocument("doc-1", {
   *   name: "جواز السفر المحدث",
   *   description: "جواز سفر محدث"
   * });
   */
  async updateDocument (id: string, data: Partial<InsertDocument>): Promise<Document> {

    try {

      const results = await db.update(documents)
        .set({
          ...data,
          'updatedAt': new Date()
        })
        .where(eq(documents.id, id))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to update document');
      }
      return results[0];

    } catch (error) {

      log.error('Error updating document:', error as Error);
      throw new Error('Failed to update document');

    }

  }

  /**
   * Delete a document
   * @description Deletes a document record from the database
   * @async
   * @param {string} id - Document unique identifier
   * @returns {Promise<void>}
   * @throws {Error} When database operation fails
   * @example
   * await storage.deleteDocument("doc-1");
   */
  async deleteDocument (id: string): Promise<void> {

    try {

      await db.delete(documents).where(eq(documents.id, id));

    } catch (error) {

      log.error('Error deleting document:', error as Error);
      throw new Error('Failed to delete document');

    }

  }

  /**
   * Get all notifications for a user
   * @description Retrieves all notifications for a specific user
   * @async
   * @param {string} userId - User unique identifier
   * @returns {Promise<Notification[]>} Array of notifications for the user
   * @throws {Error} When database operation fails
   * @example
   * const userNotifications = await storage.getUserNotifications("user-1");
   */
  async getUserNotifications (userId: string): Promise<Notification[]> {

    try {

      const results = await db.select().from(notifications).where(eq(notifications.userId, userId));
      return results;

    } catch (error) {

      log.error('Error fetching user notifications:', error as Error);
      throw new Error('Failed to fetch user notifications');

    }

  }

  /**
   * Create a new notification
   * @description Creates a new notification record in the database
   * @async
   * @param {InsertNotification} data - Notification data to insert
   * @returns {Promise<Notification>} Created notification object
   * @throws {Error} When database operation fails
   * @example
   * const newNotification = await storage.createNotification({
   *   userId: "user-1",
   *   title: "تحديث جديد",
   *   message: "تم تحديث بيانات الموظف",
   *   type: "info"
   * });
   */
  async createNotification (data: InsertNotification): Promise<Notification> {

    try {

      const results = await db.insert(notifications).values(data).returning();
      if (!results[0]) {
        throw new Error('Failed to create notification');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating notification:', error as Error);
      throw new Error('Failed to create notification');

    }

  }

  /**
   * Mark notification as read
   * @description Marks a notification as read
   * @async
   * @param {string} id - Notification unique identifier
   * @returns {Promise<Notification>} Updated notification object
   * @throws {Error} When database operation fails
   * @example
   * const updatedNotification = await storage.markNotificationAsRead("notif-1");
   */
  async markNotificationAsRead (id: string): Promise<Notification> {

    try {

      const results = await db.update(notifications)
        .set({
          'isRead': true
        })
        .where(eq(notifications.id, id))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to mark notification as read');
      }
      return results[0];

    } catch (error) {

      log.error('Error marking notification as read:', error as Error);
      throw new Error('Failed to mark notification as read');

    }

  }

  /**
   * Get employee statistics for a company
   * @description Retrieves comprehensive employee statistics for a company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<object>} Employee statistics object
   * @throws {Error} When database operation fails
   * @example
   * const stats = await storage.getEmployeeStats("company-1");
   */
  async getEmployeeStats (companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    onLeaveEmployees: number;
    terminatedEmployees: number;
    archivedEmployees: number;
    citizens: number;
    expatriates: number;
    averageSalary: number;
    departments: Array<{ name: string; count: number }>;
    nationalities: Array<{ nationality: string; count: number }>;
  }> {

    try {

      const allEmployees = await this.getCompanyEmployees(companyId);

      const stats = {
        'totalEmployees': allEmployees.length,
        'activeEmployees': allEmployees.filter(emp => emp.status === 'active').length,
        'inactiveEmployees': allEmployees.filter(emp => emp.status === 'inactive').length,
        'onLeaveEmployees': allEmployees.filter(emp => emp.status === 'on_leave').length,
        'terminatedEmployees': allEmployees.filter(emp => emp.status === 'terminated').length,
        'archivedEmployees': allEmployees.filter(emp => emp.isArchived).length,
        'citizens': allEmployees.filter(emp => emp.employeeType === 'citizen').length,
        'expatriates': allEmployees.filter(emp => emp.employeeType === 'expatriate').length,
        'averageSalary': allEmployees.length > 0
          ? allEmployees.reduce((sum, emp) => sum + (emp.salary ?? 0), 0) / allEmployees.length
          : 0,
        'departments': [] as Array<{ name: string; count: number }>,
        'nationalities': [] as Array<{ nationality: string; count: number }>
      };

      // Calculate department statistics
      const deptCounts = allEmployees.reduce((acc, emp) => {

        if (emp.department) {

          acc[emp.department] = (acc[emp.department] ?? 0) + 1;

        }
        return acc;

      }, {} as Record<string, number>);

      stats.departments = Object.entries(deptCounts).map(([name, count]) => ({name, count}));

      // Calculate nationality statistics
      const nationalityCounts = allEmployees.reduce((acc, emp) => {

        if (emp.nationality) {

          acc[emp.nationality] = (acc[emp.nationality] ?? 0) + 1;

        }
        return acc;

      }, {} as Record<string, number>);

      stats.nationalities = Object.entries(nationalityCounts).map(([nationality, count]) => ({
  nationality, count
}));

      return stats;

    } catch (error) {

      log.error('Error fetching employee stats:', error as Error);
      throw new Error('Failed to fetch employee stats');

    }

  }

  /**
   * Search employees with filters
   * @description Searches employees with various filters and search terms
   * @async
   * @param {object} filters - Search filters
   * @returns {Promise<Employee[]>} Array of filtered employees
   * @throws {Error} When database operation fails
   * @example
   * const filteredEmployees = await storage.searchEmployees({
   *   companyId: "company-1",
   *   status: "active",
   *   search: "أحمد"
   * });
   */
  async searchEmployees (filters: {
    companyId?: string;
    status?: string;
    employeeType?: string;
    department?: string;
    position?: string;
    nationality?: string;
    isArchived?: boolean;
    search?: string;
  }): Promise<Employee[]> {

    try {

      const conditions = [];

      if (filters.companyId) {

        conditions.push(eq(employees.companyId, filters.companyId));

      }
      if (filters.status) {

        conditions.push(eq(employees.status, filters.status));

      }
      if (filters.employeeType) {

        conditions.push(eq(employees.employeeType, filters.employeeType));

      }
      if (filters.department) {

        conditions.push(eq(employees.department, filters.department));

      }
      if (filters.position) {

        conditions.push(eq(employees.position, filters.position));

      }
      if (filters.nationality) {

        conditions.push(eq(employees.nationality, filters.nationality));

      }
      if (filters.isArchived !== undefined) {

        conditions.push(eq(employees.isArchived, filters.isArchived));

      }

      let results: Employee[];
      if (conditions.length > 0) {
        results = await db.select().from(employees).where(and(...conditions));
      } else {
        results = await db.select().from(employees);
      }

      // Apply search filter if provided
      if (filters.search) {

        const searchTerm = filters.search.toLowerCase();
        return results.filter((emp) =>
          emp.firstName?.toLowerCase().includes(searchTerm) ||
          emp.lastName?.toLowerCase().includes(searchTerm) ||
          emp.arabicName?.toLowerCase().includes(searchTerm) ||
          emp.englishName?.toLowerCase().includes(searchTerm) ||
          emp.position?.toLowerCase().includes(searchTerm) ||
          emp.department?.toLowerCase().includes(searchTerm)
        );

      }

      return results;

    } catch (error) {

      log.error('Error searching employees:', error as Error);
      throw new Error('Failed to search employees');

    }

  }

  /**
   * Get employees with expiring documents
   * @description Retrieves employees with documents expiring soon
   * @async
   * @param {string} companyId - Company unique identifier
   * @param {number} daysThreshold - Number of days to check for expiration
   * @returns {Promise<Employee[]>} Array of employees with expiring documents
   * @throws {Error} When database operation fails
   * @example
   * const expiringEmployees = await storage.getEmployeesWithExpiringDocuments("company-1", 30);
   */
  async getEmployeesWithExpiringDocuments (companyId: string,
   daysThreshold = 30): Promise<Employee[]> {

    try {

      const allEmployees = await this.getCompanyEmployees(companyId);
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      return allEmployees.filter(emp => {

        // Check various expiry dates
        const residenceExpiry = emp.residenceExpiry ? new Date(emp.residenceExpiry) : null;
        const workPermitEnd = emp.workPermitEnd ? new Date(emp.workPermitEnd) : null;

        return (residenceExpiry && residenceExpiry <= thresholdDate) ||
               (workPermitEnd && workPermitEnd <= thresholdDate);

      });

    } catch (error) {

      log.error('Error fetching employees with expiring documents:', error as Error);
      throw new Error('Failed to fetch employees with expiring documents');

    }

  }

  /**
   * Get company statistics
   * @description Retrieves comprehensive statistics for a company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<object>} Company statistics object
   * @throws {Error} When database operation fails
   * @example
   * const companyStats = await storage.getCompanyStats("company-1");
   */
  async getCompanyStats (companyId: string): Promise<{
    totalEmployees: number;
    totalLicenses: number;
    activeEmployees: number;
    urgentAlerts: number;
    recentLeaves: number;
    pendingLeaves: number;
    totalDeductions: number;
    totalViolations: number;
  }> {

    try {

      const [employees, licenses, leaves, deductions, violations] = await Promise.all([
        this.getCompanyEmployees(companyId),
        this.getCompanyLicenses(companyId),
        this.getCompanyLeaves(companyId),
        this.getCompanyEmployeeDeductions(companyId),
        this.getCompanyEmployeeViolations(companyId)
      ]);

      const urgentAlerts = await this.getEmployeesWithExpiringDocuments(companyId, 7);

      return {
        'totalEmployees': employees.length,
        'totalLicenses': licenses.length,
        'activeEmployees': employees.filter(emp => emp.status === 'active').length,
        'urgentAlerts': urgentAlerts.length,
        'recentLeaves': leaves.filter(leave =>
          new Date(leave.startDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        'pendingLeaves': leaves.filter(leave => leave.status === 'pending').length,
        'totalDeductions': deductions.length,
        'totalViolations': violations.length
      };

    } catch (error) {

      log.error('Error fetching company stats:', error as Error);
      throw new Error('Failed to fetch company stats');

    }

  }

  /**
   * Get employee deductions for a company
   * @description Retrieves all deductions for employees of a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<EmployeeDeduction[]>} Array of deduction records
   * @throws {Error} When database operation fails
   * @example
   * const companyDeductions = await storage.getCompanyEmployeeDeductions(companyId);
   */
  async getCompanyEmployeeDeductions (companyId: string): Promise<EmployeeDeduction[]> {

    try {

      const results = await db
        .select()
        .from(employeeDeductions)
        .leftJoin(employees, eq(employeeDeductions.employeeId, employees.id))
        .where(eq(employees.companyId, companyId));

      return results.map(result => result.employee_deductions);

    } catch (error) {

      log.error('Error fetching company deductions:', error as Error);
      throw new Error('Failed to fetch company deductions');

    }

  }

  /**
   * Get employee violations for a company
   * @description Retrieves all violations for employees of a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<EmployeeViolation[]>} Array of violation records
   * @throws {Error} When database operation fails
   * @example
   * const companyViolations = await storage.getCompanyEmployeeViolations(companyId);
   */
  async getCompanyEmployeeViolations (companyId: string): Promise<EmployeeViolation[]> {

    try {

      const results = await db
        .select()
        .from(employeeViolations)
        .leftJoin(employees, eq(employeeViolations.employeeId, employees.id))
        .where(eq(employees.companyId, companyId));

      return results.map(result => result.employee_violations);

    } catch (error) {

      log.error('Error fetching company violations:', error as Error);
      throw new Error('Failed to fetch company violations');

    }

  }

  /**
   * Get all users
   * @description Retrieves all users from the database
   * @async
   * @returns {Promise<User[]>} Array of all users
   * @throws {Error} When database operation fails
   * @example
   * const users = await storage.getAllUsers();
   */
  async getAllUsers (): Promise<User[]> {

    try {

      const results = await db.select().from(users);
      return results;

    } catch (error) {

      log.error('Error fetching users:', error as Error);
      throw new Error('Failed to fetch users');

    }

  }

  /**
   * Get users by company
   * @description Retrieves all users associated with a specific company
   * @async
   * @param {string} companyId - Company unique identifier
   * @returns {Promise<User[]>} Array of users for the company
   * @throws {Error} When database operation fails
   * @example
   * const companyUsers = await storage.getCompanyUsers("company-1");
   */
  async getCompanyUsers (companyId: string): Promise<User[]> {

    try {

      const results = await db
        .select()
        .from(companyUsers)
        .leftJoin(users, eq(companyUsers.userId, users.id))
        .where(eq(companyUsers.companyId, companyId));

      return results.map(result => result.users).filter((user): user is User => user !== null);

    } catch (error) {

      log.error('Error fetching company users:', error as Error);
      throw new Error('Failed to fetch company users');

    }

  }

  /**
   * Create a new user
   * @description Creates a new user record in the database
   * @async
   * @param {InsertUser} data - User data to insert
   * @returns {Promise<User>} Created user object
   * @throws {Error} When database operation fails
   * @example
   * const newUser = await storage.createUser({
   *   email: "user@example.com",
   *   firstName: "أحمد",
   *   lastName: "محمد",
   *   role: "employee"
   * });
   */
  async createUser (data: InsertUser): Promise<User> {

    try {

      // Convert permissions array to string for storage
      const userData = {
        ...data,
        'permissions': Array.isArray(data.permissions) ? JSON.stringify(data.permissions) : data.permissions
      };
      const results = await db.insert(users).values(userData).returning();
      if (!results[0]) {
        throw new Error('Failed to create user');
      }
      return results[0];

    } catch (error) {

      log.error('Error creating user:', error as Error);
      throw new Error('Failed to create user');

    }

  }

  /**
   * Update an existing user
   * @description Updates a user record in the database
   * @async
   * @param {string} id - User unique identifier
   * @param {Partial<UpsertUser>} data - User data to update
   * @returns {Promise<User>} Updated user object
   * @throws {Error} When database operation fails
   * @example
   * const updatedUser = await storage.updateUser("user-1", {
   *   role: "supervisor",
   *   isActive: true
   * });
   */
  async updateUser (id: string, data: Partial<UpsertUser>): Promise<User> {

    try {

      // Convert permissions array to string for storage
      const userData = {
        ...data,
        'permissions': data.permissions ? (Array.isArray(data.permissions) ? JSON.stringify(data.permissions) : data.permissions) : undefined
      };
      const results = await db.update(users).set(userData).where(eq(users.id, id)).returning();
      if (!results[0]) {
        throw new Error('Failed to update user');
      }
      return results[0];

    } catch (error) {

      log.error('Error updating user:', error as Error);
      throw new Error('Failed to update user');

    }

  }

  /**
   * Search users with filters
   * @description Searches users with various filters and search terms
   * @async
   * @param {object} filters - Search filters
   * @returns {Promise<User[]>} Array of filtered users
   * @throws {Error} When database operation fails
   * @example
   * const filteredUsers = await storage.searchUsers({
   *   role: "employee",
   *   isActive: true,
   *   search: "أحمد"
   * });
   */
  async searchUsers (filters: {
    role?: string;
    companyId?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    search?: string;
  }): Promise<User[]> {

    try {

      const conditions = [];

      if (filters.role) {

        conditions.push(eq(users.role, filters.role));

      }
      if (filters.companyId) {

        conditions.push(eq(users.companyId, filters.companyId));

      }
      if (filters.isActive !== undefined) {

        conditions.push(eq(users.isActive, filters.isActive));

      }

      let results: User[];
      if (conditions.length > 0) {
        results = await db.select().from(users).where(and(...conditions));
      } else {
        results = await db.select().from(users);
      }

      // Apply search filter if provided
      if (filters.search) {

        const searchTerm = filters.search.toLowerCase();
        return results.filter((user) =>
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.lastName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        );

      }

      return results;

    } catch (error) {

      log.error('Error searching users:', error as Error);
      throw new Error('Failed to search users');

    }

  }

  /**
   * Get user statistics
   * @description Retrieves comprehensive user statistics
   * @async
   * @returns {Promise<object>} User statistics object
   * @throws {Error} When database operation fails
   * @example
   * const userStats = await storage.getUserStats();
   */
  async getUserStats (): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Array<{ role: string; count: number }>;
    verifiedUsers: number;
    unverifiedUsers: number;
  }> {

    try {

      const allUsers = await this.getAllUsers();

      const stats = {
        'totalUsers': allUsers.length,
        'activeUsers': allUsers.filter(user => user.isActive).length,
        'inactiveUsers': allUsers.filter(user => !user.isActive).length,
        'usersByRole': [] as Array<{ role: string; count: number }>,
        'verifiedUsers': 0, // This would need additional fields in the schema
        'unverifiedUsers': 0
      };

      // Calculate role statistics
      const roleCounts = allUsers.reduce((acc, user) => {

        const role = user.role ?? "unknown";
        acc[role] = (acc[role] || 0) + 1;
        return acc;

      }, {} as Record<string, number>);

      stats.usersByRole = Object.entries(roleCounts).map(([role, count]) => ({role, count}));

      return stats;

    } catch (error) {

      log.error('Error fetching user stats:', error as Error);
      throw new Error('Failed to fetch user stats');

    }

  }

  /**
   * Update user login information
   * @description Updates user login count and last login time
   * @async
   * @param {string} userId - User unique identifier
   * @returns {Promise<User>} Updated user object
   * @throws {Error} When database operation fails
   * @example
   * const updatedUser = await storage.updateUserLogin("user-1");
   */
  async updateUserLogin (userId: string): Promise<User> {
    try {
      const results = await withDbMetrics('update', 'users', async () =>
        db.update(users)
          .set({
            'updatedAt': new Date()
          })
          .where(eq(users.id, userId))
          .returning()
      );
      if (!results[0]) {
        throw new Error('Failed to update user login');
      }
      return results[0];
    } catch (error) {
      log.error('Error updating user login:', error as Error);
      throw new Error('Failed to update user login');
    }
  }

  /**
   * Deactivate a user
   * @description Deactivates a user account
   * @async
   * @param {string} id - User unique identifier
   * @returns {Promise<User>} Deactivated user object
   * @throws {Error} When database operation fails
   * @example
   * const deactivatedUser = await storage.deactivateUser("user-1");
   */
  async deactivateUser (id: string): Promise<User> {

    try {

      const results = await db.update(users)
        .set({
          'isActive': false,
          'updatedAt': new Date()
        })
        .where(eq(users.id, id))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to deactivate user');
      }
      return results[0];

    } catch (error) {

      log.error('Error deactivating user:', error as Error);
      throw new Error('Failed to deactivate user');

    }

  }

  /**
   * Activate a user
   * @description Activates a user account
   * @async
   * @param {string} id - User unique identifier
   * @returns {Promise<User>} Activated user object
   * @throws {Error} When database operation fails
   * @example
   * const activatedUser = await storage.activateUser("user-1");
   */
  async activateUser (id: string): Promise<User> {

    try {

      const results = await db.update(users)
        .set({
          'isActive': true,
          'updatedAt': new Date()
        })
        .where(eq(users.id, id))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to activate user');
      }
      return results[0];

    } catch (error) {

      log.error('Error activating user:', error as Error);
      throw new Error('Failed to activate user');

    }

  }

  /**
   * Get user by email
   * @description Retrieves a user by their email address
   * @async
   * @param {string} email - User's email address
   * @returns {Promise<User | null>} User object or null if not found
   * @throws {Error} When database operation fails
   * @example
   * const user = await storage.getUserByEmail("user@example.com");
   */
  async getUserByEmail (email: string): Promise<User | null> {
    try {
      const results = await withDbMetrics('select', 'users', async () =>
        db.select().from(users).where(eq(users.email, email))
      );
      return results[0] || null;
    } catch (error) {
      log.error('Error fetching user by email:', error as Error);
      throw new Error('Failed to fetch user by email');
    }
  }

  /**
   * Update user password
   * @description Updates user's password hash and last password change time
   * @async
   * @param {string} userId - User unique identifier
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<User>} Updated user object
   * @throws {Error} When database operation fails
   * @example
   * const updatedUser = await storage.updateUserPassword("user-1", hashedPassword);
   */
  async updateUserPassword (userId: string, hashedPassword: string): Promise<User> {

    try {

      const results = await db.update(users)
        .set({
          'password': hashedPassword,
          'lastPasswordChange': Math.floor(Date.now() / 1000),
          'updatedAt': new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to update user password');
      }
      return results[0];

    } catch (error) {

      log.error('Error updating user password:', error as Error);
      throw new Error('Failed to update user password');

    }

  }

  /**
   * Set email verification token
   * @description Sets email verification token and expiration time
   * @async
   * @param {string} userId - User unique identifier
   * @param {string} token - Verification token
   * @returns {Promise<User>} Updated user object
   * @throws {Error} When database operation fails
   * @example
   * const user = await storage.setEmailVerificationToken("user-1", "token123");
   */
  async setEmailVerificationToken (userId: string, token: string): Promise<User> {

    try {

      const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
      const results = await db.update(users)
        .set({
          'emailVerificationToken': token,
          'emailVerificationExpires': expiresAt,
          'updatedAt': new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to set email verification token');
      }
      return results[0];

    } catch (error) {

      log.error('Error setting email verification token:', error as Error);
      throw new Error('Failed to set email verification token');

    }

  }

  /**
   * Verify email with token
   * @description Verifies user email using verification token
   * @async
   * @param {string} token - Verification token
   * @returns {Promise<User | null>} User object or null if token invalid
   * @throws {Error} When database operation fails
   * @example
   * const user = await storage.verifyEmailWithToken("token123");
   */
  async verifyEmailWithToken (token: string): Promise<User | null> {

    try {

      const now = Math.floor(Date.now() / 1000);
      const results = await db.select().from(users)
        .where(and(
          eq(users.emailVerificationToken, token),
          gt(users.emailVerificationExpires, now)
        ));

      if (results.length === 0) {

        return null;

      }

      const user = results[0];
      if (!user) {
        return null;
      }
      const updatedResults = await db.update(users)
        .set({
          'emailVerified': true,
          'emailVerificationToken': null,
          'emailVerificationExpires': null,
          'updatedAt': new Date()
        })
        .where(eq(users.id, user.id))
        .returning();

      if (!updatedResults[0]) {
        throw new Error('Failed to verify email with token');
      }
      return updatedResults[0];

    } catch (error) {

      log.error('Error verifying email with token:', error as Error);
      throw new Error('Failed to verify email with token');

    }

  }

  /**
   * Set password reset token
   * @description Sets password reset token and expiration time
   * @async
   * @param {string} userId - User unique identifier
   * @param {string} token - Reset token
   * @returns {Promise<User>} Updated user object
   * @throws {Error} When database operation fails
   * @example
   * const user = await storage.setPasswordResetToken("user-1", "token123");
   */
  async setPasswordResetToken (userId: string, token: string): Promise<User> {

    try {

      const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour
      const results = await db.update(users)
        .set({
          'passwordResetToken': token,
          'passwordResetExpires': expiresAt,
          'updatedAt': new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      if (!results[0]) {
        throw new Error('Failed to set password reset token');
      }
      return results[0];

    } catch (error) {

      log.error('Error setting password reset token:', error as Error);
      throw new Error('Failed to set password reset token');

    }

  }

  /**
   * Reset password with token
   * @description Resets user password using reset token
   * @async
   * @param {string} token - Reset token
   * @param {string} hashedPassword - New hashed password
   * @returns {Promise<User | null>} User object or null if token invalid
   * @throws {Error} When database operation fails
   * @example
   * const user = await storage.resetPasswordWithToken("token123", hashedPassword);
   */
  async resetPasswordWithToken (token: string, hashedPassword: string): Promise<User | null> {

    try {

      const now = Math.floor(Date.now() / 1000);
      const results = await db.select().from(users)
        .where(and(
          eq(users.passwordResetToken, token),
          gt(users.passwordResetExpires, now)
        ));

      if (results.length === 0) {

        return null;

      }

      const user = results[0];
      if (!user) {
        return null;
      }
      const updatedResults = await db.update(users)
        .set({
          'password': hashedPassword,
          'passwordResetToken': null,
          'passwordResetExpires': null,
          'lastPasswordChange': now,
          'updatedAt': new Date()
        })
        .where(eq(users.id, user.id))
        .returning();

      if (!updatedResults[0]) {
        throw new Error('Failed to reset password with token');
      }
      return updatedResults[0];

    } catch (error) {

      log.error('Error resetting password with token:', error as Error);
      throw new Error('Failed to reset password with token');

    }

  }

  /**
   * Create refresh token record
   * @async
   * @param {InsertRefreshToken} data - Refresh token data
   * @returns {Promise<RefreshToken>} Created token record
   */
  async createRefreshToken (data: InsertRefreshToken): Promise<RefreshToken> {
    try {
      const results = await withDbMetrics('insert', 'refresh_tokens', async () =>
        db.insert(refreshTokens).values(data).returning()
      );
      if (!results[0]) {
        throw new Error('Failed to create refresh token');
      }
      return results[0];
    } catch (error) {
      log.error('Error creating refresh token:', error as Error);
      throw new Error('Failed to create refresh token');
    }
  }

  /**
   * Find refresh token by hash
   * @async
   * @param {string} tokenHash - HMAC hash of token
   * @returns {Promise<RefreshToken | null>} Token record or null
   */
  async findRefreshToken (tokenHash: string): Promise<RefreshToken | null> {
    try {
      const results = await withDbMetrics('select', 'refresh_tokens', async () =>
        db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash))
      );
      return results[0] ?? null;
    } catch (error) {
      log.error('Error finding refresh token:', error as Error);
      throw new Error('Failed to find refresh token');
    }
  }

  /**
   * Revoke a refresh token
   * @async
   * @param {string} id - Token ID
   * @param {string} [replacedBy] - Replacement token ID
   */
  async revokeRefreshToken (id: string, replacedBy?: string): Promise<void> {
    try {
      await withDbMetrics('update', 'refresh_tokens', async () =>
        db.update(refreshTokens)
          .set({
            'revokedAt': new Date(),
            ...(replacedBy ? { 'replacedBy': replacedBy } : {})
          })
          .where(eq(refreshTokens.id, id))
      );
    } catch (error) {
      log.error('Error revoking refresh token:', error as Error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  /**
   * Revoke all tokens in a family
   * @async
   * @param {string} familyId - Token family ID
   */
  async revokeRefreshTokenFamily (familyId: string): Promise<void> {
    try {
      await withDbMetrics('update', 'refresh_tokens', async () =>
        db.update(refreshTokens)
          .set({ 'revokedAt': new Date() })
          .where(and(eq(refreshTokens.familyId, familyId), isNull(refreshTokens.revokedAt)))
      );
    } catch (error) {
      log.error('Error revoking refresh token family:', error as Error);
      throw new Error('Failed to revoke refresh token family');
    }
  }

  /**
   * Invalidate a refresh token
   * @async
   * @param {string} token - Raw refresh token
   * @returns {Promise<RefreshToken | null>} Revoked token record
   */
  async invalidateRefreshToken (token: string): Promise<RefreshToken | null> {
    try {
      const tokenHash = hashTokenInternal(token);
      const stored = await this.findRefreshToken(tokenHash);
      if (stored) {
        await this.revokeRefreshToken(stored.id);
      }
      return stored ?? null;
    } catch (error) {
      log.error('Error invalidating refresh token:', error as Error);
      throw new Error('Failed to invalidate refresh token');
    }
  }

  /**
   * Check if refresh token is revoked
   * @async
   * @param {string} token - Raw refresh token
   * @returns {Promise<boolean>} True if token is revoked
   */
  async isRefreshTokenBlacklisted (token: string): Promise<boolean> {
    try {
      const tokenHash = hashTokenInternal(token);
      const stored = await this.findRefreshToken(tokenHash);
      return !!stored?.revokedAt;
    } catch (error) {
      log.error('Error checking refresh token blacklist:', error as Error);
      throw new Error('Failed to check refresh token');
    }
  }

  /**
   * Update user last login
   * @description Updates user's last login timestamp
   * @async
   * @param {string} userId - User unique identifier
   * @returns {Promise<User>} Updated user object
   * @throws {Error} When database operation fails
   * @example
   * const user = await storage.updateUserLastLogin("user-1");
   */
  async updateUserLastLogin (userId: string): Promise<User> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const results = await withDbMetrics('update', 'users', async () =>
        db.update(users)
          .set({
            'lastLoginAt': now,
            'updatedAt': new Date()
          })
          .where(eq(users.id, userId))
          .returning()
      );
      if (!results[0]) {
        throw new Error('Failed to update user last login');
      }
      return results[0];
    } catch (error) {
      log.error('Error updating user last login:', error as Error);
      throw new Error('Failed to update user last login');
    }
  }

  /**
   * Get user permissions
   * @description Retrieves user permissions for a specific company or all permissions
   * @async
   * @param {string} userId - User unique identifier
   * @param {string} [companyId] - Optional company ID to filter permissions
   * @returns {Promise<string[]>} Array of permission strings
   * @throws {Error} When database operation fails
   * @example
   * const permissions = await storage.getUserPermissions("user-1", "company-1");
   */
  async getUserPermissions (userId: string, _companyId?: string): Promise<string[]> {

    try {

      const user = await this.getUser(userId);
      if (!user) {

        return [];

      }

      // For now, return basic permissions based on user role
      // In a real implementation, this would query a permissions table
      const rolePermissions: Record<string, string[]> = {
        'super_admin': ['*'],
        'company_manager': ['read', 'write', 'delete', 'manage_users', 'manage_employees'],
        'employee': ['read', 'write'],
        'supervisor': ['read', 'write', 'manage_employees'],
        'worker': ['read']
      };

      return rolePermissions[user.role] || ['read'];

    } catch (error) {

      log.error('Error fetching user permissions:', error as Error);
      throw new Error('Failed to fetch user permissions');

    }

  }

  /**
   * Get user roles
   * @description Retrieves user roles for a specific company or all roles
   * @async
   * @param {string} userId - User unique identifier
   * @param {string} [companyId] - Optional company ID to filter roles
   * @returns {Promise<string[]>} Array of role strings
   * @throws {Error} When database operation fails
   * @example
   * const roles = await storage.getUserRoles("user-1", "company-1");
   */
  async getUserRoles (userId: string, _companyId?: string): Promise<string[]> {

    try {

      const user = await this.getUser(userId);
      if (!user) {

        return [];

      }

      // For now, return the user's primary role
      // In a real implementation, this would query a roles table
      return [user.role];

    } catch (error) {

      log.error('Error fetching user roles:', error as Error);
      throw new Error('Failed to fetch user roles');

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
