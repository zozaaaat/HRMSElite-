export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_MANAGER: 'company_manager', 
  ADMINISTRATIVE_EMPLOYEE: 'administrative_employee',
  SUPERVISOR: 'supervisor',
  WORKER: 'worker'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  // HR Permissions
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_EMPLOYEES: 'view_employees',
  MANAGE_LEAVE_REQUESTS: 'manage_leave_requests',
  VIEW_LEAVE_REQUESTS: 'view_leave_requests',
  
  // Accounting Permissions
  MANAGE_PAYROLL: 'manage_payroll',
  VIEW_PAYROLL: 'view_payroll',
  MANAGE_FINANCES: 'manage_finances',
  VIEW_FINANCES: 'view_finances',
  
  // Inventory Permissions
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_ASSETS: 'manage_assets',
  VIEW_ASSETS: 'view_assets',
  
  // Reports Permissions
  GENERATE_REPORTS: 'generate_reports',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // Purchasing Permissions
  MANAGE_PURCHASES: 'manage_purchases',
  VIEW_PURCHASES: 'view_purchases',
  APPROVE_PURCHASES: 'approve_purchases',
  
  // System Permissions
  MANAGE_COMPANY: 'manage_company',
  MANAGE_PERMISSIONS: 'manage_permissions',
  SYSTEM_ADMIN: 'system_admin'
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

export function hasPermission(userPermissions: string[] = [], permission: Permission): boolean {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(userPermissions: string[] = [], permissions: Permission[]): boolean {
  return permissions.some(permission => userPermissions.includes(permission));
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'مسؤول النظام';
    case USER_ROLES.COMPANY_MANAGER:
      return 'مدير الشركة';
    case USER_ROLES.ADMINISTRATIVE_EMPLOYEE:
      return 'موظف إداري';
    case USER_ROLES.SUPERVISOR:
      return 'مشرف';
    case USER_ROLES.WORKER:
      return 'عامل';
    default:
      return 'غير محدد';
  }
}

export function getPermissionDisplayName(permission: Permission): string {
  const names: Record<Permission, string> = {
    [PERMISSIONS.MANAGE_EMPLOYEES]: 'إدارة الموظفين',
    [PERMISSIONS.VIEW_EMPLOYEES]: 'عرض الموظفين',
    [PERMISSIONS.MANAGE_LEAVE_REQUESTS]: 'إدارة طلبات الإجازة',
    [PERMISSIONS.VIEW_LEAVE_REQUESTS]: 'عرض طلبات الإجازة',
    [PERMISSIONS.MANAGE_PAYROLL]: 'إدارة المرتبات',
    [PERMISSIONS.VIEW_PAYROLL]: 'عرض المرتبات',
    [PERMISSIONS.MANAGE_FINANCES]: 'إدارة المالية',
    [PERMISSIONS.VIEW_FINANCES]: 'عرض المالية',
    [PERMISSIONS.MANAGE_INVENTORY]: 'إدارة المخزون',
    [PERMISSIONS.VIEW_INVENTORY]: 'عرض المخزون',
    [PERMISSIONS.MANAGE_ASSETS]: 'إدارة الأصول',
    [PERMISSIONS.VIEW_ASSETS]: 'عرض الأصول',
    [PERMISSIONS.GENERATE_REPORTS]: 'إنشاء التقارير',
    [PERMISSIONS.VIEW_REPORTS]: 'عرض التقارير',
    [PERMISSIONS.EXPORT_DATA]: 'تصدير البيانات',
    [PERMISSIONS.MANAGE_PURCHASES]: 'إدارة المشتريات',
    [PERMISSIONS.VIEW_PURCHASES]: 'عرض المشتريات',
    [PERMISSIONS.APPROVE_PURCHASES]: 'اعتماد المشتريات',
    [PERMISSIONS.MANAGE_COMPANY]: 'إدارة الشركة',
    [PERMISSIONS.MANAGE_PERMISSIONS]: 'إدارة الصلاحيات',
    [PERMISSIONS.SYSTEM_ADMIN]: 'إدارة النظام'
  };
  
  return names[permission] || permission;
}