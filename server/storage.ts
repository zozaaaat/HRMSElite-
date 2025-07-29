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
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type CompanyWithStats,
  type Employee,
  type InsertEmployee,
  type EmployeeWithDetails,
  type License,
  type InsertLicense,
  type LicenseWithDetails,
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
  type CompanyUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Company operations
  getAllCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string): Promise<void>;

  // Company User operations
  getUserCompanies(userId: string): Promise<CompanyUser[]>;
  getCompanyUsers(companyId: string): Promise<(CompanyUser & { user: User })[]>;
  addUserToCompany(userId: string, companyId: string, role: string, permissions?: string[]): Promise<CompanyUser>;
  updateUserRole(userId: string, companyId: string, role: string, permissions?: string[]): Promise<CompanyUser>;
  removeUserFromCompany(userId: string, companyId: string): Promise<void>;

  // Employee operations
  getCompanyEmployees(companyId: string, includeArchived?: boolean): Promise<Employee[]>;
  getEmployee(id: string): Promise<EmployeeWithDetails | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee>;
  archiveEmployee(id: string, reason: string): Promise<Employee>;
  getEmployeesByLicense(licenseId: string): Promise<Employee[]>;

  // License operations
  getCompanyLicenses(companyId: string): Promise<License[]>;
  getLicense(id: string): Promise<LicenseWithDetails | undefined>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(id: string, updates: Partial<InsertLicense>): Promise<License>;
  deleteLicense(id: string): Promise<void>;

  // Leave operations
  getEmployeeLeaves(employeeId: string): Promise<EmployeeLeave[]>;
  getCompanyLeaves(companyId: string, status?: string): Promise<(EmployeeLeave & { employee: Employee })[]>;
  createLeave(leave: InsertEmployeeLeave): Promise<EmployeeLeave>;
  approveLeave(id: string, approverId: string): Promise<EmployeeLeave>;
  rejectLeave(id: string, approverId: string, reason: string): Promise<EmployeeLeave>;

  // Deduction operations
  getEmployeeDeductions(employeeId: string): Promise<EmployeeDeduction[]>;
  createDeduction(deduction: InsertEmployeeDeduction, processedBy: string): Promise<EmployeeDeduction>;

  // Violation operations
  getEmployeeViolations(employeeId: string): Promise<EmployeeViolation[]>;
  createViolation(violation: InsertEmployeeViolation, reportedBy: string): Promise<EmployeeViolation>;

  // Document operations
  getEntityDocuments(entityId: string, entityType: 'employee' | 'company' | 'license'): Promise<Document[]>;
  createDocument(document: InsertDocument, uploadedBy: string): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Notification operations
  getUserNotifications(userId: string, companyId?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  getUnreadNotificationCount(userId: string, companyId?: string): Promise<number>;

  // Dashboard statistics
  getSystemStats(): Promise<{
    totalCompanies: number;
    totalEmployees: number;
    totalLicenses: number;
    urgentAlerts: number;
  }>;
  getCompanyStats(companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    pendingLeaves: number;
    urgentAlerts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async getAllCompanies(): Promise<CompanyWithStats[]> {
    const companiesData = await db
      .select({
        id: companies.id,
        name: companies.name,
        commercialFileNumber: companies.commercialFileNumber,
        commercialFileName: companies.commercialFileName,
        commercialFileStatus: companies.commercialFileStatus,
        establishmentDate: companies.establishmentDate,
        commercialRegistrationNumber: companies.commercialRegistrationNumber,
        classification: companies.classification,
        department: companies.department,
        fileType: companies.fileType,
        legalEntity: companies.legalEntity,
        ownershipCategory: companies.ownershipCategory,
        logoUrl: companies.logoUrl,
        address: companies.address,
        phone: companies.phone,
        email: companies.email,
        website: companies.website,
        isActive: companies.isActive,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
        totalEmployees: count(employees.id),
        totalLicenses: count(licenses.id),
      })
      .from(companies)
      .leftJoin(employees, and(eq(employees.companyId, companies.id), eq(employees.isArchived, false)))
      .leftJoin(licenses, eq(licenses.companyId, companies.id))
      .where(eq(companies.isActive, true))
      .groupBy(companies.id)
      .orderBy(desc(companies.createdAt));

    // Get active employees and urgent alerts for each company
    const companiesWithStats = await Promise.all(
      companiesData.map(async (company) => {
        const [activeEmployees] = await db
          .select({ count: count() })
          .from(employees)
          .where(
            and(
              eq(employees.companyId, company.id),
              eq(employees.status, "active"),
              eq(employees.isArchived, false)
            )
          );

        const urgentAlerts = 0; // TODO: Implement alert counting logic

        return {
          ...company,
          activeEmployees: activeEmployees.count,
          urgentAlerts,
        };
      })
    );

    return companiesData as any;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company as any).returning();
    return newCompany;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...updates as any, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<void> {
    await db.update(companies).set({ isActive: false }).where(eq(companies.id, id));
  }

  // Company User operations
  async getUserCompanies(userId: string): Promise<CompanyUser[]> {
    return await db
      .select()
      .from(companyUsers)
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.isActive, true)));
  }

  async getCompanyUsers(companyId: string): Promise<any[]> {
    const result = await db
      .select({
        id: companyUsers.id,
        companyId: companyUsers.companyId,
        userId: companyUsers.userId,
        role: companyUsers.role,
        isActive: companyUsers.isActive,
        permissions: companyUsers.permissions,
        createdAt: companyUsers.createdAt,
        updatedAt: companyUsers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(companyUsers)
      .innerJoin(users, eq(companyUsers.userId, users.id))
      .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.isActive, true)));
    return result;
  }

  async addUserToCompany(userId: string, companyId: string, role: string, permissions: string[] = []): Promise<CompanyUser> {
    const [companyUser] = await db
      .insert(companyUsers)
      .values({
        userId,
        companyId,
        role: role as any,
        permissions,
      })
      .returning();
    return companyUser;
  }

  async updateUserRole(userId: string, companyId: string, role: string, permissions: string[] = []): Promise<CompanyUser> {
    const [updatedUser] = await db
      .update(companyUsers)
      .set({ role: role as any, permissions, updatedAt: new Date() })
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.companyId, companyId)))
      .returning();
    return updatedUser;
  }

  async removeUserFromCompany(userId: string, companyId: string): Promise<void> {
    await db
      .update(companyUsers)
      .set({ isActive: false })
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.companyId, companyId)));
  }

  // Employee operations
  async getCompanyEmployees(companyId: string, includeArchived: boolean = false): Promise<Employee[]> {
    const conditions = [eq(employees.companyId, companyId)];
    if (!includeArchived) {
      conditions.push(eq(employees.isArchived, false));
    }

    return await db
      .select()
      .from(employees)
      .where(and(...conditions))
      .orderBy(desc(employees.createdAt)) as any;
  }

  async getEmployee(id: string): Promise<EmployeeWithDetails | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .innerJoin(companies, eq(employees.companyId, companies.id))
      .leftJoin(licenses, eq(employees.licenseId, licenses.id))
      .where(eq(employees.id, id));

    if (!employee) return undefined;

    const recentLeaves = await db
      .select()
      .from(employeeLeaves)
      .where(eq(employeeLeaves.employeeId, id))
      .orderBy(desc(employeeLeaves.createdAt))
      .limit(5);

    const [deductionStats] = await db
      .select({ total: count() })
      .from(employeeDeductions)
      .where(eq(employeeDeductions.employeeId, id));

    const [violationStats] = await db
      .select({ total: count() })
      .from(employeeViolations)
      .where(eq(employeeViolations.employeeId, id));

    return {
      ...employee.employees,
      company: employee.companies,
      license: employee.licenses || undefined,
      recentLeaves,
      totalDeductions: deductionStats.total,
      totalViolations: violationStats.total,
    };
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee as any).returning();
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...updates as any, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async archiveEmployee(id: string, reason: string): Promise<Employee> {
    const [archivedEmployee] = await db
      .update(employees)
      .set({
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: reason,
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id))
      .returning();

    // Update company employee count
    await db
      .update(companies)
      .set({ 
        totalEmployees: sql`${companies.totalEmployees} - 1`,
        updatedAt: new Date()
      })
      .where(eq(companies.id, archivedEmployee.companyId));

    return archivedEmployee as any;
  }

  async getEmployeesByLicense(licenseId: string): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(and(eq(employees.licenseId, licenseId), eq(employees.isArchived, false))) as any;
  }

  // License operations
  async getCompanyLicenses(companyId: string): Promise<License[]> {
    return await db
      .select()
      .from(licenses)
      .where(eq(licenses.companyId, companyId))
      .orderBy(desc(licenses.createdAt));
  }

  async getLicense(id: string): Promise<LicenseWithDetails | undefined> {
    const [license] = await db
      .select()
      .from(licenses)
      .innerJoin(companies, eq(licenses.companyId, companies.id))
      .where(eq(licenses.id, id));

    if (!license) return undefined;

    const licenseEmployees = await db
      .select()
      .from(employees)
      .where(and(eq(employees.licenseId, id), eq(employees.isArchived, false)));

    const licenseDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.licenseId, id));

    return {
      ...license.licenses,
      company: license.companies,
      employees: licenseEmployees,
      documents: licenseDocuments,
    };
  }

  async createLicense(license: InsertLicense): Promise<License> {
    const [newLicense] = await db.insert(licenses).values(license).returning() as License[];
    return newLicense;
  }

  async updateLicense(id: string, updates: Partial<InsertLicense>): Promise<License> {
    const [updatedLicense] = await db
      .update(licenses)
      .set({ ...updates as any, updatedAt: new Date() })
      .where(eq(licenses.id, id))
      .returning();
    return updatedLicense;
  }

  async deleteLicense(id: string): Promise<void> {
    const [license] = await db.select().from(licenses).where(eq(licenses.id, id));
    
    await db.delete(licenses).where(eq(licenses.id, id));
    
    if (license) {
      // Update company license count
      await db
        .update(companies)
        .set({ 
          totalLicenses: sql`${companies.totalLicenses} - 1`,
          updatedAt: new Date()
        })
        .where(eq(companies.id, license.companyId));
    }
  }

  // Leave operations
  async getEmployeeLeaves(employeeId: string): Promise<EmployeeLeave[]> {
    return await db
      .select()
      .from(employeeLeaves)
      .where(eq(employeeLeaves.employeeId, employeeId))
      .orderBy(desc(employeeLeaves.createdAt));
  }

  async getCompanyLeaves(companyId: string, status?: string): Promise<any[]> {
    const baseConditions = [eq(employees.companyId, companyId)];
    if (status) {
      baseConditions.push(eq(employeeLeaves.status, status as any));
    }

    const result = await db
      .select({
        id: employeeLeaves.id,
        employeeId: employeeLeaves.employeeId,
        type: employeeLeaves.type,
        startDate: employeeLeaves.startDate,
        endDate: employeeLeaves.endDate,
        days: employeeLeaves.days,
        reason: employeeLeaves.reason,
        status: employeeLeaves.status,
        approvedBy: employeeLeaves.approvedBy,
        approvedAt: employeeLeaves.approvedAt,
        rejectionReason: employeeLeaves.rejectionReason,
        createdAt: employeeLeaves.createdAt,
        updatedAt: employeeLeaves.updatedAt,
        employee: {
          id: employees.id,
          companyId: employees.companyId,
          civilId: employees.civilId,
          fullName: employees.fullName,
          nationality: employees.nationality,
          type: employees.type,
          jobTitle: employees.jobTitle,
          actualJobTitle: employees.actualJobTitle,
          department: employees.department,
          monthlySalary: employees.monthlySalary,
          actualSalary: employees.actualSalary,
          hireDate: employees.hireDate,
          contractType: employees.contractType,
          workLocation: employees.workLocation,
          status: employees.status,
          isArchived: employees.isArchived,
          profileImageUrl: employees.profileImageUrl,
          phone: employees.phone,
          email: employees.email,
          address: employees.address,
          emergencyContact: employees.emergencyContact,
          notes: employees.notes,
          createdAt: employees.createdAt,
          updatedAt: employees.updatedAt,
        }
      })
      .from(employeeLeaves)
      .innerJoin(employees, eq(employeeLeaves.employeeId, employees.id))
      .where(and(...baseConditions))
      .orderBy(desc(employeeLeaves.createdAt));

    return result;
  }

  async createLeave(leave: InsertEmployeeLeave): Promise<EmployeeLeave> {
    const [newLeave] = await db.insert(employeeLeaves).values(leave).returning();
    return newLeave;
  }

  async approveLeave(id: string, approverId: string): Promise<EmployeeLeave> {
    const [approvedLeave] = await db
      .update(employeeLeaves)
      .set({
        status: "approved",
        approvedBy: approverId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(employeeLeaves.id, id))
      .returning();
    return approvedLeave;
  }

  async rejectLeave(id: string, approverId: string, reason: string): Promise<EmployeeLeave> {
    const [rejectedLeave] = await db
      .update(employeeLeaves)
      .set({
        status: "rejected",
        approvedBy: approverId,
        approvedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(employeeLeaves.id, id))
      .returning();
    return rejectedLeave;
  }

  // Deduction operations
  async getEmployeeDeductions(employeeId: string): Promise<EmployeeDeduction[]> {
    return await db
      .select()
      .from(employeeDeductions)
      .where(eq(employeeDeductions.employeeId, employeeId))
      .orderBy(desc(employeeDeductions.createdAt));
  }

  async createDeduction(deduction: InsertEmployeeDeduction, processedBy: string): Promise<EmployeeDeduction> {
    const [newDeduction] = await db
      .insert(employeeDeductions)
      .values([{ ...deduction, processedBy }])
      .returning();
    return newDeduction;
  }

  async getEmployeeViolations(employeeId: string): Promise<EmployeeViolation[]> {
    return await db
      .select()
      .from(employeeViolations)
      .where(eq(employeeViolations.employeeId, employeeId))
      .orderBy(desc(employeeViolations.createdAt));
  }

  async createViolation(violation: InsertEmployeeViolation, reportedBy: string): Promise<EmployeeViolation> {
    const [newViolation] = await db
      .insert(employeeViolations)
      .values([{ ...violation, reportedBy }])
      .returning();
    return newViolation;
  }

  // Document operations
  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument, uploadedBy: string): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values([{ ...document, uploadedBy }])
      .returning();
    return newDocument;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Document operations
  async getEntityDocuments(entityId: string, entityType: 'employee' | 'company' | 'license'): Promise<Document[]> {
    let condition;
    switch (entityType) {
      case 'employee':
        condition = eq(documents.employeeId, entityId);
        break;
      case 'company':
        condition = eq(documents.companyId, entityId);
        break;
      case 'license':
        condition = eq(documents.licenseId, entityId);
        break;
    }

    return await db
      .select()
      .from(documents)
      .where(condition)
      .orderBy(desc(documents.createdAt));
  }

  // Notification operations
  async getUserNotifications(userId: string, companyId?: string): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (companyId) {
      conditions.push(eq(notifications.companyId, companyId));
    }

    return await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getUnreadNotificationCount(userId: string, companyId?: string): Promise<number> {
    const conditions = [eq(notifications.userId, userId), eq(notifications.isRead, false)];
    if (companyId) {
      conditions.push(eq(notifications.companyId, companyId));
    }

    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(...conditions));

    return result.count;
  }

  // Dashboard statistics
  async getSystemStats(): Promise<{
    totalCompanies: number;
    totalEmployees: number;
    totalLicenses: number;
    urgentAlerts: number;
  }> {
    const [companiesCount] = await db
      .select({ count: count() })
      .from(companies)
      .where(eq(companies.isActive, true));

    const [employeesCount] = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.isArchived, false));

    const [licensesCount] = await db
      .select({ count: count() })
      .from(licenses);

    const urgentAlerts = 0; // TODO: Implement urgent alerts logic

    return {
      totalCompanies: companiesCount.count,
      totalEmployees: employeesCount.count,
      totalLicenses: licensesCount.count,
      urgentAlerts,
    };
  }

  async getCompanyStats(companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    pendingLeaves: number;
    urgentAlerts: number;
  }> {
    const [totalEmployees] = await db
      .select({ count: count() })
      .from(employees)
      .where(and(eq(employees.companyId, companyId), eq(employees.isArchived, false)));

    const [activeEmployees] = await db
      .select({ count: count() })
      .from(employees)
      .where(
        and(
          eq(employees.companyId, companyId),
          eq(employees.status, "active"),
          eq(employees.isArchived, false)
        )
      );

    const [pendingLeaves] = await db
      .select({ count: count() })
      .from(employeeLeaves)
      .innerJoin(employees, eq(employeeLeaves.employeeId, employees.id))
      .where(
        and(
          eq(employees.companyId, companyId),
          eq(employeeLeaves.status, "pending")
        )
      );

    const urgentAlerts = 0; // TODO: Implement urgent alerts logic

    return {
      totalEmployees: totalEmployees.count,
      activeEmployees: activeEmployees.count,
      pendingLeaves: pendingLeaves.count,
      urgentAlerts,
    };
  }
}

export const storage = new DatabaseStorage();
