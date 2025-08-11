import {
  Home,
  Users,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  Bot,
  Workflow,
  GraduationCap,
  Smartphone,
  Eye,
  Clock,
  UserCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {routes, getDashboardRouteWithCompany, UserRole} from './routes';
import {canAccessPage} from './roles';

// تعريف أنواع البيانات
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section: 'main' | 'settings';
  roles: string[];
  path?: string;
  onClick?: () => void;
}

export interface AdvancedFeature {
  id: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
  onClick?: () => void;
}

// خريطة الأدوار والروابط
export const roleNavigationMap = {
  'super_admin': {
    'menuItems': [
      {
        'id': 'dashboard',
        'label': 'لوحة التحكم',
        'icon': Home,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.dashboard.super_admin
      },
      {
        'id': 'companies',
        'label': 'إدارة الشركات',
        'icon': Users,
        'section': 'main' as const,
        'roles': ['super_admin'],
        'path': routes.functional.companies
      },
      {
        'id': 'employees',
        'label': 'إدارة الموظفين',
        'icon': Users,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee'],
        'path': routes.functional.employees
      },
      {
        'id': 'reports',
        'label': 'التقارير',
        'icon': BarChart3,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee'],
        'path': routes.functional.reports
      },
      {
        'id': 'ai-dashboard',
        'label': 'لوحة التحكم الذكية',
        'icon': Bot,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee'],
        'path': routes.functional.ai_dashboard
      },
      {
        'id': 'settings',
        'label': 'إعدادات النظام',
        'icon': Settings,
        'section': 'settings' as const,
        'roles': ['super_admin'],
        'path': routes.functional.settings
      }
    ],
    'advancedFeatures': [
      {
        'id': 'ai-assistant',
        'label': 'المساعد الذكي',
        'icon': Bot,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'ai-analytics',
        'label': 'تحليلات الذكاء الاصطناعي',
        'icon': BarChart3,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'bi-dashboard',
        'label': 'لوحة التحليلات',
        'icon': BarChart3,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'workflow-builder',
        'label': 'منشئ سير العمل',
        'icon': Workflow,
        'roles': ['company_manager', 'employee']
      },
      {
        'id': 'learning-management',
        'label': 'إدارة التعلم',
        'icon': GraduationCap,
        'roles': ['company_manager', 'employee']
      },
      {
        'id': 'mobile-app',
        'label': 'التطبيق المحمول',
        'icon': Smartphone,
        'roles': ['worker', 'supervisor', 'employee', 'company_manager']
      },
      {
        'id': 'employee-360',
        'label': 'عرض الموظف 360°',
        'icon': Eye,
        'roles': ['company_manager', 'employee']
      }
    ]
  },

  'company_manager': {
    'menuItems': [
      {
        'id': 'dashboard',
        'label': 'لوحة التحكم',
        'icon': Home,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.dashboard.company_manager
      },
      {
        'id': 'employees',
        'label': 'إدارة الموظفين',
        'icon': Users,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee'],
        'path': routes.functional.employees
      },
      {
        'id': 'licenses',
        'label': 'التراخيص',
        'icon': FileText,
        'section': 'main' as const,
        'roles': ['company_manager', 'employee'],
        'path': routes.functional.government_forms
      },
      {
        'id': 'leaves',
        'label': 'الإجازات',
        'icon': Calendar,
        'section': 'main' as const,
        'roles': ['company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.functional.leave_requests
      },
      {
        'id': 'payroll',
        'label': 'المرتبات',
        'icon': DollarSign,
        'section': 'main' as const,
        'roles': ['company_manager', 'employee'],
        'path': routes.functional.payroll
      },
      {
        'id': 'reports',
        'label': 'التقارير',
        'icon': BarChart3,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee'],
        'path': routes.functional.reports
      },
      {
        'id': 'company-settings',
        'label': 'إعدادات الشركة',
        'icon': Settings,
        'section': 'settings' as const,
        'roles': ['company_manager'],
        'path': routes.functional.settings
      },
      {
        'id': 'permissions',
        'label': 'الصلاحيات',
        'icon': Shield,
        'section': 'settings' as const,
        'roles': ['company_manager'],
        'path': routes.advanced.permissions_management
      }
    ],
    'advancedFeatures': [
      {
        'id': 'ai-assistant',
        'label': 'المساعد الذكي',
        'icon': Bot,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'ai-analytics',
        'label': 'تحليلات الذكاء الاصطناعي',
        'icon': BarChart3,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'bi-dashboard',
        'label': 'لوحة التحليلات',
        'icon': BarChart3,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'workflow-builder',
        'label': 'منشئ سير العمل',
        'icon': Workflow,
        'roles': ['company_manager', 'employee']
      },
      {
        'id': 'learning-management',
        'label': 'إدارة التعلم',
        'icon': GraduationCap,
        'roles': ['company_manager', 'employee']
      },
      {
        'id': 'financial-management',
        'label': 'الإدارة المالية',
        'icon': DollarSign,
        'roles': ['company_manager']
      },
      {
        'id': 'mobile-app',
        'label': 'التطبيق المحمول',
        'icon': Smartphone,
        'roles': ['worker', 'supervisor', 'employee', 'company_manager']
      },
      {
        'id': 'employee-360',
        'label': 'عرض الموظف 360°',
        'icon': Eye,
        'roles': ['company_manager', 'employee']
      }
    ]
  },

  'employee': {
    'menuItems': [
      {
        'id': 'dashboard',
        'label': 'لوحة التحكم',
        'icon': Home,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.dashboard.employee
      },
      {
        'id': 'employees',
        'label': 'إدارة الموظفين',
        'icon': Users,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee'],
        'path': routes.functional.employees
      },
      {
        'id': 'leaves',
        'label': 'الإجازات',
        'icon': Calendar,
        'section': 'main' as const,
        'roles': ['company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.functional.leave_requests
      },
      {
        'id': 'reports',
        'label': 'التقارير',
        'icon': BarChart3,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee'],
        'path': routes.functional.reports
      },
      {
        'id': 'documents',
        'label': 'المستندات',
        'icon': FileText,
        'section': 'main' as const,
        'roles': ['employee', 'company_manager'],
        'path': routes.functional.documents
      }
    ],
    'advancedFeatures': [
      {
        'id': 'ai-assistant',
        'label': 'المساعد الذكي',
        'icon': Bot,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'ai-analytics',
        'label': 'تحليلات الذكاء الاصطناعي',
        'icon': BarChart3,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'bi-dashboard',
        'label': 'لوحة التحليلات',
        'icon': BarChart3,
        'roles': ['super_admin', 'company_manager', 'employee']
      },
      {
        'id': 'workflow-builder',
        'label': 'منشئ سير العمل',
        'icon': Workflow,
        'roles': ['company_manager', 'employee']
      },
      {
        'id': 'learning-management',
        'label': 'إدارة التعلم',
        'icon': GraduationCap,
        'roles': ['company_manager', 'employee']
      },
      {
        'id': 'mobile-app',
        'label': 'التطبيق المحمول',
        'icon': Smartphone,
        'roles': ['worker', 'supervisor', 'employee', 'company_manager']
      },
      {
        'id': 'employee-360',
        'label': 'عرض الموظف 360°',
        'icon': Eye,
        'roles': ['company_manager', 'employee']
      }
    ]
  },

  'supervisor': {
    'menuItems': [
      {
        'id': 'dashboard',
        'label': 'لوحة التحكم',
        'icon': Home,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.dashboard.supervisor
      },
      {
        'id': 'employees',
        'label': 'إدارة الفريق',
        'icon': Users,
        'section': 'main' as const,
        'roles': ['supervisor'],
        'path': routes.functional.employees
      },
      {
        'id': 'leaves',
        'label': 'الإجازات',
        'icon': Calendar,
        'section': 'main' as const,
        'roles': ['company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.functional.leave_requests
      },
      {
        'id': 'attendance',
        'label': 'الحضور',
        'icon': Clock,
        'section': 'main' as const,
        'roles': ['supervisor', 'company_manager'],
        'path': routes.functional.attendance
      }
    ],
    'advancedFeatures': [
      {
        'id': 'mobile-app',
        'label': 'التطبيق المحمول',
        'icon': Smartphone,
        'roles': ['worker', 'supervisor', 'employee', 'company_manager']
      }
    ]
  },

  'worker': {
    'menuItems': [
      {
        'id': 'dashboard',
        'label': 'لوحة التحكم',
        'icon': Home,
        'section': 'main' as const,
        'roles': ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.dashboard.worker
      },
      {
        'id': 'profile',
        'label': 'ملفي الشخصي',
        'icon': UserCheck,
        'section': 'main' as const,
        'roles': ['worker', 'supervisor', 'employee'],
        'path': routes.functional.settings
      },
      {
        'id': 'leaves',
        'label': 'الإجازات',
        'icon': Calendar,
        'section': 'main' as const,
        'roles': ['company_manager', 'employee', 'supervisor', 'worker'],
        'path': routes.functional.leave_requests
      },
      {
        'id': 'attendance',
        'label': 'الحضور',
        'icon': Clock,
        'section': 'main' as const,
        'roles': ['worker', 'supervisor', 'company_manager'],
        'path': routes.functional.attendance
      }
    ],
    'advancedFeatures': [
      {
        'id': 'mobile-app',
        'label': 'التطبيق المحمول',
        'icon': Smartphone,
        'roles': ['worker', 'supervisor', 'employee', 'company_manager']
      }
    ]
  }
};

// دالة للحصول على عناصر القائمة حسب الدور
export const getMenuItems = (role: UserRole): MenuItem[] => {

  const roleConfig = roleNavigationMap[role as keyof typeof roleNavigationMap];
  if (!roleConfig) {

    return roleNavigationMap.worker.menuItems;

  }

  return roleConfig.menuItems.filter(item => canAccessPage(role, item.id));

};

// دالة للحصول على الميزات المتقدمة حسب الدور
export const getAdvancedFeatures = (role: UserRole): AdvancedFeature[] => {

  const roleConfig = roleNavigationMap[role as keyof typeof roleNavigationMap];
  if (!roleConfig) {

    return roleNavigationMap.worker.advancedFeatures;

  }

  return roleConfig.advancedFeatures.filter(feature => canAccessPage(role, feature.id));

};

// دالة للتحقق من صلاحية الوصول لعنصر معين
export const hasAccessToItem = (itemId: string, role: UserRole): boolean => {

  return canAccessPage(role, itemId);

};

// دالة للحصول على جميع العناصر المتاحة لدور معين
export const getAllAvailableItems = (role: UserRole): (MenuItem | AdvancedFeature)[] => {

  const menuItems = getMenuItems(role);
  const advancedFeatures = getAdvancedFeatures(role);

  return [...menuItems, ...advancedFeatures];

};

// دالة للحصول على مسار العنصر
export const getItemPath = (itemId: string,
   role: UserRole,
   companyId?: string,
   companyName?: string): string => {

  switch (itemId) {

  case 'dashboard':
    return getDashboardRouteWithCompany(role, companyId, companyName);
  case 'companies':
    return routes.functional.companies;
  case 'employees':
    return `${routes.functional.employees}${companyId ? `?company=${companyId}` : ''}`;
  case 'reports':
    return `${routes.functional.reports}${companyId ? `?company=${companyId}` : ''}`;
  case 'settings':
    return `${routes.functional.settings}${companyId ? `?company=${companyId}` : ''}`;
  case 'company-settings':
    return `${routes.functional.settings}${companyId ? `?company=${companyId}&tab=company` : ''}`;
  case 'permissions':
    return `${routes.advanced.permissions_management}${companyId ? `?company=${companyId}` : ''}`;
  case 'licenses':
    return `${
  routes.functional.government_forms
}${
  companyId ? `?company=${
  companyId
}&tab=licenses` : ''
}`;
  case 'leaves':
    return `${routes.functional.leave_requests}${companyId ? `?company=${companyId}` : ''}`;
  case 'payroll':
    return `${routes.functional.payroll}${companyId ? `?company=${companyId}` : ''}`;
  case 'documents':
    return `${routes.functional.documents}${companyId ? `?company=${companyId}` : ''}`;
  case 'attendance':
    return `${routes.functional.attendance}${companyId ? `?company=${companyId}` : ''}`;
  case 'profile':
    return `${routes.functional.settings}${companyId ? `?company=${companyId}&tab=profile` : ''}`;
  case 'ai-analytics':
    return routes.advanced.ai_analytics;
  default:
    return '/';

  }

};

// دالة للحصول على معلومات العنصر
export const getItemInfo = (itemId: string, role: UserRole): MenuItem | AdvancedFeature | null => {

  const menuItems = getMenuItems(role);
  const advancedFeatures = getAdvancedFeatures(role);

  const menuItem = menuItems.find(item => item.id === itemId);
  if (menuItem) {

    return menuItem;

  }

  const advancedFeature = advancedFeatures.find(feature => feature.id === itemId);
  return advancedFeature ?? null;

};

// دالة للحصول على الأدوار التي يمكنها الوصول لعنصر معين
export const getRolesWithAccess = (itemId: string): string[] => {

  const allRoles = Object.keys(roleNavigationMap);
  const rolesWithAccess: string[] = [];

  allRoles.forEach(role => {

    if (hasAccessToItem(itemId, role as UserRole)) {

      rolesWithAccess.push(role);

    }

  });

  return rolesWithAccess;

};
