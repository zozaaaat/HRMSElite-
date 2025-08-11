# دليل استخدام نظام المصادقة الموحد - Authentication Usage Guide

## نظرة عامة - Overview

هذا الدليل يوضح كيفية استخدام نظام المصادقة الموحد في التطبيق العملي.

## 1. تسجيل الدخول - Login

### استخدام Hook المصادقة - Using Auth Hook

```typescript
// client/src/pages/login.tsx
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    companyId: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login(credentials);
    
    if (result.success) {
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } else {
      // Error is handled by the hook
      console.error('Login failed:', result.error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="اسم المستخدم"
        value={credentials.username}
        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={credentials.password}
        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
      />
      <select
        value={credentials.companyId}
        onChange={(e) => setCredentials(prev => ({ ...prev, companyId: e.target.value }))}
      >
        <option value="">اختر الشركة</option>
        <option value="company-1">شركة 1</option>
        <option value="company-2">شركة 2</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### استخدام الخدمة مباشرة - Direct Service Usage

```typescript
// client/src/services/auth.ts
import { AuthService } from './auth';

// Login with company context
const loginWithCompany = async (username: string, password: string, companyId: string) => {
  try {
    const response = await AuthService.login({
      username,
      password,
      companyId
    });
    
    if (response.success) {
      // Get user with company context
      const user = await AuthService.getCurrentUser(companyId);
      return { success: true, user };
    }
    
    return { success: false, error: response.message };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};
```

## 2. التحقق من الصلاحيات - Permission Checks

### في المكونات - In Components

```typescript
// client/src/components/EmployeeManagement.tsx
import { useAuth } from '../hooks/useAuth';

const EmployeeManagement = () => {
  const { 
    user, 
    currentCompany, 
    hasPermission, 
    hasAnyPermission,
    hasAllPermissions 
  } = useAuth();

  // Check specific permission
  const canManageEmployees = hasPermission('manage_employees');
  
  // Check any of multiple permissions
  const canViewReports = hasAnyPermission(['view_reports', 'generate_reports']);
  
  // Check all permissions
  const canFullAccess = hasAllPermissions(['manage_employees', 'manage_payroll']);

  if (!canManageEmployees) {
    return <div>ليس لديك صلاحية لإدارة الموظفين</div>;
  }

  return (
    <div>
      <h1>إدارة الموظفين - {currentCompany?.name}</h1>
      
      {canViewReports && (
        <button>عرض التقارير</button>
      )}
      
      {canFullAccess && (
        <div>
          <button>إضافة موظف جديد</button>
          <button>إدارة المرتبات</button>
        </div>
      )}
    </div>
  );
};
```

### في Hooks مخصصة - In Custom Hooks

```typescript
// client/src/hooks/usePermissions.ts
import { useAuth } from './useAuth';
import { PERMISSIONS } from '../lib/authUtils';

export const useEmployeePermissions = () => {
  const { hasPermission, hasAnyPermission } = useAuth();

  return {
    canViewEmployees: hasPermission(PERMISSIONS.VIEW_EMPLOYEES),
    canManageEmployees: hasPermission(PERMISSIONS.MANAGE_EMPLOYEES),
    canManagePayroll: hasPermission(PERMISSIONS.MANAGE_PAYROLL),
    canViewPayroll: hasPermission(PERMISSIONS.VIEW_PAYROLL),
    canManageLeave: hasPermission(PERMISSIONS.MANAGE_LEAVE_REQUESTS),
    canViewLeave: hasPermission(PERMISSIONS.VIEW_LEAVE_REQUESTS),
    
    // Combined permissions
    canManageHR: hasAnyPermission([
      PERMISSIONS.MANAGE_EMPLOYEES,
      PERMISSIONS.MANAGE_LEAVE_REQUESTS,
      PERMISSIONS.MANAGE_PAYROLL
    ]),
    
    canViewHR: hasAnyPermission([
      PERMISSIONS.VIEW_EMPLOYEES,
      PERMISSIONS.VIEW_LEAVE_REQUESTS,
      PERMISSIONS.VIEW_PAYROLL
    ])
  };
};
```

## 3. تبديل الشركة - Company Switching

```typescript
// client/src/components/CompanySwitcher.tsx
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const CompanySwitcher = () => {
  const { user, currentCompany, switchCompany, loading } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompany?.id || '');

  const handleCompanySwitch = async () => {
    if (!selectedCompanyId) return;
    
    const result = await switchCompany(selectedCompanyId);
    
    if (result.success) {
      // Company switched successfully
      console.log('Switched to company:', result.user.currentCompany);
    } else {
      console.error('Failed to switch company:', result.error);
    }
  };

  return (
    <div>
      <h3>تبديل الشركة</h3>
      
      <select
        value={selectedCompanyId}
        onChange={(e) => setSelectedCompanyId(e.target.value)}
      >
        <option value="">اختر الشركة</option>
        {user?.companies.map(company => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
      
      <button 
        onClick={handleCompanySwitch}
        disabled={loading || !selectedCompanyId}
      >
        {loading ? 'جاري التبديل...' : 'تبديل الشركة'}
      </button>
      
      {currentCompany && (
        <div>
          <p>الشركة الحالية: {currentCompany.name}</p>
          <p>الدور: {currentCompany.userRole}</p>
        </div>
      )}
    </div>
  );
};
```

## 4. إدارة الملف الشخصي - Profile Management

```typescript
// client/src/components/ProfileManager.tsx
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const ProfileManager = () => {
  const { user, updateProfile, loading } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profileImageUrl: user?.profileImageUrl || ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      alert('تم تحديث الملف الشخصي بنجاح');
    } else {
      alert('فشل في تحديث الملف الشخصي');
    }
  };

  return (
    <form onSubmit={handleUpdateProfile}>
      <h2>تحديث الملف الشخصي</h2>
      
      <div>
        <label>الاسم الأول:</label>
        <input
          type="text"
          value={profileData.firstName}
          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
        />
      </div>
      
      <div>
        <label>اسم العائلة:</label>
        <input
          type="text"
          value={profileData.lastName}
          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
        />
      </div>
      
      <div>
        <label>رابط الصورة الشخصية:</label>
        <input
          type="url"
          value={profileData.profileImageUrl}
          onChange={(e) => setProfileData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'جاري التحديث...' : 'تحديث الملف الشخصي'}
      </button>
    </form>
  );
};
```

## 5. حماية المسارات - Route Protection

```typescript
// client/src/components/ProtectedRoute.tsx
import { useAuth } from '../hooks/useAuth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: ReactNode;
}

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  fallback = <div>ليس لديك صلاحية للوصول لهذه الصفحة</div>
}: ProtectedRouteProps) => {
  const { 
    user, 
    isAuthenticated, 
    loading,
    hasPermission,
    hasAnyPermission 
  } = useAuth();

  // Check authentication
  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>يرجى تسجيل الدخول</div>;
  }

  // Check roles
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return fallback;
  }

  // Check permissions
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return fallback;
  }

  return <>{children}</>;
};

