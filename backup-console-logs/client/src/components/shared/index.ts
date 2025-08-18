// Core Components
export {
  ErrorBoundary, withErrorBoundary, SimpleErrorFallback, NetworkErrorFallback
} from './ErrorBoundary';
export {LoadingScreen, CompactLoadingScreen, OverlayLoadingScreen} from './LoadingScreen';
export {
  LoadingFallback, PageLoadingFallback, ComponentLoadingFallback, OverlayLoadingFallback as OverlayLoading
} from './LoadingFallback';
export {HelmetProvider, usePageMeta} from './HelmetProvider';
export {PageHelmet, PageHelmets} from './PageHelmet';
export {ErrorMessage} from './ErrorMessage';
export {LoadingSpinner} from './LoadingSpinner';

// App Initialization
export {AppInitializer, InitializationDebugger} from './AppInitializer';

// Route Protection
export {ProtectedRoute} from './ProtectedRoute';
export {
  ProtectedCompaniesPage,
  ProtectedEmployeesPage,
  ProtectedReportsPage,
  ProtectedSettingsPage,
  ProtectedAttendancePage,
  ProtectedLeaveRequestsPage,
  ProtectedPayrollPage,
  ProtectedDocumentsPage,
  ProtectedTrainingPage,
  ProtectedRecruitmentPage,
  ProtectedPerformancePage,
  ProtectedAdvancedSearchPage,
  ProtectedAIDashboardPage,
  ProtectedAccountingSystemsPage,
  ProtectedGovernmentFormsPage
} from './ProtectedPage';

// Enhanced Error Boundary
export {LoggingErrorBoundary} from '../../lib/logger';
