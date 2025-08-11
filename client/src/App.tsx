import {Switch, Route, useParams} from 'wouter';
import {QueryClientProvider} from '@tanstack/react-query';
import {useAppStore} from '@/stores/useAppStore';
import {ProtectedRoute} from '@/components/shared';
import {ReactQueryDevTools} from '@/components/shared/ReactQueryDevTools';
import {routes, UserRole} from '@/lib/routes';
import {queryClient} from '@/lib/queryClient';
import {useRoleBasedPreloading} from '@/hooks/useLazyLoading';

// Import lazy-loaded components
import {
  CompanySelection,
  Login,
  NotFound,
  Dashboard,
  Companies,
  Reports,
  AIChatbotDemo,
  AIAnalytics,
  Settings,
  Employees,
  Attendance,
  LeaveRequests,
  Payroll,
  Documents,
  Training,
  Recruitment,
  Performance,
  AdvancedSearch,
  AccountingSystems,
  GovernmentForms,
  Licenses,
  Leaves,
  Signatures,
  SignatureTest,
  NotificationTest,
  PermissionTest,
  RoleBasedDashboard,
  SuperAdminDashboard,
  EmployeeManagement,
  LayoutExample
} from '@/pages/lazy-pages';

// Wrapper component for Dashboard to handle route parameters with proper protection
const DashboardWrapper = () => {
  const { role } = useParams<{ role?: string }>();

  // Validate role and redirect to appropriate dashboard
  if (role && ['super_admin',
   'company_manager',
   'employee',
   'supervisor',
   'worker'].includes(role)) {

    return (
      <ProtectedRoute pageId="dashboard" requiredRole={role as UserRole}>
        <Dashboard role={role as UserRole} />
      </ProtectedRoute>
    );

  }

  // If no valid role, redirect to default dashboard
  return (
    <ProtectedRoute pageId="dashboard">
      <Dashboard />
    </ProtectedRoute>
  );

};

