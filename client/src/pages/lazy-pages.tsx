import React from 'react';
import SuspenseWrapper from '../components/optimized/SuspenseWrapper';

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
  <SuspenseWrapper type="card" message="جاري تحميل صفحة اختيار الشركة...">
    <LazyCompanySelection {...props} />
  </SuspenseWrapper>
);

export const Login = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل صفحة تسجيل الدخول...">
    <LazyLogin {...props} />
  </SuspenseWrapper>
);

export const NotFound = (props: PageProps) => (
  <SuspenseWrapper type="default" message="جاري تحميل الصفحة...">
    <LazyNotFound {...props} />
  </SuspenseWrapper>
);

export const Dashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل لوحة التحكم...">
    <LazyDashboard {...props} />
  </SuspenseWrapper>
);

export const Companies = (props: PageProps) => (
  <SuspenseWrapper type="table" message="جاري تحميل قائمة الشركات...">
    <LazyCompanies {...props} />
  </SuspenseWrapper>
);

export const CompanyDetails = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل تفاصيل الشركة...">
    <LazyCompanyDetails {...props} />
  </SuspenseWrapper>
);

export const Employees = (props: PageProps) => (
  <SuspenseWrapper type="table" message="جاري تحميل قائمة الموظفين...">
    <LazyEmployees {...props} />
  </SuspenseWrapper>
);

export const EmployeesEnhanced = (props: PageProps) => (
  <SuspenseWrapper type="table" message="جاري تحميل قائمة الموظفين المحسنة...">
    <LazyEmployeesEnhanced {...props} />
  </SuspenseWrapper>
);

export const Reports = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل التقارير...">
    <LazyReports {...props} />
  </SuspenseWrapper>
);

export const Settings = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل الإعدادات...">
    <LazySettings {...props} />
  </SuspenseWrapper>
);

export const Attendance = (props: PageProps) => (
  <SuspenseWrapper type="table" message="جاري تحميل صفحة الحضور...">
    <LazyAttendance {...props} />
  </SuspenseWrapper>
);

export const LeaveRequests = (props: PageProps) => (
  <SuspenseWrapper type="list" message="جاري تحميل طلبات الإجازة...">
    <LazyLeaveRequests {...props} />
  </SuspenseWrapper>
);

export const Payroll = (props: PageProps) => (
  <SuspenseWrapper type="table" message="جاري تحميل كشف الرواتب...">
    <LazyPayroll {...props} />
  </SuspenseWrapper>
);

export const Documents = (props: PageProps) => (
  <SuspenseWrapper type="list" message="جاري تحميل المستندات...">
    <LazyDocuments {...props} />
  </SuspenseWrapper>
);

export const Training = (props: PageProps) => (
  <SuspenseWrapper type="list" message="جاري تحميل صفحة التدريب...">
    <LazyTraining {...props} />
  </SuspenseWrapper>
);

export const Recruitment = (props: PageProps) => (
  <SuspenseWrapper type="list" message="جاري تحميل صفحة التوظيف...">
    <LazyRecruitment {...props} />
  </SuspenseWrapper>
);

export const Performance = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل تقييم الأداء...">
    <LazyPerformance {...props} />
  </SuspenseWrapper>
);

export const AdvancedSearch = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل البحث المتقدم...">
    <LazyAdvancedSearch {...props} />
  </SuspenseWrapper>
);

export const AIDashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل لوحة التحكم الذكية...">
    <LazyAIDashboard {...props} />
  </SuspenseWrapper>
);

export const AIChatbotDemo = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل المحادثة الذكية...">
    <LazyAIChatbotDemo {...props} />
  </SuspenseWrapper>
);

export const AIAnalytics = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل التحليلات الذكية...">
    <LazyAIAnalytics {...props} />
  </SuspenseWrapper>
);

export const AccountingSystems = (props: PageProps) => (
  <SuspenseWrapper type="table" message="جاري تحميل أنظمة المحاسبة...">
    <LazyAccountingSystems {...props} />
  </SuspenseWrapper>
);

export const GovernmentForms = (props: PageProps) => (
  <SuspenseWrapper type="list" message="جاري تحميل النماذج الحكومية...">
    <LazyGovernmentForms {...props} />
  </SuspenseWrapper>
);

export const Licenses = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل التراخيص...">
    <LazyLicenses {...props} />
  </SuspenseWrapper>
);

export const Leaves = (props: PageProps) => (
  <SuspenseWrapper type="list" message="جاري تحميل الإجازات...">
    <LazyLeaves {...props} />
  </SuspenseWrapper>
);

export const Signatures = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل التوقيعات...">
    <LazySignatures {...props} />
  </SuspenseWrapper>
);

export const SignatureTest = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل اختبار التوقيع...">
    <LazySignatureTest {...props} />
  </SuspenseWrapper>
);

export const PermissionTest = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل اختبار الصلاحيات...">
    <LazyPermissionTest {...props} />
  </SuspenseWrapper>
);

export const RoleBasedDashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل لوحة التحكم حسب الدور...">
    <LazyRoleBasedDashboard {...props} />
  </SuspenseWrapper>
);

export const SuperAdminDashboard = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل لوحة تحكم المدير العام...">
    <LazySuperAdminDashboard {...props} />
  </SuspenseWrapper>
);

export const EmployeeManagement = (props: PageProps) => (
  <SuspenseWrapper type="table" message="جاري تحميل إدارة الموظفين...">
    <LazyEmployeeManagement {...props} />
  </SuspenseWrapper>
);

export const LayoutExample = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل مثال التخطيط...">
    <LazyLayoutExample {...props} />
  </SuspenseWrapper>
);

export const PerformanceTest = (props: PageProps) => (
  <SuspenseWrapper type="chart" message="جاري تحميل صفحة اختبار الأداء...">
    <LazyPerformanceTest {...props} />
  </SuspenseWrapper>
);

export const I18nTest = (props: PageProps) => (
  <SuspenseWrapper type="card" message="جاري تحميل اختبار الترجمة...">
    <LazyI18nTest {...props} />
  </SuspenseWrapper>
);
