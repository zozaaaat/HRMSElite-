import {sql, relations} from 'drizzle-orm';
import {
  index,
  sqliteTable,
  text,
  integer,
  real
} from 'drizzle-orm/sqlite-core';
import {createInsertSchema} from 'drizzle-zod';
import {z} from 'zod';

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  'sessions',
  {
    'sid': text('sid').primaryKey(),
    'sess': text('sess').notNull(),
    'expire': integer('expire').notNull()
  },
  (table) => [
    index('IDX_session_expire').on(table.expire),
    index('IDX_session_sid_expire').on(table.sid, table.expire)
  ]
);

// User storage table for HRMS Elite
export const users = sqliteTable('users', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'email': text('email').unique().notNull(),
  'firstName': text('first_name').notNull(),
  'lastName': text('last_name').notNull(),
  'password': text('password').notNull(), // Hashed password
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
  index('IDX_users_email').on(table.email),
  index('IDX_users_company_id').on(table.companyId),
  index('IDX_users_role').on(table.role),
  index('IDX_users_is_active').on(table.isActive),
  index('IDX_users_created_at').on(table.createdAt)
]);

// Refresh tokens table
export const refreshTokens = sqliteTable('refresh_tokens', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'userId': text('user_id').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'tokenHash': text('token_hash').notNull(),
  'familyId': text('family_id').notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'expiresAt': integer('expires_at', {'mode': 'timestamp'}).notNull(),
  'revokedAt': integer('revoked_at', {'mode': 'timestamp'}),
  'replacedBy': text('replaced_by'),
  'userAgent': text('user_agent'),
  'ip': text('ip')
}, (table) => [
  index('IDX_refresh_tokens_user_id').on(table.userId),
  index('IDX_refresh_tokens_family_id').on(table.familyId),
  index('IDX_refresh_tokens_token_hash').on(table.tokenHash)
]);

// Enums - Using text fields instead of pgEnum for SQLite compatibility
export const userRoleEnum = ['super_admin',
   'company_manager',
   'employee',
   'supervisor',
   'worker'] as const;
export const employeeStatusEnum = ['active',
   'inactive',
   'on_leave',
   'terminated',
   'archived'] as const;
export const employeeTypeEnum = ['citizen', 'expatriate'] as const;
export const licenseStatusEnum = ['active', 'expired', 'pending'] as const;
export const licenseTypeEnum = ['main',
   'branch',
   'commercial',
   'industrial',
   'professional',
   'import_export',
   'tailoring',
   'fabric',
   'jewelry',
   'restaurant',
   'service'] as const;
export const leaveStatusEnum = ['pending', 'approved', 'rejected'] as const;
export const leaveTypeEnum = ['annual', 'sick', 'maternity', 'emergency', 'unpaid'] as const;
export const deductionTypeEnum = ['late', 'absence', 'loan', 'insurance', 'other'] as const;
export const deductionStatusEnum = ['active', 'completed', 'cancelled'] as const;
export const documentTypeEnum = ['passport',
   'residence',
   'license',
   'contract',
   'certificate',
   'civil_id',
   'work_permit',
   'health_certificate',
   'establishment_document',
   'tax_certificate',
   'chamber_membership',
   'import_export_license',
   'fire_permit',
   'municipality_permit',
   'other'] as const;

