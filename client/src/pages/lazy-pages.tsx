import React from 'react';
import SuspenseWrapper from '../components/optimized/SuspenseWrapper';
import { t } from "i18next";

// Define a generic props type for page components
type PageProps = Record<string, unknown>;

// Lazy load all pages for better performance
export const LazyCompanySelection = React.lazy(() => import('./company-selection'));
export const LazyLogin = React.lazy(() => import('./login'));
export const LazyNotFound = React.lazy(() => import('./not-found'));
export const LazyDashboard = React.lazy(() => import('./dashboard'));
export const LazyCompanies = React.lazy(() => import('./companies'));
export const LazyCompanyDetails = React.lazy(() => import('./company-details'));
export const LazyEmployees = React.lazy(() => import('./employees'));
export const LazyEmployeesEnhanced = React.lazy(() => import('./employees-enhanced'));
export const LazyReports = React.lazy(() => import('./reports'));
export const LazySettings = React.lazy(() => import('./settings'));
export const LazyAttendance = React.lazy(() => import('./attendance'));
export const LazyLeaveRequests = React.lazy(() => import('./leave-requests'));
export const LazyPayroll = React.lazy(() => import('./payroll'));
export const LazyDocuments = React.lazy(() => import('./documents'));
export const LazyTraining = React.lazy(() => import('./training'));
export const LazyRecruitment = React.lazy(() => import('./recruitment'));
export const LazyPerformance = React.lazy(() => import('./performance'));
export const LazyAdvancedSearch = React.lazy(() => import('./advanced-search'));
export const LazyAIDashboard = React.lazy(() => import('./ai-dashboard'));
export const LazyAIChatbotDemo = React.lazy(() => import('./ai-chatbot-demo'));
export const LazyAIAnalytics = React.lazy(() => import('./ai-analytics'));
export const LazyAccountingSystems = React.lazy(() => import('./accounting-systems'));
export const LazyGovernmentForms = React.lazy(() => import('./government-forms'));
export const LazyLicenses = React.lazy(() => import('./licenses'));
export const LazyLeaves = React.lazy(() => import('./leaves'));
export const LazySignatures = React.lazy(() => import('./signatures'));
export const LazySignatureTest = React.lazy(() => import('./signature-test'));
export const LazyPermissionTest = React.lazy(() => import('./permission-test'));
export const LazyRoleBasedDashboard = React.lazy(() => import('./role-based-dashboard'));
export const LazySuperAdminDashboard = React.lazy(() => import('./super-admin-dashboard'));
export const LazyEmployeeManagement = React.lazy(() => import('./employee-management'));
export const LazyLayoutExample = React.lazy(() => import('./layout-example'));
export const LazyPerformanceTest = React.lazy(() => import('./performance-test'));
export const LazyI18nTest = React.lazy(() => import('../tests/i18n-test'));

// Wrapped components with appropriate Suspense fallbacks
export const CompanySelection = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.1')}>
    <LazyCompanySelection {...props} />
  </SuspenseWrapper>
);

export const Login = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.2')}>
    <LazyLogin {...props} />
  </SuspenseWrapper>
);

export const NotFound = (props: PageProps) => (
  <SuspenseWrapper type="default" message={t('auto.lazy-pages.3')}>
    <LazyNotFound {...props} />
  </SuspenseWrapper>
);

export const Dashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.4')}>
    <LazyDashboard {...props} />
  </SuspenseWrapper>
);

export const Companies = (props: PageProps) => (
  <SuspenseWrapper type="table" message={t('auto.lazy-pages.5')}>
    <LazyCompanies {...props} />
  </SuspenseWrapper>
);

export const CompanyDetails = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.6')}>
    <LazyCompanyDetails {...props} />
  </SuspenseWrapper>
);

export const Employees = (props: PageProps) => (
  <SuspenseWrapper type="table" message={t('auto.lazy-pages.7')}>
    <LazyEmployees {...props} />
  </SuspenseWrapper>
);

export const EmployeesEnhanced = (props: PageProps) => (
  <SuspenseWrapper type="table" message={t('auto.lazy-pages.8')}>
    <LazyEmployeesEnhanced {...props} />
  </SuspenseWrapper>
);

