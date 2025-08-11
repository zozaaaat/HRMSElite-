# توحيد المصادقة - Unified Authentication Implementation

## نظرة عامة - Overview

تم تنفيذ نظام مصادقة موحد ومتكامل في النظام، حيث يتم استخدام نقطة نهاية موحدة `/api/auth/user` كالنقطة الأساسية لجميع عمليات المستخدم.

## النقاط النهائية الموحدة - Unified Endpoints

### تعريف AUTH_ENDPOINTS في authUtils.ts

```typescript
// client/src/lib/authUtils.ts
export const AUTH_ENDPOINTS = {
  // النقطة الأساسية الموحدة - Primary unified endpoint
  USER: '/api/auth/user',
  
  // نقاط المصادقة - Authentication endpoints
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/user', // توجيه إلى النقطة الموحدة
  
  // إدارة الجلسة - Session management
  SESSION: '/api/auth/session',
  REFRESH: '/api/auth/refresh',
  
  // إدارة كلمة المرور - Password management
  CHANGE_PASSWORD: '/api/auth/change-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  
  // إدارة المستخدم - User management
  REGISTER: '/api/auth/register',
  UPDATE_PROFILE: '/api/auth/update-profile',
  VERIFY_EMAIL: '/api/auth/verify-email',
  
  // نقاط الشركة - Company-specific endpoints
  USER_COMPANIES: '/api/auth/user/companies',
  SWITCH_COMPANY: '/api/auth/switch-company',
  
  // الصلاحيات والأدوار - Permissions and roles
  USER_PERMISSIONS: '/api/auth/user/permissions',
  USER_ROLES: '/api/auth/user/roles'
} as const;
```

## النقطة النهائية الموحدة الأساسية - Primary Unified Endpoint

### الخادم - Server Side

```typescript
// server/routes/auth-routes.ts
/**
 * Unified User Endpoint - Primary endpoint for all user operations
 * GET /api/auth/user
 * Returns current user with company context
 */
router.get('/user', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const companyId = req.query.companyId as string;
    
    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user's companies and roles
    const userCompanies = await storage.getUserCompanies(userId);
    
    // If companyId is specified, filter to that company
    let currentCompany = null;
    if (companyId) {
      currentCompany = userCompanies.find(company => company.id === companyId);
      if (!currentCompany) {
        return res.status(403).json({ message: "No access to specified company" });
      }
    }
    
    // Get user permissions for current company
    const permissions = companyId 
      ? await storage.getUserPermissions(userId, companyId)
      : await storage.getUserPermissions(userId);
    
    // Create unified user response
    const response = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companies: userCompanies,
      permissions: permissions,
      companyId: currentCompany?.id || user.companyId,
      currentCompany: currentCompany,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      profileImageUrl: user.profileImageUrl,
      sub: user.id,
      claims: user.claims || null
    };
    
    res.json(response);
  } catch (error) {
    log.error("Error fetching user:", error, 'AUTH');
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
```

### العميل - Client Side

```typescript
// client/src/services/auth.ts
/**
 * Get current user using unified endpoint - this is the primary method
 */
static async getCurrentUser(companyId?: string): Promise<User> {
  const endpoint = AuthUtils.getUserEndpoint(companyId);
  const userData = await ApiService.get<User>(endpoint);
  
  // Validate and create unified user object
  if (!AuthUtils.isValidUser(userData)) {
    throw new Error('Invalid user data received from server');
  }
  
  return AuthUtils.createUnifiedUser(userData);
}

/**
 * Get user with company context - alias for getCurrentUser
 */
static async getUser(companyId?: string): Promise<User> {
  return this.getCurrentUser(companyId);
}
```

## أدوات المصادقة الموحدة - Unified Authentication Utilities

### AuthUtils Class

