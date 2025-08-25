import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { useAppStore } from './stores/useAppStore';
import { ProtectedRoute } from './components/shared';
import { ReactQueryDevTools } from './components/shared/ReactQueryDevTools';
import { AccessibilityProvider } from './components/shared/AccessibilityProvider';
import { queryClient } from './lib/queryClient';
import { useRoleBasedPreloading } from './hooks/useLazyLoading';
import { useDirection } from './hooks/useDirection';
import { Toaster } from './components/ui/toaster';
import { NotFound } from './pages/lazy-pages';

const AuthRoutes = lazy(() => import('./routes/authRoutes'));
const HrRoutes = lazy(() => import('./routes/hrRoutes'));
const AdminRoutes = lazy(() => import('./routes/adminRoutes'));

const App = () => {
  const { user } = useAppStore();
  const isAuthenticated = !!user;
  useRoleBasedPreloading(user?.role ?? undefined);
  useDirection();

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <Switch>
          <Suspense fallback={<div role="status" aria-live="polite">Loading…</div>}>
            <AuthRoutes />
          </Suspense>
          {isAuthenticated && (
            <>
              <Suspense fallback={<div role="status" aria-live="polite">Loading…</div>}>
                <ProtectedRoute pageId="dashboard">
                  <HrRoutes />
                </ProtectedRoute>
              </Suspense>
              <Suspense fallback={<div role="status" aria-live="polite">Loading…</div>}>
                <ProtectedRoute pageId="dashboard" requiredRole="company_manager">
                  <AdminRoutes />
                </ProtectedRoute>
              </Suspense>
            </>
          )}
          <Route>
            <NotFound />
          </Route>
        </Switch>
        <ReactQueryDevTools initialIsOpen={false} />
        <Toaster />
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};

export default App;
