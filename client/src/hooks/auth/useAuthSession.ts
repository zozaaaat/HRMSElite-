import { useCallback } from 'react';
import { AuthService } from '../../services/auth';
import { AuthUtils } from '../../lib/authUtils';

/**
 * Authentication Session Hook - Single Responsibility Principle
 * Handles only session-related operations
 */
export const useAuthSession = () => {
  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async () => {
    try {
      const isAuth = await AuthService.checkAuth();
      return isAuth;
    } catch {
      return false;
    }
  }, []);

  /**
   * Initialize authentication from session
   */
  const initializeAuth = useCallback(async () => {
    try {
      const response = await AuthService.getCurrentUser();

      if (response) {
        const unifiedUser = AuthUtils.createUnifiedUser(response);
        return { 'success': true, 'user': unifiedUser };
      } else {
        return { 'success': false, 'error': 'No session found' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize auth';
      return { 'success': false, 'error': errorMessage };
    }
  }, []);

  return {
    checkAuth,
    initializeAuth
  };
};
