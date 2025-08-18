import { useEffect, useCallback, useState } from 'react';
import { logger } from '@/lib/logger';


interface LazyLoadingOptions {
  preloadOnHover?: boolean;
  preloadOnMount?: boolean;
  preloadDelay?: number;
}

interface PreloadStatus {
  [key: string]: boolean;
}

export const useLazyLoading = (options: LazyLoadingOptions = {}) => {
  const {
    preloadOnHover = true,
    preloadOnMount = false,
    preloadDelay = 1000
  } = options;

  const [preloadedComponents, setPreloadedComponents] = useState<PreloadStatus>({});
  const [isPreloading, setIsPreloading] = useState(false);

  // Preload a specific component
  const preloadComponent = useCallback(async (importFn: () => Promise<Record<string,
   unknown>>,
   componentName: string) => {
    if (preloadedComponents[componentName]) {
      return; // Already preloaded
    }

    try {
      setIsPreloading(true);
      await importFn();
      setPreloadedComponents(prev => ({
        ...prev,
        [componentName]: true
      }));
    } catch (error) {
      logger.warn(`Failed to preload component ${componentName}:`, error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadedComponents]);

  // Preload multiple components
  const preloadComponents = useCallback(async (components: Array<{
   importFn: () => Promise<Record<string, unknown>>; name: string 
}>) => {
  
    setIsPreloading(true);
    
    try {
      await Promise.all(
        components.map(({ importFn, name }) => preloadComponent(importFn, name))
      );
    } catch (error) {
      logger.warn('Failed to preload some components:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadComponent]);

  // Preload on mount if enabled
  useEffect(() => {
    if (preloadOnMount) {
      const timer = setTimeout(() => {
        // Preload commonly used components
        preloadComponents([
          // Only preload pages that exist in this backup directory
          { importFn: () => import('@/pages/companies'), name: 'Companies' },
          { importFn: () => import('@/pages/ai-chatbot-demo'), name: 'AIChatbotDemo' }
          // Commented out pages that don't exist in backup-console-logs:
          // { importFn: () => import('@/pages/dashboard'), name: 'Dashboard' },
          // { importFn: () => import('@/pages/employees'), name: 'Employees' },
          // { importFn: () => import('@/pages/reports'), name: 'Reports' }
        ]);
      }, preloadDelay);

      return () => clearTimeout(timer);
    }
  }, [preloadOnMount, preloadDelay, preloadComponents]);

  // Create hover handler for preloading
  const createHoverHandler = useCallback((importFn: () => Promise<Record<string,
   unknown>>,
   componentName: string) => {
    if (!preloadOnHover) return undefined;

    let timeoutId: number;

    return {
      onMouseEnter: () => {
        timeoutId = window.setTimeout(() => {
          preloadComponent(importFn, componentName);
        }, 200); // Small delay to avoid unnecessary preloading
      },
      onMouseLeave: () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      }
    };
  }, [preloadOnHover, preloadComponent]);

  // Preload dashboard components
  const preloadDashboardComponents = useCallback(() => {
    preloadComponents([
      // Only preload pages that exist in this backup directory
      { importFn: () => import('@/pages/companies'), name: 'Companies' },
      { importFn: () => import('@/pages/ai-chatbot-demo'), name: 'AIChatbotDemo' }
      // Commented out pages that don't exist in backup-console-logs:
      // { importFn: () => import('@/pages/dashboard'), name: 'Dashboard' },
      // { importFn: () => import('@/pages/ai-dashboard'), name: 'AIDashboard' },
      // { importFn: () => import('@/pages/role-based-dashboard'), name: 'RoleBasedDashboard' },
      // { importFn: () => import('@/pages/super-admin-dashboard'), name: 'SuperAdminDashboard' }
    ]);
  }, [preloadComponents]);

  // Preload employee management components
  const preloadEmployeeComponents = useCallback(() => {
    preloadComponents([
      // Only preload pages that exist in this backup directory
      { importFn: () => import('@/pages/companies'), name: 'Companies' }
      // Commented out pages that don't exist in backup-console-logs:
      // { importFn: () => import('@/pages/employees'), name: 'Employees' },
      // { importFn: () => import('@/pages/employee-management'), name: 'EmployeeManagement' },
      // { importFn: () => import('@/pages/attendance'), name: 'Attendance' },
      // { importFn: () => import('@/pages/leave-requests'), name: 'LeaveRequests' }
    ]);
  }, [preloadComponents]);

  // Preload document management components
  const preloadDocumentComponents = useCallback(() => {
    preloadComponents([
      // Only preload pages that exist in this backup directory
      { importFn: () => import('@/pages/companies'), name: 'Companies' }
      // Commented out pages that don't exist in backup-console-logs:
      // { importFn: () => import('@/pages/documents'), name: 'Documents' },
      // { importFn: () => import('@/pages/licenses'), name: 'Licenses' },
      // { importFn: () => import('@/pages/signatures'), name: 'Signatures' }
    ]);
  }, [preloadComponents]);

  // Preload reporting components
  const preloadReportingComponents = useCallback(() => {
    preloadComponents([
      // Only preload pages that exist in this backup directory
      { importFn: () => import('@/pages/companies'), name: 'Companies' }
      // Commented out pages that don't exist in backup-console-logs:
      // { importFn: () => import('@/pages/reports'), name: 'Reports' },
      // { importFn: () => import('@/pages/performance'), name: 'Performance' },
      // { importFn: () => import('@/pages/ai-analytics'), name: 'AIAnalytics' }
    ]);
  }, [preloadComponents]);

  return {
    preloadComponent,
    preloadComponents,
    createHoverHandler,
    preloadDashboardComponents,
    preloadEmployeeComponents,
    preloadDocumentComponents,
    preloadReportingComponents,
    preloadedComponents,
    isPreloading
  };
};

// Hook for preloading based on user role
export const useRoleBasedPreloading = (userRole?: string) => {
  const { preloadComponents } = useLazyLoading({ preloadOnMount: true });

  useEffect(() => {
    if (!userRole) return;

    const roleBasedComponents: {
   [key: string]: Array<{
   importFn: () => Promise<Record<string, unknown>>; name: string 
}> 
} = {
  
      super_admin: [
        // Only preload pages that exist in this backup directory
        { importFn: () => import('@/pages/companies'), name: 'Companies' }
        // Commented out pages that don't exist in backup-console-logs:
        // { importFn: () => import('@/pages/super-admin-dashboard'), name: 'SuperAdminDashboard' },
        // { importFn: () => import('@/pages/reports'), name: 'Reports' },
        // { importFn: () => import('@/pages/settings'), name: 'Settings' }
      ],
      company_manager: [
        // Only preload pages that exist in this backup directory
        { importFn: () => import('@/pages/companies'), name: 'Companies' }
        // Commented out pages that don't exist in backup-console-logs:
        // { importFn: () => import('@/pages/dashboard'), name: 'Dashboard' },
        // { importFn: () => import('@/pages/employees'), name: 'Employees' },
        // { importFn: () => import('@/pages/reports'), name: 'Reports' },
        // { importFn: () => import('@/pages/attendance'), name: 'Attendance' }
      ],
      employee: [
        // Only preload pages that exist in this backup directory
        { importFn: () => import('@/pages/companies'), name: 'Companies' }
        // Commented out pages that don't exist in backup-console-logs:
        // { importFn: () => import('@/pages/dashboard'), name: 'Dashboard' },
        // { importFn: () => import('@/pages/documents'), name: 'Documents' },
        // { importFn: () => import('@/pages/leave-requests'), name: 'LeaveRequests' }
      ],
      supervisor: [
        // Only preload pages that exist in this backup directory
        { importFn: () => import('@/pages/companies'), name: 'Companies' }
        // Commented out pages that don't exist in backup-console-logs:
        // { importFn: () => import('@/pages/dashboard'), name: 'Dashboard' },
        // { importFn: () => import('@/pages/employees'), name: 'Employees' },
        // { importFn: () => import('@/pages/attendance'), name: 'Attendance' },
        // { importFn: () => import('@/pages/performance'), name: 'Performance' }
      ],
      worker: [
        // Only preload pages that exist in this backup directory
        { importFn: () => import('@/pages/companies'), name: 'Companies' }
        // Commented out pages that don't exist in backup-console-logs:
        // { importFn: () => import('@/pages/dashboard'), name: 'Dashboard' },
        // { importFn: () => import('@/pages/attendance'), name: 'Attendance' },
        // { importFn: () => import('@/pages/documents'), name: 'Documents' }
      ]
    };

    const componentsToPreload = roleBasedComponents[userRole] || [];
    if (componentsToPreload.length > 0) {
      preloadComponents(componentsToPreload);
    }
  }, [userRole, preloadComponents]);
};

// Hook for preloading based on current route
export const useRouteBasedPreloading = (currentRoute: string) => {
  const { preloadComponent } = useLazyLoading();

  useEffect(() => {
    const routeComponentMap: {
   [key: string]: {
   importFn: () => Promise<Record<string, unknown>>; name: string 
} 
} = {
  
      // Only map routes to pages that exist in this backup directory
      '/companies': { importFn: () => import('@/pages/companies'), name: 'Companies' },
      '/ai-chatbot': { importFn: () => import('@/pages/ai-chatbot-demo'), name: 'AIChatbotDemo' }
      // Commented out routes for pages that don't exist in backup-console-logs:
      // '/dashboard': { importFn: () => import('@/pages/dashboard'), name: 'Dashboard' },
      // '/employees': { importFn: () => import('@/pages/employees'), name: 'Employees' },
      // '/reports': { importFn: () => import('@/pages/reports'), name: 'Reports' },
      // '/attendance': { importFn: () => import('@/pages/attendance'), name: 'Attendance' },
      // '/documents': { importFn: () => import('@/pages/documents'), name: 'Documents' },
      // '/settings': { importFn: () => import('@/pages/settings'), name: 'Settings' }
    };

    const componentToPreload = routeComponentMap[currentRoute];
    if (componentToPreload) {
      preloadComponent(componentToPreload.importFn, componentToPreload.name);
    }
  }, [currentRoute, preloadComponent]);
}; 