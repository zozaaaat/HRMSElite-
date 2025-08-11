import {useAuth} from './useAuth';
import {
  hasPermission,
  canAccessPage,
  getRolePermissions,
  hasAnyPermission,
  hasAllPermissions,
  getAccessiblePages,
  getRoleLabel,
  getRoleDescription,
  getRoleLevel,
  canPromote,
  canDemote,
  type Permission
} from '../lib/roles';
import {UserRole} from '../lib/routes';

export const usePermissions = () => {

  const {user} = useAuth();

  // الحصول على الدور الحالي
  const currentRole = user?.role as UserRole;

  // التحقق من صلاحية معينة
  const checkPermission = (permission: Permission): boolean => {

    if (!currentRole) {

      return false;

    }
    return hasPermission(currentRole, permission);

  };

  // التحقق من إمكانية الوصول لصفحة معينة
  const canAccess = (pageId: string): boolean => {

    if (!currentRole) {

      return false;

    }
    return canAccessPage(currentRole, pageId);

  };

  // الحصول على جميع الصلاحيات المتاحة للدور الحالي
  const getCurrentRolePermissions = (): Permission[] => {

    if (!currentRole) {

      return [];

    }
    return getRolePermissions(currentRole);

  };

  // التحقق من وجود أي من الصلاحيات المطلوبة
  const checkAnyPermission = (permissions: Permission[]): boolean => {

    if (!currentRole) {

      return false;

    }
    return hasAnyPermission(currentRole, permissions);

  };

  // التحقق من وجود جميع الصلاحيات المطلوبة
  const checkAllPermissions = (permissions: Permission[]): boolean => {

    if (!currentRole) {

      return false;

    }
    return hasAllPermissions(currentRole, permissions);

  };

  // الحصول على الصفحات المتاحة للدور الحالي
  const getAccessiblePagesForCurrentRole = (): string[] => {

    if (!currentRole) {

      return [];

    }
    return getAccessiblePages(currentRole);

  };

  // الحصول على اسم الدور الحالي
  const getCurrentRoleLabel = (): string => {

    if (!currentRole) {

      return 'غير محدد';

    }
    return getRoleLabel(currentRole);

  };

  // الحصول على وصف الدور الحالي
  const getCurrentRoleDescription = (): string => {

    if (!currentRole) {

      return 'دور غير محدد';

    }
    return getRoleDescription(currentRole);

  };

  // الحصول على مستوى الدور الحالي
  const getCurrentRoleLevel = (): number => {

    if (!currentRole) {

      return 0;

    }
    return getRoleLevel(currentRole);

  };

  // التحقق من إمكانية الترقية لدور معين
  const canPromoteTo = (targetRole: UserRole): boolean => {

    if (!currentRole) {

      return false;

    }
    return canPromote(currentRole, targetRole);

  };

  // التحقق من إمكانية التنزيل لدور معين
  const canDemoteTo = (targetRole: UserRole): boolean => {

    if (!currentRole) {

      return false;

    }
    return canDemote(currentRole, targetRole);

  };

  // التحقق من كون المستخدم مسؤول عام
  const isSuperAdmin = (): boolean => {

    return currentRole === 'super_admin';

  };

  // التحقق من كون المستخدم مدير شركة
  const isCompanyManager = (): boolean => {

    return currentRole === 'company_manager';

  };

  // التحقق من كون المستخدم موظف إداري
  const isEmployee = (): boolean => {

    return currentRole === 'employee';

  };

  // التحقق من كون المستخدم مشرف
  const isSupervisor = (): boolean => {

    return currentRole === 'supervisor';

  };

  // التحقق من كون المستخدم عامل
  const isWorker = (): boolean => {

    return currentRole === 'worker';

  };

  // التحقق من كون المستخدم لديه صلاحيات إدارية
  const hasAdminPermissions = (): boolean => {

    return isSuperAdmin() || isCompanyManager();

  };

  // التحقق من كون المستخدم لديه صلاحيات إدارية متوسطة
  const hasManagerPermissions = (): boolean => {

    return isSuperAdmin() || isCompanyManager() || isEmployee();

  };

  // التحقق من كون المستخدم لديه صلاحيات مشرف
  const hasSupervisorPermissions = (): boolean => {

    return isSuperAdmin() || isCompanyManager() || isEmployee() || isSupervisor();

  };

  return {
    // الدور الحالي
    currentRole,

    // دوال التحقق من الصلاحيات
    checkPermission,
    canAccess,
    checkAnyPermission,
    checkAllPermissions,

    // دوال الحصول على المعلومات
    getCurrentRolePermissions,
    getAccessiblePagesForCurrentRole,
    getCurrentRoleLabel,
    getCurrentRoleDescription,
    getCurrentRoleLevel,

    // دوال التحقق من الأدوار
    isSuperAdmin,
    isCompanyManager,
    isEmployee,
    isSupervisor,
    isWorker,

    // دوال التحقق من مجموعات الصلاحيات
    hasAdminPermissions,
    hasManagerPermissions,
    hasSupervisorPermissions,

    // دوال الترقية والتنزيل
    canPromoteTo,
    canDemoteTo,

    // دوال مساعدة
    'hasPermission': checkPermission,
    'canAccessPage': canAccess,
    'roleLabel': getCurrentRoleLabel(),
    'roleDescription': getCurrentRoleDescription(),
    'roleLevel': getCurrentRoleLevel()
  };

};