```typescript
// client/src/lib/authUtils.ts
export class AuthUtils {
  /**
   * Get the unified user endpoint with optional company context
   * This is the primary method for all user-related operations
   */
  static getUserEndpoint(companyId?: string): string {
    return companyId ? `${AUTH_ENDPOINTS.USER}?companyId=${companyId}` : AUTH_ENDPOINTS.USER;
  }

  /**
   * Create unified user object from various sources
   */
  static createUnifiedUser(userData: any): User {
    return {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      companies: userData.companies || [],
      permissions: userData.permissions || [],
      companyId: userData.companyId,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: userData.lastLoginAt,
      isActive: userData.isActive ?? true,
      emailVerified: userData.emailVerified ?? false,
      profileImageUrl: userData.profileImageUrl,
      sub: userData.sub || userData.id,
      claims: userData.claims || null
    };
  }

  /**
   * Validate user data structure
   */
  static isValidUser(user: any): user is User {
    return user && 
           typeof user.id === 'string' &&
           typeof user.email === 'string' &&
           typeof user.firstName === 'string' &&
           typeof user.lastName === 'string' &&
           typeof user.role === 'string' &&
           Array.isArray(user.companies) &&
           Array.isArray(user.permissions);
  }

  /**
   * Get current company from user data
   */
  static getCurrentCompany(user: User, companyId?: string): Company | null {
    if (!companyId) {
      return user.companies.find(c => c.id === user.companyId) || user.companies[0] || null;
    }
    return user.companies.find(c => c.id === companyId) || null;
  }

  /**
   * Get user's effective permissions for current company
   */
  static getEffectivePermissions(user: User, companyId?: string): string[] {
    if (!companyId) {
      return user.permissions;
    }
    
    const company = user.companies.find(c => c.id === companyId);
    return company?.userPermissions || user.permissions;
  }

  /**
   * Check if user can access specific company
   */
  static canAccessCompany(user: User, companyId: string): boolean {
    return user.companies.some(company => company.id === companyId);
  }
}
```

## Hook المصادقة الموحد - Unified Authentication Hook

```typescript
// client/src/hooks/useAuth.ts
export const useAuth = () => {
  // State
  const user = useCurrentUser();
  const currentCompany = useCurrentCompany();
  const permissions = useUserPermissions();
  const isAuthenticated = useIsUserAuthenticated();
  const loading = useUserLoading();
  const error = useUserError();

  // Actions
  const login = useCallback(async (credentials: { username: string; password: string; companyId?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AuthService.login(credentials);
      
      if (response.success && response.user) {
        const unifiedUser = AuthUtils.createUnifiedUser(response.user);
        setUser(unifiedUser);
        
        // Set token if provided
        if (response.token) {
          setToken(response.token);
        }
        
        return { success: true, user: unifiedUser };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, setLoading, setError]);

  /**
   * Get current user with unified endpoint
   */
  const getCurrentUser = useCallback(async (companyId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await AuthService.getCurrentUser(companyId);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  // Permission checks
  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions]);

  const hasAllPermissions = useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, [permissions]);

  return {
    // State
    user,
    currentCompany,
    permissions,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    login,
    logout,
    getCurrentUser,
    switchCompany,
    updateProfile,
    checkAuth,
    initializeAuth,
    getPermissions,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role checks
    isSuperAdmin,
    isCompanyManager,
    
    // Utility functions
    getUserFullName,
    canAccessCompany,
    getUserRoleForCompany,
  };
};
```

## متجر المستخدم الموحد - Unified User Store

