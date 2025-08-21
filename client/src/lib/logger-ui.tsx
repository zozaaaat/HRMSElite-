// Internal Logging System for HRMS Elite
import React from 'react';
import { logger as baseLogger } from './logger';
import {useAppStore} from '../stores/useAppStore';


interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
  FATAL: 4;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: Record<string, unknown> | undefined;
  error?: Error | undefined;
  component?: string | undefined;
  userId?: string | undefined;
  sessionId?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel: number = LOG_LEVELS.INFO;
  private isProduction = process.env.NODE_ENV === 'production';

  private constructor() {
    this.setupGlobalErrorHandling();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private setupGlobalErrorHandling() {
    // Only setup global error handling in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });

    // React error boundary fallback
    (window as unknown as { __REACT_ERROR_BOUNDARY_FALLBACK__?: (error: Error, errorInfo: Record<string, unknown>) => void }).__REACT_ERROR_BOUNDARY_FALLBACK__ = (error: Error,
   errorInfo: Record<string,
   unknown>) => {
      this.error('React Error Boundary', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    };
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error,
    component?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ?? undefined,
      error: error ?? undefined,
      component: component ?? undefined,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      return useAppStore.getState().user?.id;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string {
    const storage = typeof window !== 'undefined' ? window.sessionStorage : undefined;
    let sessionId = storage?.getItem('hrms-session-id') ?? '';
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      storage?.setItem('hrms-session-id', sessionId);
    }
    return sessionId;
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output based on environment
    if (!this.isProduction || entry.level === 'ERROR' || entry.level === 'FATAL') {
      this.outputToConsole(entry);
    }

    // Send critical errors to server in production
    if (this.isProduction && (entry.level === 'ERROR' || entry.level === 'FATAL')) {
      this.sendToServer(entry);
    }
  }

  private outputToConsole(entry: LogEntry) {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const componentPrefix = entry.component ? `[${entry.component}]` : '';
    
    switch (entry.level) {
      case 'DEBUG':
        break;
      case 'INFO':
        break;
      case 'WARN':
        break;
      case 'ERROR':
      case 'FATAL':
        baseLogger.error(`${prefix} ${componentPrefix} ${entry.message}`, entry.error ?? entry.data, entry.component);
        break;
    }
  }

  private async sendToServer(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if server logging fails
      baseLogger.error('Failed to send log to server:', error);
    }
  }

  // Public logging methods
  debug(message: string, data?: Record<string, unknown>, component?: string) {
    if (this.currentLevel <= LOG_LEVELS.DEBUG) {
      this.addLog(this.createLogEntry('DEBUG', message, data, undefined, component));
    }
  }

  info(message: string, data?: Record<string, unknown>, component?: string) {
    if (this.currentLevel <= LOG_LEVELS.INFO) {
      this.addLog(this.createLogEntry('INFO', message, data, undefined, component));
    }
  }

  warn(message: string, data?: Record<string, unknown>, component?: string) {
    if (this.currentLevel <= LOG_LEVELS.WARN) {
      this.addLog(this.createLogEntry('WARN', message, data, undefined, component));
    }
  }

  error(message: string, data?: Record<string, unknown>, error?: Error, component?: string) {
    if (this.currentLevel <= LOG_LEVELS.ERROR) {
      this.addLog(this.createLogEntry('ERROR', message, data, error, component));
    }
  }

  fatal(message: string, data?: Record<string, unknown>, error?: Error, component?: string) {
    if (this.currentLevel <= LOG_LEVELS.FATAL) {
      this.addLog(this.createLogEntry('FATAL', message, data, error, component));
    }
  }

  // Performance logging
  time(label: string, component?: string) {
    const getNow = () => {
      const g: unknown = typeof globalThis !== 'undefined' ? globalThis : undefined;
      if (
        g &&
        typeof g === 'object' &&
        'performance' in g &&
        g.performance &&
        typeof (g.performance as { now?: () => number }).now === 'function'
      ) {
        return (g.performance as { now: () => number }).now();
      }
      return Date.now();
    };
    const startTime = getNow();
    return {
      end: (data?: Record<string, unknown>) => {
        const endTime = getNow();
        const duration = endTime - startTime;
        this.info(`${label} completed in ${duration.toFixed(2)}ms`, data, component);
      }
    };
  }

  // API request logging
  apiRequest(method: string, url: string, data?: Record<string, unknown>, component?: string) {
    this.info(`API ${method} ${url}`, data, component);
  }

  apiResponse(method: string, url: string, status: number, data?: Record<string, unknown>, component?: string) {
    const level = status >= 400 ? 'ERROR' : 'INFO';
    const message = `API ${method} ${url} - ${status}`;
    
    if (level === 'ERROR') {
      this.error(message, data, undefined, component);
    } else {
      this.info(message, data, component);
    }
  }

  // User action logging
  userAction(action: string, data?: Record<string, unknown>, component?: string) {
    this.info(`User Action: ${action}`, data, component);
  }

  // Navigation logging
  navigation(from: string, to: string, component?: string) {
    this.info(`Navigation: ${from} → ${to}`, undefined, component);
  }

  // Get logs for debugging
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Set log level
  setLevel(level: keyof LogLevel) {
    this.currentLevel = LOG_LEVELS[level];
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const uiLogger = Logger.getInstance();

// React Hook for component logging
export function useLogger(componentName: string) {
  return {
    debug: (message: string,
   data?: Record<string,
   unknown>) => uiLogger.debug(message,
   data,
   componentName),
  
    info: (message: string,
   data?: Record<string,
   unknown>) => uiLogger.info(message,
   data,
   componentName),
  
    warn: (message: string,
   data?: Record<string,
   unknown>) => uiLogger.warn(message,
   data,
   componentName),
  
    error: (message: string,
   data?: Record<string, unknown>,
   error?: Error) => uiLogger.error(message,
   data,
   error,
   componentName),
  
    fatal: (message: string,
   data?: Record<string, unknown>,
   error?: Error) => uiLogger.fatal(message,
   data,
   error,
   componentName),
  
    time: (label: string) => uiLogger.time(label, componentName),
  };
}

// Higher-order component for automatic logging
export function withLogging<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function WithLoggingComponent(props: P) {
    const log = useLogger(componentName);
    
    React.useEffect(() => {
      log.info('Component mounted');
      return () => log.info('Component unmounted');
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

// Error boundary with logging
export class LoggingErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
   children: React.ReactNode; fallback?: React.ComponentType<{
   error: Error 
}> 
}) {
  
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log rich context as info, and the error separately
    baseLogger.info('React Error Boundary context', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    }, 'ErrorBoundary');
    baseLogger.error('React Error Boundary Caught Error', error, 'ErrorBoundary');
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return React.createElement(this.props.fallback, { error: this.state.error });
      }
      return React.createElement(
        'div',
        { className: 'p-4 text-center' },
        React.createElement('h2', { className: 'text-lg font-semibold text-red-600' }, 'حدث خطأ'),
        React.createElement('p', {
   className: 'text-sm text-gray-600' 
}, 'يرجى تحديث الصفحة أو المحاولة مرة أخرى')
      );
    }

    return this.props.children;
  }
}


