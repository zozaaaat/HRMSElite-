import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';

interface AdvancedLazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: 'default' | 'card' | 'list' | 'table' | 'chart';
  message?: string;
  preloadOnHover?: boolean;
  preloadOnIntersection?: boolean;
  priority?: 'high' | 'medium' | 'low';
  showProgress?: boolean;
  minLoadTime?: number;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  startTime: number;
}

// Enhanced loading fallback with progress
const ProgressFallback = ({ 
  message, 
  progress, 
  type = 'default' 
}: { 
  message: string | undefined; 
  progress: number; 
  type?: string;
}) => {
  const getFallbackByType = () => {
    switch (type) {
      case 'card':
        return (
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Progress value={progress} className="w-full" />
          </div>
        );
      case 'table':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 border-b last:border-b-0">
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        );
      case 'chart':
        return (
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-8 w-[100px]" />
                </div>
                <div className="flex items-end justify-between h-32">
                  <Skeleton className="h-16 w-8" />
                  <Skeleton className="h-20 w-8" />
                  <Skeleton className="h-12 w-8" />
                  <Skeleton className="h-24 w-8" />
                  <Skeleton className="h-18 w-8" />
                  <Skeleton className="h-14 w-8" />
                  <Skeleton className="h-22 w-8" />
                </div>
                <Progress value={progress} className="w-full" />
                <div className="flex justify-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <span className="text-muted-foreground text-center">
                  {message ?? 'جاري التحميل...'}
                </span>
                <Progress value={progress} className="w-full" />
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return getFallbackByType();
};

// Main Advanced Lazy Loader component
const AdvancedLazyLoader: React.FC<AdvancedLazyLoaderProps> = ({
  children,
  fallback,
  type = 'default',
  message,
  preloadOnHover = true,
  preloadOnIntersection = true,
  priority = 'medium',
  showProgress = true,
  minLoadTime = 500
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    startTime: Date.now()
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const elementRef = useRef<globalThis.HTMLDivElement>(null);

  // Simulate progress for better UX
  const startProgressSimulation = useCallback(() => {
    const startTime = Date.now();
    setLoadingState(prev => ({ ...prev, startTime, isLoading: true, progress: 0 }));

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / minLoadTime) * 90, 90); // Max 90% until actually loaded
      
      setLoadingState(prev => ({ ...prev, progress }));
    }, 50);
  }, [minLoadTime]);

  // Stop progress simulation
  const stopProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setLoadingState(prev => ({ ...prev, progress: 100, isLoading: false }));
    setIsLoaded(true);
  }, []);

  // Handle hover preloading
  const handleMouseEnter = useCallback(() => {
    if (preloadOnHover && !isLoaded) {
      startProgressSimulation();
    }
  }, [preloadOnHover, isLoaded, startProgressSimulation]);

  // Handle intersection observer for preloading
  useEffect(() => {
    if (!preloadOnIntersection || !elementRef.current || isLoaded) {
      return;
    }

    const observer = new globalThis.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startProgressSimulation();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [preloadOnIntersection, isLoaded, startProgressSimulation]);

  // Auto-start loading for high priority components
  useEffect(() => {
    if (priority === 'high' && !isLoaded) {
      startProgressSimulation();
    }
  }, [priority, isLoaded, startProgressSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Simulate completion after minimum load time
  useEffect(() => {
    if (loadingState.isLoading && loadingState.progress >= 90) {
      const remainingTime = Math.max(0, minLoadTime - (Date.now() - loadingState.startTime));
      
      setTimeout(() => {
        stopProgressSimulation();
      }, remainingTime);
    }
  }, [loadingState, minLoadTime, stopProgressSimulation]);

  // If component is loaded, show children
  if (isLoaded) {
    return <div ref={elementRef}>{children}</div>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return (
      <div 
        ref={elementRef}
        onMouseEnter={handleMouseEnter}
        className="cursor-pointer"
      >
        {fallback}
      </div>
    );
  }

  // Show progress fallback
  return (
    <div 
      ref={elementRef}
      onMouseEnter={handleMouseEnter}
      className="cursor-pointer"
    >
      <ProgressFallback 
        message={message} 
        progress={showProgress ? loadingState.progress : 0}
        type={type}
      />
    </div>
  );
};

// HOC for wrapping components with advanced lazy loading
export const withAdvancedLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AdvancedLazyLoaderProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <AdvancedLazyLoader {...options}>
      <Component {...props} />
    </AdvancedLazyLoader>
  );

  WrappedComponent.displayName = `withAdvancedLazyLoading(${Component.displayName ?? Component.name})`;
  return WrappedComponent;
};

// Priority-based lazy loading wrapper
export const createPriorityLazyLoader = (
  priority: 'high' | 'medium' | 'low' = 'medium'
) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    return withAdvancedLazyLoading(Component, { priority });
  };
};

export default AdvancedLazyLoader;
