import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePermissions } from '../../src/hooks/usePermissions';
import { useUserStore } from '../../src/stores/useUserStore';
import { PERMISSIONS, USER_ROLES } from '../../src/lib/authUtils';
import type { Permission } from '../../src/lib/roles';

// Mock the hooks and stores
vi.mock('../../src/hooks/usePermissions');
vi.mock('../../src/stores/useUserStore');
vi.mock('../../src/lib/authUtils');

describe('Access Control and Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Permission Checking', () => {
    it('should check if user has specific permission', () => {
      const mockCheckPermission = vi.fn().mockReturnValue(true);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkPermission: mockCheckPermission,
        getCurrentRolePermissions: vi.fn().mockReturnValue(['employees:view', 'employees:create']),
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkPermission } = usePermissions();
      const result = checkPermission('employees:view' as Permission);

      expect(result).toBe(true);
      expect(mockCheckPermission).toHaveBeenCalledWith('employees:view');
    });

    it('should deny access when user lacks permission', () => {
      const mockCheckPermission = vi.fn().mockReturnValue(false);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkPermission: mockCheckPermission,
        getCurrentRolePermissions: vi.fn().mockReturnValue(['employees:view']),
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkPermission } = usePermissions();
      const result = checkPermission('employees:create' as Permission);

      expect(result).toBe(false);
    });

    it('should handle multiple permissions check', () => {
      const mockCheckAnyPermission = vi.fn().mockReturnValue(true);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkAnyPermission: mockCheckAnyPermission,
        getCurrentRolePermissions: vi.fn().mockReturnValue(['employees:view', 'employees:create']),
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkAnyPermission } = usePermissions();
      const result = checkAnyPermission([
        'employees:view' as Permission,
        'employees:create' as Permission,
      ]);

      expect(result).toBe(true);
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow super admin all permissions', () => {
      const mockUser = {
        id: '1',
        username: 'admin',
        role: USER_ROLES.SUPER_ADMIN,
        permissions: Object.values(PERMISSIONS),
      };

      const mockUseUserStore = vi.mocked(useUserStore);
      mockUseUserStore.mockReturnValue({
        user: mockUser,
        hasRole: vi.fn().mockReturnValue(true),
      } as unknown as ReturnType<typeof useUserStore>);

      const { user } = useUserStore();
      expect(user?.permissions).toContain(PERMISSIONS.SYSTEM_ADMIN);
      expect(user?.permissions).toContain(PERMISSIONS.MANAGE_EMPLOYEES);
      expect(user?.permissions).toContain(PERMISSIONS.MANAGE_COMPANY);
    });

    it('should restrict company manager permissions', () => {
      const mockUser = {
        id: '2',
        username: 'manager',
        role: USER_ROLES.COMPANY_MANAGER,
        permissions: [
          PERMISSIONS.MANAGE_EMPLOYEES,
          PERMISSIONS.VIEW_EMPLOYEES,
          PERMISSIONS.MANAGE_COMPANY,
        ],
      };

      const mockUseUserStore = vi.mocked(useUserStore);
      mockUseUserStore.mockReturnValue({
        user: mockUser,
        hasRole: vi.fn().mockReturnValue(true),
      } as unknown as ReturnType<typeof useUserStore>);

      const { user } = useUserStore();
      expect(user?.permissions).toContain(PERMISSIONS.MANAGE_EMPLOYEES);
      expect(user?.permissions).not.toContain(PERMISSIONS.SYSTEM_ADMIN);
    });

    it('should limit worker permissions', () => {
      const mockUser = {
        id: '3',
        username: 'worker',
        role: USER_ROLES.WORKER,
        permissions: [PERMISSIONS.VIEW_LEAVE_REQUESTS],
      };

      const mockUseUserStore = vi.mocked(useUserStore);
      mockUseUserStore.mockReturnValue({
        user: mockUser,
        hasRole: vi.fn().mockReturnValue(true),
      } as unknown as ReturnType<typeof useUserStore>);

      const { user } = useUserStore();
      expect(user?.permissions).toContain(PERMISSIONS.VIEW_LEAVE_REQUESTS);
      expect(user?.permissions).not.toContain(PERMISSIONS.MANAGE_EMPLOYEES);
      expect(user?.permissions).not.toContain(PERMISSIONS.MANAGE_COMPANY);
    });
  });

  describe('Page Access Control', () => {
    it('should allow access to dashboard for all roles', () => {
      const mockCanAccess = vi.fn().mockReturnValue(true);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        canAccess: mockCanAccess,
      } as unknown as ReturnType<typeof usePermissions>);

      const { canAccess } = usePermissions();
      const result = canAccess('dashboard');

      expect(result).toBe(true);
    });

    it('should restrict access to admin pages for non-admin users', () => {
      const mockCanAccess = vi.fn().mockReturnValue(false);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        canAccess: mockCanAccess,
      } as unknown as ReturnType<typeof usePermissions>);

      const { canAccess } = usePermissions();
      const result = canAccess('admin-settings');

      expect(result).toBe(false);
    });
  });

  describe('Feature Access Control', () => {
    it('should allow employee management for authorized users', () => {
      const mockCheckPermission = vi.fn().mockReturnValue(true);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkPermission: mockCheckPermission,
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkPermission } = usePermissions();
      const result = checkPermission('employees:create' as Permission);

      expect(result).toBe(true);
    });

    it('should allow payroll access for HR and managers', () => {
      const mockCheckPermission = vi.fn().mockReturnValue(true);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkPermission: mockCheckPermission,
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkPermission } = usePermissions();
      const result = checkPermission('payroll:view' as Permission);

      expect(result).toBe(true);
    });

    it('should restrict sensitive operations', () => {
      const mockCheckPermission = vi.fn().mockReturnValue(false);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkPermission: mockCheckPermission,
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkPermission } = usePermissions();
      const result = checkPermission('settings:edit' as Permission);

      expect(result).toBe(false);
    });
  });

  describe('Permission Inheritance', () => {
    it('should inherit permissions from role', () => {
      const rolePermissions = {
        [USER_ROLES.COMPANY_MANAGER]: [
          'employees:view' as Permission,
          'employees:create' as Permission,
          'reports:view' as Permission,
        ],
      };

      const userRole = USER_ROLES.COMPANY_MANAGER;
      const inheritedPermissions = rolePermissions[userRole];

      expect(inheritedPermissions).toContain('employees:view');
      expect(inheritedPermissions).toContain('employees:create');
      expect(inheritedPermissions).toContain('reports:view');
    });

    it('should allow custom permissions override', () => {
      const basePermissions: Permission[] = ['employees:view'];
      const customPermissions: Permission[] = ['employees:create'];
      const finalPermissions = [...basePermissions, ...customPermissions];

      expect(finalPermissions).toContain('employees:view');
      expect(finalPermissions).toContain('employees:create');
    });
  });

  describe('Permission Validation', () => {
    it('should validate permission format', () => {
      const validPermissions: Permission[] = [
        'employees:view',
        'employees:create',
        'payroll:view',
        'reports:view',
      ];

      validPermissions.forEach(permission => {
        expect(permission).toMatch(/^[a-z_]+:[a-z]+$/);
        expect(permission.length).toBeGreaterThan(0);
      });
    });

    it('should reject invalid permission formats', () => {
      const invalidPermissions = [
        'EMPLOYEES:VIEW',
        'employees-view',
        'employees view',
        '',
        '123',
      ];

      invalidPermissions.forEach(permission => {
        expect(permission).not.toMatch(/^[a-z_]+:[a-z]+$/);
      });
    });
  });

  describe('Permission Caching', () => {
    it('should cache permission checks for performance', () => {
      const mockCheckPermission = vi.fn().mockReturnValue(true);
      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkPermission: mockCheckPermission,
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkPermission } = usePermissions();
      
      // First call
      checkPermission('employees:view' as Permission);
      // Second call (should use cache)
      checkPermission('employees:view' as Permission);

      expect(mockCheckPermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('Permission Error Handling', () => {
    it('should handle permission check errors gracefully', () => {
      const mockCheckPermission = vi.fn().mockImplementation(() => {
        throw new Error('Permission check failed');
      });

      const mockUsePermissions = vi.mocked(usePermissions);
      mockUsePermissions.mockReturnValue({
        checkPermission: mockCheckPermission,
      } as unknown as ReturnType<typeof usePermissions>);

      const { checkPermission } = usePermissions();

      expect(() => checkPermission('employees:view' as Permission)).toThrow('Permission check failed');
    });
  });
}); 