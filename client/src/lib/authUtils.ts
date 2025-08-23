import i18n from './i18n';

export function isUnauthorizedError (error: Error): boolean {

  return (/^401: .*Unauthorized/).test(error.message);

}

// Unified Authentication Endpoints
export const AUTH_ENDPOINTS = {
  // Main unified user endpoint - this is the primary endpoint for all user operations
  'USER': '/api/auth/user',

  // Authentication endpoints
  'LOGIN': '/api/auth/login',
  'LOGOUT': '/api/auth/logout',
  'CURRENT_USER': '/api/auth/user', // Redirects to unified endpoint

  // Session management
  'SESSION': '/api/auth/session',
  'REFRESH': '/api/auth/refresh',

  // Password management
  'CHANGE_PASSWORD': '/api/auth/change-password',
  'RESET_PASSWORD': '/api/auth/reset-password',
  'FORGOT_PASSWORD': '/api/auth/forgot-password',

  // User management
  'REGISTER': '/api/auth/register',
  'UPDATE_PROFILE': '/api/auth/update-profile',
  'VERIFY_EMAIL': '/api/auth/verify-email',

  // Company-specific endpoints
  'USER_COMPANIES': '/api/auth/user/companies',
  'SWITCH_COMPANY': '/api/auth/switch-company',

  // Permissions and roles
  'USER_PERMISSIONS': '/api/auth/user/permissions',
  'USER_ROLES': '/api/auth/user/roles'
} as const;

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentCompany: Company | null;
  permissions: string[];
  roles: string[];
  loading: boolean;
  error: string | null;
}

// User interface - unified with shared types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companies: Company[];
  permissions: string[];
  companyId?: string | undefined;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | undefined;
  isActive: boolean;
  emailVerified: boolean;
  profileImageUrl?: string | undefined;
  sub: string;
  claims?: Record<string, unknown> | null;
}

// Company interface
export interface Company {
  id: string;
  name: string;
  commercialFileName: string;
  department: string;
  classification: string;
  status: 'active' | 'inactive' | 'pending';
  employeeCount: number;
  industry: string;
  establishmentDate: string;
  userRole: UserRole;
  userPermissions: string[];
  logoUrl?: string | undefined;
}

// Authentication response interface
export interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

// Login credentials interface
export interface LoginCredentials {
  username: string;
  password: string;
  companyId?: string;
}

