import { BaseService } from './BaseService';
import { User } from '../../lib/authUtils';

export interface LoginCredentials {
  username: string;
  password: string;
  companyId?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface SwitchCompanyResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Authentication Service - Single Responsibility Principle
 * Handles all authentication-related API calls
 */
export class AuthService extends BaseService {
  constructor() {
    super('/api/auth');
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      return await this.post<LoginResponse>('/login', credentials);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.post('/logout');
    } catch (error) {
      // Logout errors are handled silently
      console.warn('Logout error:', error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(companyId?: string): Promise<User> {
    try {
      const params = companyId ? { companyId } : undefined;
      return await this.get<User>('/me', params);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Switch company
   */
  async switchCompany(companyId: string): Promise<SwitchCompanyResponse> {
    try {
      return await this.post<SwitchCompanyResponse>('/switch-company', { companyId });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      return await this.put<User>('/profile', updates);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Check authentication status
   */
  async checkAuth(): Promise<boolean> {
    try {
      const response = await this.get<{ authenticated: boolean }>('/check');
      return response.authenticated;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshTokens(): Promise<{ success: boolean; message?: string }> {
    try {
      return await this.post<{ success: boolean; message?: string }>('/refresh');
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get session data
   */
  async getSession(): Promise<{ user?: User; company?: any }> {
    try {
      return await this.get<{ user?: User; company?: any }>('/session');
    } catch (error) {
      return {};
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(companyId?: string): Promise<string[]> {
    try {
      const params = companyId ? { companyId } : undefined;
      const response = await this.get<{ permissions: string[] }>('/permissions', params);
      return response.permissions;
    } catch (error) {
      return [];
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