// Companies table - Enhanced for real business data
export const companies = sqliteTable('companies', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'name': text('name').notNull(),
  'commercialFileNumber': text('commercial_file_number'),
  'commercialFileName': text('commercial_file_name'),
  'commercialFileStatus': integer('commercial_file_status', {
  'mode': 'boolean'
}).default(true).notNull(),
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
  // حقول إضافية مستخرجة من الملفات الحقيقية
  'industryType': text('industry_type'), // أقمشة، مجوهرات، خياطة، تجارة عامة
  'businessActivity': text('business_activity'), // نشاط الشركة التفصيلي
  'location': text('location'), // الموقع: مباركية، الجهراء، الصفاة، فحيحيل، رامين
  'taxNumber': text('tax_number'), // الرقم الضريبي
  'chambers': text('chambers'), // غرف التجارة المسجلة بها
  'partnerships': text('partnerships').default('[]').notNull(), // JSON string
  'importExportLicense': text('import_export_license'), // رخصة الاستيراد والتصدير
  'specialPermits': text('special_permits').default('[]').notNull(), // JSON string
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  index('IDX_companies_name').on(table.name),
  index('IDX_companies_commercial_file_number').on(table.commercialFileNumber),
  index('IDX_companies_is_active').on(table.isActive),
  index('IDX_companies_industry_type').on(table.industryType),
  index('IDX_companies_location').on(table.location),
  index('IDX_companies_created_at').on(table.createdAt)
]);

// Company Users table
export const companyUsers = sqliteTable('company_users', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'companyId': text('company_id').notNull().references(() => companies.id, {'onDelete': 'cascade'}),
  'userId': text('user_id').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'role': text('role').notNull().default('worker'),
  'permissions': text('permissions').default('[]').notNull(), // JSON string
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  index('IDX_company_users_company_id').on(table.companyId),
  index('IDX_company_users_user_id').on(table.userId),
  index('IDX_company_users_role').on(table.role),
  index('IDX_company_users_company_user').on(table.companyId, table.userId)
]);

// Employees table
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
  'documents': text('documents').default('[]').notNull(), // JSON string
  'skills': text('skills').default('[]').notNull(), // JSON string
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
  index('IDX_employees_company_id').on(table.companyId),
  index('IDX_employees_license_id').on(table.licenseId),
  index('IDX_employees_status').on(table.status),
  index('IDX_employees_employee_type').on(table.employeeType),
  index('IDX_employees_department').on(table.department),
  index('IDX_employees_position').on(table.position),
  index('IDX_employees_civil_id').on(table.civilId),
  index('IDX_employees_passport_number').on(table.passportNumber),
  index('IDX_employees_is_archived').on(table.isArchived),
  index('IDX_employees_hire_date').on(table.hireDate),
  index('IDX_employees_created_at').on(table.createdAt),
  index('IDX_employees_company_status').on(table.companyId, table.status)
]);

// Licenses table
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
  'documents': text('documents').default('[]').notNull(), // JSON string
  'isActive': integer('is_active', {'mode': 'boolean'}).default(true).notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  index('IDX_licenses_company_id').on(table.companyId),
  index('IDX_licenses_type').on(table.type),
  index('IDX_licenses_status').on(table.status),
  index('IDX_licenses_number').on(table.number),
  index('IDX_licenses_expiry_date').on(table.expiryDate),
  index('IDX_licenses_is_active').on(table.isActive),
  index('IDX_licenses_company_status').on(table.companyId, table.status),
  index('IDX_licenses_expiry_active').on(table.expiryDate, table.isActive)
]);

// Employee Leaves table
export const employeeLeaves = sqliteTable('employee_leaves', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'employeeId': text('employee_id').notNull().references(() => employees.id, {
  'onDelete': 'cascade'
}),
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
  index('IDX_employee_leaves_employee_id').on(table.employeeId),
  index('IDX_employee_leaves_type').on(table.type),
  index('IDX_employee_leaves_status').on(table.status),
  index('IDX_employee_leaves_start_date').on(table.startDate),
  index('IDX_employee_leaves_end_date').on(table.endDate),
  index('IDX_employee_leaves_approved_by').on(table.approvedBy),
  index('IDX_employee_leaves_created_at').on(table.createdAt),
  index('IDX_employee_leaves_employee_status').on(table.employeeId, table.status),
  index('IDX_employee_leaves_date_range').on(table.startDate, table.endDate)
]);