// -------------------------
// Internal type helpers
// -------------------------
function isPlainRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString (value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString (value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean (value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber (value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asStringArray (value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function isUserRoleValue (value: unknown): value is UserRole {
  return (
    value === USER_ROLES.SUPER_ADMIN ||
    value === USER_ROLES.COMPANY_MANAGER ||
    value === USER_ROLES.ADMINISTRATIVE_EMPLOYEE ||
    value === USER_ROLES.SUPERVISOR ||
    value === USER_ROLES.WORKER
  );
}

function asUserRole (value: unknown, fallback: UserRole = USER_ROLES.WORKER): UserRole {
  return isUserRoleValue(value) ? value : fallback;
}

function isCompanyStatus (value: unknown): value is Company['status'] {
  return value === 'active' || value === 'inactive' || value === 'pending';
}

function asClaims (value: unknown): Record<string, unknown> | null {
  return isPlainRecord(value) ? value : null;
}

function isoDateOrNow (value: unknown): string {
  return typeof value === 'string' ? value : new Date().toISOString();
}

function asCompany (value: unknown): Company | null {
  if (!isPlainRecord(value)) return null;
  const status = isCompanyStatus(value.status) ? value.status : 'active';
  return {
    id: asString(value.id),
    name: asString(value.name),
    commercialFileName: asString(value.commercialFileName),
    department: asString(value.department),
    classification: asString(value.classification),
    status,
    employeeCount: asNumber(value.employeeCount, 0),
    industry: asString(value.industry),
    establishmentDate: isoDateOrNow(value.establishmentDate),
    userRole: asUserRole(value.userRole),
    userPermissions: asStringArray(value.userPermissions),
    logoUrl: asOptionalString(value.logoUrl) ?? undefined
  };
}

function asCompanies (value: unknown): Company[] {
  if (!Array.isArray(value)) return [];
  return value.map(asCompany).filter((c): c is Company => c !== null);
}

// Unified authentication utilities
export class AuthUtils {

  /**
   * Get the unified user endpoint with optional company context
   * This is the primary method for all user-related operations
   */
  static getUserEndpoint (companyId?: string): string {

    return companyId ? `${AUTH_ENDPOINTS.USER}?companyId=${companyId}` : AUTH_ENDPOINTS.USER;

  }

  /**
   * Check if user has specific permission
   */
  static hasPermission (userPermissions: string[] = [], permission: Permission): boolean {

    return userPermissions.includes(permission);

  }

  /**
   * Check if user has unknown of the specified permissions
   */
  static hasAnyPermission (userPermissions: string[] = [], permissions: Permission[]): boolean {

    return permissions.some(permission => userPermissions.includes(permission));

  }

  /**
   * Check if user has all specified permissions
   */
  static hasAllPermissions (userPermissions: string[] = [], permissions: Permission[]): boolean {

    return permissions.every(permission => userPermissions.includes(permission));

  }

  /**
   * Get user's role display name
   */
  static getRoleDisplayName (role: string): string {

    return getRoleDisplayName(role);

  }

  /**
   * Get permission display name
   */
  static getPermissionDisplayName (permission: Permission): string {

    return getPermissionDisplayName(permission);

  }

  /**
   * Validate authentication state
   */
  static validateAuthState (state: AuthState): boolean {

    return state.isAuthenticated &&
           state.user !== null &&
           state.user.isActive &&
           state.currentCompany !== null;

  }

  /**
   * Get user's effective permissions for current company
   */
  static getEffectivePermissions (user: User, companyId?: string): string[] {

    if (!companyId) {

      return user.permissions;

    }

    const company = user.companies.find(c => c.id === companyId);
    return company?.userPermissions ?? user.permissions;

  }

  /**
   * Check if user can access specific company
   */
  static canAccessCompany (user: User, companyId: string): boolean {

    return user.companies.some(company => company.id === companyId);

  }

  /**
   * Get user's role for specific company
   */
  static getUserRoleForCompany (user: User, companyId: string): UserRole | null {

    const company = user.companies.find(c => c.id === companyId);
    return company?.userRole ?? null;

  }

  /**
   * Create unified user object from various sources
   */
  static createUnifiedUser (userData: Record<string, unknown> | User): User {

    const data = userData as Record<string, unknown>;
    return {
      id: asString(data.id),
      email: asString(data.email),
      firstName: asString(data.firstName),
      lastName: asString(data.lastName),
      role: asUserRole(data.role),
      companies: asCompanies(data.companies),
      permissions: asStringArray(data.permissions),
      companyId: asOptionalString(data.companyId) ?? undefined,
      createdAt: isoDateOrNow(data.createdAt),
      updatedAt: isoDateOrNow(data.updatedAt),
      lastLoginAt: asOptionalString(data.lastLoginAt) ?? undefined,
      isActive: asBoolean(data.isActive, true),
      emailVerified: asBoolean(data.emailVerified, false),
      profileImageUrl: asOptionalString(data.profileImageUrl) ?? undefined,
      sub: asString(data.sub ?? data.id),
      claims: asClaims(data.claims)
    };

  }

  /**
   * Validate user data structure
   */
  static isValidUser (user: unknown): user is User {
    if (!isPlainRecord(user)) return false;
    const hasStrings =
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      typeof user.firstName === 'string' &&
      typeof user.lastName === 'string';
    const roleValid = isUserRoleValue(user.role);
    const companiesValid = Array.isArray(user.companies);
    const permissionsValid = Array.isArray(user.permissions) &&
      user.permissions.every(v => typeof v === 'string');
    return hasStrings && roleValid && companiesValid && permissionsValid;
  }

  /**
   * Get current company from user data
   */
  static getCurrentCompany (user: User, companyId?: string): Company | null {

    if (!companyId) {

      return user.companies.find(c => c.id === user.companyId) ?? user.companies[0] ?? null;

    }
    return user.companies.find(c => c.id === companyId) ?? null;

  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin (user: User): boolean {

    return user.role === USER_ROLES.SUPER_ADMIN;

  }

  /**
   * Check if user is company manager
   */
  static isCompanyManager (user: User): boolean {

    return user.role === USER_ROLES.COMPANY_MANAGER;

  }

  /**
   * Get user's full name
   */
  static getUserFullName (user: User): string {

    return `${user.firstName} ${user.lastName}`.trim();

  }

  /**
   * Check if user has company-specific permissions
   */
  static hasCompanyPermission (user: User, companyId: string, permission: Permission): boolean {

    const company = user.companies.find(c => c.id === companyId);
    if (!company) {

      return false;

    }
    return company.userPermissions.includes(permission);

  }

}

export const USER_ROLES = {
  'SUPER_ADMIN': 'super_admin',
  'COMPANY_MANAGER': 'company_manager',
  'ADMINISTRATIVE_EMPLOYEE': 'administrative_employee',
  'SUPERVISOR': 'supervisor',
  'WORKER': 'worker'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  // HR Permissions
  'MANAGE_EMPLOYEES': 'manage_employees',
  'VIEW_EMPLOYEES': 'view_employees',
  'MANAGE_LEAVE_REQUESTS': 'manage_leave_requests',
  'VIEW_LEAVE_REQUESTS': 'view_leave_requests',

  // Accounting Permissions
  'MANAGE_PAYROLL': 'manage_payroll',
  'VIEW_PAYROLL': 'view_payroll',
  'MANAGE_FINANCES': 'manage_finances',
  'VIEW_FINANCES': 'view_finances',

  // Inventory Permissions
  'MANAGE_INVENTORY': 'manage_inventory',
  'VIEW_INVENTORY': 'view_inventory',
  'MANAGE_ASSETS': 'manage_assets',
  'VIEW_ASSETS': 'view_assets',

  // Reports Permissions
  'GENERATE_REPORTS': 'generate_reports',
  'VIEW_REPORTS': 'view_reports',
  'EXPORT_DATA': 'export_data',

  // Purchasing Permissions
  'MANAGE_PURCHASES': 'manage_purchases',
  'VIEW_PURCHASES': 'view_purchases',
  'APPROVE_PURCHASES': 'approve_purchases',

  // System Permissions
  'MANAGE_COMPANY': 'manage_company',
  'MANAGE_PERMISSIONS': 'manage_permissions',
  'SYSTEM_ADMIN': 'system_admin'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [USER_ROLES.COMPANY_MANAGER]: [
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_LEAVE_REQUESTS,
    PERMISSIONS.VIEW_LEAVE_REQUESTS,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.MANAGE_FINANCES,
    PERMISSIONS.VIEW_FINANCES,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_COMPANY,
    PERMISSIONS.MANAGE_PERMISSIONS
  ],

  [USER_ROLES.ADMINISTRATIVE_EMPLOYEE]: [
    // Permissions are customizable by company manager
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_LEAVE_REQUESTS,
    PERMISSIONS.VIEW_REPORTS
  ],

  [USER_ROLES.SUPERVISOR]: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_LEAVE_REQUESTS,
    PERMISSIONS.VIEW_REPORTS
  ],

  [USER_ROLES.WORKER]: [
    PERMISSIONS.VIEW_LEAVE_REQUESTS // Only their own
  ]
};

export function hasPermission (userPermissions: string[] = [], permission: Permission): boolean {

  return userPermissions.includes(permission);

}

export function hasAnyPermission (userPermissions: string[] = [],
   permissions: Permission[]): boolean {

  return permissions.some(permission => userPermissions.includes(permission));

}

export function getRoleDisplayName (role: string): string {
  const roleKeys: Record<string, string> = {
    [USER_ROLES.SUPER_ADMIN]: 'roles.labels.super_admin',
    [USER_ROLES.COMPANY_MANAGER]: 'roles.labels.company_manager',
    [USER_ROLES.ADMINISTRATIVE_EMPLOYEE]: 'roles.labels.employee',
    [USER_ROLES.SUPERVISOR]: 'roles.labels.supervisor',
    [USER_ROLES.WORKER]: 'roles.labels.worker'
  };
  return i18n.t(roleKeys[role] ?? 'roles.labels.undefined');
}

export function getPermissionDisplayName (permission: Permission): string {
  const permissionKeys: Record<Permission, string> = {
    [PERMISSIONS.MANAGE_EMPLOYEES]: 'permissions.manage_employees',
    [PERMISSIONS.VIEW_EMPLOYEES]: 'permissions.view_employees',
    [PERMISSIONS.MANAGE_LEAVE_REQUESTS]: 'permissions.manage_leave_requests',
    [PERMISSIONS.VIEW_LEAVE_REQUESTS]: 'permissions.view_leave_requests',
    [PERMISSIONS.MANAGE_PAYROLL]: 'permissions.manage_payroll',
    [PERMISSIONS.VIEW_PAYROLL]: 'permissions.view_payroll',
    [PERMISSIONS.MANAGE_FINANCES]: 'permissions.manage_finances',
    [PERMISSIONS.VIEW_FINANCES]: 'permissions.view_finances',
    [PERMISSIONS.MANAGE_INVENTORY]: 'permissions.manage_inventory',
    [PERMISSIONS.VIEW_INVENTORY]: 'permissions.view_inventory',
    [PERMISSIONS.MANAGE_ASSETS]: 'permissions.manage_assets',
    [PERMISSIONS.VIEW_ASSETS]: 'permissions.view_assets',
    [PERMISSIONS.GENERATE_REPORTS]: 'permissions.generate_reports',
    [PERMISSIONS.VIEW_REPORTS]: 'permissions.view_reports',
    [PERMISSIONS.EXPORT_DATA]: 'permissions.export_data',
    [PERMISSIONS.MANAGE_PURCHASES]: 'permissions.manage_purchases',
    [PERMISSIONS.VIEW_PURCHASES]: 'permissions.view_purchases',
    [PERMISSIONS.APPROVE_PURCHASES]: 'permissions.approve_purchases',
    [PERMISSIONS.MANAGE_COMPANY]: 'permissions.manage_company',
    [PERMISSIONS.MANAGE_PERMISSIONS]: 'permissions.manage_permissions',
    [PERMISSIONS.SYSTEM_ADMIN]: 'permissions.system_admin'
  };

  return i18n.t(permissionKeys[permission] ?? permission);
}
