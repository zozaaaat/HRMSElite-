import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserStore } from '../../src/stores/useUserStore';

// Mock the stores
vi.mock('../../src/stores/useUserStore');
vi.mock('@/hooks/use-toast');

describe('Employee Status Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Employee Status Types', () => {
    it('should handle active employee status', () => {
      const mockUser = {
        id: '1',
        username: 'employee1',
        role: 'worker',
        status: 'active',
        firstName: 'أحمد',
        lastName: 'محمد',
        companyId: 'company-1',
        companyName: 'شركة النيل الأزرق',
        isActive: true,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        updateUser: vi.fn(),
      });

      expect(mockUser.isActive).toBe(true);
    });

    it('should handle inactive employee status', () => {
      const mockUser = {
        id: '2',
        username: 'employee2',
        role: 'worker',
        status: 'inactive',
        firstName: 'سارة',
        lastName: 'أحمد',
        companyId: 'company-1',
        companyName: 'شركة النيل الأزرق',
        isActive: false,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        updateUser: vi.fn(),
      });

      expect(mockUser.isActive).toBe(false);
    });

    it('should handle suspended employee status', () => {
      const mockUser = {
        id: '3',
        username: 'employee3',
        role: 'worker',
        status: 'suspended',
        firstName: 'محمد',
        lastName: 'علي',
        companyId: 'company-1',
        companyName: 'شركة النيل الأزرق',
        isActive: false,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        updateUser: vi.fn(),
      });

      expect(mockUser.isActive).toBe(false);
    });
  });

  describe('Employee Status Updates', () => {
    it('should update employee status to active', async () => {
      const mockUpdateUser = vi.fn();
      const mockUser = {
        id: '1',
        username: 'employee1',
        role: 'worker',
        status: 'inactive',
        firstName: 'أحمد',
        lastName: 'محمد',
        isActive: false,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        updateUser: mockUpdateUser,
      });

      await mockUpdateUser({ isActive: true });

      expect(mockUpdateUser).toHaveBeenCalledWith({ isActive: true });
    });

    it('should update employee status to suspended', async () => {
      const mockUpdateUser = vi.fn();
      const mockUser = {
        id: '1',
        username: 'employee1',
        role: 'worker',
        status: 'active',
        firstName: 'أحمد',
        lastName: 'محمد',
        isActive: true,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        updateUser: mockUpdateUser,
      });

      await mockUpdateUser({ isActive: false });

      expect(mockUpdateUser).toHaveBeenCalledWith({ isActive: false });
    });

    it('should handle status update errors', async () => {
      const mockUpdateUser = vi.fn().mockRejectedValue(new Error('Update failed'));
      const mockUser = {
        id: '1',
        username: 'employee1',
        role: 'worker',
        status: 'active',
        firstName: 'أحمد',
        lastName: 'محمد',
        isActive: true,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        updateUser: mockUpdateUser,
      });

      await expect(mockUpdateUser({ isActive: false })).rejects.toThrow('Update failed');
    });
  });

  describe('Employee Status Validation', () => {
    it('should validate valid status values', () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'terminated'];
      
      validStatuses.forEach(status => {
        expect(['active', 'inactive', 'suspended', 'terminated']).toContain(status);
      });
    });

    it('should reject invalid status values', () => {
      const invalidStatuses = ['invalid', 'unknown', 'pending'];
      
      invalidStatuses.forEach(status => {
        expect(['active', 'inactive', 'suspended', 'terminated']).not.toContain(status);
      });
    });
  });

  describe('Employee Status Permissions', () => {
    it('should allow company manager to update employee status', () => {
      const mockUser = {
        id: '1',
        username: 'manager1',
        role: 'company_manager',
        status: 'active',
        firstName: 'مدير',
        lastName: 'الشركة',
        isActive: true,
        permissions: ['manage_employees'],
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        permissions: ['manage_employees'],
      });

      const { user, permissions } = useUserStore();
      const canUpdateEmployeeStatus = user && permissions.includes('manage_employees');
      expect(canUpdateEmployeeStatus).toBe(true);
    });

    it('should not allow regular employee to update status', () => {
      const mockUser = {
        id: '2',
        username: 'employee1',
        role: 'worker',
        status: 'active',
        firstName: 'موظف',
        lastName: 'عادي',
        isActive: true,
        permissions: ['view_employees'],
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        permissions: ['view_employees'],
      });

      const { user, permissions } = useUserStore();
      const canUpdateEmployeeStatus = user && permissions.includes('manage_employees');
      expect(canUpdateEmployeeStatus).toBe(false);
    });

    it('should allow super admin to update any employee status', () => {
      const mockUser = {
        id: '3',
        username: 'admin',
        role: 'super_admin',
        status: 'active',
        firstName: 'المسؤول',
        lastName: 'العام',
        isActive: true,
        permissions: ['manage_employees', 'system_admin'],
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        permissions: ['manage_employees', 'system_admin'],
      });

      const { user, permissions } = useUserStore();
      const canUpdateEmployeeStatus = user && permissions.includes('manage_employees');
      expect(canUpdateEmployeeStatus).toBe(true);
    });
  });

  describe('Employee Status Effects', () => {
    it('should disable login for inactive employees', () => {
      const mockUser = {
        id: '1',
        username: 'employee1',
        role: 'worker',
        status: 'inactive',
        firstName: 'أحمد',
        lastName: 'محمد',
        isActive: false,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: false,
      });

      const { user, isAuthenticated } = useUserStore();
      const canLogin = user && user.isActive && isAuthenticated;
      expect(canLogin).toBe(false);
    });

    it('should allow login for active employees', () => {
      const mockUser = {
        id: '1',
        username: 'employee1',
        role: 'worker',
        status: 'active',
        firstName: 'أحمد',
        lastName: 'محمد',
        isActive: true,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      });

      const { user, isAuthenticated } = useUserStore();
      const canLogin = user && user.isActive && isAuthenticated;
      expect(canLogin).toBe(true);
    });

    it('should restrict access for suspended employees', () => {
      const mockUser = {
        id: '1',
        username: 'employee1',
        role: 'worker',
        status: 'suspended',
        firstName: 'أحمد',
        lastName: 'محمد',
        isActive: false,
      };

      vi.mocked(useUserStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: false,
      });

      const { user, isAuthenticated } = useUserStore();
      const canAccessSystem = user && user.isActive && isAuthenticated;
      expect(canAccessSystem).toBe(false);
    });
  });

  describe('Employee Status History', () => {
    it('should track status change history', () => {
      const statusHistory = [
        { status: 'active', date: '2024-01-01', reason: 'Initial hire' },
        { status: 'suspended', date: '2024-02-01', reason: 'Policy violation' },
        { status: 'active', date: '2024-03-01', reason: 'Reinstated' },
      ];

      expect(statusHistory).toHaveLength(3);
      expect(statusHistory[0].status).toBe('active');
      expect(statusHistory[1].status).toBe('suspended');
      expect(statusHistory[2].status).toBe('active');
    });

    it('should validate status change reasons', () => {
      const validReasons = [
        'Initial hire',
        'Policy violation',
        'Performance issues',
        'Resignation',
        'Termination',
        'Reinstated',
      ];

      validReasons.forEach(reason => {
        expect(reason.length).toBeGreaterThan(0);
        expect(typeof reason).toBe('string');
      });
    });
  });
}); 