// Usage
const EmployeeManagementPage = () => {
  return (
    <ProtectedRoute 
      requiredPermissions={['manage_employees']}
      requiredRoles={['company_manager', 'super_admin']}
    >
      <EmployeeManagement />
    </ProtectedRoute>
  );
};
```

## 6. إدارة الحالة - State Management

### استخدام المتجر مباشرة - Direct Store Usage

```typescript
// client/src/components/UserInfo.tsx
import { useUserStore } from '../stores/useUserStore';

const UserInfo = () => {
  const { 
    user, 
    currentCompany, 
    permissions, 
    isAuthenticated,
    logout 
  } = useUserStore();

  if (!isAuthenticated || !user) {
    return <div>يرجى تسجيل الدخول</div>;
  }

  return (
    <div>
      <h2>معلومات المستخدم</h2>
      <p>الاسم: {user.firstName} {user.lastName}</p>
      <p>البريد الإلكتروني: {user.email}</p>
      <p>الدور: {user.role}</p>
      <p>الشركة الحالية: {currentCompany?.name}</p>
      
      <h3>الصلاحيات:</h3>
      <ul>
        {permissions.map(permission => (
          <li key={permission}>{permission}</li>
        ))}
      </ul>
      
      <button onClick={logout}>تسجيل الخروج</button>
    </div>
  );
};
```

### استخدام Hooks المساعدة - Using Helper Hooks

```typescript
// client/src/components/AdminPanel.tsx
import { 
  useIsSuperAdmin, 
  useIsCompanyManager,
  useHasPermission 
} from '../stores/useUserStore';

