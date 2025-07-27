import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for advanced features
export const aiAnalysisTypeEnum = pgEnum('ai_analysis_type', [
  'performance_review',
  'resignation_risk',
  'promotion_candidate',
  'training_recommendation',
  'salary_analysis',
  'attendance_pattern'
]);

export const workflowStatusEnum = pgEnum('workflow_status', [
  'pending',
  'in_progress',
  'approved',
  'rejected',
  'completed',
  'cancelled'
]);

export const departmentEnum = pgEnum('department', [
  'hr',
  'finance',
  'it',
  'security',
  'operations',
  'management',
  'sales',
  'marketing'
]);

// AI Analysis System
export const aiAnalyses = pgTable("ai_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  employeeId: varchar("employee_id"),
  analysisType: aiAnalysisTypeEnum("analysis_type").notNull(),
  inputData: jsonb("input_data").notNull(),
  results: jsonb("results").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  recommendations: jsonb("recommendations"),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business Intelligence Dashboard
export const biDashboards = pgTable("bi_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  layout: jsonb("layout").notNull(),
  filters: jsonb("filters"),
  permissions: jsonb("permissions").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Workflow Builder
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  department: departmentEnum("department"),
  steps: jsonb("steps").notNull(),
  rules: jsonb("rules"),
  triggers: jsonb("triggers"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowInstances = pgTable("workflow_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  companyId: varchar("company_id").notNull(),
  initiatedBy: varchar("initiated_by").notNull(),
  currentStep: integer("current_step").default(0),
  status: workflowStatusEnum("status").default("pending"),
  data: jsonb("data"),
  stepHistory: jsonb("step_history").default(sql`'[]'`),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee 360° View
export const employee360Views = pgTable("employee_360_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().unique(),
  companyId: varchar("company_id").notNull(),
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }),
  engagementLevel: varchar("engagement_level"),
  skillMatrix: jsonb("skill_matrix"),
  careerPath: jsonb("career_path"),
  goals: jsonb("goals"),
  achievements: jsonb("achievements"),
  feedback: jsonb("feedback"),
  trainingProgress: jsonb("training_progress"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Department Portals
export const departmentPortals = pgTable("department_portals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  department: departmentEnum("department").notNull(),
  config: jsonb("config").notNull(),
  widgets: jsonb("widgets").notNull(),
  permissions: jsonb("permissions").notNull(),
  customFields: jsonb("custom_fields"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Integration System
export const apiIntegrations = pgTable("api_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'accounting', 'payroll', 'attendance', 'external'
  endpoint: varchar("endpoint").notNull(),
  authMethod: varchar("auth_method").notNull(),
  credentials: jsonb("credentials"), // encrypted
  configuration: jsonb("configuration"),
  webhookUrl: varchar("webhook_url"),
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Management
export const payrollRuns = pgTable("payroll_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  period: varchar("period").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status").default("draft"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }),
  processedBy: varchar("processed_by").notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payrollItems = pgTable("payroll_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payrollRunId: varchar("payroll_run_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }),
  allowances: jsonb("allowances"),
  deductions: jsonb("deductions"),
  overtime: decimal("overtime", { precision: 10, scale: 2 }),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }),
  taxes: decimal("taxes", { precision: 10, scale: 2 }),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }),
  paySlip: text("pay_slip"), // base64 encoded PDF
  status: varchar("status").default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mobile App Support
export const mobileAppSessions = pgTable("mobile_app_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceId: varchar("device_id").notNull(),
  deviceType: varchar("device_type").notNull(),
  appVersion: varchar("app_version"),
  fcmToken: varchar("fcm_token"),
  location: jsonb("location"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security & Audit
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(),
  resourceId: varchar("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  sessionId: varchar("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securitySettings = pgTable("security_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().unique(),
  mfaRequired: boolean("mfa_required").default(false),
  passwordPolicy: jsonb("password_policy"),
  loginAttempts: integer("login_attempts").default(5),
  sessionTimeout: integer("session_timeout").default(3600),
  ipWhitelist: jsonb("ip_whitelist"),
  encryptionLevel: varchar("encryption_level").default("standard"),
  auditRetention: integer("audit_retention").default(365), // days
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning Management System
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: jsonb("content").notNull(),
  duration: integer("duration"), // minutes
  difficulty: varchar("difficulty").default("beginner"),
  category: varchar("category"),
  prerequisites: jsonb("prerequisites"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  companyId: varchar("company_id").notNull(),
  status: varchar("status").default("enrolled"),
  progress: integer("progress").default(0), // percentage
  score: decimal("score", { precision: 5, scale: 2 }),
  completedAt: timestamp("completed_at"),
  certificateUrl: varchar("certificate_url"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// Chatbot System
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyId: varchar("company_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  messages: jsonb("messages").default(sql`'[]'`),
  context: jsonb("context"),
  isActive: boolean("is_active").default(true),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types
export type AIAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAIAnalysis = typeof aiAnalyses.$inferInsert;

export type BIDashboard = typeof biDashboards.$inferSelect;
export type InsertBIDashboard = typeof biDashboards.$inferInsert;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type InsertWorkflowInstance = typeof workflowInstances.$inferInsert;

export type Employee360View = typeof employee360Views.$inferSelect;
export type InsertEmployee360View = typeof employee360Views.$inferInsert;

export type DepartmentPortal = typeof departmentPortals.$inferSelect;
export type InsertDepartmentPortal = typeof departmentPortals.$inferInsert;

export type APIIntegration = typeof apiIntegrations.$inferSelect;
export type InsertAPIIntegration = typeof apiIntegrations.$inferInsert;

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type InsertPayrollRun = typeof payrollRuns.$inferInsert;

export type PayrollItem = typeof payrollItems.$inferSelect;
export type InsertPayrollItem = typeof payrollItems.$inferInsert;

export type MobileAppSession = typeof mobileAppSessions.$inferSelect;
export type InsertMobileAppSession = typeof mobileAppSessions.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export type SecuritySettings = typeof securitySettings.$inferSelect;
export type InsertSecuritySettings = typeof securitySettings.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = typeof courseEnrollments.$inferInsert;

export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
export type InsertChatbotConversation = typeof chatbotConversations.$inferInsert;

// Zod schemas
export const insertAIAnalysisSchema = createInsertSchema(aiAnalyses);
export const insertBIDashboardSchema = createInsertSchema(biDashboards);
export const insertWorkflowSchema = createInsertSchema(workflows);
export const insertWorkflowInstanceSchema = createInsertSchema(workflowInstances);
export const insertEmployee360ViewSchema = createInsertSchema(employee360Views);
export const insertDepartmentPortalSchema = createInsertSchema(departmentPortals);
export const insertAPIIntegrationSchema = createInsertSchema(apiIntegrations);
export const insertPayrollRunSchema = createInsertSchema(payrollRuns);
export const insertPayrollItemSchema = createInsertSchema(payrollItems);
export const insertMobileAppSessionSchema = createInsertSchema(mobileAppSessions);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertSecuritySettingsSchema = createInsertSchema(securitySettings);
export const insertCourseSchema = createInsertSchema(courses);
export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments);
export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations);