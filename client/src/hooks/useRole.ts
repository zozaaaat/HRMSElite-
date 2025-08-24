import {useAuth} from './useAuth';
import {isValidRole, UserRole} from '../lib/routes';
import { t } from "i18next";

export const useRole = () => {

  const {user} = useAuth();

  // الحصول على الدور من بيانات المستخدم
  const getUserRole = (): UserRole => {

    if (user?.role && isValidRole(user.role)) {

      return user.role;

    }

    // استخراج الدور من URL parameters
    const urlParams = new window.URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    if (urlRole && isValidRole(urlRole)) {

      return urlRole;

    }

    // استخراج الدور من pathname
    const {pathname} = window.location;
    const roleMatch = pathname.match(/\/dashboard\/([^/?]+)/);
    if (roleMatch?.[1] && isValidRole(roleMatch[1])) {

      return roleMatch[1];

    }

    // الدور الافتراضي
    return 'worker';

  };

  // الحصول على اسم الدور بالعربية
  const getRoleLabel = (role?: UserRole): string => {

    const currentRole = role ?? getUserRole();

    const roleLabels: Record<UserRole, string> = {
      'super_admin': 'المسؤول العام',
      'company_manager': 'مدير الشركة',
      'employee': 'موظف إداري',
      'supervisor': 'مشرف',
      'worker': 'عامل'
    };

    return roleLabels[currentRole] || 'عامل';

  };

  // التحقق من الصلاحيات
  const hasPermission = (requiredRoles: UserRole[]): boolean => {

    const currentRole = getUserRole();
    return requiredRoles.includes(currentRole);

  };

  // الحصول على الدور الحالي
  const currentRole = getUserRole();

  return {
    'role': currentRole,
    'roleLabel': getRoleLabel(currentRole),
    getUserRole,
    getRoleLabel,
    hasPermission,
    'isValidRole': (role: string): role is UserRole => isValidRole(role)
  };

};
