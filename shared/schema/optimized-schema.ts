import {sql, relations} from 'drizzle-orm';
import {
  index,
  sqliteTable,
  text,
  integer,
  real,
  primaryKey
} from 'drizzle-orm/sqlite-core';
import {createInsertSchema} from 'drizzle-zod';
import {z} from 'zod';

// ============================================================================
// ENUMS - Centralized for consistency
// ============================================================================

export const userRoleEnum = ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'] as const;
export const employeeStatusEnum = ['active', 'inactive', 'on_leave', 'terminated', 'archived'] as const;
export const employeeTypeEnum = ['citizen', 'expatriate'] as const;
export const licenseStatusEnum = ['active', 'expired', 'pending'] as const;
export const licenseTypeEnum = [
  'main', 'branch', 'commercial', 'industrial', 'professional',
  'import_export', 'tailoring', 'fabric', 'jewelry', 'restaurant', 'service'
] as const;
export const leaveStatusEnum = ['pending', 'approved', 'rejected'] as const;
export const leaveTypeEnum = ['annual', 'sick', 'maternity', 'emergency', 'unpaid'] as const;
export const deductionTypeEnum = ['late', 'absence', 'loan', 'insurance', 'other'] as const;
export const deductionStatusEnum = ['active', 'completed', 'cancelled'] as const;
export const documentTypeEnum = [
  'passport', 'residence', 'license', 'contract', 'certificate',
  'civil_id', 'work_permit', 'health_certificate', 'establishment_document',
  'tax_certificate', 'chamber_membership', 'import_export_license',
  'fire_permit', 'municipality_permit', 'other'
] as const;

// ============================================================================
// CORE TABLES - Optimized with better indexing and relationships
// ============================================================================

// Companies table - Optimized with composite indexes
export const companies = sqliteTable('companies', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'name': text('name').notNull(),
  'commercialFileNumber': text('commercial_file_number'),
  'commercialFileName': text('commercial_file_name'),
  'commercialFileStatus': integer('commercial_file_status', {'mode': 'boolean'}).default(true).notNull(),
  'establishmentDate': text('establishment_date'),
  'commercialRegistrationNumber': text('commercial_registration_number'),
  'classification': text('classification'),
  'department': text('department'),
  'fileType': text('file_type'),
  'legalEntity': text('legal_entity'),
  'ownershipCategory': text('ownership_category'),
  'logoUrl': text('logo_url'),
  'address': text('address'),
  'phone': text('phone'),
  'email': text('email'),
  'website': text('website'),
  'totalEmployees': integer('total_employees').default(0).notNull(),
  'totalLicenses': integer('total_licenses').default(0).notNull(),
  'isActive': integer('is_active', {'mode': 'boolean'}).default(true).notNull(),
  'industryType': text('industry_type'),
  'businessActivity': text('business_activity'),
  'location': text('location'),
  'taxNumber': text('tax_number'),
  'chambers': text('chambers'),
  'partnerships': text('partnerships').default('[]').notNull(),
  'importExportLicense': text('import_export_license'),
  'specialPermits': text('special_permits').default('[]').notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  // Primary indexes for common queries
  index('IDX_companies_name').on(table.name),
  index('IDX_companies_commercial_file_number').on(table.commercialFileNumber),
  index('IDX_companies_is_active').on(table.isActive),
  
  // Composite indexes for complex queries
  index('IDX_companies_location_industry').on(table.location, table.industryType),
  index('IDX_companies_status_created').on(table.isActive, table.createdAt),
  index('IDX_companies_search').on(table.name, table.commercialFileNumber, table.location),
  
  // Performance indexes
  index('IDX_companies_industry_type').on(table.industryType),
  index('IDX_companies_location').on(table.location),
  index('IDX_companies_created_at').on(table.createdAt)
]);

// Users table - Optimized with better indexing
export const users = sqliteTable('users', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'email': text('email').unique().notNull(),
  'firstName': text('first_name').notNull(),
  'lastName': text('last_name').notNull(),
  'password': text('password').notNull(),
  'profileImageUrl': text('profile_image_url'),
  'role': text('role').default('worker').notNull(),
  'companyId': text('company_id'),
  'permissions': text('permissions').default('[]').notNull(),
  'isActive': integer('is_active', {'mode': 'boolean'}).default(true).notNull(),
  'emailVerified': integer('email_verified', {'mode': 'boolean'}).default(false).notNull(),
  'emailVerificationToken': text('email_verification_token'),
  'emailVerificationExpires': integer('email_verification_expires'),
  'passwordResetToken': text('password_reset_token'),
  'passwordResetExpires': integer('password_reset_expires'),
  'lastPasswordChange': integer('last_password_change'),
  'lastLoginAt': integer('last_login_at'),
  'sub': text('sub'),
  'claims': text('claims'),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  // Primary indexes
  index('IDX_users_email').on(table.email),
  index('IDX_users_company_id').on(table.companyId),
  index('IDX_users_role').on(table.role),
  index('IDX_users_is_active').on(table.isActive),
  
  // Composite indexes for common queries
  index('IDX_users_company_role').on(table.companyId, table.role),
  index('IDX_users_status_created').on(table.isActive, table.createdAt),
  index('IDX_users_search').on(table.email, table.firstName, table.lastName),
  
  // Performance indexes
  index('IDX_users_created_at').on(table.createdAt),
  index('IDX_users_last_login').on(table.lastLoginAt)
]);

