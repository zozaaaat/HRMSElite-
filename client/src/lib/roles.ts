import {UserRole} from './routes';
import i18n from './i18n';

// Define available permissions
export type Permission =
  | 'dashboard:view'
  | 'companies:view'
  | 'companies:create'
  | 'companies:edit'
  | 'companies:delete'
  | 'employees:view'
  | 'employees:create'
  | 'employees:edit'
  | 'employees:delete'
  | 'reports:view'
  | 'reports:create'
  | 'reports:export'
  | 'settings:view'
  | 'settings:edit'
  | 'attendance:view'
  | 'attendance:edit'
  | 'leave_requests:view'
  | 'leave_requests:approve'
  | 'leave_requests:create'
  | 'payroll:view'
  | 'payroll:edit'
  | 'payroll:process'
  | 'documents:view'
  | 'documents:upload'
  | 'documents:delete'
  | 'training:view'
  | 'training:create'
  | 'training:assign'
  | 'recruitment:view'
  | 'recruitment:create'
  | 'recruitment:approve'
  | 'performance:view'
  | 'performance:edit'
  | 'advanced_search:view'
  | 'ai_dashboard:view'
  | 'accounting_systems:view'
  | 'accounting_systems:edit'
  | 'government_forms:view'
  | 'government_forms:submit';

// Permission map for each role
export const rolePermissions: Record<UserRole, Permission[]> = {
  'super_admin': [
    'dashboard:view',
    'companies:view',
    'companies:create',
    'companies:edit',
    'companies:delete',
    'employees:view',
    'employees:create',
    'employees:edit',
    'employees:delete',
    'reports:view',
    'reports:create',
    'reports:export',
    'settings:view',
    'settings:edit',
    'attendance:view',
    'attendance:edit',
    'leave_requests:view',
    'leave_requests:approve',
    'leave_requests:create',
    'payroll:view',
    'payroll:edit',
    'payroll:process',
    'documents:view',
    'documents:upload',
    'documents:delete',
    'training:view',
    'training:create',
    'training:assign',
    'recruitment:view',
    'recruitment:create',
    'recruitment:approve',
    'performance:view',
    'performance:edit',
    'advanced_search:view',
    'ai_dashboard:view',
    'accounting_systems:view',
    'accounting_systems:edit',
    'government_forms:view',
    'government_forms:submit'
  ],

  'company_manager': [
    'dashboard:view',
    'employees:view',
    'employees:create',
    'employees:edit',
    'employees:delete',
    'reports:view',
    'reports:create',
    'reports:export',
    'settings:view',
    'attendance:view',
    'attendance:edit',
    'leave_requests:view',
    'leave_requests:approve',
    'leave_requests:create',
    'payroll:view',
    'payroll:edit',
    'payroll:process',
    'documents:view',
    'documents:upload',
    'documents:delete',
    'training:view',
    'training:create',
    'training:assign',
    'recruitment:view',
    'recruitment:create',
    'recruitment:approve',
    'performance:view',
    'performance:edit',
    'advanced_search:view',
    'ai_dashboard:view',
    'accounting_systems:view',
    'government_forms:view',
    'government_forms:submit'
  ],

  'employee': [
    'dashboard:view',
    'employees:view',
    'reports:view',
    'attendance:view',
    'leave_requests:view',
    'leave_requests:create',
    'payroll:view',
    'documents:view',
    'documents:upload',
    'training:view',
    'performance:view',
    'advanced_search:view',
    'ai_dashboard:view',
    'government_forms:view',
    'government_forms:submit'
  ],

  'supervisor': [
    'dashboard:view',
    'employees:view',
    'reports:view',
    'attendance:view',
    'attendance:edit',
    'leave_requests:view',
    'leave_requests:approve',
    'leave_requests:create',
    'payroll:view',
    'documents:view',
    'documents:upload',
    'training:view',
    'performance:view',
    'performance:edit',
    'advanced_search:view',
    'ai_dashboard:view',
    'government_forms:view'
  ],

  'worker': [
    'dashboard:view',
    'attendance:view',
    'leave_requests:view',
    'leave_requests:create',
    'payroll:view',
    'documents:view',
    'training:view',
    'performance:view',
    'government_forms:view'
  ]
};

