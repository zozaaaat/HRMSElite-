import React from 'react';
import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { useAppStore } from '@/stores/useAppStore';
// import CompanySelection from '@/pages/company-selection';
// import Login from '@/pages/login';
// import NotFound from '@/pages/not-found';
// import Dashboard from '@/pages/dashboard';
// import Companies from '@/pages/companies';
// import Reports from '@/pages/reports';
import AIChatbotDemo from '@/pages/ai-chatbot-demo';
// import { ProtectedRoute } from '@/components/shared';
// import { routes, getDashboardRoute } from '@/lib/routes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Placeholder components for missing files
const CompanySelection = () => <div>Company Selection (Placeholder)</div>;
const Login = () => <div>Login (Placeholder)</div>;
const NotFound = () => <div>404 - Not Found (Placeholder)</div>;
const Dashboard = ({ role }: { role?: string }) => <div>Dashboard for {role} (Placeholder)</div>;
const Companies = () => <div>Companies (Placeholder)</div>;
const Reports = () => <div>Reports (Placeholder)</div>;
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Placeholder routes object
const routes = {
  public: {
    home: '/',
    login: '/login'
  },
  dashboard: {
    super_admin: '/dashboard/super-admin',
    company_manager: '/dashboard/company-manager',
    employee: '/dashboard/employee',
    supervisor: '/dashboard/supervisor',
    worker: '/dashboard/worker'
  },
  functional: {
    companies: '/companies',
    reports: '/reports'
  }
};

// Wrapper component for Dashboard to handle route parameters
const DashboardWrapper = ({ params }: { params?: { role?: string } }) => {
  return <Dashboard role={params?.role} />;
};

const App = () => {
  // const { user } = useAppStore();
  // const isAuthenticated = !!user;
  const isAuthenticated = true; // Placeholder - always authenticated for demo

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Public Routes */}
        <Route path={routes.public.home} component={CompanySelection} />
        <Route path={routes.public.login} component={Login} />

        {/* Protected Routes - Only render if authenticated */}
        {isAuthenticated && (
          <>
            {/* Dashboard Routes - Unified */}
            <Route path={routes.dashboard.super_admin}>
              <ProtectedRoute>
                <Dashboard role="super_admin" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.company_manager}>
              <ProtectedRoute>
                <Dashboard role="company_manager" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.employee}>
              <ProtectedRoute>
                <Dashboard role="employee" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.supervisor}>
              <ProtectedRoute>
                <Dashboard role="supervisor" />
              </ProtectedRoute>
            </Route>

            <Route path={routes.dashboard.worker}>
              <ProtectedRoute>
                <Dashboard role="worker" />
              </ProtectedRoute>
            </Route>

            {/* Legacy dashboard route for backward compatibility */}
            <Route path="/dashboard/:role" component={DashboardWrapper} />
            <Route path="/dashboard" component={DashboardWrapper} />

            {/* Functional Routes */}
            <Route path={routes.functional.companies}>
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            </Route>

            <Route path={routes.functional.reports}>
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            </Route>

            <Route path="/ai-chatbot">
              <ProtectedRoute>
                <AIChatbotDemo />
              </ProtectedRoute>
            </Route>
          </>
        )}

        {/* Catch all route */}
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
};

export default App;