// Company Users table - Many-to-many relationship with composite primary key
export const companyUsers = sqliteTable('company_users', {
  'companyId': text('company_id').notNull().references(() => companies.id, {'onDelete': 'cascade'}),
  'userId': text('user_id').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'role': text('role').notNull().default('worker'),
  'permissions': text('permissions').default('[]').notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.companyId, table.userId] }),
  companyIdIdx: index('IDX_company_users_company_id').on(table.companyId),
  userIdIdx: index('IDX_company_users_user_id').on(table.userId),
  roleIdx: index('IDX_company_users_role').on(table.role),
  compositeIdx: index('IDX_company_users_company_user').on(table.companyId, table.userId)
}));

// ============================================================================
// EMPLOYEE MANAGEMENT TABLES - Optimized relationships
// ============================================================================

// Employees table - Enhanced with better indexing
export const employees = sqliteTable('employees', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'companyId': text('company_id').notNull().references(() => companies.id, {'onDelete': 'cascade'}),
  'licenseId': text('license_id').references(() => licenses.id, {'onDelete': 'set null'}),
  'firstName': text('first_name').notNull(),
  'lastName': text('last_name').notNull(),
  'arabicName': text('arabic_name'),
  'englishName': text('english_name'),
  'passportNumber': text('passport_number'),
  'civilId': text('civil_id'),
  'nationality': text('nationality'),
  'dateOfBirth': text('date_of_birth'),
  'gender': text('gender'),
  'maritalStatus': text('marital_status'),
  'employeeType': text('employee_type').default('citizen').notNull(),
  'status': text('status').default('active').notNull(),
  'position': text('position'),
  'department': text('department'),
  'hireDate': text('hire_date'),
  'salary': real('salary'),
  'phone': text('phone'),
  'email': text('email'),
  'address': text('address'),
  'emergencyContact': text('emergency_contact'),
  'emergencyPhone': text('emergency_phone'),
  'photoUrl': text('photo_url'),
  'documents': text('documents').default('[]').notNull(),
  'skills': text('skills').default('[]').notNull(),
  'notes': text('notes'),
  'fullName': text('full_name'),
  'jobTitle': text('job_title'),
  'residenceNumber': text('residence_number'),
  'residenceExpiry': text('residence_expiry'),
  'medicalInsurance': text('medical_insurance'),
  'bankAccount': text('bank_account'),
  'workPermitStart': text('work_permit_start'),
  'workPermitEnd': text('work_permit_end'),
  'isArchived': integer('is_archived', {'mode': 'boolean'}).default(false).notNull(),
  'archiveReason': text('archive_reason'),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  // Primary indexes
  index('IDX_employees_company_id').on(table.companyId),
  index('IDX_employees_license_id').on(table.licenseId),
  index('IDX_employees_status').on(table.status),
  index('IDX_employees_employee_type').on(table.employeeType),
  
  // Composite indexes for common queries
  index('IDX_employees_company_status').on(table.companyId, table.status),
  index('IDX_employees_department_position').on(table.department, table.position),
  index('IDX_employees_search').on(table.firstName, table.lastName, table.civilId, table.passportNumber),
  index('IDX_employees_hire_date').on(table.hireDate),
  
  // Performance indexes
  index('IDX_employees_is_archived').on(table.isArchived),
  index('IDX_employees_created_at').on(table.createdAt),
  index('IDX_employees_nationality').on(table.nationality),
  index('IDX_employees_residence_expiry').on(table.residenceExpiry)
]);

// ============================================================================
// LICENSE MANAGEMENT TABLES
// ============================================================================

// Licenses table - Optimized with better indexing
export const licenses = sqliteTable('licenses', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'companyId': text('company_id').notNull().references(() => companies.id, {'onDelete': 'cascade'}),
  'name': text('name').notNull(),
  'type': text('type').notNull(),
  'number': text('number').notNull(),
  'status': text('status').default('active').notNull(),
  'issueDate': text('issue_date'),
  'expiryDate': text('expiry_date'),
  'issuingAuthority': text('issuing_authority'),
  'location': text('location'),
  'description': text('description'),
  'documents': text('documents').default('[]').notNull(),
  'isActive': integer('is_active', {'mode': 'boolean'}).default(true).notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  // Primary indexes
  index('IDX_licenses_company_id').on(table.companyId),
  index('IDX_licenses_type').on(table.type),
  index('IDX_licenses_status').on(table.status),
  index('IDX_licenses_number').on(table.number),
  
  // Composite indexes for common queries
  index('IDX_licenses_company_status').on(table.companyId, table.status),
  index('IDX_licenses_expiry_active').on(table.expiryDate, table.isActive),
  index('IDX_licenses_type_status').on(table.type, table.status),
  
  // Performance indexes
  index('IDX_licenses_expiry_date').on(table.expiryDate),
  index('IDX_licenses_is_active').on(table.isActive),
  index('IDX_licenses_created_at').on(table.createdAt)
]);

