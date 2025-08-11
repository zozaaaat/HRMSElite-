import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../../../shared/types/user';
import { logger } from '@utils/logger';


// Interface for current user state
interface CurrentUserState {
  id: string | null;
  role: UserRole | null;
  companyId: string | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Interface for user store actions
interface UserStoreActions {
  // Actions
  setUser: (user: { id: string; role: UserRole; companyId: string; token: string }) => void;
  setToken: (token: string) => void;
  updateUser: (updates: Partial<{ id: string; role: UserRole; companyId: string }>) => void;
  logout: () => void;
  clearUser: () => void;
}

// Combined interface for the store
interface UserStore extends CurrentUserState, UserStoreActions {}

// Validation functions
const isValidUserData = (data: unknown): data is {
   id: string; role: UserRole; companyId: string; token: string 
} => {
  
  return data && 
         typeof data === 'object' && 
         data !== null &&
         'id' in data &&
         'role' in data &&
         'companyId' in data &&
         'token' in data &&
         typeof (data as any).id === 'string' && 
         typeof (data as any).role === 'string' &&
         typeof (data as any).companyId === 'string' &&
         typeof (data as any).token === 'string' &&
         (data as any).id.trim() !== '' &&
         (data as any).companyId.trim() !== '' &&
         (data as any).token.trim() !== '';
};

const isValidToken = (token: unknown): token is string => {
  return typeof token === 'string' && token.trim() !== '';
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      id: null,
      role: null,
      companyId: null,
      token: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) => {
        if (isValidUserData(user)) {
          set({
            id: user.id,
            role: user.role,
            companyId: user.companyId,
            token: user.token,
            isAuthenticated: true,
          });
        } else {
          logger.error('Invalid user data provided to setUser');
        }
      },

      setToken: (token) => {
        if (isValidToken(token)) {
          set({ token, isAuthenticated: true });
        } else {
          logger.error('Invalid token provided to setToken');
        }
      },

      updateUser: (updates) => {
        const currentState = get();
        const newState = { ...currentState, ...updates };
        
        // Validate the updated state
        if (newState.id && newState.role && newState.companyId && newState.token) {
          set(newState);
        } else {
          logger.error('Invalid user data in updateUser');
        }
      },

      logout: () => {
        set({
          id: null,
          role: null,
          companyId: null,
          token: null,
          isAuthenticated: false,
        });
      },

      clearUser: () => {
        set({
          id: null,
          role: null,
          companyId: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'user-store', // unique name for localStorage key
      partialize: (state) => ({
        id: state.id,
        role: state.role,
        companyId: state.companyId,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Validate stored data on rehydration
        if (state) {
          const isValid = state.id && state.role && state.companyId && state.token;
          if (!isValid) {
            logger.warn('Invalid stored user data detected, clearing...');
            state.clearUser();
          }
        }
      },
    }
  )
);

// Convenience hooks for accessing specific parts of the store
export const useCurrentUserId = () => useUserStore((state) => state.id);
export const useCurrentUserRole = () => useUserStore((state) => state.role);
export const useCurrentUserCompanyId = () => useUserStore((state) => state.companyId);
export const useCurrentUserToken = () => useUserStore((state) => state.token);
export const useIsUserAuthenticated = () => useUserStore((state) => state.isAuthenticated);

// Hook for user actions
export const useUserActions = () => useUserStore((state) => ({
  setUser: state.setUser,
  setToken: state.setToken,
  updateUser: state.updateUser,
  logout: state.logout,
  clearUser: state.clearUser,
}));

// Hook for complete user state and actions
export const useUserStoreComplete = () => useUserStore((state) => ({
  // State
  id: state.id,
  role: state.role,
  companyId: state.companyId,
  token: state.token,
  isAuthenticated: state.isAuthenticated,
  // Actions
  setUser: state.setUser,
  setToken: state.setToken,
  updateUser: state.updateUser,
  logout: state.logout,
  clearUser: state.clearUser,
})); 