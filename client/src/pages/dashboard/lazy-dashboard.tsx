import React from 'react';
import SuspenseWrapper from '@/components/optimized/SuspenseWrapper';
import {useTranslation} from 'react-i18next';

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

export const DashboardMain = (props: DashboardProps) => {
  const {t} = useTranslation();
  return (
    <SuspenseWrapper
      type="chart"
      message={t('dashboard.loadingStates.main')}
    >
      <LazyDashboardMain {...props} />
    </SuspenseWrapper>
  );
};

export const AIDashboard = (props: DashboardProps) => {
  const {t} = useTranslation();
  return (
    <SuspenseWrapper
      type="chart"
      message={t('dashboard.loadingStates.ai')}
    >
      <LazyAIDashboard {...props} />
    </SuspenseWrapper>
  );
};

export const RoleBasedDashboard = (props: DashboardProps) => {
  const {t} = useTranslation();
  return (
    <SuspenseWrapper
      type="chart"
      message={t('dashboard.loadingStates.roleBased')}
    >
      <LazyRoleBasedDashboard {...props} />
    </SuspenseWrapper>
  );
};

export const SuperAdminDashboard = (props: DashboardProps) => {
  const {t} = useTranslation();
  return (
    <SuspenseWrapper
      type="chart"
      message={t('dashboard.loadingStates.superAdmin')}
    >
      <LazySuperAdminDashboard {...props} />
    </SuspenseWrapper>
  );
};

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
  'main': () => {
    const {t} = useTranslation();
    return <CenteredMessage message={t('dashboard.loadingStates.main')} />;
  },
  'ai': () => {
    const {t} = useTranslation();
    return <CenteredMessage message={t('dashboard.loadingStates.ai')} />;
  },
  'roleBased': () => {
    const {t} = useTranslation();
    return <CenteredMessage message={t('dashboard.loadingStates.roleBased')} />;
  },
  'superAdmin': () => {
    const {t} = useTranslation();
    return <CenteredMessage message={t('dashboard.loadingStates.superAdmin')} />;
  }
};