```typescript
// client/src/stores/useUserStore.ts
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      id: null,
      role: null,
      companyId: null,
      token: null,
      isAuthenticated: false,
      user: null,
      currentCompany: null,
      permissions: [],
      loading: false,
      error: null,

      // Actions
      setUser: (user) => {
        if (AuthUtils.isValidUser(user)) {
          const currentCompany = AuthUtils.getCurrentCompany(user);
          set({
            id: user.id,
            role: user.role as UserRole,
            companyId: user.companyId || currentCompany?.id || null,
            token: user.token || get().token,
            isAuthenticated: true,
            user: user,
            currentCompany: currentCompany,
            permissions: user.permissions,
            loading: false,
            error: null
          });
        } else {
          console.error('Invalid user data provided to setUser');
          set({ error: 'Invalid user data', loading: false });
        }
      },

      initializeFromSession: (userData) => {
        if (isValidUserData(userData)) {
          const user = AuthUtils.createUnifiedUser(userData);
          const currentCompany = AuthUtils.getCurrentCompany(user);
          set({
            id: user.id,
            role: user.role as UserRole,
            companyId: user.companyId || currentCompany?.id || null,
            token: user.token || get().token,
            isAuthenticated: true,
            user: user,
            currentCompany: currentCompany,
            permissions: user.permissions,
            loading: false,
            error: null
          });
        } else {
          console.error('Invalid session data');
          set({ error: 'Invalid session data', loading: false });
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        id: state.id,
        role: state.role,
        companyId: state.companyId,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        currentCompany: state.currentCompany,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        // Validate stored data on rehydration
        if (state) {
          const isValid = state.id && state.role && state.user;
          if (!isValid) {
            state.clearUser();
          }
        }
      },
    }
  )
);
```

## استخدام النقطة الموحدة - Using the Unified Endpoint

### مثال على الاستخدام - Usage Example

```typescript
// في أي مكون React - In any React component
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { 
    user, 
    currentCompany, 
    permissions, 
    isAuthenticated, 
    loading,
    getCurrentUser,
    hasPermission 
  } = useAuth();

  useEffect(() => {
    // الحصول على المستخدم الحالي مع سياق الشركة
    // Get current user with company context
    if (isAuthenticated) {
      getCurrentUser(currentCompany?.id);
    }
  }, [isAuthenticated, currentCompany]);

  // التحقق من الصلاحيات
  // Check permissions
  const canManageEmployees = hasPermission('manage_employees');

  return (
    <div>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div>
          <h1>مرحباً {user?.firstName}</h1>
          <p>الشركة: {currentCompany?.name}</p>
          <p>الدور: {user?.role}</p>
          {canManageEmployees && (
            <button>إدارة الموظفين</button>
          )}
        </div>
      )}
    </div>
  );
};
```

## المزايا - Benefits

### 1. نقطة نهاية موحدة - Unified Endpoint
- استخدام `/api/auth/user` كالنقطة الأساسية لجميع عمليات المستخدم
- دعم سياق الشركة عبر معامل `companyId`
- استجابة موحدة تحتوي على جميع بيانات المستخدم والصلاحيات

### 2. إدارة الحالة الموحدة - Unified State Management
- متجر Zustand موحد لإدارة حالة المستخدم
- تخزين محلي آمن مع التحقق من صحة البيانات
- إعادة تهيئة تلقائية من الجلسة

### 3. أدوات مساعدة موحدة - Unified Utilities
- فئة `AuthUtils` للعمليات المشتركة
- التحقق من صحة البيانات
- إدارة الصلاحيات والأدوار

### 4. Hook موحد - Unified Hook
- `useAuth` يوفر واجهة موحدة للمصادقة
- إدارة الحالة والعمليات في مكان واحد
- دعم التحقق من الصلاحيات

## الخلاصة - Summary

تم تنفيذ نظام مصادقة موحد ومتكامل بنجاح، حيث:

1. **النقطة النهائية الموحدة**: `/api/auth/user` هي النقطة الأساسية لجميع عمليات المستخدم
2. **إدارة الحالة الموحدة**: متجر Zustand موحد مع تخزين محلي آمن
3. **الأدوات المساعدة الموحدة**: فئة `AuthUtils` للعمليات المشتركة
4. **Hook الموحد**: `useAuth` يوفر واجهة موحدة للمصادقة
5. **دعم الشركات المتعددة**: إدارة سياق الشركة عبر معامل `companyId`

النظام جاهز للاستخدام ويوفر تجربة مصادقة موحدة ومتسقة عبر جميع أجزاء التطبيق. 