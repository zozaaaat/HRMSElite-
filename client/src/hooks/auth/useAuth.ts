import { useEffect } from 'react';
import { useAuthCore } from './useAuthCore';
import { useAuthPermissions } from './useAuthPermissions';
import { useAuthProfile } from './useAuthProfile';
import { useAuthSession } from './useAuthSession';

/**
 * Unified Authentication Hook - Composition Pattern
 * Combines all authentication hooks into a single interface
 * Follows Open/Closed Principle - easy to extend without modification
 */
export const useAuth = () => {
  const core = useAuthCore();
  const permissions = useAuthPermissions();
  const profile = useAuthProfile();
  const session = useAuthSession();

  // Initialize authentication on mount
  useEffect(() => {
    if (!core.isAuthenticated && !core.loading) {
      session.initializeAuth().then((result) => {
        if (result.success && result.user) {
          core.setUser(result.user);
          if (result.company) {
            core.setCurrentCompany(result.company.id);
          }
        } else {
          core.clearUser();
        }
      });
    }
  }, [core.isAuthenticated, core.loading, session, core.setUser, core.setCurrentCompany, core.clearUser]);

  return {
    // Core State
    user: core.user,
    currentCompany: core.currentCompany,
    permissions: permissions.permissions,
    isAuthenticated: core.isAuthenticated,
    loading: core.loading,
    error: core.error,

    // Core Actions
    login: core.login,
    logout: core.logout,
    getCurrentUser: core.getCurrentUser,

    // Profile Actions
    updateProfile: profile.updateProfile,
    getUserFullName: profile.getUserFullName,
    switchCompany: profile.switchCompany,

    // Session Actions
    checkAuth: session.checkAuth,
    initializeAuth: session.initializeAuth,

    // Permission Actions
    getPermissions: permissions.getPermissions,
    hasPermission: permissions.hasPermission,
    hasAnyPermission: permissions.hasAnyPermission,
    hasAllPermissions: permissions.hasAllPermissions,

    // Role Checks
    isSuperAdmin: permissions.isSuperAdmin,
    isCompanyManager: permissions.isCompanyManager,
    canAccessCompany: permissions.canAccessCompany,
    getUserRoleForCompany: permissions.getUserRoleForCompany,

    // Store Actions (for advanced usage)
    setUser: core.setUser,
    updateUser: core.updateUser,
    setCurrentCompany: core.setCurrentCompany,
    setPermissions: core.setPermissions,
    setLoading: core.setLoading,
    setError: core.setError,
    clearUser: core.clearUser,
    initializeFromSession: core.initializeFromSession
  };
};
