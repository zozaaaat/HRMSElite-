import {
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

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Company operations
  getAllCompanies(): Promise<CompanyWithStats[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  getCompanyStats(companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    pendingLeaves: number;
    expiringLicenses: number;
  }>;

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
  approveLeave(leaveId: string, approverId: string): Promise<EmployeeLeave>;
  rejectLeave(leaveId: string, approverId: string, reason: string): Promise<EmployeeLeave>;

  // Deduction operations
  getEmployeeDeductions(employeeId: string): Promise<EmployeeDeduction[]>;
  getCompanyDeductions(companyId: string): Promise<(EmployeeDeduction & { employee: Employee })[]>;
  createDeduction(deduction: InsertEmployeeDeduction): Promise<EmployeeDeduction>;
  updateDeduction(id: string, updates: Partial<InsertEmployeeDeduction>): Promise<EmployeeDeduction>;
  deleteDeduction(id: string): Promise<void>;

  // Violation operations
  getEmployeeViolations(employeeId: string): Promise<EmployeeViolation[]>;
  getCompanyViolations(companyId: string): Promise<(EmployeeViolation & { employee: Employee })[]>;
  createViolation(violation: InsertEmployeeViolation): Promise<EmployeeViolation>;
  updateViolation(id: string, updates: Partial<InsertEmployeeViolation>): Promise<EmployeeViolation>;
  deleteViolation(id: string): Promise<void>;

  // Document operations
  getEntityDocuments(entityId: string, entityType: 'employee' | 'company' | 'license'): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Notification operations
  getUserNotifications(userId: string, companyId?: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string, companyId?: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
}

export class MockStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private companies: Map<string, Company> = new Map();
  private employees: Map<string, Employee> = new Map();
  private licenses: Map<string, License> = new Map();
  private leaves: Map<string, EmployeeLeave> = new Map();
  private deductions: Map<string, EmployeeDeduction> = new Map();
  private violations: Map<string, EmployeeViolation> = new Map();
  private documents: Map<string, Document> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private companyUsers: Map<string, CompanyUser> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock companies
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
        establishedDate: new Date("2015-01-01"),
        taxNumber: "300123456789003",
        commercialRegister: "1010123456",
        createdAt: new Date(),
        updatedAt: new Date(),
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
        establishedDate: new Date("2010-05-15"),
        taxNumber: "300987654321003",
        commercialRegister: "4030987654",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockCompanies.forEach(company => {
      this.companies.set(company.id, company as Company);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Company operations
  async getAllCompanies(): Promise<CompanyWithStats[]> {
    const companiesArray = Array.from(this.companies.values());
    return companiesArray.map(company => ({
      ...company,
      employeeCount: Array.from(this.employees.values()).filter(emp => emp.companyId === company.id).length,
      activeEmployees: Array.from(this.employees.values()).filter(emp => emp.companyId === company.id && emp.status === 'active').length,
    }));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(companyData: InsertCompany): Promise<Company> {
    const company: Company = {
      ...companyData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.companies.set(company.id, company);
    return company;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company> {
    const company = this.companies.get(id);
    if (!company) throw new Error("Company not found");
    
    const updatedCompany = {
      ...company,
      ...updates,
      updatedAt: new Date(),
    };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<void> {
    this.companies.delete(id);
  }

  async getCompanyStats(companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    pendingLeaves: number;
    expiringLicenses: number;
  }> {
    const employees = Array.from(this.employees.values()).filter(emp => emp.companyId === companyId);
    const leaves = Array.from(this.leaves.values()).filter(leave => 
      employees.some(emp => emp.id === leave.employeeId) && leave.status === 'pending'
    );
    const licenses = Array.from(this.licenses.values()).filter(license => license.companyId === companyId);
    
    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(emp => emp.status === 'active').length,
      pendingLeaves: leaves.length,
      expiringLicenses: licenses.filter(license => {
        const expiryDate = new Date(license.expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).length,
    };
  }

  // Company User operations
  async getUserCompanies(userId: string): Promise<CompanyUser[]> {
    return Array.from(this.companyUsers.values()).filter(cu => cu.userId === userId);
  }

  async getCompanyUsers(companyId: string): Promise<(CompanyUser & { user: User })[]> {
    const companyUsersList = Array.from(this.companyUsers.values()).filter(cu => cu.companyId === companyId);
    return companyUsersList.map(cu => ({
      ...cu,
      user: this.users.get(cu.userId)!,
    }));
  }

  async addUserToCompany(userId: string, companyId: string, role: string, permissions?: string[]): Promise<CompanyUser> {
    const companyUser: CompanyUser = {
      id: Date.now().toString(),
      userId,
      companyId,
      role,
      permissions: permissions || [],
      joinedAt: new Date(),
    };
    this.companyUsers.set(companyUser.id, companyUser);
    return companyUser;
  }

  async updateUserRole(userId: string, companyId: string, role: string, permissions?: string[]): Promise<CompanyUser> {
    const companyUser = Array.from(this.companyUsers.values()).find(cu => cu.userId === userId && cu.companyId === companyId);
    if (!companyUser) throw new Error("Company user not found");
    
    const updated = {
      ...companyUser,
      role,
      permissions: permissions || companyUser.permissions,
    };
    this.companyUsers.set(companyUser.id, updated);
    return updated;
  }

  async removeUserFromCompany(userId: string, companyId: string): Promise<void> {
    const companyUser = Array.from(this.companyUsers.values()).find(cu => cu.userId === userId && cu.companyId === companyId);
    if (companyUser) {
      this.companyUsers.delete(companyUser.id);
    }
  }

  // Employee operations
  async getCompanyEmployees(companyId: string, includeArchived?: boolean): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => 
      emp.companyId === companyId && (includeArchived || emp.status !== 'archived')
    );
  }

  async getEmployee(id: string): Promise<EmployeeWithDetails | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    return {
      ...employee,
      company: this.companies.get(employee.companyId)!,
    };
  }

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    const employee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employees.set(employee.id, employee);
    return employee;
  }

  async updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee> {
    const employee = this.employees.get(id);
    if (!employee) throw new Error("Employee not found");
    
    const updated = {
      ...employee,
      ...updates,
      updatedAt: new Date(),
    };
    this.employees.set(id, updated);
    return updated;
  }

  async archiveEmployee(id: string, reason: string): Promise<Employee> {
    const employee = this.employees.get(id);
    if (!employee) throw new Error("Employee not found");
    
    const archived = {
      ...employee,
      status: 'archived' as const,
      archivedAt: new Date(),
      archiveReason: reason,
      updatedAt: new Date(),
    };
    this.employees.set(id, archived);
    return archived;
  }

  async getEmployeesByLicense(licenseId: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.licenseId === licenseId);
  }

  // License operations
  async getCompanyLicenses(companyId: string): Promise<License[]> {
    return Array.from(this.licenses.values()).filter(license => license.companyId === companyId);
  }

  async getLicense(id: string): Promise<LicenseWithDetails | undefined> {
    const license = this.licenses.get(id);
    if (!license) return undefined;
    
    return {
      ...license,
      company: this.companies.get(license.companyId)!,
      employeeCount: Array.from(this.employees.values()).filter(emp => emp.licenseId === id).length,
    };
  }

  async createLicense(licenseData: InsertLicense): Promise<License> {
    const license: License = {
      ...licenseData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.licenses.set(license.id, license);
    return license;
  }

  async updateLicense(id: string, updates: Partial<InsertLicense>): Promise<License> {
    const license = this.licenses.get(id);
    if (!license) throw new Error("License not found");
    
    const updated = {
      ...license,
      ...updates,
      updatedAt: new Date(),
    };
    this.licenses.set(id, updated);
    return updated;
  }

  async deleteLicense(id: string): Promise<void> {
    this.licenses.delete(id);
  }

  // Leave operations
  async getEmployeeLeaves(employeeId: string): Promise<EmployeeLeave[]> {
    return Array.from(this.leaves.values()).filter(leave => leave.employeeId === employeeId);
  }

  async getCompanyLeaves(companyId: string, status?: string): Promise<(EmployeeLeave & { employee: Employee })[]> {
    const employees = Array.from(this.employees.values()).filter(emp => emp.companyId === companyId);
    const leaves = Array.from(this.leaves.values()).filter(leave => 
      employees.some(emp => emp.id === leave.employeeId) && (!status || leave.status === status)
    );
    
    return leaves.map(leave => ({
      ...leave,
      employee: employees.find(emp => emp.id === leave.employeeId)!,
    }));
  }

  async createLeave(leaveData: InsertEmployeeLeave): Promise<EmployeeLeave> {
    const leave: EmployeeLeave = {
      ...leaveData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.leaves.set(leave.id, leave);
    return leave;
  }

  async approveLeave(leaveId: string, approverId: string): Promise<EmployeeLeave> {
    const leave = this.leaves.get(leaveId);
    if (!leave) throw new Error("Leave not found");
    
    const approved = {
      ...leave,
      status: 'approved' as const,
      approverId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
    this.leaves.set(leaveId, approved);
    return approved;
  }

  async rejectLeave(leaveId: string, approverId: string, reason: string): Promise<EmployeeLeave> {
    const leave = this.leaves.get(leaveId);
    if (!leave) throw new Error("Leave not found");
    
    const rejected = {
      ...leave,
      status: 'rejected' as const,
      approverId,
      rejectionReason: reason,
      rejectedAt: new Date(),
      updatedAt: new Date(),
    };
    this.leaves.set(leaveId, rejected);
    return rejected;
  }

  // Deduction operations
  async getEmployeeDeductions(employeeId: string): Promise<EmployeeDeduction[]> {
    return Array.from(this.deductions.values()).filter(deduction => deduction.employeeId === employeeId);
  }

  async getCompanyDeductions(companyId: string): Promise<(EmployeeDeduction & { employee: Employee })[]> {
    const employees = Array.from(this.employees.values()).filter(emp => emp.companyId === companyId);
    const deductions = Array.from(this.deductions.values()).filter(deduction => 
      employees.some(emp => emp.id === deduction.employeeId)
    );
    
    return deductions.map(deduction => ({
      ...deduction,
      employee: employees.find(emp => emp.id === deduction.employeeId)!,
    }));
  }

  async createDeduction(deductionData: InsertEmployeeDeduction): Promise<EmployeeDeduction> {
    const deduction: EmployeeDeduction = {
      ...deductionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deductions.set(deduction.id, deduction);
    return deduction;
  }

  async updateDeduction(id: string, updates: Partial<InsertEmployeeDeduction>): Promise<EmployeeDeduction> {
    const deduction = this.deductions.get(id);
    if (!deduction) throw new Error("Deduction not found");
    
    const updated = {
      ...deduction,
      ...updates,
      updatedAt: new Date(),
    };
    this.deductions.set(id, updated);
    return updated;
  }

  async deleteDeduction(id: string): Promise<void> {
    this.deductions.delete(id);
  }

  // Violation operations
  async getEmployeeViolations(employeeId: string): Promise<EmployeeViolation[]> {
    return Array.from(this.violations.values()).filter(violation => violation.employeeId === employeeId);
  }

  async getCompanyViolations(companyId: string): Promise<(EmployeeViolation & { employee: Employee })[]> {
    const employees = Array.from(this.employees.values()).filter(emp => emp.companyId === companyId);
    const violations = Array.from(this.violations.values()).filter(violation => 
      employees.some(emp => emp.id === violation.employeeId)
    );
    
    return violations.map(violation => ({
      ...violation,
      employee: employees.find(emp => emp.id === violation.employeeId)!,
    }));
  }

  async createViolation(violationData: InsertEmployeeViolation): Promise<EmployeeViolation> {
    const violation: EmployeeViolation = {
      ...violationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.violations.set(violation.id, violation);
    return violation;
  }

  async updateViolation(id: string, updates: Partial<InsertEmployeeViolation>): Promise<EmployeeViolation> {
    const violation = this.violations.get(id);
    if (!violation) throw new Error("Violation not found");
    
    const updated = {
      ...violation,
      ...updates,
      updatedAt: new Date(),
    };
    this.violations.set(id, updated);
    return updated;
  }

  async deleteViolation(id: string): Promise<void> {
    this.violations.delete(id);
  }

  // Document operations
  async getEntityDocuments(entityId: string, entityType: 'employee' | 'company' | 'license'): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => 
      doc.entityId === entityId && doc.entityType === entityType
    );
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const document: Document = {
      ...documentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(document.id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  // Notification operations
  async getUserNotifications(userId: string, companyId?: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => 
      notification.userId === userId && (!companyId || notification.companyId === companyId)
    );
  }

  async getUnreadNotificationCount(userId: string, companyId?: string): Promise<number> {
    return Array.from(this.notifications.values()).filter(notification => 
      notification.userId === userId && 
      (!companyId || notification.companyId === companyId) && 
      !notification.readAt
    ).length;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, {
        ...notification,
        readAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications.delete(id);
  }
}

export const storage = new MockStorage();