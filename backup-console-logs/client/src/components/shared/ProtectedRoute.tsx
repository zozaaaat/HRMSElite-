import {ReactNode, useEffect, useState} from 'react';
import {useLocation} from 'wouter';
import {useAuth} from '../../hooks/useAuth';
import {canAccessPage} from '../../lib/roles';
import {getDashboardRoute, UserRole as RoutesUserRole} from '../../lib/routes';
import {UserRole as AuthUserRole} from '../../lib/authUtils';

// محول لتوحيد نوع الدور بين `authUtils` و `routes`
const toRoutesUserRole = (role: AuthUserRole): RoutesUserRole => {
  return (role === 'administrative_employee' ? 'employee' : role) as RoutesUserRole;
};

// محول معاكس لتوحيد نوع الدور القادم من المكونات التي تستخدم أنواع المسارات
const toAuthUserRole = (role: AuthUserRole | RoutesUserRole): AuthUserRole => {
  return (role === 'employee' ? 'administrative_employee' : role) as AuthUserRole;
};

interface ProtectedRouteProps {
  children: ReactNode;
  pageId: string;
  fallbackPath?: string;
  requiredRole?: AuthUserRole | RoutesUserRole;
}

export function ProtectedRoute ({
  children,
  pageId,
  fallbackPath,
  requiredRole
}: ProtectedRouteProps) {

  const {user, isAuthenticated, loading} = useAuth();
  const [, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {

    // إذا كان التطبيق لا يزال في حالة التحميل، انتظر
    if (loading) {

      return;

    }

    // إذا لم يكن المستخدم مسجل الدخول، توجيه إلى صفحة تسجيل الدخول
    if (!isAuthenticated || !user) {

      setLocation('/login');
      return;

    }

    // التحقق من الدور المطلوب إذا تم تحديده
    if (requiredRole && user.role !== toAuthUserRole(requiredRole)) {

      const defaultFallback = getDashboardRoute(toRoutesUserRole(user.role as AuthUserRole));
      setLocation(fallbackPath ?? defaultFallback);
      return;

    }

    // التحقق من صلاحيات الوصول للصفحة
    if (!canAccessPage(toRoutesUserRole(user.role as AuthUserRole), pageId)) {

      // توجيه إلى لوحة التحكم المناسبة للدور
      const dashboardPath = getDashboardRoute(toRoutesUserRole(user.role as AuthUserRole));
      setLocation(dashboardPath);
      return;

    }

    // إذا وصلنا هنا، فالمستخدم لديه الصلاحيات المطلوبة
    setIsValidating(false);

  }, [user, isAuthenticated, loading, pageId, requiredRole, fallbackPath, setLocation]);

  // عرض شاشة تحميل أثناء التحقق من الصلاحيات
  if (loading || isValidating) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );

  }

  // إذا لم يكن المستخدم مسجل الدخول، لا تعرض المحتوى
  if (!isAuthenticated || !user) {

    return null;

  }

  // التحقق النهائي من الصلاحيات
  if (!canAccessPage(toRoutesUserRole(user.role as AuthUserRole), pageId)) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">غير مصرح بالوصول</h2>
          <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
          <button
            onClick={() => setLocation(getDashboardRoute(toRoutesUserRole(user.role as AuthUserRole)))}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );

  }

  // التحقق من الدور المطلوب
  if (requiredRole && user.role !== toAuthUserRole(requiredRole)) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">دور غير صحيح</h2>
          <p className="text-muted-foreground">هذه الصفحة مخصصة لدور آخر</p>
          <button
            onClick={() => setLocation(getDashboardRoute(toRoutesUserRole(user.role as AuthUserRole)))}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );

  }

  return <>{children}</>;

}

// مكون مختصر للتحقق من الصلاحيات فقط
interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function PermissionGuard ({children, permission, fallback}: PermissionGuardProps) {

  const {user} = useAuth();

  if (!user) {

    return fallback ?? null;

  }

  // التحقق من الصلاحية
  const hasAccess = canAccessPage(toRoutesUserRole(user.role as AuthUserRole), permission);

  if (!hasAccess) {

    return fallback ?? null;

  }

  return <>{children}</>;

}

// مكون للتحقق من وجود أي من الصلاحيات المطلوبة
interface AnyPermissionGuardProps {
  children: ReactNode;
  permissions: string[];
  fallback?: ReactNode;
}

export function AnyPermissionGuard ({children, permissions, fallback}: AnyPermissionGuardProps) {

  const {user} = useAuth();

  if (!user) {

    return fallback ?? null;

  }

  // التحقق من وجود أي من الصلاحيات
  const hasAnyAccess = permissions.some(permission => canAccessPage(toRoutesUserRole(user.role as AuthUserRole), permission));

  if (!hasAnyAccess) {

    return fallback ?? null;

  }

  return <>{children}</>;

}

// مكون للتحقق من وجود جميع الصلاحيات المطلوبة
interface AllPermissionsGuardProps {
  children: ReactNode;
  permissions: string[];
  fallback?: ReactNode;
}

export function AllPermissionsGuard ({children, permissions, fallback}: AllPermissionsGuardProps) {

  const {user} = useAuth();

  if (!user) {

    return fallback ?? null;

  }

  // التحقق من وجود جميع الصلاحيات
  const hasAllAccess = permissions.every(permission => canAccessPage(toRoutesUserRole(user.role as AuthUserRole), permission));

  if (!hasAllAccess) {

    return fallback ?? null;

  }

  return <>{children}</>;

}