export const Reports = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.9')}>
    <LazyReports {...props} />
  </SuspenseWrapper>
);

export const Settings = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.10')}>
    <LazySettings {...props} />
  </SuspenseWrapper>
);

export const Attendance = (props: PageProps) => (
  <SuspenseWrapper type="table" message={t('auto.lazy-pages.11')}>
    <LazyAttendance {...props} />
  </SuspenseWrapper>
);

export const LeaveRequests = (props: PageProps) => (
  <SuspenseWrapper type="list" message={t('auto.lazy-pages.12')}>
    <LazyLeaveRequests {...props} />
  </SuspenseWrapper>
);

export const Payroll = (props: PageProps) => (
  <SuspenseWrapper type="table" message={t('auto.lazy-pages.13')}>
    <LazyPayroll {...props} />
  </SuspenseWrapper>
);

export const Documents = (props: PageProps) => (
  <SuspenseWrapper type="list" message={t('auto.lazy-pages.14')}>
    <LazyDocuments {...props} />
  </SuspenseWrapper>
);

export const Training = (props: PageProps) => (
  <SuspenseWrapper type="list" message={t('auto.lazy-pages.15')}>
    <LazyTraining {...props} />
  </SuspenseWrapper>
);

export const Recruitment = (props: PageProps) => (
  <SuspenseWrapper type="list" message={t('auto.lazy-pages.16')}>
    <LazyRecruitment {...props} />
  </SuspenseWrapper>
);

export const Performance = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.17')}>
    <LazyPerformance {...props} />
  </SuspenseWrapper>
);

export const AdvancedSearch = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.18')}>
    <LazyAdvancedSearch {...props} />
  </SuspenseWrapper>
);

export const AIDashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.19')}>
    <LazyAIDashboard {...props} />
  </SuspenseWrapper>
);

export const AIChatbotDemo = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.20')}>
    <LazyAIChatbotDemo {...props} />
  </SuspenseWrapper>
);

export const AIAnalytics = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.21')}>
    <LazyAIAnalytics {...props} />
  </SuspenseWrapper>
);

export const AccountingSystems = (props: PageProps) => (
  <SuspenseWrapper type="table" message={t('auto.lazy-pages.22')}>
    <LazyAccountingSystems {...props} />
  </SuspenseWrapper>
);

export const GovernmentForms = (props: PageProps) => (
  <SuspenseWrapper type="list" message={t('auto.lazy-pages.23')}>
    <LazyGovernmentForms {...props} />
  </SuspenseWrapper>
);

export const Licenses = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.24')}>
    <LazyLicenses {...props} />
  </SuspenseWrapper>
);

export const Leaves = (props: PageProps) => (
  <SuspenseWrapper type="list" message={t('auto.lazy-pages.25')}>
    <LazyLeaves {...props} />
  </SuspenseWrapper>
);

export const Signatures = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.26')}>
    <LazySignatures {...props} />
  </SuspenseWrapper>
);

export const SignatureTest = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.27')}>
    <LazySignatureTest {...props} />
  </SuspenseWrapper>
);

export const PermissionTest = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.28')}>
    <LazyPermissionTest {...props} />
  </SuspenseWrapper>
);

export const RoleBasedDashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.29')}>
    <LazyRoleBasedDashboard {...props} />
  </SuspenseWrapper>
);

export const SuperAdminDashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.30')}>
    <LazySuperAdminDashboard {...props} />
  </SuspenseWrapper>
);

export const EmployeeManagement = (props: PageProps) => (
  <SuspenseWrapper type="table" message={t('auto.lazy-pages.31')}>
    <LazyEmployeeManagement {...props} />
  </SuspenseWrapper>
);

export const LayoutExample = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.32')}>
    <LazyLayoutExample {...props} />
  </SuspenseWrapper>
);

export const PerformanceTest = (props: PageProps) => (
  <SuspenseWrapper type="chart" message={t('auto.lazy-pages.33')}>
    <LazyPerformanceTest {...props} />
  </SuspenseWrapper>
);

export const I18nTest = (props: PageProps) => (
  <SuspenseWrapper type="card" message={t('auto.lazy-pages.34')}>
    <LazyI18nTest {...props} />
  </SuspenseWrapper>
);
