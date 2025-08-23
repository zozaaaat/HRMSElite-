// تعريف المسارات الموحدة للتطبيق
export const routes = {
  // المسارات العامة
  'public': {
    'home': '/',
    'login': '/login'
  },

  // مسارات لوحة التحكم حسب الدور
  'dashboard': {
    'super_admin': '/dashboard/super-admin',
    'company_manager': '/dashboard/company-manager',
    'employee': '/dashboard/employee',
    'supervisor': '/dashboard/supervisor',
    'worker': '/dashboard/worker'
  },

  // المسارات الوظيفية
  'functional': {
    'companies': '/companies',
    'company_details': '/company-details',
    'employees': '/employees',
    'reports': '/reports',
    'settings': '/settings',
    'accounting_systems': '/accounting-systems',
    'government_forms': '/government-forms',
    'attendance': '/attendance',
    'leave_requests': '/leave-requests',
    'payroll': '/payroll',
    'documents': '/documents',
    'training': '/training',
    'recruitment': '/recruitment',
    'performance': '/performance',
    'advanced_search': '/advanced-search',
    'ai_dashboard': '/ai-dashboard',
    'licenses': '/licenses',
    'leaves': '/leaves',
    'signatures': '/signatures',
    'signature_test': '/signature-test',
    'permission_test': '/permission-test',
    'role_based_dashboard': '/role-based-dashboard',
    'super_admin_dashboard': '/super-admin-dashboard',
    'employee_management': '/employee-management',
    'layout_example': '/layout-example'
  },

  // المسارات المتقدمة
  'advanced': {
    'ai_analytics': '/ai-analytics',
    'project_management': '/project-management',
    'assets_management': '/assets-management',
    'permissions_management': '/permissions-management',
    'mobile_apps': '/mobile-apps'
  },

  // مسارات AI
  'ai': {
    'chatbot': '/ai-chatbot',
    'analytics': '/ai-analytics',
    'dashboard': '/ai-dashboard'
  }
};

// دالة للحصول على مسار لوحة التحكم حسب الدور
export const getDashboardRoute = (role: string): string => {

  const roleMap: Record<string, string> = {
    'super_admin': routes.dashboard.super_admin,
    'company_manager': routes.dashboard.company_manager,
    'employee': routes.dashboard.employee,
    'supervisor': routes.dashboard.supervisor,
    'worker': routes.dashboard.worker
  };

  return roleMap[role] ?? routes.dashboard.worker;

};

// دالة لبناء مسار مع معاملات
export const buildRoute = (baseRoute: string, params?: Record<string, string>): string => {

  if (!params) {

    return baseRoute;

  }

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return queryString ? `${baseRoute}?${queryString}` : baseRoute;

};

// دالة للحصول على مسار لوحة التحكم مع معاملات الشركة
export const getDashboardRouteWithCompany = (role: string,
   companyId?: string,
   companyName?: string): string => {

  const baseRoute = getDashboardRoute(role);
  const params: Record<string, string> = {};

  if (companyId) {

    params.company = companyId;

  }
  if (companyName) {

    params.name = companyName;

  }

  return buildRoute(baseRoute, params);

};

// أنواع الأدوار المتاحة
export type UserRole = 'super_admin' | 'company_manager' | 'employee' | 'supervisor' | 'worker';

// التحقق من صحة الدور
export const isValidRole = (role: string): role is UserRole => {

  return ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'].includes(role);

};
