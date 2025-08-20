import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from '../../src/hooks/useAuth';
import { AuthService } from '../../src/services/auth';
import { AuthUtils } from '../../src/lib/authUtils';

// Mock dependencies
vi.mock('../../src/services/auth');
vi.mock('../../src/lib/authUtils');
vi.mock('../../src/stores/useUserStore', () => ({
  useUserActions: () => ({
    setUser: vi.fn(),
    updateUser: vi.fn(),
    setCurrentCompany: vi.fn(),
    setPermissions: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    logout: vi.fn(),
    clearUser: vi.fn(),
    initializeFromSession: vi.fn()
  }),
  useCurrentUser: () => null,
  useCurrentCompany: () => null,
  useUserPermissions: () => [],
  useIsUserAuthenticated: () => false,
  useUserLoading: () => false,
  useUserError: () => null
}));

const mockAuthService = vi.mocked(AuthService);
const mockAuthUtils = vi.mocked(AuthUtils);

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockResponse = {
        success: true,
        user: mockUser,
        token: 'mock-token'
      };

      mockAuthService.login.mockResolvedValue(mockResponse);
      mockAuthUtils.createUnifiedUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.login({
          username: 'test@example.com',
          password: 'password'
        });
        expect(response.success).toBe(true);
        expect(response.user).toEqual(mockUser);
      });

      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password'
      });
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials'
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.login({
          username: 'test@example.com',
          password: 'wrong-password'
        });
        expect(response.success).toBe(false);
        expect(response.error).toBe('Invalid credentials');
      });
    });

    it('should handle login error', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.login({
          username: 'test@example.com',
          password: 'password'
        });
        expect(response.success).toBe(false);
        expect(response.error).toBe('Network error');
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should handle logout error gracefully', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      // Should not throw error, should handle silently
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should successfully get current user', async () => {
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.getCurrentUser();
        expect(response.success).toBe(true);
        expect(response.user).toEqual(mockUser);
      });

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });

    it('should handle getCurrentUser error', async () => {
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('User not found'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.getCurrentUser();
        expect(response.success).toBe(false);
        expect(response.error).toBe('User not found');
      });
    });
  });

  describe('switchCompany', () => {
    it('should successfully switch company', async () => {
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockResponse = {
        success: true,
        user: mockUser
      };

      mockAuthService.switchCompany.mockResolvedValue(mockResponse);
      mockAuthUtils.createUnifiedUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.switchCompany('company-1');
        expect(response.success).toBe(true);
        expect(response.user).toEqual(mockUser);
      });

      expect(mockAuthService.switchCompany).toHaveBeenCalledWith('company-1');
    });

    it('should handle switchCompany failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Company not found'
      };

      mockAuthService.switchCompany.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.switchCompany('invalid-company');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Company not found');
      });
    });
  });

  describe('updateProfile', () => {
    it('should successfully update profile', async () => {
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAuthService.updateProfile.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.updateProfile({
          firstName: 'Updated'
        });
        expect(response.success).toBe(true);
        expect(response.user).toEqual(mockUser);
      });

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith({
        firstName: 'Updated'
      });
    });

    it('should handle updateProfile when no user', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.updateProfile({
          firstName: 'Updated'
        });
        expect(response.success).toBe(false);
        expect(response.error).toBe('No user to update');
      });
    });
  });

  describe('checkAuth', () => {
    it('should return true when authenticated', async () => {
      mockAuthService.checkAuth.mockResolvedValue(true);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const isAuth = await result.current.checkAuth();
        expect(isAuth).toBe(true);
      });
    });

    it('should return false when not authenticated', async () => {
      mockAuthService.checkAuth.mockResolvedValue(false);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const isAuth = await result.current.checkAuth();
        expect(isAuth).toBe(false);
      });
    });

    it('should handle checkAuth error', async () => {
      mockAuthService.checkAuth.mockRejectedValue(new Error('Auth check failed'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const isAuth = await result.current.checkAuth();
        expect(isAuth).toBe(false);
      });
    });
  });

  describe('initializeAuth', () => {
    it('should successfully initialize auth from session', async () => {
      const mockUser = {
        id: '1',
        sub: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        permissions: ['read'],
        isActive: true,
        claims: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSession = {
        user: mockUser,
        company: { id: 'company-1', name: 'Test Company' }
      };

      mockAuthService.getSession.mockResolvedValue(mockSession);
      mockAuthUtils.createUnifiedUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.initializeAuth();
        expect(response.success).toBe(true);
        expect(response.user).toEqual(mockUser);
        expect(response.company).toEqual(mockSession.company);
      });
    });

    it('should handle no session found', async () => {
      mockAuthService.getSession.mockResolvedValue({ user: null, company: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.initializeAuth();
        expect(response.success).toBe(false);
        expect(response.error).toBe('No session found');
      });
    });
  });

  describe('getPermissions', () => {
    it('should successfully get permissions', async () => {
      const mockPermissions = ['read', 'write', 'delete'];
      mockAuthService.getUserPermissions.mockResolvedValue(mockPermissions);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const permissions = await result.current.getPermissions('company-1');
        expect(permissions).toEqual(mockPermissions);
      });

      expect(mockAuthService.getUserPermissions).toHaveBeenCalledWith('company-1');
    });

    it('should handle getPermissions error', async () => {
      mockAuthService.getUserPermissions.mockRejectedValue(new Error('Failed to get permissions'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const permissions = await result.current.getPermissions('company-1');
        expect(permissions).toEqual([]);
      });
    });
  });

  describe('permission checks', () => {
    it('should check hasPermission correctly', () => {
      const { result } = renderHook(() => useAuth());

      // Mock permissions in store
      vi.mocked(useAuth).mockReturnValue({
        ...result.current,
        permissions: ['read', 'write']
      });

      expect(result.current.hasPermission('read')).toBe(true);
      expect(result.current.hasPermission('delete')).toBe(false);
    });

    it('should check hasAnyPermission correctly', () => {
      const { result } = renderHook(() => useAuth());

      // Mock permissions in store
      vi.mocked(useAuth).mockReturnValue({
        ...result.current,
        permissions: ['read', 'write']
      });

      expect(result.current.hasAnyPermission(['read', 'delete'])).toBe(true);
      expect(result.current.hasAnyPermission(['delete', 'admin'])).toBe(false);
    });

    it('should check hasAllPermissions correctly', () => {
      const { result } = renderHook(() => useAuth());

      // Mock permissions in store
      vi.mocked(useAuth).mockReturnValue({
        ...result.current,
        permissions: ['read', 'write']
      });

      expect(result.current.hasAllPermissions(['read', 'write'])).toBe(true);
      expect(result.current.hasAllPermissions(['read', 'delete'])).toBe(false);
    });
  });

  describe('role checks', () => {
    it('should check isSuperAdmin correctly', () => {
      const mockUser = {
        id: '1',
        role: 'super_admin',
        permissions: ['admin']
      };

      mockAuthUtils.isSuperAdmin.mockReturnValue(true);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isSuperAdmin()).toBe(true);
      expect(mockAuthUtils.isSuperAdmin).toHaveBeenCalledWith(mockUser);
    });

    it('should check isCompanyManager correctly', () => {
      const mockUser = {
        id: '1',
        role: 'manager',
        permissions: ['manage']
      };

      mockAuthUtils.isCompanyManager.mockReturnValue(true);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isCompanyManager()).toBe(true);
      expect(mockAuthUtils.isCompanyManager).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('utility functions', () => {
    it('should get user full name correctly', () => {
      const mockUser = {
        id: '1',
        firstName: 'Test',
        lastName: 'User'
      };

      mockAuthUtils.getUserFullName.mockReturnValue('Test User');

      const { result } = renderHook(() => useAuth());

      expect(result.current.getUserFullName()).toBe('Test User');
      expect(mockAuthUtils.getUserFullName).toHaveBeenCalledWith(mockUser);
    });

    it('should check company access correctly', () => {
      const mockUser = {
        id: '1',
        companies: ['company-1', 'company-2']
      };

      mockAuthUtils.canAccessCompany.mockReturnValue(true);

      const { result } = renderHook(() => useAuth());

      expect(result.current.canAccessCompany('company-1')).toBe(true);
      expect(mockAuthUtils.canAccessCompany).toHaveBeenCalledWith(mockUser, 'company-1');
    });

    it('should get user role for company correctly', () => {
      const mockUser = {
        id: '1',
        companies: ['company-1']
      };

      mockAuthUtils.getUserRoleForCompany.mockReturnValue('manager');

      const { result } = renderHook(() => useAuth());

      expect(result.current.getUserRoleForCompany('company-1')).toBe('manager');
      expect(mockAuthUtils.getUserRoleForCompany).toHaveBeenCalledWith(mockUser, 'company-1');
    });
  });

  describe('state management', () => {
    it('should return correct state values', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.currentCompany).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide all required actions', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.updateUser).toBe('function');
      expect(typeof result.current.setCurrentCompany).toBe('function');
      expect(typeof result.current.setPermissions).toBe('function');
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.clearUser).toBe('function');
      expect(typeof result.current.initializeFromSession).toBe('function');
    });
  });
});
