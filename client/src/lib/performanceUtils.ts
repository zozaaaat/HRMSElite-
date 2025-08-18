/* global NodeJS, performance */

import React from 'react';

/**
 * Performance Utilities for HRMS Elite
 * Provides tools for monitoring and optimizing application performance
 */

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any> = new Map();
  private observers: Set<(metric: string, value: any) => void> = new Set();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure execution time of a function
   */
  static measureExecutionTime<T extends (...args: any[]) => any>(
    func: T,
    name: string
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      const start = Date.now();
      const result = func(...args);
      const end = Date.now();
      
      const executionTime = end - start;
      PerformanceMonitor.getInstance().recordMetric(`${name}_execution_time`, executionTime);
      
      if (executionTime > 100) {
        console.warn(`🚨 Slow execution detected in ${name}: ${executionTime}ms`);
      }
      
      return result;
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: any): void {
    this.metrics.set(name, {
      value,
      timestamp: Date.now(),
      count: (this.metrics.get(name)?.count || 0) + 1
    });

    // Notify observers
    this.observers.forEach(observer => observer(name, value));
  }

  /**
   * Get a performance metric
   */
  getMetric(name: string): any {
    return this.metrics.get(name);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, any> {
    return new Map(this.metrics);
  }

  /**
   * Subscribe to metric changes
   */
  subscribe(observer: (metric: string, value: any) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
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
}

// Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  options: {
    cache?: boolean;
    timeout?: number;
  } = {}
): () => Promise<T> {
  const { cache = true, timeout = 5000 } = options;
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async (): Promise<T> => {
    if (cache && cached) {
      return cached;
    }

    if (loading) {
      return loading;
    }

    loading = Promise.race([
      loader(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Lazy loading timeout')), timeout)
      )
    ]);

    try {
      const result = await loading;
      if (cache) {
        cached = result;
      }
      return result;
    } finally {
      loading = null;
    }
  };
}

// Component optimization utilities
export const ComponentUtils = {
  /**
   * Check if component should re-render
   */
  shouldComponentUpdate<T extends Record<string, any>>(
    prevProps: T,
    nextProps: T,
    keys: (keyof T)[]
  ): boolean {
    return keys.some(key => prevProps[key] !== nextProps[key]);
  },

  /**
   * Create a memoized component wrapper
   */
  memoizeComponent<P extends object>(
    Component: React.ComponentType<P>,
    propsAreEqual?: (prevProps: P, nextProps: P) => boolean
  ): React.MemoExoticComponent<React.ComponentType<P>> {
    return React.memo(Component, propsAreEqual);
  },

  /**
   * Create a lazy component with error boundary
   */
  createLazyComponent<T extends object>(
    loader: () => Promise<{ default: React.ComponentType<T> }>,
    fallback?: React.ComponentType<T>
  ): React.LazyExoticComponent<React.ComponentType<T>> {
    return React.lazy(() => 
      loader().catch(error => {
        console.error('Failed to load component:', error);
        const ErrorComponent: React.ComponentType<T> = fallback || (() => React.createElement('div', null, 'Error loading component'));
        return { default: ErrorComponent };
      })
    );
  }
};

// Memory management utilities
export const MemoryUtils = {
  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const memory = (performance as any).memory;
      if (memory) {
        return {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
        };
      }
    }
    return null;
  },

  /**
   * Check if memory usage is high
   */
  isMemoryUsageHigh(threshold: number = 80): boolean {
    const memory = this.getMemoryUsage();
    if (!memory) return false;
    
    const usagePercentage = (memory.used / memory.limit) * 100;
    return usagePercentage > threshold;
  },

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }
};

// Network performance utilities
export const NetworkUtils = {
  /**
   * Measure network request time
   */
  async measureRequestTime<T>(
    request: () => Promise<T>,
    name: string
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await request();
      const duration = Date.now() - start;
      
      PerformanceMonitor.getInstance().recordMetric(`${name}_request_time`, duration);
      
      if (duration > 1000) {
        console.warn(`🚨 Slow network request detected: ${name} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      PerformanceMonitor.getInstance().recordMetric(`${name}_request_error`, duration);
      throw error;
    }
  },

  /**
   * Create a request with retry logic
   */
  async requestWithRetry<T>(
    request: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      backoff?: boolean;
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000, backoff = true } = options;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }
};

// Bundle size optimization
export const BundleUtils = {
  /**
   * Check if code splitting is working
   */
  checkCodeSplitting(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource');
      const jsFiles = resources.filter(r => r.name.endsWith('.js'));
      
      console.info(`📦 Bundle analysis: ${jsFiles.length} JavaScript files loaded`);
      
      jsFiles.forEach(file => {
        const size = (file as any).transferSize || 0;
        if (size > 100 * 1024) { // 100KB
          console.warn(`🚨 Large bundle detected: ${file.name} (${Math.round(size / 1024)}KB)`);
        }
      });
    }
  },

  /**
   * Preload critical resources
   */
  preloadResource(url: string, type: 'script' | 'style' | 'image' = 'script'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  }
};

// Performance monitoring hook
export function usePerformanceMonitoring(
  componentName: string,
  options: {
    enableLogging?: boolean;
    threshold?: number;
  } = {}
) {
  const { enableLogging = false, threshold = 16 } = options;
  const renderStartTime = React.useRef<number>(0);
  const renderCount = React.useRef<number>(0);

  const startRender = React.useCallback(() => {
    renderStartTime.current = Date.now();
    renderCount.current += 1;
  }, []);

  const endRender = React.useCallback(() => {
    const renderTime = Date.now() - renderStartTime.current;
    
    PerformanceMonitor.getInstance().recordMetric(`${componentName}_render_time`, renderTime);
    
    if (enableLogging && renderTime > threshold) {
      console.warn(`🚨 Performance Issue in ${componentName}:`, {
        renderTime: `${renderTime}ms`,
        threshold: `${threshold}ms`,
        renderCount: renderCount.current
      });
    }

    return renderTime;
  }, [componentName, enableLogging, threshold]);

  React.useEffect(() => {
    startRender();
    const timeoutId = setTimeout(endRender, 0);
    return () => clearTimeout(timeoutId);
  });

  return { 
    startRender, 
    endRender, 
    renderCount: renderCount.current,
    getMetrics: () => PerformanceMonitor.getInstance().getAllMetrics()
  };
}

// Export default instance
export default PerformanceMonitor.getInstance();
