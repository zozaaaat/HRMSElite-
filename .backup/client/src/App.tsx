import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/stores/useAppStore';
import CompanySelection from '@/pages/company-selection';
import Login from '@/pages/login';
import NotFound from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';
import Companies from '@/pages/companies';
import Reports from '@/pages/reports';
import AIChatbotDemo from '@/pages/ai-chatbot-demo';
import { ProtectedRoute } from '@/components/shared';
import { routes, getDashboardRoute } from '@/lib/routes';

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

// Wrapper component for Dashboard to handle route parameters
const DashboardWrapper = ({ params }: { params?: { role?: string } }) => {
  return <Dashboard role={params?.role} />;
};

const App = () => {
  const { user } = useAppStore();
  const isAuthenticated = !!user;

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

            {/* Legacy dashboard route for backward compatibility */}
            <Route path="/dashboard/:role" component={DashboardWrapper} />
            <Route path="/dashboard" component={DashboardWrapper} />

            {/* Functional Routes */}
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

            <Route path="/ai-chatbot">
              <ProtectedRoute pageId="ai_dashboard">
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