// ============================================================================
// RELATIONSHIPS - Explicitly defined for better performance
// ============================================================================

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(companyUsers),
  employees: many(employees),
  licenses: many(licenses)
}));

export const usersRelations = relations(users, ({ many }) => ({
  companyUsers: many(companyUsers)
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id]
  }),
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id]
  })
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id]
  }),
  license: one(licenses, {
    fields: [employees.licenseId],
    references: [licenses.id]
  }),
  leaves: many(employeeLeaves),
  deductions: many(employeeDeductions)
}));

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  company: one(companies, {
    fields: [licenses.companyId],
    references: [companies.id]
  }),
  employees: many(employees)
}));

// ============================================================================
// ADDITIONAL TABLES - Optimized versions
// ============================================================================

// Employee Leaves table - Optimized
export const employeeLeaves = sqliteTable('employee_leaves', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'employeeId': text('employee_id').notNull().references(() => employees.id, {'onDelete': 'cascade'}),
  'type': text('type', {'enum': leaveTypeEnum}).notNull(),
  'status': text('status', {'enum': leaveStatusEnum}).default('pending').notNull(),
  'startDate': text('start_date').notNull(),
  'endDate': text('end_date').notNull(),
  'days': integer('days').notNull(),
  'reason': text('reason'),
  'approvedBy': text('approved_by').references(() => users.id, {'onDelete': 'set null'}),
  'approvedAt': integer('approved_at', {'mode': 'timestamp'}),
  'rejectionReason': text('rejection_reason'),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  // Primary indexes
  index('IDX_employee_leaves_employee_id').on(table.employeeId),
  index('IDX_employee_leaves_type').on(table.type),
  index('IDX_employee_leaves_status').on(table.status),
  
  // Composite indexes for common queries
  index('IDX_employee_leaves_employee_status').on(table.employeeId, table.status),
  index('IDX_employee_leaves_date_range').on(table.startDate, table.endDate),
  index('IDX_employee_leaves_type_status').on(table.type, table.status),
  
  // Performance indexes
  index('IDX_employee_leaves_start_date').on(table.startDate),
  index('IDX_employee_leaves_end_date').on(table.endDate),
  index('IDX_employee_leaves_approved_by').on(table.approvedBy),
  index('IDX_employee_leaves_created_at').on(table.createdAt)
]);

// Employee Deductions table - Optimized
export const employeeDeductions = sqliteTable('employee_deductions', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'employeeId': text('employee_id').notNull().references(() => employees.id, {'onDelete': 'cascade'}),
  'type': text('type', {'enum': deductionTypeEnum}).notNull(),
  'amount': real('amount').notNull(),
  'reason': text('reason').notNull(),
  'date': text('date').notNull(),
  'status': text('status', {'enum': deductionStatusEnum}).default('active').notNull(),
  'processedBy': text('processed_by').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  // Primary indexes
  index('IDX_employee_deductions_employee_id').on(table.employeeId),
  index('IDX_employee_deductions_type').on(table.type),
  index('IDX_employee_deductions_status').on(table.status),
  
  // Composite indexes for common queries
  index('IDX_employee_deductions_employee_type').on(table.employeeId, table.type),
  index('IDX_employee_deductions_type_status').on(table.type, table.status),
  index('IDX_employee_deductions_date_amount').on(table.date, table.amount),
  
  // Performance indexes
  index('IDX_employee_deductions_date').on(table.date),
  index('IDX_employee_deductions_processed_by').on(table.processedBy),
  index('IDX_employee_deductions_created_at').on(table.createdAt),
  index('IDX_employee_deductions_amount').on(table.amount)
]);

// ============================================================================
// SESSION STORAGE
// ============================================================================

export const sessions = sqliteTable('sessions', {
  'sid': text('sid').primaryKey(),
  'sess': text('sess').notNull(),
  'expire': integer('expire').notNull()
}, (table) => [
  index('IDX_session_expire').on(table.expire),
  index('IDX_session_sid_expire').on(table.sid, table.expire)
]);

// ============================================================================
// SCHEMA EXPORTS
// ============================================================================

export const schema = {
  companies,
  users,
  companyUsers,
  employees,
  licenses,
  employeeLeaves,
  employeeDeductions,
  sessions
};

// Zod schemas for validation
export const insertCompanySchema = createInsertSchema(companies);
export const insertUserSchema = createInsertSchema(users);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertLicenseSchema = createInsertSchema(licenses);

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