const AdminPanel = () => {
  const isSuperAdmin = useIsSuperAdmin();
  const isCompanyManager = useIsCompanyManager();
  const canManagePermissions = useHasPermission('manage_permissions');

  return (
    <div>
      <h2>لوحة الإدارة</h2>
      
      {isSuperAdmin && (
        <div>
          <h3>إعدادات النظام</h3>
          <button>إدارة المستخدمين</button>
          <button>إدارة الشركات</button>
        </div>
      )}
      
      {isCompanyManager && (
        <div>
          <h3>إدارة الشركة</h3>
          <button>إدارة الموظفين</button>
          <button>إدارة الصلاحيات</button>
        </div>
      )}
      
      {canManagePermissions && (
        <div>
          <h3>إدارة الصلاحيات</h3>
          <button>تعديل الصلاحيات</button>
        </div>
      )}
    </div>
  );
};
```

## 7. معالجة الأخطاء - Error Handling

```typescript
// client/src/hooks/useAuthError.ts
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export const useAuthError = () => {
  const { error, setError } = useAuth();

  useEffect(() => {
    if (error) {
      // Log error
      console.error('Authentication error:', error);
      
      // Show user-friendly message
      const message = getErrorMessage(error);
      alert(message);
      
      // Clear error after showing
      setTimeout(() => setError(null), 5000);
    }
  }, [error, setError]);

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'Unauthorized': 'يرجى تسجيل الدخول مرة أخرى',
      'Forbidden': 'ليس لديك صلاحية للوصول',
      'User not found': 'المستخدم غير موجود',
      'Invalid credentials': 'بيانات الدخول غير صحيحة',
      'Account inactive': 'الحساب غير مفعل',
      'default': 'حدث خطأ في المصادقة'
    };

    return errorMessages[error] || errorMessages.default;
  };

  return { error, clearError: () => setError(null) };
};
```

## 8. التهيئة التلقائية - Auto Initialization

```typescript
// client/src/components/AppInitializer.tsx
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const { initializeAuth, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize authentication on app start
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return <div>جاري تهيئة التطبيق...</div>;
  }

  return <>{children}</>;
};

// Usage in App.tsx
const App = () => {
  return (
    <AppInitializer>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Other routes */}
        </Routes>
      </Router>
    </AppInitializer>
  );
};
```

## الخلاصة - Summary

هذا الدليل يوضح كيفية استخدام نظام المصادقة الموحد في مختلف السيناريوهات:

1. **تسجيل الدخول**: استخدام `useAuth` hook أو الخدمة مباشرة
2. **التحقق من الصلاحيات**: استخدام `hasPermission`, `hasAnyPermission`, `hasAllPermissions`
3. **تبديل الشركة**: استخدام `switchCompany` مع سياق الشركة
4. **إدارة الملف الشخصي**: استخدام `updateProfile`
5. **حماية المسارات**: استخدام `ProtectedRoute` component
6. **إدارة الحالة**: استخدام المتجر مباشرة أو Hooks المساعدة
7. **معالجة الأخطاء**: استخدام `useAuthError` hook
8. **التهيئة التلقائية**: استخدام `AppInitializer` component

النظام يوفر واجهة موحدة ومتسقة لجميع عمليات المصادقة مع دعم شامل للصلاحيات والأدوار والشركات المتعددة. 