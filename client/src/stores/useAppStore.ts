import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {
  DbUser, Company, Employee, EmployeeWithDetails, CompanyWithStats
} from '../../../shared/schema';
import {AUTH_ENDPOINTS, COMPANY_ENDPOINTS, EMPLOYEE_ENDPOINTS} from '../lib/constants';
import {log} from '../lib/logger';

// Define CompanyStats type to match the request
type CompanyStats = CompanyWithStats;
import {UserRole} from '../../../shared/types/user';
import logger from '../lib/logger';
import i18n from '../lib/i18n';

// Import RequestInit type for TypeScript compatibility
type RequestInit = globalThis.RequestInit;

// Type definitions for API responses
interface APIErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// Type guard for error responses
const isErrorResponse = (data: unknown): data is APIErrorResponse => {
  return typeof data === 'object' && data !== null && ('message' in data || 'error' in data);
};

// Safe error message extraction
const getErrorMessage = (data: unknown, fallback: string): string => {
  if (isErrorResponse(data)) {
    return data.message ?? data.error ?? fallback;
  }
  return fallback;
};

// Enhanced fetch function with retry logic
const fetchWithRetry = async (url: string,
   options: RequestInit,
   maxRetries = 3): Promise<Record<string, unknown> | null> => {

  // Ensure cookies are always sent with requests for authentication
  const requestOptions: RequestInit = {
    'credentials': 'include',
    ...options
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {

    try {

      const response = await fetch(url, requestOptions);

      if (response.ok) {

        const data = await response.json() as Record<string, unknown>;
        return data;

      } else if (response.status === 401) {

        // Unauthorized - don't retry
        log.warn('Unauthorized request, not retrying', null, 'API');
        return null;

      } else if (response.status >= 500 && attempt < maxRetries) {

        // Server error - retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        log.warn(`Server error (${
  response.status
}), retrying in ${
  delay
}ms (attempt ${
  attempt
}/${
  maxRetries
})`, null, 'API');
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;

      } else {

        // Other errors - don't retry
        log.error(`Request failed with status ${response.status}`, null, 'API');
        return null;

      }

    } catch (error) {

      if (attempt < maxRetries) {

        const delay = Math.pow(2, attempt) * 1000;
        log.warn(`Network error, retrying in ${
  delay
}ms (attempt ${
  attempt
}/${
  maxRetries
})`, null, 'API');
        await new Promise(resolve => setTimeout(resolve, delay));

      } else {

        log.error('Max retries reached:', error, 'API');
        throw error;

      }

    }

  }
  return null;

};

interface AppState {
  // State
  user: DbUser | null;
  company: Company | null;
  employees: EmployeeWithDetails[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  hydrationComplete: boolean;
  lastSyncTime: number | null;
  theme: 'light' | 'dark' | 'system';
  language: string;

  // Actions
  setUser: (user: DbUser | null) => void;
  setCompany: (company: Company | null) => void;
  setEmployees: (employees: EmployeeWithDetails[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setHydrationComplete: (complete: boolean) => void;
  setLastSyncTime: (time: number | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;

  // Computed values
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userFullName: string;
  companyName: string;
  totalEmployees: number;
  activeEmployees: number;

  // Auth actions
  login: (user: DbUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<DbUser>) => void;
  updateCompany: (updates: Partial<Company>) => void;

  // Employee actions
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  archiveEmployee: (id: string, reason: string) => Promise<void>;

  // Company actions
  getCompanyStats: (companyId: string) => Promise<CompanyStats>;

  // Utility actions
  clearError: () => void;
  reset: () => void;
  validateStoredData: () => boolean;
  initializeApp: () => Promise<void>;
  syncData: () => Promise<boolean>;
  isDataStale: () => boolean;
  refreshData: () => Promise<void>;

  // Cleanup functions
  cleanup: () => void;
  clearStaleData: () => void;
}

// Validation functions
const isValidUser = (user: unknown): user is DbUser => {

  return Boolean(user &&
         typeof user === 'object' &&
         user !== null &&
         'id' in user &&
         typeof (user as DbUser).id === 'string' &&
         (user as DbUser).id.trim() !== '');

};

const isValidCompany = (company: unknown): company is Company => {

  return Boolean(company &&
         typeof company === 'object' &&
         company !== null &&
         'id' in company &&
         'name' in company &&
         typeof (company as Company).id === 'string' &&
         typeof (company as Company).name === 'string' &&
         (company as Company).id.trim() !== '' &&
         (company as Company).name.trim() !== '');

};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      'user': null,
      'company': null,
      'employees': [],
      'isLoading': false,
      'error': null,
      'isInitialized': false,
      'hydrationComplete': false,
      'lastSyncTime': null,
      'theme': 'system',
      'language': 'en',

      // Actions
      'setUser': (user) => set({user}),
      'setCompany': (company) => set({company}),
      'setEmployees': (employees) => set({employees}),
      'setLoading': (loading) => set({'isLoading': loading}),
      'setError': (error) => set({error}),
      'setInitialized': (initialized) => set({'isInitialized': initialized}),
      'setHydrationComplete': (complete) => set({'hydrationComplete': complete}),
      'setLastSyncTime': (time) => set({'lastSyncTime': time}),
      'setTheme': (theme) => set({theme}),
      'setLanguage': (language) => set({'language': language}),

      // Computed values
      get 'isAuthenticated' () {

        const {user} = get();
        return !!user && typeof user === 'object' && user !== null && 'id' in user && typeof user.id === 'string';

      },

      get 'userRole' () {

        const {user} = get();
        return (user?.role as UserRole) || null;

      },

      get 'userFullName' () {

        const {user} = get();
        if (!user) {

          return '';

        }
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || i18n.t('common.user');

      },

      get 'companyName' () {

        const {company} = get();
        return company?.name ?? '';

      },

      get 'totalEmployees' () {

        return get().employees.length;

      },

      get 'activeEmployees' () {

        return get().employees.filter(emp => emp.status === 'active').length;

      },

      // Auth actions
      'login': (user) => set({
        user,
        'isLoading': false,
        'error': null,
        'isInitialized': true
      }),

      'logout': () => set({
        'user': null,
        'company': null,
        'employees': [],
        'isLoading': false,
        'error': null,
        'isInitialized': true,
        'lastSyncTime': null
      }),

      'updateUser': (updates) => set((state) => ({
        'user': state.user ? {...state.user, ...updates} : null
      })),

      'updateCompany': (updates) => set((state) => ({
        'company': state.company ? {...state.company, ...updates} : null
      })),

      // Employee actions
      'updateEmployee': async (id: string, data: Partial<Employee>) => {

        set({'isLoading': true, 'error': null});

        try {

          const response = await fetch(EMPLOYEE_ENDPOINTS.UPDATE(id), {
            'method': 'PATCH',
            'headers': {
              'Content-Type': 'application/json'
            },
            'credentials': 'include',
            'body': JSON.stringify(data)
          });

          if (response.ok) {

            const updatedEmployee = await response.json() as Employee;
            set((state) => ({
              'employees': state.employees.map(emp =>
                emp.id === id ? {...emp, ...updatedEmployee} : emp
              ),
              'isLoading': false,
              'error': null
            }));

          } else {

            const errorData = await response.json().catch(() => ({})) as APIErrorResponse;
            const errorMessage = getErrorMessage(errorData, i18n.t('errors.employeeUpdateFailed'));
            set({
              'error': errorMessage,
              'isLoading': false
            });
            throw new Error(errorMessage);

          }

        } catch (error) {

          logger.error('Error updating employee:', error as Error);
          set({
            'error': i18n.t('errors.serverConnection'),
            'isLoading': false
          });
          throw error;

        }

      },

      'archiveEmployee': async (id: string, reason: string) => {

        set({'isLoading': true, 'error': null});

        try {

          const response = await fetch(EMPLOYEE_ENDPOINTS.ARCHIVE(id), {
            'method': 'POST',
            'headers': {
              'Content-Type': 'application/json'
            },
            'credentials': 'include',
            'body': JSON.stringify({reason})
          });

          if (response.ok) {

            set((state) => ({
              'employees': state.employees.map(emp =>
                emp.id === id ? {...emp, 'isArchived': true, 'archiveReason': reason} : emp
              ),
              'isLoading': false,
              'error': null
            }));

          } else {

            const errorData = await response.json().catch(() => ({})) as APIErrorResponse;
            const errorMessage = getErrorMessage(errorData, i18n.t('errors.employeeArchiveFailed'));
            set({
              'error': errorMessage,
              'isLoading': false
            });
            throw new Error(errorMessage);

          }

        } catch (error) {

          logger.error('Error archiving employee:', error as Error);
          set({
            'error': i18n.t('errors.serverConnection'),
            'isLoading': false
          });
          throw error;

        }

      },

      // Company actions
      'getCompanyStats': async (companyId: string) => {

        set({'isLoading': true, 'error': null});

        try {

          const response = await fetch(COMPANY_ENDPOINTS.GET_STATS(companyId), {
            'method': 'GET',
            'headers': {
              'Content-Type': 'application/json'
            },
            'credentials': 'include'
          });

          if (response.ok) {

            const stats = await response.json() as CompanyStats;
            set({'isLoading': false, 'error': null});
            return stats;

          } else {

            const errorData = await response.json().catch(() => ({})) as APIErrorResponse;
            const errorMessage = getErrorMessage(errorData, i18n.t('errors.companyStatsLoadFailed'));
            set({
              'error': errorMessage,
              'isLoading': false
            });
            throw new Error(errorMessage);

          }

        } catch (error) {

          logger.error('Error loading company stats:', error as Error);
          set({
            'error': i18n.t('errors.serverConnection'),
            'isLoading': false
          });
          throw error;

        }

      },

      // Utility actions
      'clearError': () => set({'error': null}),

      'reset': () => set({
        'user': null,
        'company': null,
        'employees': [],
        'isLoading': false,
        'error': null,
        'isInitialized': false,
        'hydrationComplete': false,
        'lastSyncTime': null
      }),

      // Enhanced data synchronization
      'syncData': async () => {

        const state = get();
        if (!state.user) {

          return false;

        }

        set({'isLoading': true, 'error': null});

        try {

          // Sync user data
          const userData = await fetchWithRetry(AUTH_ENDPOINTS.ME, {
            'method': 'GET',
            'headers': {'Content-Type': 'application/json'},
            'credentials': 'include'
          });

          if (userData) {

            set({'user': userData as DbUser});

            // Sync company data if available
            if (userData['companyId']) {

              const companyData = await fetchWithRetry(COMPANY_ENDPOINTS.GET_BY_ID(userData['companyId'] as string),
   {
                'method': 'GET',
                'headers': {'Content-Type': 'application/json'},
                'credentials': 'include'
              });

              if (companyData) {

                set({'company': companyData as Company});

              }

            }

            set({
              'isLoading': false,
              'lastSyncTime': Date.now()
            });
            return true;

          }

          set({'isLoading': false});
          return false;

        } catch (error) {

          logger.error('Data sync failed:', error as Error);
          set({
            'error': i18n.t('errors.dataSyncFailed'),
            'isLoading': false
          });
          return false;

        }

      },

      // Check if data is stale and needs refresh
      'isDataStale': () => {

        const state = get();
        if (!state.user || !state.company) {

          return true;

        }

        // Consider data stale after 5 minutes
        const lastUpdate = state.lastSyncTime;
        if (!lastUpdate) {

          return true;

        }

        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return lastUpdate < fiveMinutesAgo;

      },

      // Validation function
      'validateStoredData': () => {

        const state = get();
        const userValid = isValidUser(state.user);
        const companyValid = isValidCompany(state.company);

        // Log validation results for debugging
        log.debug('Data validation:', {
          userValid,
          companyValid,
          'hasUser': !!state.user,
          'hasCompany': !!state.company
        }, 'STORE');

        if (!userValid || !companyValid) {

          // Clear invalid data
          set({
            'user': userValid ? state.user : null,
            'company': companyValid ? state.company : null,
            'isInitialized': true,
            'hydrationComplete': true
          });
          return false;

        }

        return true;

      },

      // Simplified and improved initialization function
      'initializeApp': async () => {

        set({'isLoading': true, 'error': null});

        try {

          // Wait for hydration to complete
          await new Promise(resolve => setTimeout(resolve, 100));

          const state = get();
          const isValid = state.validateStoredData();

          if (isValid && state.user && !state.isDataStale()) {

            // Data is valid and fresh - no need to sync
            log.info('✅ App initialized with valid cached data', null, 'STORE');

          } else {

            // Need to load/sync data from API
            const syncSuccess = await state.syncData();
            if (!syncSuccess) {

              log.warn('⚠️ Failed to sync data during initialization', null, 'STORE');

            }

          }

          set({
            'isInitialized': true,
            'hydrationComplete': true,
            'isLoading': false
          });

          log.info('✅ App initialization completed', null, 'STORE');

        } catch (error) {

          log.error('❌ Error during app initialization:', error, 'STORE');
          set({
            'error': i18n.t('errors.appInitFailed'),
            'isLoading': false,
            'isInitialized': true,
            'hydrationComplete': true
          });

        }

      },

      // Simplified refresh function
      'refreshData': async () => {

        const state = get();
        if (!state.user) {

          return;

        }

        try {

          const syncSuccess = await state.syncData();
          if (syncSuccess) {

            log.info('✅ Data refreshed successfully', null, 'STORE');

          } else {

            log.warn('⚠️ Failed to refresh data', null, 'STORE');

          }

        } catch (error) {

          log.error('❌ Error refreshing data:', error, 'STORE');

        }

      },

      // Cleanup functions
      'cleanup': () => {

        const state = get();

        // Clear any ongoing operations
        set({
          'isLoading': false,
          'error': null
        });

        // Clear stale data
        state.clearStaleData();

        log.info('🧹 Store cleanup completed', null, 'STORE');

      },

      'clearStaleData': () => {

        const state = get();

        // Clear employees data as it's not persisted and can be stale
        if (state.employees.length > 0) {

          set({'employees': []});
          log.info('🗑️ Cleared stale employees data', null, 'STORE');

        }

        // Clear error state
        if (state.error) {

          set({'error': null});

        }

      }
    }),
    {
      'name': 'hrms-app-store', // unique name for localStorage
      'partialize': (state) => ({
        'theme': state.theme,
        'language': state.language
      }), // persist only non-sensitive UI preferences
      'onRehydrateStorage': () => (state) => {

        // Called when hydration starts
        if (state) {

          state.setHydrationComplete(true);

        }

      }
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useCompany = () => useAppStore((state) => state.company);
export const useEmployees = () => useAppStore((state) => state.employees);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useUserRole = () => useAppStore((state) => state.userRole);
export const useUserFullName = () => useAppStore((state) => state.userFullName);
export const useCompanyName = () => useAppStore((state) => state.companyName);
export const useTotalEmployees = () => useAppStore((state) => state.totalEmployees);
export const useActiveEmployees = () => useAppStore((state) => state.activeEmployees);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useIsInitialized = () => useAppStore((state) => state.isInitialized);
export const useHydrationComplete = () => useAppStore((state) => state.hydrationComplete);
export const useIsDataStale = () => useAppStore((state) => state.isDataStale());
export const useLastSyncTime = () => useAppStore((state) => state.lastSyncTime);
export const useAppTheme = () => useAppStore((state) => state.theme);
export const useAppLanguage = () => useAppStore((state) => state.language);

// New hooks for simplified API operations
export const useAPIOperations = () => useAppStore((state) => ({
  'syncData': state.syncData,
  'refreshData': state.refreshData,
  'isDataStale': state.isDataStale
}));

// Action hooks
export const useAuthActions = () => useAppStore((state) => ({
  'setUser': state.setUser,
  'setCompany': state.setCompany,
  'setEmployees': state.setEmployees,
  'login': state.login,
  'logout': state.logout,
  'updateUser': state.updateUser,
  'updateCompany': state.updateCompany,
  'reset': state.reset,
  'validateStoredData': state.validateStoredData,
  'initializeApp': state.initializeApp,
  'syncData': state.syncData,
  'refreshData': state.refreshData,
  'isDataStale': state.isDataStale
}));

export const useAppActions = () => useAppStore((state) => ({
  'setLoading': state.setLoading,
  'setError': state.setError,
  'clearError': state.clearError,
  'setInitialized': state.setInitialized,
  'setHydrationComplete': state.setHydrationComplete,
  'setLastSyncTime': state.setLastSyncTime,
  'cleanup': state.cleanup,
  'clearStaleData': state.clearStaleData
}));

export const useEmployeeActions = () => useAppStore((state) => ({
  'updateEmployee': state.updateEmployee,
  'archiveEmployee': state.archiveEmployee
}));

export const useCompanyActions = () => useAppStore((state) => ({
  'getCompanyStats': state.getCompanyStats
}));
