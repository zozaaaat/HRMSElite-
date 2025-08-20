import { useCallback } from 'react';
import { AuthService } from '../../services/auth';
import { AuthUtils, type User } from '../../lib/authUtils';
import {
  useUserActions,
  useCurrentUser,
  useCurrentCompany,
  useUserPermissions,
  useIsUserAuthenticated,
  useUserLoading,
  useUserError
} from '../../stores/useUserStore';

// Type conversion function to convert User to AppUser
const convertUserToAppUser = (user: User) => {
  return {
    sub: user.sub,
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl ?? null,
    role: user.role,
    companyId: user.companyId ?? null,
    permissions: user.permissions,
    companies: user.companies,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    claims: user.claims ?? null
  };
};

/**
 * Core Authentication Hook - Single Responsibility Principle
 * Handles only authentication state and basic operations
 */
export const useAuthCore = () => {
  const {
    setUser,
    updateUser,
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
   * Core login functionality
   */
  const login = useCallback(async (credentials: {
    username: string; 
    password: string; 
    companyId?: string 
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.login(credentials);

      if (response.success && response.user) {
        const unifiedUser = AuthUtils.createUnifiedUser(response.user);
        const appUser = convertUserToAppUser(unifiedUser);
        setUser(appUser);

        return { 'success': true, 'user': unifiedUser };
      } else {
        throw new Error(response.message ?? "Login failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { 'success': false, 'error': errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  /**
   * Core logout functionality
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
   * Core user retrieval
   */
  const getCurrentUser = useCallback(async (companyId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const user = await AuthService.getCurrentUser(companyId);
      const appUser = convertUserToAppUser(user);
      setUser(appUser);

      return { 'success': true, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      setError(errorMessage);
      return { 'success': false, 'error': errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  return {
    // State
    user,
    currentCompany,
    permissions,
    isAuthenticated,
    loading,
    error,

    // Core Actions
    login,
    logout,
    getCurrentUser,

    // Store Actions
    setUser,
    updateUser,
    setLoading,
    setError,
    clearUser,
    initializeFromSession
  };
};
