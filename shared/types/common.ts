// Common types to replace 'any' usage throughout the project

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiRequest<T = unknown> {
  data: T;
  headers?: Record<string, string>;
}

export interface LogData {
  [key: string]: unknown;
}

export interface ErrorData {
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

export interface UserData {
  id: string;
  email: string;
  role: string;
  companyId?: string;
  [key: string]: unknown;
}

export interface EmployeeData {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  companyId: string;
  [key: string]: unknown;
}

export interface CompanyData {
  id: string;
  name: string;
  industry: string;
  size: string;
  [key: string]: unknown;
}

export interface DocumentData {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  [key: string]: unknown;
}

export interface LicenseData {
  id: string;
  name: string;
  type: string;
  expiryDate: string;
  status: string;
  companyId: string;
  [key: string]: unknown;
}

export interface SyncData {
  id: string;
  type: 'employee' | 'company' | 'document' | 'license';
  action: 'create' | 'update' | 'delete';
  data: EmployeeData | CompanyData | DocumentData | LicenseData;
  timestamp: number;
}

export interface PendingDataItem {
  id: string;
  type: string;
  action: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: string;
  companyId?: string;
}

export interface TestResult {
  success: boolean;
  duration: number;
  error?: string;
  data?: unknown;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  concurrentUsers: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SecurityEvent {
  type: string;
  ip?: string;
  userId?: string;
  timestamp: number;
  data?: LogData;
}

export interface DatabaseOperation {
  operation: string;
  table?: string;
  duration?: number;
  data?: LogData;
}

export interface AuthEvent {
  event: string;
  userId?: string;
  data?: LogData;
}

export interface MiddlewareEvent {
  name: string;
  duration?: number;
  data?: LogData;
}

// Generic types for better type safety
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Function types
export type ApiHandler<T = unknown> = (data: T) => Promise<ApiResponse<T>>;
export type ErrorHandler = (error: ErrorData) => void;
export type LogHandler = (level: LogLevel, message: string, data?: LogData) => void;
