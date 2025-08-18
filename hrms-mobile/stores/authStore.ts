import { create } from 'zustand';
import { api, endpoints, setAuthToken, clearAuthToken } from '../lib/api';
import { UserData, ErrorData } from '@shared/types/common';
import { AxiosResponse } from 'axios';

// Memoized API functions to prevent unnecessary re-renders
const memoizedApi = {
  post: (url: string, data: UserData | LoginData) => api.post(url, data),
};

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  companyId?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: AxiosResponse<AuthResponse> = await memoizedApi.post(endpoints.auth.login, {
        email,
        password,
      } as LoginData);
      
      const { user, token } = response.data || { user: null, token: '' };
      
      if (user && token) {
        setAuthToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: unknown) {
      const errorData = error as ErrorData;
      set({
        error: errorData.message ?? "Login failed",
        isLoading: false,
      });
    }
  },

  logout: () => {
    clearAuthToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: AxiosResponse<AuthResponse> = await memoizedApi.post(endpoints.auth.register, userData);
      
      const { user, token } = response.data || { user: null, token: '' };
      
      if (user && token) {
        setAuthToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: unknown) {
      const errorData = error as ErrorData;
      set({
        error: errorData.message ?? "Registration failed",
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  setToken: (token: string) => {
    setAuthToken(token);
    set({ token, isAuthenticated: true });
  },

  clearError: () => {
    set({ error: null });
  },
})); 