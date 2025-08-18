// API-specific types for better type safety and consistency

import type {
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginatedResponse,
  UserData,
  EmployeeData,
  CompanyData,
  DocumentData,
  LicenseData,
  AttendanceData,
  PayrollData,
  UserRole,
  LogLevel
} from './common';

// Authentication API Types
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

export interface LoginResponse extends ApiSuccessResponse<{
  user: UserData;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}> {}

export interface RegisterResponse extends LoginResponse {}
export interface RefreshTokenResponse extends ApiSuccessResponse<{
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}> {}

export interface LogoutResponse extends ApiSuccessResponse<{
  message: string;
}> {}

// User Management API Types
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  password?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  avatar?: string;
}

export interface UsersListResponse extends PaginatedResponse<UserData> {}
export interface UserResponse extends ApiSuccessResponse<UserData> {}
export interface CreateUserResponse extends UserResponse {}
export interface UpdateUserResponse extends UserResponse {}

// Employee Management API Types
export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  companyId: string;
  managerId?: string;
  hireDate: string;
  salary?: number;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  managerId?: string;
  salary?: number;
  status?: 'active' | 'inactive' | 'terminated';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface EmployeeSearchRequest {
  query: string;
  department?: string;
  position?: string;
  status?: 'active' | 'inactive' | 'terminated';
  page?: number;
  limit?: number;
}

export interface EmployeesListResponse extends PaginatedResponse<EmployeeData> {}
export interface EmployeeResponse extends ApiSuccessResponse<EmployeeData> {}
export interface CreateEmployeeResponse extends EmployeeResponse {}
export interface UpdateEmployeeResponse extends EmployeeResponse {}
export interface EmployeeSearchResponse extends PaginatedResponse<EmployeeData> {}

// Company Management API Types
export interface CreateCompanyRequest {
  name: string;
  industry: string;
  size: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  industry?: string;
  size?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
}

export interface CompaniesListResponse extends PaginatedResponse<CompanyData> {}
export interface CompanyResponse extends ApiSuccessResponse<CompanyData> {}
export interface CreateCompanyResponse extends CompanyResponse {}
export interface UpdateCompanyResponse extends CompanyResponse {}

// Document Management API Types
export interface UploadDocumentRequest {
  name: string;
  type: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  expiresAt?: string;
  file: File | Blob;
}

export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  expiresAt?: string;
}

export interface DocumentsListResponse extends PaginatedResponse<DocumentData> {}
export interface DocumentResponse extends ApiSuccessResponse<DocumentData> {}
export interface UploadDocumentResponse extends DocumentResponse {}
export interface UpdateDocumentResponse extends DocumentResponse {}
export interface DownloadDocumentResponse extends ApiSuccessResponse<{
  url: string;
  filename: string;
  contentType: string;
  size: number;
}> {}

// License Management API Types
export interface CreateLicenseRequest {
  name: string;
  type: string;
  licenseNumber: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  companyId: string;
  renewalDate?: string;
  cost?: number;
  description?: string;
}

export interface UpdateLicenseRequest {
  name?: string;
  type?: string;
  licenseNumber?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  cost?: number;
  description?: string;
  status?: 'active' | 'expired' | 'pending' | 'suspended';
}

export interface RenewLicenseRequest {
  renewalDate: string;
  cost?: number;
  description?: string;
}

export interface LicensesListResponse extends PaginatedResponse<LicenseData> {}
export interface LicenseResponse extends ApiSuccessResponse<LicenseData> {}
export interface CreateLicenseResponse extends LicenseResponse {}
export interface UpdateLicenseResponse extends LicenseResponse {}
export interface RenewLicenseResponse extends LicenseResponse {}

// Attendance Management API Types
export interface CheckInRequest {
  employeeId: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
}

export interface CheckOutRequest {
  employeeId: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
}

export interface AttendanceReportRequest {
  employeeId?: string;
  department?: string;
  startDate: string;
  endDate: string;
  status?: 'present' | 'absent' | 'late' | 'half-day';
}

export interface AttendanceListResponse extends PaginatedResponse<AttendanceData> {}
export interface AttendanceResponse extends ApiSuccessResponse<AttendanceData> {}
export interface CheckInResponse extends AttendanceResponse {}
export interface CheckOutResponse extends AttendanceResponse {}
export interface AttendanceReportResponse extends ApiSuccessResponse<{
  data: AttendanceData[];
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
    averageHours: number;
  };
}> {}

// Payroll Management API Types
export interface GeneratePayrollRequest {
  employeeId?: string;
  department?: string;
  month: string;
  year: number;
  includeAllowances?: boolean;
  includeDeductions?: boolean;
}

export interface ProcessPayrollRequest {
  payrollId: string;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
}

export interface PayrollReportRequest {
  employeeId?: string;
  department?: string;
  startMonth: string;
  endMonth: string;
  year: number;
  status?: 'pending' | 'processed' | 'paid';
}

