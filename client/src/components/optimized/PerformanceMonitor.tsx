import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useAuth } from '../../hooks/useAuth';

// Declare performance API for TypeScript
declare global {
  interface Window {
    performance: globalThis.Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };
  }
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentMounts: number;
  reRenders: number;
  lastRenderTime: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
  enableLogging?: boolean;
  threshold?: number;
}

/**
 * Performance Monitor Component
 * Monitors and optimizes component performance
 */
export const PerformanceMonitor = memo<PerformanceMonitorProps>(({
  componentName,
  children,
  enableLogging = false,
  threshold = 16 // 16ms = 60fps
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentMounts: 0,
    reRenders: 0,
    lastRenderTime: 0
  });

  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const prevPropsRef = useRef<any>(null);

  // Performance measurement
  const measurePerformance = useCallback(() => {
    const now = window.performance.now();
    const renderTime = now - renderStartTime.current;
    
    // Memory usage (if available)
    const memoryUsage = (window.performance as any).memory 
      ? (window.performance as any).memory.usedJSHeapSize / 1024 / 1024 
      : 0;

    setMetrics(prev => ({
      ...prev,
      renderTime,
      memoryUsage,
      reRenders: prev.reRenders + 1,
      lastRenderTime: now
    }));

    // Log performance issues
    if (enableLogging && renderTime > threshold) {
      console.warn(`🚨 Performance Issue in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: `${threshold}ms`,
        memoryUsage: `${memoryUsage.toFixed(2)}MB`,
        user: user?.email
      });
    }
  }, [componentName, enableLogging, threshold, user]);

  // Component mount tracking
  useEffect(() => {
    mountTime.current = window.performance.now();
    renderStartTime.current = window.performance.now();
    
    setMetrics(prev => ({
      ...prev,
      componentMounts: prev.componentMounts + 1
    }));

    if (enableLogging) {
      console.info(`📊 ${componentName} mounted at:`, new Date().toISOString());
    }

    return () => {
      const mountDuration = window.performance.now() - mountTime.current;
      if (enableLogging) {
        console.info(`📊 ${componentName} unmounted after: ${mountDuration.toFixed(2)}ms`);
      }
    };
  }, [componentName, enableLogging]);

  // Render tracking
  useEffect(() => {
    renderStartTime.current = window.performance.now();
    renderCount.current += 1;

    // Schedule performance measurement after render
    const timeoutId = setTimeout(measurePerformance, 0);

    return () => clearTimeout(timeoutId);
  }, [measurePerformance]);

  // Props change detection
  useEffect(() => {
    if (prevPropsRef.current !== null) {
      // Detect unnecessary re-renders
      if (enableLogging) {
        console.info(`🔄 ${componentName} re-rendered (${renderCount.current} times)`);
      }
    }
    prevPropsRef.current = true;
  });

  return (
    <div data-testid={`performance-monitor-${componentName}`}>
      {children}
      {enableLogging && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          <div>{componentName}</div>
          <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
          <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
          <div>Re-renders: {metrics.reRenders}</div>
        </div>
      )}
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

/**
 * Higher-Order Component for Performance Monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    componentName?: string;
    enableLogging?: boolean;
    threshold?: number;
  } = {}
) => {
  const { 
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'Unknown',
    enableLogging = false,
    threshold = 16
  } = options;

  const EnhancedComponent = React.forwardRef<any, P>((props, ref) => (
    <PerformanceMonitor
      componentName={componentName}
      enableLogging={enableLogging}
      threshold={threshold}
    >
      <WrappedComponent {...(props as P)} ref={ref} />
    </PerformanceMonitor>
  ));

  EnhancedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return EnhancedComponent;
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitor = (
  componentName: string,
  options: {
    enableLogging?: boolean;
    threshold?: number;
  } = {}
) => {
  const { enableLogging = false, threshold = 16 } = options;
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  const startRender = useCallback(() => {
    renderStartTime.current = window.performance.now();
    renderCount.current += 1;
  }, []);

  const endRender = useCallback(() => {
    const renderTime = window.performance.now() - renderStartTime.current;
    
    if (enableLogging && renderTime > threshold) {
      console.warn(`🚨 Performance Issue in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: `${threshold}ms`,
        renderCount: renderCount.current
      });
    }

    return renderTime;
  }, [componentName, enableLogging, threshold]);

  return { startRender, endRender, renderCount: renderCount.current };
};

/**
 * Performance optimization utilities
 */
export const PerformanceUtils = {
  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Memoize expensive calculations
   */
  memoize: <T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = resolver ? resolver(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  /**
   * Check if component should re-render
   */
  shouldComponentUpdate: <T extends Record<string, any>>(
    prevProps: T,
    nextProps: T,
    keys: (keyof T)[]
  ): boolean => {
    return keys.some(key => prevProps[key] !== nextProps[key]);
  },

  /**
   * Measure function execution time
   */
  measureExecutionTime: <T extends (...args: any[]) => any>(
    func: T,
    name: string
  ): ((...args: Parameters<T>) => ReturnType<T>) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      const start = window.performance.now();
      const result = func(...args);
      const end = window.performance.now();
      
      console.info(`${name} execution time: ${(end - start).toFixed(2)}ms`);
      return result;
    };
  }
};

export default PerformanceMonitor;
