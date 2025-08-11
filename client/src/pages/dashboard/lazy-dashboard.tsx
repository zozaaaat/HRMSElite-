import React from 'react';
import SuspenseWrapper from '@/components/optimized/SuspenseWrapper';

// Lazy load dashboard components for better performance
export const LazyDashboardMain = React.lazy(() => import('../dashboard'));
export const LazyAIDashboard = React.lazy(() => import('../ai-dashboard'));
export const LazyRoleBasedDashboard = React.lazy(() => import('../role-based-dashboard'));
export const LazySuperAdminDashboard = React.lazy(() => import('../super-admin-dashboard'));

// Dashboard components with specialized loading states
type DashboardProps = Record<string, unknown>;

const CenteredMessage = ({message}: { message: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <span className="text-muted-foreground">{message}</span>
  </div>
);

export const DashboardMain = (props: DashboardProps) => (
  <SuspenseWrapper
    type="chart"
    message="جاري تحميل لوحة التحكم الرئيسية..."
  >
    <LazyDashboardMain {...props} />
  </SuspenseWrapper>
);

export const AIDashboard = (props: DashboardProps) => (
  <SuspenseWrapper
    type="chart"
    message="جاري تحميل لوحة التحكم الذكية..."
  >
    <LazyAIDashboard {...props} />
  </SuspenseWrapper>
);

export const RoleBasedDashboard = (props: DashboardProps) => (
  <SuspenseWrapper
    type="chart"
    message="جاري تحميل لوحة التحكم حسب الدور..."
  >
    <LazyRoleBasedDashboard {...props} />
  </SuspenseWrapper>
);

export const SuperAdminDashboard = (props: DashboardProps) => (
  <SuspenseWrapper
    type="chart"
    message="جاري تحميل لوحة تحكم المدير العام..."
  >
    <LazySuperAdminDashboard {...props} />
  </SuspenseWrapper>
);

// Dashboard wrapper with role-based loading
export const DashboardWrapper = ({role, ...props}: { role?: string } & DashboardProps) => {

  const getDashboardComponent = () => {

    switch (role) {

    case 'super_admin':
      return <SuperAdminDashboard {...props} />;
    case 'ai_dashboard':
      return <AIDashboard {...props} />;
    case 'role_based':
      return <RoleBasedDashboard {...props} />;
    default:
      return <DashboardMain {...props} />;

    }

  };

  return getDashboardComponent();

};

// Preload dashboard components for better UX
export const preloadDashboardComponents = () => {

  // Preload main dashboard
  import('../dashboard');

  // Preload AI dashboard
  import('../ai-dashboard');

  // Preload role-based dashboard
  import('../role-based-dashboard');

  // Preload super admin dashboard
  import('../super-admin-dashboard');

};

// Dashboard loading states for different scenarios
export const DashboardLoadingStates = {
  'main': () => <CenteredMessage message="جاري تحميل لوحة التحكم الرئيسية..." />,
  'ai': () => <CenteredMessage message="جاري تحميل لوحة التحكم الذكية..." />,
  'roleBased': () => <CenteredMessage message="جاري تحميل لوحة التحكم حسب الدور..." />,
  'superAdmin': () => <CenteredMessage message="جاري تحميل لوحة تحكم المدير العام..." />
};