// Map of pages and required permissions
export const pagePermissions: Record<string, Permission[]> = {
  'dashboard': ['dashboard:view'],
  'companies': ['companies:view'],
  'employees': ['employees:view'],
  'reports': ['reports:view'],
  'settings': ['settings:view'],
  'attendance': ['attendance:view'],
  'leave-requests': ['leave_requests:view'],
  'payroll': ['payroll:view'],
  'documents': ['documents:view'],
  'training': ['training:view'],
  'recruitment': ['recruitment:view'],
  'performance': ['performance:view'],
  'advanced-search': ['advanced_search:view'],
  'ai-dashboard': ['ai_dashboard:view'],
  'ai_analytics': ['ai_dashboard:view'],
  'accounting-systems': ['accounting_systems:view'],
  'government-forms': ['government_forms:view'],
  'licenses': ['documents:view'],
  'leaves': ['leave_requests:view'],
  'signatures': ['documents:view'],
  'signature-test': ['documents:view'],
  'permission-test': ['settings:view'],
  'role-based-dashboard': ['dashboard:view'],
  'super-admin-dashboard': ['dashboard:view'],
  'employee-management': ['employees:view'],
  'layout-example': ['settings:view'],
  'project-management': ['settings:view'],
  'assets-management': ['settings:view'],
  'permissions-management': ['settings:view'],
  'mobile-apps': ['settings:view']
};

// Helper functions for permission checks
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {

  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);

};

// Verify page permissions
export const canAccessPage = (userRole: UserRole, pageId: string): boolean => {

  const requiredPermissions = pagePermissions[pageId] ?? [];

  if (requiredPermissions.length === 0) {

    // If no permissions defined for page, allow all
    return true;

  }

  return requiredPermissions.some(permission => hasPermission(userRole, permission));

};

// Get available permissions for a role
export const getRolePermissions = (userRole: UserRole): Permission[] => {

  return rolePermissions[userRole] || [];

};

// Check for any required permissions
export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {

  return permissions.some(permission => hasPermission(userRole, permission));

};

// Check for all required permissions
export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {

  return permissions.every(permission => hasPermission(userRole, permission));

};

// Get accessible pages for a role
export const getAccessiblePages = (userRole: UserRole): string[] => {

  return Object.entries(pagePermissions)
    .filter(([_pageId, requiredPermissions]) => {

      if (requiredPermissions.length === 0) {

        return true;

      }
      return requiredPermissions.some(permission => hasPermission(userRole, permission));

    })
    .map(([pageId]) => pageId);

};

export const getRoleLabel = (role: UserRole): string => {
  return i18n.t(`roles.labels.${role}`, { defaultValue: i18n.t('roles.labels.undefined') });
};

export const getRoleDescription = (role: UserRole): string => {
  return i18n.t(`roles.descriptions.${role}`, { defaultValue: i18n.t('roles.descriptions.undefined') });
};

// Get role level (for sorting)
export const getRoleLevel = (role: UserRole): number => {

  const roleLevels: Record<UserRole, number> = {
    'super_admin': 5,
    'company_manager': 4,
    'employee': 3,
    'supervisor': 2,
    'worker': 1
  };

  return roleLevels[role] || 0;

};

// Check if role can be promoted
export const canPromote = (currentRole: UserRole, targetRole: UserRole): boolean => {

  return getRoleLevel(targetRole) > getRoleLevel(currentRole);

};

// Check if role can be demoted
export const canDemote = (currentRole: UserRole, targetRole: UserRole): boolean => {

  return getRoleLevel(targetRole) < getRoleLevel(currentRole);

};
