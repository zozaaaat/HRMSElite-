import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
   useUserStore, useUserActions, useCurrentUserId, useCurrentUserRole, useCurrentUserCompanyId, useIsUserAuthenticated
} from '../src/stores/useUserStore';
import type { User } from '../../../shared/schema';

// Mock user data that matches the User interface from shared schema
const createMockUser = (overrides = {}): User => ({
  id: 'user123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'hashedpassword',
  profileImageUrl: null,
  role: 'company_manager',
  companyId: 'company456',
  permissions: '["read", "write"]',
  isActive: true,
  emailVerified: false,
  emailVerificationToken: null,
  emailVerificationExpires: null,
  passwordResetToken: null,
  passwordResetExpires: null,
  lastPasswordChange: null,
  lastLoginAt: null,
  sub: 'user123',
  claims: null,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
});

describe('useUserStore', () => {
  beforeEach(() => {
    // Clear all mocks and reset store
    vi.clearAllMocks();
    act(() => {
      useUserStore.getState().clearUser();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.id).toBeNull();
      expect(result.current.role).toBeNull();
      expect(result.current.companyId).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user data correctly', () => {
      const { result } = renderHook(() => useUserActions());
      const userData = createMockUser();

      act(() => {
        result.current.setUser(userData);
      });

      const state = useUserStore.getState();
      expect(state.id).toBe('user123');
      expect(state.role).toBe('company_manager');
      expect(state.companyId).toBe('company456');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle invalid user data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useUserActions());

      act(() => {
        // @ts-expect-error - Testing invalid user data
        result.current.setUser({});
      });

      const state = useUserStore.getState();
      expect(state.id).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid user data provided to setUser');
      
      consoleSpy.mockRestore();
    });
  });


  describe('updateUser', () => {
    it('should update user data correctly', () => {
      // First set initial user data
      act(() => {
        useUserStore.getState().setUser(createMockUser());
      });

      const { result } = renderHook(() => useUserActions());

      act(() => {
        result.current.updateUser({ role: 'super_admin' });
      });

      const state = useUserStore.getState();
      expect(state.id).toBe('user123');
      expect(state.role).toBe('super_admin');
      expect(state.companyId).toBe('company456');
    });

    it('should handle invalid updates', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useUserActions());

      act(() => {
        result.current.updateUser({ id: '' });
      });

      expect(consoleSpy).toHaveBeenCalledWith('Invalid user data in updateUser');
      
      consoleSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('should clear all user data', () => {
      // First set user data
      act(() => {
        useUserStore.getState().setUser(createMockUser());
      });

      const { result } = renderHook(() => useUserActions());

      act(() => {
        result.current.logout();
      });

      const state = useUserStore.getState();
      expect(state.id).toBeNull();
      expect(state.role).toBeNull();
      expect(state.companyId).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('clearUser', () => {
    it('should clear all user data', () => {
      // First set user data
      act(() => {
        useUserStore.getState().setUser(createMockUser());
      });

      const { result } = renderHook(() => useUserActions());

      act(() => {
        result.current.clearUser();
      });

      const state = useUserStore.getState();
      expect(state.id).toBeNull();
      expect(state.role).toBeNull();
      expect(state.companyId).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('Convenience Hooks', () => {
    it('should provide correct values through convenience hooks', () => {
      // Set user data
      act(() => {
        useUserStore.getState().setUser(createMockUser({ role: 'employee' }));
      });

      const { result: idResult } = renderHook(() => useCurrentUserId());
      const { result: roleResult } = renderHook(() => useCurrentUserRole());
      const { result: companyIdResult } = renderHook(() => useCurrentUserCompanyId());
      const { result: authResult } = renderHook(() => useIsUserAuthenticated());

      expect(idResult.current).toBe('user123');
      expect(roleResult.current).toBe('employee');
      expect(companyIdResult.current).toBe('company456');
      expect(authResult.current).toBe(true);
    });
  });
});