import {ReactNode} from 'react';
import {ProtectedRoute} from './ProtectedRoute';
import type {UserRole} from '../../lib/routes';

interface ProtectedPageProps {
  children: ReactNode;
  pageId: string;
  fallbackPath?: string;
  requiredRole?: UserRole;
}

export function ProtectedPage ({
  children,
  pageId,
  fallbackPath,
  requiredRole
}: ProtectedPageProps) {

  // Create props object conditionally to avoid exactOptionalPropertyTypes issues
  const routeProps: {
    pageId: string;
    children: ReactNode;
    fallbackPath?: string;
    requiredRole?: UserRole;
  } = {
    pageId,
    children
  };

  if (fallbackPath !== undefined) {
    routeProps.fallbackPath = fallbackPath;
  }

  if (requiredRole !== undefined) {
    routeProps.requiredRole = requiredRole;
  }

  return (
    <ProtectedRoute {...routeProps} />
  );

}

// مكونات محمية جاهزة للاستخدام
export function ProtectedCompaniesPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="companies">{children}</ProtectedPage>;

}

export function ProtectedEmployeesPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="employees">{children}</ProtectedPage>;

}

export function ProtectedReportsPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="reports">{children}</ProtectedPage>;

}

export function ProtectedSettingsPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="settings">{children}</ProtectedPage>;

}

export function ProtectedAttendancePage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="attendance">{children}</ProtectedPage>;

}

export function ProtectedLeaveRequestsPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="leave-requests">{children}</ProtectedPage>;

}

export function ProtectedPayrollPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="payroll">{children}</ProtectedPage>;

}

export function ProtectedDocumentsPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="documents">{children}</ProtectedPage>;

}

export function ProtectedTrainingPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="training">{children}</ProtectedPage>;

}

export function ProtectedRecruitmentPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="recruitment">{children}</ProtectedPage>;

}

export function ProtectedPerformancePage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="performance">{children}</ProtectedPage>;

}

export function ProtectedAdvancedSearchPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="advanced-search">{children}</ProtectedPage>;

}

export function ProtectedAIDashboardPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="ai-dashboard">{children}</ProtectedPage>;

}

export function ProtectedAccountingSystemsPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="accounting-systems">{children}</ProtectedPage>;

}

export function ProtectedGovernmentFormsPage ({children}: { children: ReactNode }) {

  return <ProtectedPage pageId="government-forms">{children}</ProtectedPage>;

}
