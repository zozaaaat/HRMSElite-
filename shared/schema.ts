import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "company_manager", "employee"]);
export const employeeStatusEnum = pgEnum("employee_status", ["active", "inactive", "on_leave", "terminated", "archived"]);
export const employeeTypeEnum = pgEnum("employee_type", ["citizen", "expatriate"]);
export const licenseStatusEnum = pgEnum("license_status", ["active", "expired", "pending"]);
export const licenseTypeEnum = pgEnum("license_type", ["main", "branch"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);
export const leaveTypeEnum = pgEnum("leave_type", ["annual", "sick", "maternity", "emergency", "unpaid"]);
export const documentTypeEnum = pgEnum("document_type", ["passport", "residence", "license", "contract", "certificate", "other"]);

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  commercialFileNumber: varchar("commercial_file_number"),
  commercialFileName: text("commercial_file_name"),
  commercialFileStatus: boolean("commercial_file_status").default(true),
  establishmentDate: date("establishment_date"),
  commercialRegistrationNumber: varchar("commercial_registration_number"),
  classification: text("classification"),
  department: text("department"),
  fileType: text("file_type"),
  legalEntity: text("legal_entity"),
  ownershipCategory: text("ownership_category"),
  logoUrl: varchar("logo_url"),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  totalEmployees: integer("total_employees").default(0),
  totalLicenses: integer("total_licenses").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company Users (linking users to companies with roles)
export const companyUsers = pgTable("company_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  role: userRoleEnum("role").notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Licenses table
export const licenses = pgTable("licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  licenseNumber: varchar("license_number").notNull(),
  name: text("name").notNull(),
  holderCivilId: varchar("holder_civil_id"),
  issuingAuthority: text("issuing_authority"),
  type: licenseTypeEnum("type").notNull(),
  status: licenseStatusEnum("status").notNull().default("active"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  associatedEmployees: integer("associated_employees").default(0),
  address: text("address"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  licenseId: varchar("license_id").references(() => licenses.id),
  civilId: varchar("civil_id").notNull(),
  fullName: text("full_name").notNull(),
  nationality: text("nationality").notNull(),
  type: employeeTypeEnum("type").notNull(),
  jobTitle: text("job_title").notNull(),
  actualJobTitle: text("actual_job_title"), // الوظيفة الفعلية
  hireDate: date("hire_date"),
  workPermitStart: date("work_permit_start"),
  workPermitEnd: date("work_permit_end"),
  monthlySalary: decimal("monthly_salary", { precision: 10, scale: 2 }),
  actualSalary: decimal("actual_salary", { precision: 10, scale: 2 }), // الراتب الفعلي
  status: employeeStatusEnum("status").notNull().default("active"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  profileImageUrl: varchar("profile_image_url"),
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
  archivedReason: text("archived_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Leaves table
export const employeeLeaves = pgTable("employee_leaves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  type: leaveTypeEnum("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").notNull().default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Deductions table
export const employeeDeductions = pgTable("employee_deductions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  date: date("date").notNull(),
  processedBy: varchar("processed_by").notNull().references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee Violations table
export const employeeViolations = pgTable("employee_violations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  violationType: text("violation_type").notNull(),
  date: date("date").notNull(),
  actionTaken: text("action_taken"),
  notes: text("notes"),
  reportedBy: varchar("reported_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: documentTypeEnum("type").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  expiryDate: date("expiry_date"),
  // Polymorphic relations
  employeeId: varchar("employee_id").references(() => employees.id),
  companyId: varchar("company_id").references(() => companies.id),
  licenseId: varchar("license_id").references(() => licenses.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").references(() => companies.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'warning', 'info', 'success', 'error'
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url"),
  relatedEntityId: varchar("related_entity_id"),
  relatedEntityType: varchar("related_entity_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  employees: many(employees),
  licenses: many(licenses),
  companyUsers: many(companyUsers),
  documents: many(documents),
  notifications: many(notifications),
}));

export const usersRelations = relations(users, ({ many }) => ({
  companyUsers: many(companyUsers),
  approvedLeaves: many(employeeLeaves),
  processedDeductions: many(employeeDeductions),
  reportedViolations: many(employeeViolations),
  uploadedDocuments: many(documents),
  notifications: many(notifications),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
  license: one(licenses, {
    fields: [employees.licenseId],
    references: [licenses.id],
  }),
  leaves: many(employeeLeaves),
  deductions: many(employeeDeductions),
  violations: many(employeeViolations),
  documents: many(documents),
}));

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  company: one(companies, {
    fields: [licenses.companyId],
    references: [companies.id],
  }),
  employees: many(employees),
  documents: many(documents),
}));

export const employeeLeavesRelations = relations(employeeLeaves, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeLeaves.employeeId],
    references: [employees.id],
  }),
  approver: one(users, {
    fields: [employeeLeaves.approvedBy],
    references: [users.id],
  }),
}));

export const employeeDeductionsRelations = relations(employeeDeductions, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeDeductions.employeeId],
    references: [employees.id],
  }),
  processor: one(users, {
    fields: [employeeDeductions.processedBy],
    references: [users.id],
  }),
}));

export const employeeViolationsRelations = relations(employeeViolations, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeViolations.employeeId],
    references: [employees.id],
  }),
  reporter: one(users, {
    fields: [employeeViolations.reportedBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  employee: one(employees, {
    fields: [documents.employeeId],
    references: [employees.id],
  }),
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  license: one(licenses, {
    fields: [documents.licenseId],
    references: [licenses.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [notifications.companyId],
    references: [companies.id],
  }),
}));

// Insert Schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  totalEmployees: true,
  totalLicenses: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  associatedEmployees: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeLeaveSchema = createInsertSchema(employeeLeaves).omit({
  id: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeDeductionSchema = createInsertSchema(employeeDeductions).omit({
  id: true,
  processedBy: true,
  createdAt: true,
});

export const insertEmployeeViolationSchema = createInsertSchema(employeeViolations).omit({
  id: true,
  reportedBy: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type EmployeeLeave = typeof employeeLeaves.$inferSelect;
export type InsertEmployeeLeave = z.infer<typeof insertEmployeeLeaveSchema>;
export type EmployeeDeduction = typeof employeeDeductions.$inferSelect;
export type InsertEmployeeDeduction = z.infer<typeof insertEmployeeDeductionSchema>;
export type EmployeeViolation = typeof employeeViolations.$inferSelect;
export type InsertEmployeeViolation = z.infer<typeof insertEmployeeViolationSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type CompanyUser = typeof companyUsers.$inferSelect;

// Extended types for API responses
export type CompanyWithStats = Company & {
  totalEmployees: number;
  totalLicenses: number;
  activeEmployees: number;
  urgentAlerts: number;
};

export type EmployeeWithDetails = Employee & {
  company: Company;
  license?: License;
  recentLeaves: EmployeeLeave[];
  totalDeductions: number;
  totalViolations: number;
};

export type LicenseWithDetails = License & {
  company: Company;
  employees: Employee[];
  documents: Document[];
};
