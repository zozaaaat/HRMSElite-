import {useEffect, useCallback} from 'react';
import {AuthService} from '../services/auth';
import {AuthUtils, type User} from '../lib/authUtils';
import {
  useUserActions,
  useCurrentUser,
  useCurrentCompany,
  useUserPermissions,
  useIsUserAuthenticated,
  useUserLoading,
  useUserError
} from '../stores/useUserStore';

/**
 * Unified Authentication Hook
 * Provides centralized authentication state and actions
 */
export const useAuth = () => {

  const {
    setUser,
    setToken,
    updateUser,
    setCurrentCompany,
    setPermissions,
    setLoading,
    setError,
    'logout': storeLogout,
    clearUser,
    initializeFromSession
  } = useUserActions();

  const user = useCurrentUser();
  const currentCompany = useCurrentCompany();
  const permissions = useUserPermissions();
  const isAuthenticated = useIsUserAuthenticated();
  const loading = useUserLoading();
  const error = useUserError();

  /**
   * Login with unified authentication
   */
  const login = useCallback(async (credentials: {
   username: string; password: string; companyId?: string 
}) => {
  

    try {

      setLoading(true);
      setError(null);

      const response = await AuthService.login(credentials);

      if (response.success && response.user) {

        const unifiedUser = AuthUtils.createUnifiedUser(response.user);
        setUser(unifiedUser);

        // Set token if provided
        if (response.token) {

          setToken(response.token);

        }

        return {'success': true, 'user': unifiedUser};

      } else {

        throw new Error(response.message ?? "Login failed");

      }

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return {'success': false, 'error': errorMessage};

    } finally {

      setLoading(false);

    }

  }, [setUser, setToken, setLoading, setError]);

  /**
   * Logout with unified authentication
   */
  const logout = useCallback(async () => {

    try {

      setLoading(true);
      await AuthService.logout();

    } catch {
      // Logout error handled silently
    } finally {

      storeLogout();
      setLoading(false);

    }

  }, [storeLogout, setLoading]);

  /**
   * Get current user with unified endpoint
   */
  const getCurrentUser = useCallback(async (companyId?: string) => {

    try {

      setLoading(true);
      setError(null);

      const user = await AuthService.getCurrentUser(companyId);
      setUser(user);

      return {'success': true, user};

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      setError(errorMessage);
      return {'success': false, 'error': errorMessage};

    } finally {

      setLoading(false);

    }

  }, [setUser, setLoading, setError]);

  /**
   * Switch to different company
   */
  const switchCompany = useCallback(async (companyId: string) => {

    try {

      setLoading(true);
      setError(null);

      const response = await AuthService.switchCompany(companyId);

      if (response.success && response.user) {

        const unifiedUser = AuthUtils.createUnifiedUser(response.user);
        setUser(unifiedUser);

        return {'success': true, 'user': unifiedUser};

      } else {

        throw new Error(response.message ?? "Failed to switch company");

      }

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Failed to switch company';
      setError(errorMessage);
      return {'success': false, 'error': errorMessage};

    } finally {

      setLoading(false);

    }

  }, [setUser, setLoading, setError]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<User>) => {

    if (!user) {

      return {'success': false, 'error': 'No user to update'};

    }

    try {

      setLoading(true);
      setError(null);

      const updatedUser = await AuthService.updateProfile(updates);
      updateUser(updatedUser);

      return {'success': true, 'user': updatedUser};

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      return {'success': false, 'error': errorMessage};

    } finally {

      setLoading(false);

    }

  }, [user, updateUser, setLoading, setError]);

  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async () => {

    try {

      setLoading(true);
      const isAuth = await AuthService.checkAuth();

      if (!isAuth) {

        clearUser();

      }

      return isAuth;

    } catch {

      clearUser();
      return false;

    } finally {

      setLoading(false);

    }

  }, [clearUser, setLoading]);

  /**
   * Initialize authentication from session
   */
  const initializeAuth = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);

      const {'user': sessionUser, company} = await AuthService.getSession();

      if (sessionUser) {

        const unifiedUser = AuthUtils.createUnifiedUser(sessionUser);
        setUser(unifiedUser);

        if (company) {

          setCurrentCompany(company);

        }

        return {'success': true, 'user': unifiedUser, company};

      } else {

        clearUser();
        return {'success': false, 'error': 'No session found'};

      }

    } catch (error) {

      clearUser();
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize auth';
      setError(errorMessage);
      return {'success': false, 'error': errorMessage};

    } finally {

      setLoading(false);

    }

  }, [setUser, setCurrentCompany, clearUser, setLoading, setError]);

  /**
   * Get user permissions for specific company
   */
  const getPermissions = useCallback(async (companyId?: string) => {

    try {

      const permissions = await AuthService.getUserPermissions(companyId);
      setPermissions(permissions);
      return permissions;

    } catch {

      return [];

    }

  }, [setPermissions]);

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

    return user ? AuthUtils.isSuperAdmin(user) : false;

  }, [user]);

  /**
   * Check if user is company manager
   */
  const isCompanyManager = useCallback(() => {

    return user ? AuthUtils.isCompanyManager(user) : false;

  }, [user]);

  /**
   * Get user's full name
   */
  const getUserFullName = useCallback(() => {

    return user ? AuthUtils.getUserFullName(user) : '';

  }, [user]);

  /**
   * Check if user can access specific company
   */
  const canAccessCompany = useCallback((companyId: string) => {

    return user ? AuthUtils.canAccessCompany(user, companyId) : false;

  }, [user]);

  /**
   * Get user's role for specific company
   */
  const getUserRoleForCompany = useCallback((companyId: string) => {

    return user ? AuthUtils.getUserRoleForCompany(user, companyId) : null;

  }, [user]);

  // Initialize authentication on mount
  useEffect(() => {

    if (!isAuthenticated && !loading) {

      initializeAuth();

    }

  }, [isAuthenticated, loading, initializeAuth]);

  return {
    // State
    user,
    currentCompany,
    permissions,
    isAuthenticated,
    loading,
    error,

    // Actions
    login,
    logout,
    getCurrentUser,
    switchCompany,
    updateProfile,
    checkAuth,
    initializeAuth,
    getPermissions,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role checks
    isSuperAdmin,
    isCompanyManager,

    // Utility functions
    getUserFullName,
    canAccessCompany,
    getUserRoleForCompany,

    // Store actions
    setUser,
    setToken,
    updateUser,
    setCurrentCompany,
    setPermissions,
    setLoading,
    setError,
    clearUser,
    initializeFromSession
  };

};
