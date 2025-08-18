import {useEffect, useCallback, useState, useRef} from 'react';
import { log } from '../lib/logger';

// Type declarations for browser APIs
declare global {
  interface Window {
    IntersectionObserver: any;
  }
}

// Ensure IntersectionObserver is available
const _isIntersectionObserverSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window;

interface LazyLoadingOptions {
  preloadOnHover?: boolean;
  preloadOnMount?: boolean;
  preloadDelay?: number;
  preloadOnIntersection?: boolean;
  preloadOnRouteChange?: boolean;
}

interface PreloadStatus {
  [key: string]: boolean;
}

interface ComponentImport {
  importFn: () => Promise<Record<string, unknown>>;
  name: string;
  priority?: 'high' | 'medium' | 'low';
}

export const useLazyLoading = (options: LazyLoadingOptions = {}) => {

  const {
    preloadOnHover = true,
    preloadOnMount: _preloadOnMount = false,
    preloadDelay: _preloadDelay = 1000,
    preloadOnIntersection = true,
    preloadOnRouteChange: _preloadOnRouteChange = true
  } = options;

  const [preloadedComponents, setPreloadedComponents] = useState<PreloadStatus>({});
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadQueue, setPreloadQueue] = useState<ComponentImport[]>([]);
  const preloadTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const intersectionObserverRef = useRef<any>(null);

  // Enhanced preload component with priority
  const preloadComponent = useCallback(async (
    importFn: () => Promise<Record<string, unknown>>,
    componentName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {

    if (preloadedComponents[componentName]) {
      return; // Already preloaded
    }

    try {
      setIsPreloading(true);
      
      // Add to queue based on priority
      const component: ComponentImport = { importFn, name: componentName, priority };
      
      setPreloadQueue(prev => {
        const newQueue = [...prev];
        if (priority === 'high') {
          newQueue.unshift(component);
        } else if (priority === 'low') {
          newQueue.push(component);
        } else {
          // Insert medium priority components in the middle
          const mediumIndex = newQueue.findIndex(item => item.priority === 'low');
          if (mediumIndex === -1) {
            newQueue.push(component);
          } else {
            newQueue.splice(mediumIndex, 0, component);
          }
        }
        return newQueue;
      });

      // Process queue with delay for better performance
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }

      preloadTimeoutRef.current = setTimeout(async () => {
        try {
          await importFn();
          setPreloadedComponents(prev => ({
            ...prev,
            [componentName]: true
          }));
          
          // Remove from queue
          setPreloadQueue(prev => prev.filter(item => item.name !== componentName));
        } catch (error) {
          log.error('Failed to preload component', error, 'useLazyLoading');
        }
      }, priority === 'high' ? 0 : 100);

    } catch (error) {
      log.error('Failed to preload component', error, 'useLazyLoading');
    } finally {
      setIsPreloading(false);
    }

  }, [preloadedComponents]);

  // Enhanced preload multiple components with priority
  const preloadComponents = useCallback(async (components: ComponentImport[]) => {
    
    setIsPreloading(true);

    try {
      // Sort components by priority
      const sortedComponents = [...components].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
      });

      // Preload high priority components immediately
      const highPriorityComponents = sortedComponents.filter(c => c.priority === 'high');
      await Promise.all(
        highPriorityComponents.map(({importFn, name}) => 
          preloadComponent(importFn, name, 'high')
        )
      );

      // Preload other components with delay
      const otherComponents = sortedComponents.filter(c => c.priority !== 'high');
      if (otherComponents.length > 0) {
        setTimeout(() => {
          otherComponents.forEach(({importFn, name, priority}) => 
            preloadComponent(importFn, name, priority)
          );
        }, 200);
      }

    } catch (error) {
      log.error('Failed to preload components', error, 'useLazyLoading');
    } finally {
      setIsPreloading(false);
    }

  }, [preloadComponent]);

  // Enhanced hover handler with debouncing
  const createHoverHandler = useCallback((
    importFn: () => Promise<Record<string, unknown>>,
    componentName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {

    if (!preloadOnHover) {
      return undefined;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isHovering = false;

    return {
      onMouseEnter: () => {
        isHovering = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
          if (isHovering) {
            preloadComponent(importFn, componentName, priority);
          }
        }, 150); // Reduced delay for better responsiveness
      },
      onMouseLeave: () => {
        isHovering = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

  }, [preloadOnHover, preloadComponent]);

  // Intersection Observer for preloading on scroll
  const createIntersectionHandler = useCallback((
    importFn: () => Promise<Record<string, unknown>>,
    componentName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {

    if (!preloadOnIntersection || typeof window === 'undefined' || !window.IntersectionObserver) {
      return undefined;
    }

    return (element: HTMLElement | null) => {
      if (!element) return;

      if (!intersectionObserverRef.current) {
        intersectionObserverRef.current = new window.IntersectionObserver(
          (entries: any[]) => {
            entries.forEach((entry: any) => {
              if (entry.isIntersecting) {
                const componentName = entry.target.getAttribute('data-component');
                if (componentName) {
                  preloadComponent(importFn, componentName, priority);
                  intersectionObserverRef.current?.unobserve(entry.target);
                }
              }
            });
          },
          {
            rootMargin: '50px', // Start preloading 50px before element is visible
            threshold: 0.1
          }
        );
      }

      element.setAttribute('data-component', componentName);
      intersectionObserverRef.current.observe(element);
    };

  }, [preloadOnIntersection, preloadComponent]);

  // Enhanced preload functions with priority
  const preloadDashboardComponents = useCallback(() => {
    preloadComponents([
      {importFn: () => import('@/pages/dashboard'), name: 'Dashboard', priority: 'high'},
      {importFn: () => import('@/pages/ai-dashboard'), name: 'AIDashboard', priority: 'medium'},
      {importFn: () => import('@/pages/role-based-dashboard'), name: 'RoleBasedDashboard', priority: 'medium'},
      {importFn: () => import('@/pages/super-admin-dashboard'), name: 'SuperAdminDashboard', priority: 'low'}
    ]);
  }, [preloadComponents]);

  const preloadEmployeeComponents = useCallback(() => {
    preloadComponents([
      {importFn: () => import('@/pages/employees'), name: 'Employees', priority: 'high'},
      {importFn: () => import('@/pages/employee-management'), name: 'EmployeeManagement', priority: 'medium'},
      {importFn: () => import('@/pages/attendance'), name: 'Attendance', priority: 'high'},
      {importFn: () => import('@/pages/leave-requests'), name: 'LeaveRequests', priority: 'medium'}
    ]);
  }, [preloadComponents]);

  const preloadDocumentComponents = useCallback(() => {
    preloadComponents([
      {importFn: () => import('@/pages/documents'), name: 'Documents', priority: 'high'},
      {importFn: () => import('@/pages/licenses'), name: 'Licenses', priority: 'medium'},
      {importFn: () => import('@/pages/signatures'), name: 'Signatures', priority: 'low'}
    ]);
  }, [preloadComponents]);

  const preloadReportingComponents = useCallback(() => {
    preloadComponents([
      {importFn: () => import('@/pages/reports'), name: 'Reports', priority: 'high'},
      {importFn: () => import('@/pages/performance'), name: 'Performance', priority: 'medium'},
      {importFn: () => import('@/pages/ai-analytics'), name: 'AIAnalytics', priority: 'low'}
    ]);
  }, [preloadComponents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);

  return {
    preloadComponent,
    preloadComponents,
    createHoverHandler,
    createIntersectionHandler,
    preloadDashboardComponents,
    preloadEmployeeComponents,
    preloadDocumentComponents,
    preloadReportingComponents,
    preloadedComponents,
    isPreloading,
    preloadQueue
  };

};

// Hook for preloading based on user role
export const useRoleBasedPreloading = (userRole?: string) => {

  const {preloadComponents} = useLazyLoading({'preloadOnMount': true});

  useEffect(() => {

    if (!userRole) {

      return;

    }

    const roleBasedComponents: {
   [key: string]: Array<{
   importFn: () => Promise<Record<string, unknown>>; name: string 
}> 
} = {
  
      'super_admin': [
        {'importFn': () => import('@/pages/super-admin-dashboard'), 'name': 'SuperAdminDashboard'},
        {'importFn': () => import('@/pages/companies'), 'name': 'Companies'},
        {'importFn': () => import('@/pages/reports'), 'name': 'Reports'},
        {'importFn': () => import('@/pages/settings'), 'name': 'Settings'}
      ],
      'company_manager': [
        {'importFn': () => import('@/pages/dashboard'), 'name': 'Dashboard'},
        {'importFn': () => import('@/pages/employees'), 'name': 'Employees'},
        {'importFn': () => import('@/pages/reports'), 'name': 'Reports'},
        {'importFn': () => import('@/pages/attendance'), 'name': 'Attendance'}
      ],
      'employee': [
        {'importFn': () => import('@/pages/dashboard'), 'name': 'Dashboard'},
        {'importFn': () => import('@/pages/documents'), 'name': 'Documents'},
        {'importFn': () => import('@/pages/leave-requests'), 'name': 'LeaveRequests'}
      ],
      'supervisor': [
        {'importFn': () => import('@/pages/dashboard'), 'name': 'Dashboard'},
        {'importFn': () => import('@/pages/employees'), 'name': 'Employees'},
        {'importFn': () => import('@/pages/attendance'), 'name': 'Attendance'},
        {'importFn': () => import('@/pages/performance'), 'name': 'Performance'}
      ],
      'worker': [
        {'importFn': () => import('@/pages/dashboard'), 'name': 'Dashboard'},
        {'importFn': () => import('@/pages/attendance'), 'name': 'Attendance'},
        {'importFn': () => import('@/pages/documents'), 'name': 'Documents'}
      ]
    };

    const componentsToPreload = roleBasedComponents[userRole] ?? [];
    if (componentsToPreload.length > 0) {

      preloadComponents(componentsToPreload);

    }

  }, [userRole, preloadComponents]);

};

// Hook for preloading based on current route
export const useRouteBasedPreloading = (currentRoute: string) => {

  const {preloadComponent} = useLazyLoading();

  useEffect(() => {

    const routeComponentMap: {
   [key: string]: {
   importFn: () => Promise<Record<string, unknown>>; name: string 
} 
} = {
  
      '/dashboard': {'importFn': () => import('@/pages/dashboard'), 'name': 'Dashboard'},
      '/employees': {'importFn': () => import('@/pages/employees'), 'name': 'Employees'},
      '/companies': {'importFn': () => import('@/pages/companies'), 'name': 'Companies'},
      '/reports': {'importFn': () => import('@/pages/reports'), 'name': 'Reports'},
      '/attendance': {'importFn': () => import('@/pages/attendance'), 'name': 'Attendance'},
      '/documents': {'importFn': () => import('@/pages/documents'), 'name': 'Documents'},
      '/settings': {'importFn': () => import('@/pages/settings'), 'name': 'Settings'}
    };

    const componentToPreload = routeComponentMap[currentRoute];
    if (componentToPreload) {

      preloadComponent(componentToPreload.importFn, componentToPreload.name);

    }

  }, [currentRoute, preloadComponent]);

};
