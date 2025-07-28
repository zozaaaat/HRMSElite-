import { pgTable, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// جدول الإشعارات
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyId: varchar("company_id"),
  type: varchar("type").notNull(), // system, task, leave, document, etc
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // بيانات إضافية
  isRead: boolean("is_read").default(false),
  isImportant: boolean("is_important").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// جدول الحضور والانصراف
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  companyId: varchar("company_id").notNull(),
  date: timestamp("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: varchar("status").notNull(), // present, absent, late, holiday
  workHours: text("work_hours"), // ساعات العمل المحسوبة
  overtimeHours: text("overtime_hours"), // الساعات الإضافية
  notes: text("notes"),
  location: jsonb("location"), // GPS location if needed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// جدول طلبات الإجازات
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  companyId: varchar("company_id").notNull(),
  leaveType: varchar("leave_type").notNull(), // annual, sick, emergency, etc
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  attachments: jsonb("attachments"), // مرفقات مثل التقارير الطبية
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// جدول رصيد الإجازات
export const leaveBalance = pgTable("leave_balance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  year: varchar("year").notNull(),
  annualLeave: text("annual_leave").default("21"), // الإجازة السنوية
  sickLeave: text("sick_leave").default("30"), // الإجازة المرضية
  emergencyLeave: text("emergency_leave").default("7"), // إجازة الطوارئ
  usedAnnual: text("used_annual").default("0"),
  usedSick: text("used_sick").default("0"),
  usedEmergency: text("used_emergency").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveBalanceSchema = createInsertSchema(leaveBalance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type LeaveBalance = typeof leaveBalance.$inferSelect;
export type InsertLeaveBalance = z.infer<typeof insertLeaveBalanceSchema>;