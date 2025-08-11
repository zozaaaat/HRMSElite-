export type UserRole = 'super_admin' | 'company_manager' | 'employee' | 'supervisor' | 'worker';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: UserRole;
  companyId?: string;
  permissions: string[];
  isActive: boolean;
  sub: string;
  claims: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  // Additional properties for enhanced user management
  phone?: string;
  address?: string;
  lastLoginAt?: Date;
  loginCount?: number;
  preferences?: Record<string, unknown>;
  timezone?: string;
  language?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastPasswordChange?: Date;
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;
}

export interface CreateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: UserRole;
  companyId?: string;
  permissions?: string[];
  isActive?: boolean;
  sub: string;
  claims?: Record<string, unknown> | null;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: UserRole;
  companyId?: string;
  permissions?: string[];
  isActive?: boolean;
  claims?: Record<string, unknown> | null;
}

export interface UserWithCompany extends User {
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

export interface UserWithDetails extends User {
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  permissions: string[];
  lastLoginAt?: Date;
  loginCount: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserFilters {
  role?: UserRole;
  companyId?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  search?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersByRole: Array<{
    role: UserRole;
    count: number;
  }>;
  recentLogins: number;
  lockedAccounts: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}
