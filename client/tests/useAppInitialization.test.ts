import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
   useAppInitialization, useAppReady, useAuthWithInitialization 
} from '../src/hooks/useAppInitialization';
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

describe('useAppInitialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.getState().reset();
  });

  describe('useAppInitialization', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useAppInitialization());

      expect(result.current.isReady).toBe(false);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.hydrationComplete).toBe(false);
    });

    it('should set isReady to true when both initialized and hydrated', async () => {
      const { result } = renderHook(() => useAppInitialization());

      // Initially not ready
      expect(result.current.isReady).toBe(false);

      // Set both flags to true
      act(() => {
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isReady).toBe(true);
    });

    it('should call initializeApp when not initialized but hydrated', async () => {
      renderHook(() => useAppInitialization());

      // Mock initializeApp
      const initializeAppSpy = vi.spyOn(useAppStore.getState(), 'initializeApp');

      // Set only hydration to true
      act(() => {
        useAppStore.getState().setHydrationComplete(true);
      });

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(initializeAppSpy).toHaveBeenCalled();
    });

    it('should not call initializeApp when already initialized', async () => {
      renderHook(() => useAppInitialization());

      // Mock initializeApp
      const initializeAppSpy = vi.spyOn(useAppStore.getState(), 'initializeApp');

      // Set both flags to true
      act(() => {
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(initializeAppSpy).not.toHaveBeenCalled();
    });

    it('should provide validateData function', () => {
      const { result } = renderHook(() => useAppInitialization());

      expect(typeof result.current.validateData).toBe('function');

      // Test validation
      const isValid = result.current.validateData();
      expect(isValid).toBe(false); // Should be false because no valid data
    });

    it('should validate data correctly with valid user and company', () => {
      const { result } = renderHook(() => useAppInitialization());

      // Set valid data
      act(() => {
        useAppStore.getState().setUser(createMockUser());
        useAppStore.getState().setCompany(createMockCompany());
      });

      const isValid = result.current.validateData();
      expect(isValid).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const { result } = renderHook(() => useAppInitialization());

      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Set hydration to true to trigger initialization
      act(() => {
        useAppStore.getState().setHydrationComplete(true);
      });

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isReady).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('useAppReady', () => {
    it('should return false initially', () => {
      const { result } = renderHook(() => useAppReady());
      expect(result.current).toBe(false);
    });

    it('should return true when app is ready', () => {
      const { result } = renderHook(() => useAppReady());

      act(() => {
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      expect(result.current).toBe(true);
    });

    it('should return false when only initialized', () => {
      const { result } = renderHook(() => useAppReady());

      act(() => {
        useAppStore.getState().setInitialized(true);
      });

      expect(result.current).toBe(false);
    });

    it('should return false when only hydrated', () => {
      const { result } = renderHook(() => useAppReady());

      act(() => {
        useAppStore.getState().setHydrationComplete(true);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('useAuthWithInitialization', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useAuthWithInitialization());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isReady).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should return authenticated state when user is set', () => {
      const { result } = renderHook(() => useAuthWithInitialization());
      const user = createMockUser();

      act(() => {
        useAppStore.getState().setUser(user);
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isReady).toBe(true);
      expect(result.current.user).toEqual(user);
    });

    it('should handle user logout correctly', () => {
      const { result } = renderHook(() => useAuthWithInitialization());
      const user = createMockUser();

      // Set user first
      act(() => {
        useAppStore.getState().setUser(user);
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      act(() => {
        useAppStore.getState().logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle user updates correctly', () => {
      const { result } = renderHook(() => useAuthWithInitialization());
      const user = createMockUser();

      act(() => {
        useAppStore.getState().setUser(user);
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      expect(result.current.user?.firstName).toBe('أحمد');

      // Update user
      act(() => {
        useAppStore.getState().updateUser({ firstName: 'محمد' });
      });

      expect(result.current.user?.firstName).toBe('محمد');
    });
  });

  describe('Data Synchronization', () => {
    it('should handle data sync when app is ready', async () => {
      const { result } = renderHook(() => useAppInitialization());

      // Mock syncData
      const syncDataSpy = vi.spyOn(useAppStore.getState(), 'syncData');

      // Set app as ready
      act(() => {
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isReady).toBe(true);
    });

    it('should handle stale data detection', () => {
      const { result } = renderHook(() => useAppInitialization());

      // Mock isDataStale
      const isDataStaleSpy = vi.spyOn(useAppStore.getState(), 'isDataStale');

      // Set app as ready
      act(() => {
        useAppStore.getState().setInitialized(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      expect(result.current.isReady).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      const { result } = renderHook(() => useAppInitialization());

      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Set error state
      act(() => {
        useAppStore.getState().setError('Initialization failed');
        useAppStore.getState().setHydrationComplete(true);
      });

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isReady).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should handle network errors during initialization', async () => {
      const { result } = renderHook(() => useAppInitialization());

      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Set loading state to simulate network request
      act(() => {
        useAppStore.getState().setLoading(true);
        useAppStore.getState().setHydrationComplete(true);
      });

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isReady).toBe(false);
      consoleSpy.mockRestore();
    });
  });
}); 