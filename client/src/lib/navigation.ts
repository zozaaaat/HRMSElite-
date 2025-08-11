import {useLocation} from 'wouter';
import {routes, getDashboardRoute, UserRole} from './routes';
import {canAccessPage} from './roles';

// Hook for navigation
export const useNavigation = () => {

  const [, setLocation] = useLocation();

  const navigate = (path: string) => {

    setLocation(path);

  };

  const navigateToDashboard = (role: UserRole) => {

    const dashboardPath = getDashboardRoute(role);
    setLocation(dashboardPath);

  };

  const navigateToLogin = () => {

    setLocation(routes.public.login);

  };

  const navigateToHome = () => {

    setLocation(routes.public.home);

  };

  const navigateToCompanies = () => {

    setLocation(routes.functional.companies);

  };

  const navigateToReports = () => {

    setLocation(routes.functional.reports);

  };

  const goBack = () => {

    // For wouter, we can use browser history
    window.history.back();

  };

  return {
    navigate,
    navigateToDashboard,
    navigateToLogin,
    navigateToHome,
    navigateToCompanies,
    navigateToReports,
    goBack
  };

};

// Utility function to get current route info
export const getCurrentRouteInfo = () => {

  const [location] = useLocation();

  // Check if it's a dashboard route
  const dashboardMatch = location.match(/^\/dashboard\/([^/]+)/);
  if (dashboardMatch) {

    return {
      'type': 'dashboard',
      'role': dashboardMatch[1] as UserRole,
      'path': location
    };

  }

  // Check other routes
  const routeEntries = Object.entries(routes.functional);
  for (const [key, path] of routeEntries) {

    if (location === path) {

      return {
        'type': 'functional',
        'page': key,
        'path': location
      };

    }

  }

  return {
    'type': 'unknown',
    'path': location
  };

};

// Utility function to check if user can access a route
export const canAccessRoute = (userRole: UserRole, routePath: string): boolean => {

  // Dashboard routes
  if (routePath.startsWith('/dashboard/')) {

    const roleFromPath = routePath.split('/')[2] as UserRole;
    return userRole === roleFromPath;

  }

  // Functional routes
  const routeEntries = Object.entries(routes.functional);
  for (const [key, path] of routeEntries) {

    if (routePath === path) {

      return canAccessPage(userRole, key);

    }

  }

  return false;

};
