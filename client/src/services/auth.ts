import {ApiService} from './api';
import {
  AUTH_ENDPOINTS,
  AuthUtils,
  type User,
  type Company,
  type AuthResponse,
  type LoginCredentials
} from '../lib/authUtils';

// Re-export shared auth-related types for downstream consumers
export type { User, Company, AuthResponse, LoginCredentials } from '../lib/authUtils';

// Local interface duplicates removed; using shared types from '../lib/authUtils'

export class AuthService {

  /**
   * Login with unified endpoint
   */
  static async login (credentials: LoginCredentials): Promise<AuthResponse> {

    return ApiService.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);

  }

  /**
   * Logout using unified endpoint
   */
  static async logout (): Promise<void> {

    return ApiService.post(AUTH_ENDPOINTS.LOGOUT);

  }

  /**
   * Get current user using unified endpoint - this is the primary method
   */
  static async getCurrentUser (companyId?: string): Promise<User> {

    const endpoint = AuthUtils.getUserEndpoint(companyId);
    const rawUser = await ApiService.get<unknown>(endpoint);

    // Validate and create unified user object
    if (!AuthUtils.isValidUser(rawUser)) {

      throw new Error('Invalid user data received from server');

    }

    return AuthUtils.createUnifiedUser(rawUser as unknown as Record<string, unknown>);

  }

  /**
   * Get user with company context - alias for getCurrentUser
   */
  static async getUser (companyId?: string): Promise<User> {

    return this.getCurrentUser(companyId);

  }

  /**
   * Refresh authentication token
   */
  static async refreshToken (): Promise<{ token: string }> {

    return ApiService.post<{ token: string }>(AUTH_ENDPOINTS.REFRESH);

  }

  /**
   * Change user password
   */
  static async changePassword (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {

    return ApiService.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);

  }

  /**
   * Update user profile
   */
  static async updateProfile (data: Partial<User>): Promise<User> {

    const updatedUser = await ApiService.put<unknown>(AUTH_ENDPOINTS.UPDATE_PROFILE, data);
    return AuthUtils.createUnifiedUser(updatedUser as Record<string, unknown>);

  }

  /**
   * Switch to different company
   */
  static async switchCompany (companyId: string): Promise<AuthResponse> {

    return ApiService.post<AuthResponse>(AUTH_ENDPOINTS.SWITCH_COMPANY, {companyId});

  }

  /**
   * Get user's companies
   */
  static async getUserCompanies (): Promise<Company[]> {

    return ApiService.get<Company[]>(AUTH_ENDPOINTS.USER_COMPANIES);

  }

  /**
   * Get user permissions
   */
  static async getUserPermissions (companyId?: string): Promise<string[]> {

    const endpoint = companyId
      ? `${AUTH_ENDPOINTS.USER_PERMISSIONS}?companyId=${companyId}`
      : AUTH_ENDPOINTS.USER_PERMISSIONS;
    return ApiService.get<string[]>(endpoint);

  }

  /**
   * Get user roles
   */
  static async getUserRoles (companyId?: string): Promise<string[]> {

    const endpoint = companyId
      ? `${AUTH_ENDPOINTS.USER_ROLES}?companyId=${companyId}`
      : AUTH_ENDPOINTS.USER_ROLES;
    return ApiService.get<string[]>(endpoint);

  }

  /**
   * Request password reset
   */
  static async forgotPassword (email: string): Promise<void> {

    return ApiService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {email});

  }

  /**
   * Reset password with token
   */
  static async resetPassword (token: string, newPassword: string): Promise<void> {

    return ApiService.post(AUTH_ENDPOINTS.RESET_PASSWORD, {token, newPassword});

  }

  /**
   * Verify email address
   */
  static async verifyEmail (token: string): Promise<void> {

    return ApiService.post(AUTH_ENDPOINTS.VERIFY_EMAIL, {token});

  }

  /**
   * Register new user
   */
  static async register (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId?: string;
  }): Promise<AuthResponse> {

    return ApiService.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);

  }

  /**
   * Check if user is authenticated using unified endpoint
   */
  static async checkAuth (): Promise<boolean> {

    try {

      await this.getCurrentUser();
      return true;

    } catch {

      return false;

    }

  }

  /**
   * Get session information using unified endpoint
   */
  static async getSession (): Promise<{ user: User; company: Company | null }> {

    const user = await this.getCurrentUser();
    const currentCompany = AuthUtils.getCurrentCompany(user);
    return {user, 'company': currentCompany};

  }

  /**
   * Get user with full company context
   */
  static async getUserWithCompany (companyId?: string): Promise<{
   user: User; company: Company | null 
}> {
  

    const user = await this.getCurrentUser(companyId);
    const company = AuthUtils.getCurrentCompany(user, companyId);
    return {user, company};

  }

  /**
   * Validate user permissions for specific company
   */
  static async validateCompanyAccess (userId: string, companyId: string): Promise<boolean> {

    try {

      const user = await this.getCurrentUser(companyId);
      return AuthUtils.canAccessCompany(user, companyId);

    } catch {

      return false;

    }

  }

  /**
   * Get user's effective permissions for current context
   */
  static async getEffectivePermissions (companyId?: string): Promise<string[]> {

    const user = await this.getCurrentUser(companyId);
    return AuthUtils.getEffectivePermissions(user, companyId);

  }

}
