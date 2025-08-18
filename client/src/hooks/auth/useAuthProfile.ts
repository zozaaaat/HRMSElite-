import { useCallback } from 'react';
import { AuthService } from '../../services/auth';
import { AuthUtils, type User } from '../../lib/authUtils';
import { useCurrentUser } from '../../stores/useUserStore';

/**
 * Authentication Profile Hook - Single Responsibility Principle
 * Handles only profile-related operations
 */
export const useAuthProfile = () => {
  const user = useCurrentUser();

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) {
      return { 'success': false, 'error': 'No user to update' };
    }

    try {
      const updatedUser = await AuthService.updateProfile(updates);
      return { 'success': true, 'user': updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      return { 'success': false, 'error': errorMessage };
    }
  }, [user]);

  /**
   * Get user's full name
   */
  const getUserFullName = useCallback(() => {
    return user ? AuthUtils.getUserFullName(user as any) : '';
  }, [user]);

  /**
   * Switch to different company
   */
  const switchCompany = useCallback(async (companyId: string) => {
    try {
      const response = await AuthService.switchCompany(companyId);

      if (response.success && response.user) {
        const unifiedUser = AuthUtils.createUnifiedUser(response.user);
        return { 'success': true, 'user': unifiedUser };
      } else {
        throw new Error(response.message ?? "Failed to switch company");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch company';
      return { 'success': false, 'error': errorMessage };
    }
  }, []);

  return {
    user,
    updateProfile,
    getUserFullName,
    switchCompany
  };
};
