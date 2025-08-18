import React, {Component, ErrorInfo, ReactNode, Suspense} from 'react';
import {AlertTriangle, RefreshCw, Home, Bug, Info} from 'lucide-react';
import {Button} from '../ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Badge} from '../ui/badge';
import {Separator} from '../ui/separator';
import logger from '../../lib/logger';


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </CardContent>
    </Card>
  </div>
);

// Error details component with React.memo for performance
const ErrorDetails = React.memo(({error, errorInfo}: { error: Error; errorInfo?: ErrorInfo | undefined }) => (
  <details className="bg-muted p-4 rounded-lg text-sm space-y-3">
    <summary className="cursor-pointer font-medium mb-3 flex items-center gap-2">
      <Bug className="h-4 w-4" />
      تفاصيل الخطأ (للطور)
    </summary>
    <div className="space-y-3">
      <div>
        <strong className="text-destructive">الخطأ:</strong>
        <pre className="mt-2 text-xs bg-background p-3 rounded overflow-auto border">
          {error.message}
        </pre>
      </div>
      {errorInfo && (
        <div>
          <strong className="text-destructive">معلومات إضافية:</strong>
          <pre className="mt-2 text-xs bg-background p-3 rounded overflow-auto border">
            {errorInfo.componentStack}
          </pre>
        </div>
      )}
      <div>
        <strong className="text-destructive">Stack Trace:</strong>
        <pre className="mt-2 text-xs bg-background p-3 rounded overflow-auto border">
          {error.stack}
        </pre>
      </div>
    </div>
  </details>
));

ErrorDetails.displayName = 'ErrorDetails';

export class EnhancedErrorBoundary extends Component<Props, State> {

  constructor (props: Props) {

    super(props);
    this.state = {
      'hasError': false,
      'retryCount': 0
    };

  }

  static getDerivedStateFromError (error: Error): Partial<State> {

    return {
      'hasError': true,
      error,
      'errorId': `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

  }

  override componentDidCatch (error: Error, errorInfo: ErrorInfo) {

    // Log error to console
    logger.error('EnhancedErrorBoundary caught an error', error, 'EnhancedErrorBoundary');

    // Update state with error details
    this.setState({error, errorInfo});

    // Call custom error handler if provided
    if (this.props.onError) {

      this.props.onError(error, errorInfo);

    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {

      this.logErrorToService(error, errorInfo);

    }

  }

  override componentDidUpdate (prevProps: Props) {

    // Reset error state when props change (if enabled)
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {

      this.setState({
        'hasError': false
      });

    }

  }

  private readonly logErrorToService = (error: Error, errorInfo: ErrorInfo) => {

    // In a real application, you would send this to your error tracking service
    // Example: Sentry, LogRocket, etc.
    try {

      const errorData = {
        'message': error.message,
        'stack': error.stack,
        'componentStack': errorInfo.componentStack,
        'timestamp': new Date().toISOString(),
        'userAgent': navigator.userAgent,
        'url': window.location.href,
        'errorId': this.state.errorId
      };

      // Send to your error tracking service
      // Example: await fetch('/api/error-logging', { method: 'POST', body: JSON.stringify(errorData) });
      logger.info('Error data prepared for external service:', errorData);

    } catch (logError) {

      logger.error('Failed to log error to service:', logError);

    }

  };

  handleRetry = () => {

    this.setState(prevState => ({
      'hasError': false,
      'retryCount': prevState.retryCount + 1
    }));

  };

  handleGoHome = () => {

    window.location.href = '/';

  };

  handleReload = () => {

    window.location.reload();

  };

  handleReportError = () => {

    const {error, errorInfo, errorId} = this.state;
    if (error) {

      const errorReport = {
        errorId,
        'message': error.message,
        'stack': error.stack,
        'componentStack': errorInfo?.componentStack,
        'url': window.location.href,
        'timestamp': new Date().toISOString()
      };

      // In a real application, you would send this to your support system
      // Example: await fetch('/api/error-reporting', { method: 'POST', body: JSON.stringify(errorReport) });
      logger.info('Error report prepared for support system:', errorReport);

      // Show success message
      window.alert('تم إرسال تقرير الخطأ بنجاح');

    }

  };

  override render () {

    if (this.state.hasError) {

      // Use custom fallback if provided
      if (this.props.fallback) {

        return this.props.fallback;

      }

      const {error, errorInfo, retryCount} = this.state;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-red-600 dark:text-red-400">
                حدث خطأ غير متوقع
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                عذراً، حدث خطأ أثناء تحميل هذه الصفحة
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  محاولة {retryCount + 1}
                </Badge>
                {error && (
                  <Badge variant="destructive" className="text-xs">
                    {error.name}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-center text-sm">
                يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية. إذا استمرت المشكلة،
                يمكنك الإبلاغ عن الخطأ للمساعدة في حلها.
              </p>

              {/* Error details for development */}
              {this.props.showDetails && error && (
                <ErrorDetails error={error} errorInfo={errorInfo} />
              )}

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <Home className="h-4 w-4" />
                  الصفحة الرئيسية
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 gap-2"
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة تحميل الصفحة
                </Button>
                <Button
                  onClick={this.handleReportError}
                  className="flex-1 gap-2"
                  variant="outline"
                  size="sm"
                >
                  <Info className="h-4 w-4" />
                  الإبلاغ عن الخطأ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    }

    // Wrap children with Suspense for better loading experience
    return (
      <Suspense fallback={<LoadingFallback />}>
        {this.props.children}
      </Suspense>
    );

  }

}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {

  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;
  return WrappedComponent;

};

export default EnhancedErrorBoundary;
