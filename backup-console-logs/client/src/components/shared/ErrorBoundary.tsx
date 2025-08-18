import React from 'react';
import logger from '../../lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo?: React.ErrorInfo }> | undefined;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

  constructor (props: ErrorBoundaryProps) {

    super(props);
    this.state = {'hasError': false};

  }

  static getDerivedStateFromError (error: Error): ErrorBoundaryState {

    return {'hasError': true, error};

  }

  override componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {

    // Log the error using our internal logger
    logger.error('React Error Boundary Caught Error', {
      'error': {
        'message': error.message,
        'stack': error.stack,
        'name': error.name
      },
      'componentStack': errorInfo.componentStack,
      errorInfo
    }, 'ErrorBoundary');

    // Call custom error handler if provided
    if (this.props.onError) {

      this.props.onError(error, errorInfo);

    }

    // Update state with error info
    this.setState({errorInfo});

  }

  override render () {

    if (this.state.hasError) {

      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {

        const fallbackProps: { error: Error; errorInfo?: React.ErrorInfo } = {
          'error': this.state.error
        };
        
        if (this.state.errorInfo) {
          fallbackProps.errorInfo = this.state.errorInfo;
        }

        return React.createElement(this.props.fallback, fallbackProps);

      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">حدث خطأ غير متوقع</h1>
              <p className="text-muted-foreground">
                عذراً، حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left max-w-md mx-auto">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  تفاصيل الخطأ (للأغراض التطويرية)
                </summary>
                <div className="mt-2 p-4 bg-muted rounded-lg text-xs font-mono text-muted-foreground overflow-auto">
                  <div className="space-y-2">
                    <div>
                      <strong>الخطأ:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{
  this.state.errorInfo.componentStack
}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                تحديث الصفحة
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                العودة للصفحة السابقة
              </button>
            </div>

            {/* Contact Support */}
            <div className="text-sm text-muted-foreground">
              إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم الفني
            </div>
          </div>
        </div>
      );

    }

    return this.props.children;

  }

}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object> (
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; errorInfo?: React.ErrorInfo }>
) {

  return function WithErrorBoundaryComponent (props: P) {

    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );

  };

}

// Simple error fallback component
export function SimpleErrorFallback ({error}: { error: Error }) {

  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-semibold text-red-600">حدث خطأ</h2>
      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
      >
        تحديث
      </button>
    </div>
  );

}

// Network error fallback component
export function NetworkErrorFallback () {

  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-semibold text-orange-600">مشكلة في الاتصال</h2>
      <p className="text-sm text-gray-600 mb-4">
        يبدو أن هناك مشكلة في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
      >
        إعادة المحاولة
      </button>
    </div>
  );

}
