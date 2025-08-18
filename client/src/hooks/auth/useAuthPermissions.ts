import { useCallback } from 'react';
import { AuthService } from '../../services/auth';
import { AuthUtils } from '../../lib/authUtils';
import { useUserPermissions, useCurrentUser } from '../../stores/useUserStore';

/**
 * Authentication Permissions Hook - Single Responsibility Principle
 * Handles only permission-related operations
 */
export const useAuthPermissions = () => {
  const permissions = useUserPermissions();
  const user = useCurrentUser();

  /**
   * Get user permissions for specific company
   */
  const getPermissions = useCallback(async (companyId?: string) => {
    try {
      const permissions = await AuthService.getUserPermissions(companyId);
      return permissions;
    } catch {
      return [];
    }
  }, []);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission);
  }, [permissions]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions]);

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, [permissions]);

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = useCallback(() => {
    return user ? AuthUtils.isSuperAdmin(user as any) : false;
  }, [user]);

  /**
   * Check if user is company manager
   */
  const isCompanyManager = useCallback(() => {
    return user ? AuthUtils.isCompanyManager(user as any) : false;
  }, [user]);

  /**
   * Check if user can access specific company
   */
  const canAccessCompany = useCallback((companyId: string) => {
    return user ? AuthUtils.canAccessCompany(user as any, companyId) : false;
  }, [user]);

  /**
   * Get user's role for specific company
   */
  const getUserRoleForCompany = useCallback((companyId: string) => {
    return user ? AuthUtils.getUserRoleForCompany(user as any, companyId) : null;
  }, [user]);

  return {
    permissions,
    getPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isCompanyManager,
    canAccessCompany,
    getUserRoleForCompany
  };
};