// Employee Deductions table
export const employeeDeductions = sqliteTable('employee_deductions', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'employeeId': text('employee_id').notNull().references(() => employees.id, {
  'onDelete': 'cascade'
}),
  'type': text('type', {'enum': deductionTypeEnum}).notNull(),
  'amount': real('amount').notNull(),
  'reason': text('reason').notNull(),
  'date': text('date').notNull(),
  'status': text('status', {'enum': deductionStatusEnum}).default('active').notNull(),
  'processedBy': text('processed_by').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  index('IDX_employee_deductions_employee_id').on(table.employeeId),
  index('IDX_employee_deductions_type').on(table.type),
  index('IDX_employee_deductions_status').on(table.status),
  index('IDX_employee_deductions_date').on(table.date),
  index('IDX_employee_deductions_processed_by').on(table.processedBy),
  index('IDX_employee_deductions_created_at').on(table.createdAt),
  index('IDX_employee_deductions_employee_type').on(table.employeeId, table.type),
  index('IDX_employee_deductions_amount').on(table.amount)
]);

// Employee Violations table
export const employeeViolations = sqliteTable('employee_violations', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'employeeId': text('employee_id').notNull().references(() => employees.id, {
  'onDelete': 'cascade'
}),
  'type': text('type').notNull(),
  'description': text('description').notNull(),
  'date': text('date').notNull(),
  'reportedBy': text('reported_by').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'severity': text('severity').default('medium').notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  index('IDX_employee_violations_employee_id').on(table.employeeId),
  index('IDX_employee_violations_type').on(table.type),
  index('IDX_employee_violations_severity').on(table.severity),
  index('IDX_employee_violations_date').on(table.date),
  index('IDX_employee_violations_reported_by').on(table.reportedBy),
  index('IDX_employee_violations_created_at').on(table.createdAt),
  index('IDX_employee_violations_employee_type').on(table.employeeId, table.type)
]);

// Documents table
export const documents = sqliteTable('documents', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'entityId': text('entity_id').notNull(),
  'entityType': text('entity_type').notNull(), // 'employee', 'company', 'license'
  'name': text('name').notNull(),
  'type': text('type').notNull(),
  'fileName': text('file_name').notNull(),
  'fileUrl': text('file_url').notNull(),
  'fileSize': integer('file_size'),
  'mimeType': text('mime_type'),
  'description': text('description'),
  'tags': text('tags').default('[]').notNull(), // JSON string
  'uploadedBy': text('uploaded_by').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'isActive': integer('is_active', {'mode': 'boolean'}).default(true).notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull(),
  'updatedAt': integer('updated_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  index('IDX_documents_entity_id').on(table.entityId),
  index('IDX_documents_entity_type').on(table.entityType),
  index('IDX_documents_type').on(table.type),
  index('IDX_documents_uploaded_by').on(table.uploadedBy),
  index('IDX_documents_is_active').on(table.isActive),
  index('IDX_documents_created_at').on(table.createdAt),
  index('IDX_documents_entity_entity_type').on(table.entityId, table.entityType),
  index('IDX_documents_file_size').on(table.fileSize)
]);

// Notifications table
export const notifications = sqliteTable('notifications', {
  'id': text('id').primaryKey().default(sql`(hex(randomblob(16)))`),
  'userId': text('user_id').notNull().references(() => users.id, {'onDelete': 'cascade'}),
  'companyId': text('company_id').references(() => companies.id, {'onDelete': 'cascade'}),
  'type': text('type').notNull(),
  'title': text('title').notNull(),
  'message': text('message').notNull(),
  'data': text('data').default('{}').notNull(), // JSON string
  'isRead': integer('is_read', {'mode': 'boolean'}).default(false).notNull(),
  'createdAt': integer('created_at', {'mode': 'timestamp'}).default(sql`(unixepoch())`).notNull()
}, (table) => [
  index('IDX_notifications_user_id').on(table.userId),
  index('IDX_notifications_company_id').on(table.companyId),
  index('IDX_notifications_type').on(table.type),
  index('IDX_notifications_is_read').on(table.isRead),
  index('IDX_notifications_created_at').on(table.createdAt),
  index('IDX_notifications_user_read').on(table.userId, table.isRead),
  index('IDX_notifications_company_type').on(table.companyId, table.type)
]);

