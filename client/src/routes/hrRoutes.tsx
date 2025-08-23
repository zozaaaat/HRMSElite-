import { Route, useParams } from 'wouter';
import { ProtectedRoute } from '../components/shared';
import { routes, UserRole } from '../lib/routes';
import {Dashboard,Employees,Attendance,LeaveRequests,Payroll,Documents,Training,Recruitment,Performance,AdvancedSearch,AIChatbotDemo,AIAnalytics,Licenses,Leaves,Signatures,SignatureTest,PermissionTest,RoleBasedDashboard,SuperAdminDashboard,EmployeeManagement,LayoutExample,I18nTest} from '../pages/lazy-pages';

const DashboardWrapper = () => {
  const { role } = useParams<{ role?: string }>();
  if (role && ['super_admin','company_manager','employee','supervisor','worker'].includes(role)) {
    return (
      <ProtectedRoute pageId="dashboard" requiredRole={role as UserRole}>
        <Dashboard role={role as UserRole} />
      </ProtectedRoute>
    );
  }
  return (
    <ProtectedRoute pageId="dashboard">
      <Dashboard />
    </ProtectedRoute>
  );
};

const dashboardRoles: UserRole[] = ['super_admin','company_manager','employee','supervisor','worker'];

const functionalRoutes = [
  { path: routes.functional.employees, pageId: 'employees', element: <Employees /> },
  { path: routes.functional.attendance, pageId: 'attendance', element: <Attendance /> },
  { path: routes.functional.leave_requests, pageId: 'leave-requests', element: <LeaveRequests /> },
  { path: routes.functional.payroll, pageId: 'payroll', element: <Payroll /> },
  { path: routes.functional.documents, pageId: 'documents', element: <Documents /> },
  { path: routes.functional.training, pageId: 'training', element: <Training /> },
  { path: routes.functional.recruitment, pageId: 'recruitment', element: <Recruitment /> },
  { path: routes.functional.performance, pageId: 'performance', element: <Performance /> },
  { path: routes.functional.advanced_search, pageId: 'advanced-search', element: <AdvancedSearch /> },
  { path: routes.ai.chatbot, pageId: 'ai_dashboard', element: <AIChatbotDemo /> },
  { path: routes.ai.analytics, pageId: 'ai_analytics', element: <AIAnalytics /> },
  { path: routes.ai.dashboard, pageId: 'ai_dashboard', element: <AIChatbotDemo /> },
  { path: routes.functional.licenses, pageId: 'licenses', element: <Licenses /> },
  { path: routes.functional.leaves, pageId: 'leaves', element: <Leaves /> },
  { path: routes.functional.signatures, pageId: 'signatures', element: <Signatures /> },
  { path: routes.functional.signature_test, pageId: 'signature-test', element: <SignatureTest /> },
  { path: routes.functional.permission_test, pageId: 'permission-test', element: <PermissionTest /> },
  { path: routes.functional.role_based_dashboard, pageId: 'role-based-dashboard', element: <RoleBasedDashboard /> },
  { path: routes.functional.super_admin_dashboard, pageId: 'super-admin-dashboard', element: <SuperAdminDashboard />, requiredRole: 'super_admin' },
  { path: routes.functional.employee_management, pageId: 'employee-management', element: <EmployeeManagement /> },
  { path: routes.functional.layout_example, pageId: 'layout-example', element: <LayoutExample /> },
  { path: '/i18n-test', pageId: 'i18n-test', element: <I18nTest /> },
];

const HrRoutes = () => (
  <>
    {dashboardRoles.map(role => (
      <Route key={role} path={routes.dashboard[role]}>
        <ProtectedRoute pageId="dashboard" requiredRole={role}>
          <Dashboard role={role} />
        </ProtectedRoute>
      </Route>
    ))}
    <Route path="/dashboard/:role">
      <DashboardWrapper />
    </Route>
    <Route path="/dashboard">
      <ProtectedRoute pageId="dashboard">
        <Dashboard />
      </ProtectedRoute>
    </Route>
    {functionalRoutes.map(({ path, pageId, element, requiredRole }) => (
      <Route key={path} path={path}>
        <ProtectedRoute pageId={pageId} requiredRole={requiredRole as UserRole | undefined}>
          {element}
        </ProtectedRoute>
      </Route>
    ))}
  </>
);

export default HrRoutes;
