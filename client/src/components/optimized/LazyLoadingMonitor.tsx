/* eslint-env browser */
import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Clock, Download, CheckCircle, AlertCircle} from 'lucide-react';

interface LoadingMetrics {
  componentName: string;
  loadTime: number;
  status: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

interface LazyLoadingMonitorProps {
  showMetrics?: boolean;
  maxMetrics?: number;
}

export const LazyLoadingMonitor: React.FC<LazyLoadingMonitorProps> = ({
  showMetrics = false,
  maxMetrics = 10
}) => {

  const [metrics, setMetrics] = useState<LoadingMetrics[]>([]);
  const [isVisible] = useState(showMetrics);

  useEffect(() => {

    // Listen for custom lazy loading events
    const handleLazyLoadStart = (event: unknown) => {

      const {componentName} = (event as { detail: { componentName: string } }).detail;
      setMetrics(prev => [
        {
          componentName,
          'loadTime': 0,
          'status': 'loading',
          'timestamp': Date.now()
        },
        ...prev.slice(0, maxMetrics - 1)
      ]);

    };

    const handleLazyLoadComplete = (event: unknown) => {

      const {componentName, loadTime, status} = (event as { detail: { componentName: string; loadTime: number; status: 'loaded' | 'error' } }).detail;
      setMetrics(prev =>
        prev.map(metric =>
          metric.componentName === componentName
            ? {...metric, loadTime, status, 'timestamp': Date.now()}
            : metric
        )
      );

    };

    // Add event listeners
    window.addEventListener('lazy-load-start', handleLazyLoadStart);
    window.addEventListener('lazy-load-complete', handleLazyLoadComplete);

    return () => {

      window.removeEventListener('lazy-load-start', handleLazyLoadStart);
      window.removeEventListener('lazy-load-complete', handleLazyLoadComplete);

    };

  }, [maxMetrics]);

  const getAverageLoadTime = () => {

    const loadedMetrics = metrics.filter(m => m.status === 'loaded' && m.loadTime > 0);
    if (loadedMetrics.length === 0) {

      return 0;

    }

    const totalTime = loadedMetrics.reduce((sum, m) => sum + m.loadTime, 0);
    return Math.round(totalTime / loadedMetrics.length);

  };

  const getLoadingCount = () => metrics.filter(m => m.status === 'loading').length;
  const getLoadedCount = () => metrics.filter(m => m.status === 'loaded').length;
  const getErrorCount = () => metrics.filter(m => m.status === 'error').length;

  const getStatusIcon = (status: string) => {

    switch (status) {

    case 'loading':
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'loaded':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Download className="h-4 w-4 text-gray-500" />;

    }

  };

  const getStatusBadge = (status: string) => {

    switch (status) {

    case 'loading':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Loading</Badge>;
    case 'loaded':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Loaded</Badge>;
    case 'error':
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Error</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;

    }

  };

  if (!isVisible) {

    return null;

  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Lazy Loading Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getLoadingCount()}</div>
            <div className="text-sm text-muted-foreground">Loading</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getLoadedCount()}</div>
            <div className="text-sm text-muted-foreground">Loaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{getErrorCount()}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </div>
        </div>

        {/* Average Load Time */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Average Load Time</span>
            <span className="font-mono">{getAverageLoadTime()}ms</span>
          </div>
          <Progress
            value={Math.min((getAverageLoadTime() / 1000) * 100, 100)}
            className="h-2"
          />
        </div>

        {/* Recent Components */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Components</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {metrics.map((metric, index) => (
              <div key={
  `${
  metric.componentName
}-${
  index
}`
} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-mono">{metric.componentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {metric.loadTime > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {metric.loadTime}ms
                    </span>
                  )}
                  {getStatusBadge(metric.status)}
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">
                No components loaded yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

};

// Utility functions for tracking lazy loading
export const trackLazyLoadStart = (componentName: string) => {

  window.dispatchEvent(new window.CustomEvent('lazy-load-start', {
    'detail': {componentName}
  }));

};

export const trackLazyLoadComplete = (componentName: string,
   loadTime: number,
   status: 'loaded' | 'error' = 'loaded') => {

  window.dispatchEvent(new window.CustomEvent('lazy-load-complete', {
    'detail': {componentName, loadTime, status}
  }));

};

// HOC for automatically tracking lazy loading
export const withLazyLoadTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {

  const WrappedComponent = (props: P) => {

    useEffect(() => {

      const startTime = window.performance.now();
      trackLazyLoadStart(componentName);

      return () => {

        const loadTime = window.performance.now() - startTime;
        trackLazyLoadComplete(componentName, Math.round(loadTime));

      };

    }, []);

    return <Component {...props} />;

  };

  WrappedComponent.displayName = `withLazyLoadTracking(${Component.displayName ?? Component.name})`;
  return WrappedComponent;

};

export default LazyLoadingMonitor;