// Relations with proper cascade behavior
export const usersRelations = relations(users, ({many}) => ({
  'companyUsers': many(companyUsers),
  'employeeLeaves': many(employeeLeaves, {'relationName': 'approvedBy'}),
  'employeeDeductions': many(employeeDeductions, {'relationName': 'processedBy'}),
  'employeeViolations': many(employeeViolations, {'relationName': 'reportedBy'}),
  'documents': many(documents, {'relationName': 'uploadedBy'}),
  'notifications': many(notifications)
}));

export const companiesRelations = relations(companies, ({many}) => ({
  'employees': many(employees),
  'licenses': many(licenses),
  'companyUsers': many(companyUsers),
  'notifications': many(notifications)
}));

export const employeesRelations = relations(employees, ({one, many}) => ({
  'company': one(companies, {
    'fields': [employees.companyId],
    'references': [companies.id]
  }),
  'license': one(licenses, {
    'fields': [employees.licenseId],
    'references': [licenses.id]
  }),
  'leaves': many(employeeLeaves),
  'deductions': many(employeeDeductions),
  'violations': many(employeeViolations),
  'documents': many(documents, {'relationName': 'employeeDocuments'})
}));

export const licensesRelations = relations(licenses, ({one, many}) => ({
  'company': one(companies, {
    'fields': [licenses.companyId],
    'references': [companies.id]
  }),
  'employees': many(employees),
  'documents': many(documents, {'relationName': 'licenseDocuments'})
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCompanySchema = createInsertSchema(companies);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertLicenseSchema = createInsertSchema(licenses);
export const insertEmployeeLeaveSchema = createInsertSchema(employeeLeaves);
export const insertEmployeeDeductionSchema = createInsertSchema(employeeDeductions);
export const insertEmployeeViolationSchema = createInsertSchema(employeeViolations);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens);

export const upsertUserSchema = z.object({
  'id': z.string(),
  'email': z.string().email().optional(),
  'firstName': z.string().optional(),
  'lastName': z.string().optional(),
  'password': z.string().optional(),
  'profileImageUrl': z.string().optional(),
  'role': z.string().optional(),
  'companyId': z.string().optional(),
  'permissions': z.array(z.string()).optional(),
  'isActive': z.boolean().optional(),
  'emailVerified': z.boolean().optional(),
  'emailVerificationToken': z.string().optional(),
  'emailVerificationExpires': z.number().optional(),
  'passwordResetToken': z.string().optional(),
  'passwordResetExpires': z.number().optional(),
  'lastPasswordChange': z.number().optional(),
  'lastLoginAt': z.number().optional()
});

// Registration schema
export const registerUserSchema = z.object({
  'email': z.string().email(),
  'password': z.string().min(8, 'Password must be at least 8 characters'),
  'firstName': z.string().min(2, 'First name must be at least 2 characters'),
  'lastName': z.string().min(2, 'Last name must be at least 2 characters'),
  'companyId': z.string().optional(),
  'role': z.string().optional()
});

// Login schema
export const loginSchema = z.object({
  'email': z.string().email(),
  'password': z.string(),
  'companyId': z.string().optional()
});

// Change password schema
export const changePasswordSchema = z.object({
  'currentPassword': z.string(),
  'newPassword': z.string().min(8, 'Password must be at least 8 characters')
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  'email': z.string().email()
});

// Reset password schema
export const resetPasswordSchema = z.object({
  'token': z.string(),
  'newPassword': z.string().min(8, 'Password must be at least 8 characters')
});

// Verify email schema
export const verifyEmailSchema = z.object({
  'token': z.string()
});

// Type exports
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type VerifyEmail = z.infer<typeof verifyEmailSchema>;
export type DbUser = typeof users.$inferSelect;
export type User = DbUser; // Alias for backward compatibility
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
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type CompanyUser = typeof companyUsers.$inferSelect;

// Extended types
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
