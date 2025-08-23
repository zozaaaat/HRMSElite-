import { create } from 'zustand';
import { logger } from '../lib/logger';
import { UserRole } from '../lib/routes';

// Define AppUser type locally since it's not in common types
type AppUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: string | null;
  permissions?: string | string[];
  companies?: Array<{
    id: string;
    name: string;
    role?: string;
    permissions?: string[];
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string | undefined;
  claims?: Record<string, unknown> | null;
  [k: string]: unknown;
};

interface CurrentUserState {
  id: string | null;
  role: UserRole | null;
  companyId: string | null;
  isAuthenticated: boolean;
  user: AppUser | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  currentCompany: any | null;
}

interface CurrentUserActions {
  setUser: (user: AppUser) => void;
  updateUser: (updates: Partial<AppUser>) => void;
  logout: () => void;
  clearUser: () => void;
  initializeFromSession: (userData: any) => void;
}

type UserStore = CurrentUserState & CurrentUserActions;

// Validation functions
const isValidUserData = (user: any): user is AppUser => {
  return user && 
         typeof user === 'object' && 
         typeof user.id === 'string' && 
         user.id.trim() !== '' &&
         typeof user.role === 'string' && 
         user.role.trim() !== '';
};

export const useUserStore = create<UserStore>()(
  (set, get) => ({
    // Initial state
    'id': null,
    'role': null,
    'companyId': null,
    'isAuthenticated': false,
    'user': null,
    'permissions': [],
    'loading': false,
    'error': null,
    'currentCompany': null,

    // Actions
    'setUser': (user) => {
      if (isValidUserData(user)) {
        // Parse permissions from string to array
        let permissions: string[] = [];
        try {
          if (typeof user.permissions === 'string') {
            permissions = JSON.parse(user.permissions || '[]');
          } else if (Array.isArray(user.permissions)) {
            permissions = user.permissions;
          }
        } catch {
          permissions = [];
        }

        set({
          'id': user.id,
          'role': user.role as UserRole,
          'companyId': user.companyId ?? null,
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

    'updateUser': (updates) => {
      const currentState = get();
      if (currentState.user) {
        const updatedUser = { ...currentState.user, ...updates };
        set({ user: updatedUser });
      }
    },

    'logout': () => {
      set({
        'id': null,
        'role': null,
        'companyId': null,
        'isAuthenticated': false,
        'user': null,
        'permissions': [],
        'loading': false,
        'error': null,
        'currentCompany': null
      });
    },

    'clearUser': () => {
      set({
        'id': null,
        'role': null,
        'companyId': null,
        'isAuthenticated': false,
        'user': null,
        'permissions': [],
        'loading': false,
        'error': null,
        'currentCompany': null
      });
    },

    'initializeFromSession': (userData) => {
      // Apply a simple conversion if needed
      set({ user: (userData || null) as AppUser });
    }
  })
);

// Convenience hooks for accessing specific parts of the store
export const useCurrentUserId = () => useUserStore((state) => state.id);
export const useCurrentUserRole = () => useUserStore((state) => state.role);
export const useCurrentUserCompanyId = () => useUserStore((state) => state.companyId);
export const useIsUserAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useCurrentUser = () => useUserStore((state) => state.user);
export const useCurrentUserPermissions = () => useUserStore((state) => state.permissions);
export const useUserPermissions = useCurrentUserPermissions;
export const useCurrentCompany = () => useUserStore((state) => state.currentCompany);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);

// Action hooks
export const useUserActions = () => useUserStore((state) => ({
  setUser: state.setUser,
  updateUser: state.updateUser,
  logout: state.logout,
  clearUser: state.clearUser,
  initializeFromSession: state.initializeFromSession
}));
