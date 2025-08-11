import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {User} from '../../../shared/schema';
import {logger} from '../lib/logger';

// Interface for current user state
interface CurrentUserState {
  id: string | null;
  role: string | null;
  companyId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
}

// Interface for user store actions
interface UserStoreActions {
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  setPermissions: (permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearUser: () => void;
  initializeFromSession: (userData: unknown) => void;
}

// Combined interface for the store
interface UserStore extends CurrentUserState, UserStoreActions {}

// Validation functions
const isRecordObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isValidUserData = (data: unknown): data is User => {
  if (!isRecordObject(data)) return false;
  const hasId = typeof data.id === 'string' && data.id.trim() !== '';
  const hasRole = typeof data.role === 'string';
  const hasEmail = typeof data.email === 'string';
  const hasFirst = typeof data.firstName === 'string';
  const hasLast = typeof data.lastName === 'string';
  return hasId && hasRole && hasEmail && hasFirst && hasLast;
};

const isValidToken = (token: unknown): token is string => {
  return typeof token === 'string' && token.trim() !== '';
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      'id': null,
      'role': null,
      'companyId': null,
      'token': null,
      'isAuthenticated': false,
      'user': null,
      'permissions': [],
      'loading': false,
      'error': null,

      // Actions
      'setUser': (user) => {
        if (isValidUserData(user)) {
          // Parse permissions from string to array
          let permissions: string[] = [];
          try {
            permissions = JSON.parse(user.permissions || '[]');
          } catch {
            permissions = [];
          }

          set({
            'id': user.id,
            'role': user.role,
            'companyId': user.companyId ?? null,
            'token': get().token,
            'isAuthenticated': true,
            user,
            'permissions': permissions,
            'loading': false,
            'error': null
          });
        } else {
          logger.error('Invalid user data provided to setUser');
          set({'error': 'Invalid user data', 'loading': false});
        }
      },

      'setToken': (token) => {
        if (isValidToken(token)) {
          set({token, 'isAuthenticated': true});
        } else {
          logger.error('Invalid token provided to setToken');
          set({'error': 'Invalid token', 'loading': false});
        }
      },

      'updateUser': (updates) => {
        const currentState = get();
        if (!currentState.user) {
          logger.error('No user to update');
          return;
        }

        const updatedUser = {...currentState.user, ...updates};
        if (isValidUserData(updatedUser)) {
          // Parse permissions from string to array
          let permissions: string[] = [];
          try {
            permissions = JSON.parse(updatedUser.permissions || '[]');
          } catch {
            permissions = [];
          }

          set({
            'user': updatedUser,
            'id': updatedUser.id,
            'role': updatedUser.role,
            'companyId': updatedUser.companyId ?? null,
            'permissions': permissions
          });
        } else {
          logger.error('Invalid user data in updateUser');
          set({'error': 'Invalid user data', 'loading': false});
        }
      },

      'setPermissions': (permissions) => {
        set({permissions});
      },

      'setLoading': (loading) => {
        set({loading});
      },

      'setError': (error) => {
        set({error, 'loading': false});
      },

      'logout': () => {
        set({
          'id': null,
          'role': null,
          'companyId': null,
          'token': null,
          'isAuthenticated': false,
          'user': null,
          'permissions': [],
          'loading': false,
          'error': null
        });
      },

      'clearUser': () => {
        set({
          'id': null,
          'role': null,
          'companyId': null,
          'token': null,
          'isAuthenticated': false,
          'user': null,
          'permissions': [],
          'loading': false,
          'error': null
        });
      },

      'initializeFromSession': (userData) => {
        if (isValidUserData(userData)) {
          const user = userData as User;
          // Parse permissions from string to array
          let permissions: string[] = [];
          try {
            permissions = JSON.parse(user.permissions || '[]');
          } catch {
            permissions = [];
          }

          set({
            'id': user.id,
            'role': user.role,
            'companyId': user.companyId ?? null,
            'token': get().token,
            'isAuthenticated': true,
            user,
            'permissions': permissions,
            'loading': false,
            'error': null
          });
        } else {
          logger.error('Invalid session data');
          set({'error': 'Invalid session data', 'loading': false});
        }
      }
    }),
    {
      'name': 'user-store', // unique name for localStorage key
      'partialize': (state) => ({
        'id': state.id,
        'role': state.role,
        'companyId': state.companyId,
        'token': state.token,
        'isAuthenticated': state.isAuthenticated,
        'user': state.user,
        'permissions': state.permissions
      }),
      'onRehydrateStorage': () => (state) => {
        // Validate stored data on rehydration
        if (state) {
          const isValid = state.id && state.role && state.user;
          if (!isValid) {
            state.clearUser();
          }
        }
      }
    }
  )
);

// Convenience hooks for accessing specific parts of the store
export const useCurrentUserId = () => useUserStore((state) => state.id);
export const useCurrentUserRole = () => useUserStore((state) => state.role);
export const useCurrentUserCompanyId = () => useUserStore((state) => state.companyId);
export const useCurrentUserToken = () => useUserStore((state) => state.token);
export const useIsUserAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useCurrentUser = () => useUserStore((state) => state.user);
export const useUserPermissions = () => useUserStore((state) => state.permissions);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);

// Hook for user actions
export const useUserActions = () => useUserStore((state) => ({
  'setUser': state.setUser,
  'setToken': state.setToken,
  'updateUser': state.updateUser,
  'setPermissions': state.setPermissions,
  'setLoading': state.setLoading,
  'setError': state.setError,
  'logout': state.logout,
  'clearUser': state.clearUser,
  'initializeFromSession': state.initializeFromSession
}));

// Hook for complete user state and actions
export const useUserStoreComplete = () => useUserStore((state) => ({
  // State
  'id': state.id,
  'role': state.role,
  'companyId': state.companyId,
  'token': state.token,
  'isAuthenticated': state.isAuthenticated,
  'user': state.user,
  'permissions': state.permissions,
  'loading': state.loading,
  'error': state.error,
  // Actions
  'setUser': state.setUser,
  'setToken': state.setToken,
  'updateUser': state.updateUser,
  'setPermissions': state.setPermissions,
  'setLoading': state.setLoading,
  'setError': state.setError,
  'logout': state.logout,
  'clearUser': state.clearUser,
  'initializeFromSession': state.initializeFromSession
}));

// Utility hooks for common operations
export const useHasPermission = (permission: string) => {
  const permissions = useUserPermissions();
  return permissions.includes(permission);
};

export const useHasAnyPermission = (requiredPermissions: string[]) => {
  const permissions = useUserPermissions();
  return requiredPermissions.some(permission => permissions.includes(permission));
};

export const useHasAllPermissions = (requiredPermissions: string[]) => {
  const permissions = useUserPermissions();
  return requiredPermissions.every(permission => permissions.includes(permission));
};

export const useIsSuperAdmin = () => {
  const role = useCurrentUserRole();
  return role === 'super_admin';
};

export const useIsCompanyManager = () => {
  const role = useCurrentUserRole();
  return role === 'company_manager';
};
