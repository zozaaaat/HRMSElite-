import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../src/stores/useAppStore';
import type { User, Company } from '../../../shared/schema';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Create mock data that matches the schema
const createMockUser = (overrides = {}): User => ({
  id: 'user123',
  email: 'test@example.com',
  firstName: 'أحمد',
  lastName: 'محمد',
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

const createMockCompany = (overrides = {}): Company => ({
  id: 'company456',
  name: 'شركة النيل الأزرق للمجوهرات',
  commercialFileNumber: '123456',
  commercialFileName: 'ملف تجاري النيل الأزرق',
  commercialFileStatus: true,
  establishmentDate: '2020-01-01',
  commercialRegistrationNumber: 'CR123456',
  classification: 'تجارة عامة',
  department: 'إدارة التجارة',
  fileType: 'تجاري',
  legalEntity: 'شركة ذات مسؤولية محدودة',
  ownershipCategory: 'خاص',
  logoUrl: null,
  address: 'شارع الخليج، مباركية، الكويت',
  phone: '+96512345678',
  email: 'info@nileblue.com',
  website: 'https://nileblue.com',
  totalEmployees: 25,
  totalLicenses: 3,
  isActive: true,
  ...overrides
});

describe('useAppStore', () => {
  beforeEach(() => {
    // Clear all mocks and reset store
    vi.clearAllMocks();
    useAppStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.company).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isInitialized).toBe(false);
      expect(state.hydrationComplete).toBe(false);
    });

    it('should compute isAuthenticated correctly', () => {
      const { result } = renderHook(() => useAppStore((state) => state.isAuthenticated));
      
      expect(result.current).toBe(false);
      
      act(() => {
        useAppStore.getState().setUser(createMockUser());
      });
      
      expect(result.current).toBe(true);
    });
  });

  describe('User Management', () => {
    it('should set and get user correctly', () => {
      const user = createMockUser();

      act(() => {
        useAppStore.getState().setUser(user);
      });

      const state = useAppStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.userRole).toBe('company_manager');
      expect(state.userFullName).toBe('أحمد محمد');
    });

    it('should update user correctly', () => {
      const user = createMockUser({ firstName: 'أحمد', lastName: 'محمد' });
      
      act(() => {
        useAppStore.getState().setUser(user);
        useAppStore.getState().updateUser({ firstName: 'محمد', lastName: 'أحمد' });
      });

      const state = useAppStore.getState();
      expect(state.user).toEqual({
        ...user,
        firstName: 'محمد',
        lastName: 'أحمد'
      });
    });

    it('should handle logout correctly', () => {
      const user = createMockUser();
      
      act(() => {
        useAppStore.getState().setUser(user);
        useAppStore.getState().logout();
      });

      const state = useAppStore.getState();
      expect(state.user).toBeNull();
      expect(state.company).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(true);
    });
  });

  describe('Company Management', () => {
    it('should set and get company correctly', () => {
      const company = createMockCompany();

      act(() => {
        useAppStore.getState().setCompany(company);
      });

      const state = useAppStore.getState();
      expect(state.company).toEqual(company);
      expect(state.companyName).toBe('شركة النيل الأزرق للمجوهرات');
    });

    it('should update company correctly', () => {
      const company = createMockCompany();
      
      act(() => {
        useAppStore.getState().setCompany(company);
        useAppStore.getState().updateCompany({ name: 'شركة جديدة' });
      });

      const state = useAppStore.getState();
      expect(state.company?.name).toBe('شركة جديدة');
    });
  });

  describe('Employee Management', () => {
    it('should set employees correctly', () => {
      const employees = [
        {
          id: 'emp1',
          firstName: 'عامل',
          lastName: 'أول',
          email: 'emp1@example.com',
          phone: '+96512345678',
          position: 'عامل',
          department: 'الإنتاج',
          salary: 500,
          hireDate: new Date('2023-01-01'),
          companyId: 'company456',
          status: 'active',
          type: 'expatriate',
          nationality: 'مصرية',
          passportNumber: 'A123456',
          residenceNumber: 'R123456',
          civilId: '123456789',
          workPermitNumber: 'WP123456',
          licenseId: null,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          company: createMockCompany(),
          license: undefined,
          recentLeaves: [],
          totalDeductions: 0,
          totalViolations: 0
        }
      ];

      act(() => {
        useAppStore.getState().setEmployees(employees);
      });

      const state = useAppStore.getState();
      expect(state.employees).toEqual(employees);
      expect(state.totalEmployees).toBe(1);
      expect(state.activeEmployees).toBe(1);
    });
  });

  describe('Loading and Error States', () => {
    it('should handle loading state correctly', () => {
      act(() => {
        useAppStore.getState().setLoading(true);
      });

      expect(useAppStore.getState().isLoading).toBe(true);

      act(() => {
        useAppStore.getState().setLoading(false);
      });

      expect(useAppStore.getState().isLoading).toBe(false);
    });

    it('should handle error state correctly', () => {
      const errorMessage = 'Test error message';

      act(() => {
        useAppStore.getState().setError(errorMessage);
      });

      expect(useAppStore.getState().error).toBe(errorMessage);

      act(() => {
        useAppStore.getState().clearError();
      });

      expect(useAppStore.getState().error).toBeNull();
    });
  });

  describe('Initialization', () => {
    it('should handle initialization correctly', () => {
      act(() => {
        useAppStore.getState().setInitialized(true);
      });

      expect(useAppStore.getState().isInitialized).toBe(true);
    });

    it('should handle hydration completion correctly', () => {
      act(() => {
        useAppStore.getState().setHydrationComplete(true);
      });

      expect(useAppStore.getState().hydrationComplete).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate stored data correctly', () => {
      const state = useAppStore.getState();
      expect(state.validateStoredData()).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset store to initial state', () => {
      // Set some data first
      act(() => {
        useAppStore.getState().setUser(createMockUser());
        useAppStore.getState().setCompany(createMockCompany());
        useAppStore.getState().setError('Test error');
      });

      // Reset
      act(() => {
        useAppStore.getState().reset();
      });

      const state = useAppStore.getState();
      expect(state.user).toBeNull();
      expect(state.company).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist data to localStorage', () => {
      const user = createMockUser();
      
      act(() => {
        useAppStore.getState().setUser(user);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app-store',
        expect.stringContaining('user123')
      );
    });
  });
}); 