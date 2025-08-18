// Common types to replace 'any' usage throughout the project

// Base API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
  requestId?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

// Specific API Response types
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface AuthResponse {
  success: true;
  data: {
    user: UserData;
    token: string;
    refreshToken?: string;
    expiresIn?: number;
  };
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}

export interface RefreshTokenResponse {
  success: true;
  data: {
    token: string;
    refreshToken?: string;
    expiresIn?: number;
  };
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface LogoutResponse {
  success: true;
  message: string;
  timestamp?: string;
  requestId?: string;
}

// Request types
export interface ApiRequest<T = unknown> {
  data: T;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  role?: UserRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Data types
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
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface EmployeeData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  companyId: string;
  managerId?: string;
  hireDate: string;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface CompanyData {
  id: string;
  name: string;
  industry: string;
  size: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  description?: string;
  tags?: string[];
  isPublic: boolean;
  expiresAt?: string;
  [key: string]: unknown;
}

export interface LicenseData {
  id: string;
  name: string;
  type: string;
  licenseNumber: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  companyId: string;
  renewalDate?: string;
  cost?: number;
  description?: string;
  [key: string]: unknown;
}

export interface AttendanceData {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  [key: string]: unknown;
}

export interface PayrollData {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paymentDate?: string;
  paymentMethod?: string;
  [key: string]: unknown;
}

export interface SyncData {
  id: string;
  type: 'employee' | 'company' | 'document' | 'license' | 'attendance' | 'payroll';
  action: 'create' | 'update' | 'delete';
  data: EmployeeData | CompanyData | DocumentData | LicenseData | AttendanceData | PayrollData;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}

export interface PendingDataItem {
  id: string;
  type: string;
  action: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  nextRetry?: number;
}

// Test and Performance types
export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  companyId?: string;
}

export interface TestResult {
  success: boolean;
  duration: number;
  error?: string;
  data?: unknown;
  timestamp: string;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  concurrentUsers: number;
  memoryUsage?: number;
  cpuUsage?: number;
  timestamp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: string;
}

// Security and Monitoring types
export interface SecurityEvent {
  type: string;
  ip?: string;
  userId?: string;
  userAgent?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: LogData;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface DatabaseOperation {
  operation: string;
  table?: string;
  duration?: number;
  data?: LogData;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface AuthEvent {
  event: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  data?: LogData;
  timestamp: string;
  success: boolean;
}

export interface MiddlewareEvent {
  name: string;
  duration?: number;
  data?: LogData;
  timestamp: string;
  success: boolean;
  error?: string;
}

// Generic types for better type safety
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 502 | 503;

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;
export type Undefinable<T> = T | undefined;

// Function types
export type ApiHandler<T = unknown, R = unknown> = (data: T) => Promise<ApiResponse<R>>;
export type ErrorHandler = (error: ErrorData) => void;
export type LogHandler = (level: LogLevel, message: string, data?: LogData) => void;
export type ValidationHandler<T> = (data: T) => ValidationResult;
export type TransformHandler<T, R> = (data: T) => R;

// API Endpoint types
export interface ApiEndpoint {
  path: string;
  method: ApiMethod;
  requiresAuth: boolean;
  roles?: UserRole[];
  rateLimit?: number;
  timeout?: number;
}

export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    verify: string;
  };
  users: {
    list: string;
    get: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    profile: string;
  };
  employees: {
    list: string;
    get: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    search: string;
  };
  companies: {
    list: string;
    get: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  documents: {
    list: string;
    get: (id: string) => string;
    upload: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    download: (id: string) => string;
  };
  licenses: {
    list: string;
    get: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    renew: (id: string) => string;
  };
  attendance: {
    list: string;
    get: (id: string) => string;
    checkIn: string;
    checkOut: string;
    report: string;
  };
  payroll: {
    list: string;
    get: (id: string) => string;
    generate: string;
    process: string;
    report: string;
  };
}
