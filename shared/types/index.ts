// Export all types from a single entry point for easier imports

// Common types
export * from './common';

// API-specific types
export * from './api';

// Re-export commonly used types for convenience
export type {
  // Base API types
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginatedResponse,
  
  // Data types
  UserData,
  EmployeeData,
  CompanyData,
  DocumentData,
  LicenseData,
  AttendanceData,
  PayrollData,
  
  // Request types
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeSearchRequest,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  UploadDocumentRequest,
  UpdateDocumentRequest,
  CreateLicenseRequest,
  UpdateLicenseRequest,
  RenewLicenseRequest,
  CheckInRequest,
  CheckOutRequest,
  AttendanceReportRequest,
  GeneratePayrollRequest,
  ProcessPayrollRequest,
  PayrollReportRequest,
  AnalyticsRequest,
  LogsRequest,
  
  // Response types
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  LogoutResponse,
  UsersListResponse,
  UserResponse,
  CreateUserResponse,
  UpdateUserResponse,
  EmployeesListResponse,
  EmployeeResponse,
  CreateEmployeeResponse,
  UpdateEmployeeResponse,
  EmployeeSearchResponse,
  CompaniesListResponse,
  CompanyResponse,
  CreateCompanyResponse,
  UpdateCompanyResponse,
  DocumentsListResponse,
  DocumentResponse,
  UploadDocumentResponse,
  UpdateDocumentResponse,
  DownloadDocumentResponse,
  LicensesListResponse,
  LicenseResponse,
  CreateLicenseResponse,
  UpdateLicenseResponse,
  RenewLicenseResponse,
  AttendanceListResponse,
  AttendanceResponse,
  CheckInResponse,
  CheckOutResponse,
  AttendanceReportResponse,
  PayrollListResponse,
  PayrollResponse,
  GeneratePayrollResponse,
  ProcessPayrollResponse,
  PayrollReportResponse,
  DashboardStatsResponse,
  AnalyticsResponse,
  SystemHealthResponse,
  LogsResponse,
  
  // Error response types
  ValidationErrorResponse,
  AuthenticationErrorResponse,
  AuthorizationErrorResponse,
  RateLimitErrorResponse,
  NotFoundErrorResponse,
  ConflictErrorResponse,
  
  // Union types
  ApiResponseTypes,
  ApiErrorResponseTypes,
  
  // Utility types
  ApiMethod,
  LogLevel,
  UserRole,
  HttpStatus,
  DeepPartial,
  Optional,
  RequiredFields,
  Nullable,
  Undefinable,
  ApiHandler,
  ErrorHandler,
  LogHandler,
  ValidationHandler,
  TransformHandler,
  ApiEndpoint,
  ApiEndpoints,
} from './api';