export interface PayrollListResponse extends PaginatedResponse<PayrollData> {}
export interface PayrollResponse extends ApiSuccessResponse<PayrollData> {}
export interface GeneratePayrollResponse extends PayrollResponse {}
export interface ProcessPayrollResponse extends PayrollResponse {}
export interface PayrollReportResponse extends ApiSuccessResponse<{
  data: PayrollData[];
  summary: {
    totalEmployees: number;
    totalSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    netPayroll: number;
    pendingAmount: number;
    processedAmount: number;
    paidAmount: number;
  };
}> {}

// Dashboard and Analytics API Types
export interface DashboardStatsResponse extends ApiSuccessResponse<{
  employees: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  attendance: {
    presentToday: number;
    absentToday: number;
    lateToday: number;
    averageAttendance: number;
  };
  payroll: {
    totalThisMonth: number;
    pendingThisMonth: number;
    processedThisMonth: number;
    averageSalary: number;
  };
  documents: {
    total: number;
    expiringSoon: number;
    recentlyUploaded: number;
  };
  licenses: {
    total: number;
    active: number;
    expiringSoon: number;
    expired: number;
  };
}> {}

export interface AnalyticsRequest {
  type: 'employees' | 'attendance' | 'payroll' | 'documents' | 'licenses';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  groupBy?: string;
}

export interface AnalyticsResponse extends ApiSuccessResponse<{
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
  summary: Record<string, number>;
}> {}

// System and Monitoring API Types
export interface SystemHealthResponse extends ApiSuccessResponse<{
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    connections: number;
    responseTime: number;
  };
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    responseTime?: number;
  }>;
}> {}

export interface LogsRequest {
  level?: LogLevel;
  source?: string;
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse extends PaginatedResponse<{
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: string;
  data?: Record<string, unknown>;
}> {}

// Error Response Types
export interface ValidationErrorResponse extends ApiErrorResponse {
  code: 'VALIDATION_ERROR';
  details: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

export interface AuthenticationErrorResponse extends ApiErrorResponse {
  code: 'AUTHENTICATION_ERROR';
  details: {
    reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'account_locked';
    attempts?: number;
    lockoutUntil?: string;
  };
}

export interface AuthorizationErrorResponse extends ApiErrorResponse {
  code: 'AUTHORIZATION_ERROR';
  details: {
    requiredRole: UserRole;
    userRole: UserRole;
    resource: string;
    action: string;
  };
}

export interface RateLimitErrorResponse extends ApiErrorResponse {
  code: 'RATE_LIMIT_ERROR';
  details: {
    limit: number;
    remaining: number;
    resetTime: string;
    retryAfter: number;
  };
}

export interface NotFoundErrorResponse extends ApiErrorResponse {
  code: 'NOT_FOUND';
  details: {
    resource: string;
    id?: string;
  };
}

export interface ConflictErrorResponse extends ApiErrorResponse {
  code: 'CONFLICT';
  details: {
    resource: string;
    field: string;
    value: unknown;
    existingId?: string;
  };
}

// Generic API Response Union Types
export type ApiResponseTypes = 
  | LoginResponse
  | RegisterResponse
  | RefreshTokenResponse
  | LogoutResponse
  | UsersListResponse
  | UserResponse
  | CreateUserResponse
  | UpdateUserResponse
  | EmployeesListResponse
  | EmployeeResponse
  | CreateEmployeeResponse
  | UpdateEmployeeResponse
  | EmployeeSearchResponse
  | CompaniesListResponse
  | CompanyResponse
  | CreateCompanyResponse
  | UpdateCompanyResponse
  | DocumentsListResponse
  | DocumentResponse
  | UploadDocumentResponse
  | UpdateDocumentResponse
  | DownloadDocumentResponse
  | LicensesListResponse
  | LicenseResponse
  | CreateLicenseResponse
  | UpdateLicenseResponse
  | RenewLicenseResponse
  | AttendanceListResponse
  | AttendanceResponse
  | CheckInResponse
  | CheckOutResponse
  | AttendanceReportResponse
  | PayrollListResponse
  | PayrollResponse
  | GeneratePayrollResponse
  | ProcessPayrollResponse
  | PayrollReportResponse
  | DashboardStatsResponse
  | AnalyticsResponse
  | SystemHealthResponse
  | LogsResponse;

export type ApiErrorResponseTypes = 
  | ValidationErrorResponse
  | AuthenticationErrorResponse
  | AuthorizationErrorResponse
  | RateLimitErrorResponse
  | NotFoundErrorResponse
  | ConflictErrorResponse
  | ApiErrorResponse;

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export type Nullable<T> = T | null;
export type Undefinable<T> = T | undefined;

export type ApiHandler<T = any> = (req: any, res: any) => Promise<T>;
export type ApiEndpoint = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: ApiHandler;
};
export type ApiEndpoints = Record<string, ApiEndpoint>;