const App = () => {

  const {user} = useAppStore();
  const isAuthenticated = !!user;

  // Use role-based preloading for better performance
  useRoleBasedPreloading(user?.role ?? undefined);

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Public Routes */}
        <Route path={routes.public.home}>
          <CompanySelection />
        </Route>
        <Route path={routes.public.login}>
          <Login />
        </Route>

        {/* Protected Routes - Only render if authenticated */}
        {isAuthenticated && (
          <>
            {/* Dashboard Routes - Unified with proper role-based protection */}
            <Route path={routes.dashboard.super_admin}>
              <ProtectedRoute pageId="dashboard" requiredRole="super_admin">
                <Dashboard role="super_admin" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.company_manager}>
              <ProtectedRoute pageId="dashboard" requiredRole="company_manager">
                <Dashboard role="company_manager" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.employee}>
              <ProtectedRoute pageId="dashboard" requiredRole="employee">
                <Dashboard role="employee" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.supervisor}>
              <ProtectedRoute pageId="dashboard" requiredRole="supervisor">
                <Dashboard role="supervisor" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.worker}>
              <ProtectedRoute pageId="dashboard" requiredRole="worker">
                <Dashboard role="worker" />
              </ProtectedRoute>
            </Route>

            {/* Legacy dashboard routes with proper protection */}
            <Route path="/dashboard/:role">
              <DashboardWrapper />
            </Route>
            <Route path="/dashboard">
              <ProtectedRoute pageId="dashboard">
                <Dashboard />
              </ProtectedRoute>
            </Route>

            {/* Functional Routes with proper protection */}
            <Route path={routes.functional.companies}>
              <ProtectedRoute pageId="companies" requiredRole="super_admin">
                <Companies />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.reports}>
              <ProtectedRoute pageId="reports" requiredRole="company_manager">
                <Reports />
              </ProtectedRoute>
            </Route>

            {/* AI Routes with proper protection */}
            <Route path={routes.ai.chatbot}>
              <ProtectedRoute pageId="ai_dashboard">
                <AIChatbotDemo />
              </ProtectedRoute>
            </Route>

            <Route path={routes.ai.analytics}>
              <ProtectedRoute pageId="ai_analytics">
                <AIAnalytics />
              </ProtectedRoute>
            </Route>

            <Route path={routes.ai.dashboard}>
              <ProtectedRoute pageId="ai_dashboard">
                <AIChatbotDemo />
              </ProtectedRoute>
            </Route>

            {/* Additional functional routes with proper protection */}
            <Route path={routes.functional.employees}>
              <ProtectedRoute pageId="employees">
                <Employees />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.settings}>
              <ProtectedRoute pageId="settings">
                <Settings />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.attendance}>
              <ProtectedRoute pageId="attendance">
                <Attendance />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.leave_requests}>
              <ProtectedRoute pageId="leave-requests">
                <LeaveRequests />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.payroll}>
              <ProtectedRoute pageId="payroll">
                <Payroll />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.documents}>
              <ProtectedRoute pageId="documents">
                <Documents />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.training}>
              <ProtectedRoute pageId="training">
                <Training />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.recruitment}>
              <ProtectedRoute pageId="recruitment">
                <Recruitment />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.performance}>
              <ProtectedRoute pageId="performance">
                <Performance />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.advanced_search}>
              <ProtectedRoute pageId="advanced-search">
                <AdvancedSearch />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.accounting_systems}>
              <ProtectedRoute pageId="accounting-systems">
                <AccountingSystems />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.government_forms}>
              <ProtectedRoute pageId="government-forms">
                <GovernmentForms />
              </ProtectedRoute>
            </Route>

            {/* Additional functional routes */}
            <Route path={routes.functional.licenses}>
              <ProtectedRoute pageId="licenses">
                <Licenses />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.leaves}>
              <ProtectedRoute pageId="leaves">
                <Leaves />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.signatures}>
              <ProtectedRoute pageId="signatures">
                <Signatures />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.signature_test}>
              <ProtectedRoute pageId="signature-test">
                <SignatureTest />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.notification_test}>
              <ProtectedRoute pageId="notification-test">
                <NotificationTest />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.permission_test}>
              <ProtectedRoute pageId="permission-test">
                <PermissionTest />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.role_based_dashboard}>
              <ProtectedRoute pageId="role-based-dashboard">
                <RoleBasedDashboard />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.super_admin_dashboard}>
              <ProtectedRoute pageId="super-admin-dashboard" requiredRole="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.employee_management}>
              <ProtectedRoute pageId="employee-management">
                <EmployeeManagement />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.layout_example}>
              <ProtectedRoute pageId="layout-example">
                <LayoutExample />
              </ProtectedRoute>
            </Route>

            {/* Advanced routes with proper protection */}
            <Route path={routes.advanced.ai_analytics}>
              <ProtectedRoute pageId="ai_analytics">
                <AIAnalytics />
              </ProtectedRoute>
            </Route>

            <Route path={routes.advanced.project_management}>
              <ProtectedRoute pageId="project-management">
                <div>Project Management Page</div>
              </ProtectedRoute>
            </Route>

            <Route path={routes.advanced.assets_management}>
              <ProtectedRoute pageId="assets-management">
                <div>Assets Management Page</div>
              </ProtectedRoute>
            </Route>

            <Route path={routes.advanced.permissions_management}>
              <ProtectedRoute pageId="permissions-management">
                <div>Permissions Management Page</div>
              </ProtectedRoute>
            </Route>

            <Route path={routes.advanced.mobile_apps}>
              <ProtectedRoute pageId="mobile-apps">
                <div>Mobile Apps Page</div>
              </ProtectedRoute>
            </Route>
          </>
        )}

        {/* Catch all route */}
        <Route>
          <NotFound />
        </Route>
      </Switch>

      {/* React Query DevTools for development */}
      <ReactQueryDevTools initialIsOpen={false} />
    </QueryClientProvider>
  );

};

export default App;
