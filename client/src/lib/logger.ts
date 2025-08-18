// Removed conflicting import. This module defines and exports `logger`.

/**
 * Comprehensive logging utility for HRMS Elite
 * Provides structured logging with different levels and environments
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogData {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  source?: string | undefined;
  userId?: string | undefined;
  sessionId?: string | undefined;
}

class Logger {

  private logLevel: LogLevel;
  private readonly isDevelopment: boolean;
  private readonly isProduction: boolean;

  constructor () {

    this.isDevelopment = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';
    this.isProduction = typeof import.meta !== 'undefined' ? import.meta.env?.PROD : process.env.NODE_ENV === 'production';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  }

  private formatMessage (level: LogLevel, message: string, data?: unknown, source?: string): string {

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourceInfo = source ? ` [${source}]` : '';
    const dataInfo = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';

    return `[${timestamp}] ${levelName}${sourceInfo}: ${message}${dataInfo}`;

  }

  private shouldLog (level: LogLevel): boolean {

    return level >= this.logLevel;

  }

  private logToConsole (level: LogLevel, message: string, data?: unknown, source?: string): void {

    if (!this.shouldLog(level)) {

      return;

    }

    const formattedMessage = this.formatMessage(level, message, data, source);

    switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
    }

  }

  private logToService (_logData:  LogData): void {

    // In production, send logs to external service
    if (this.isProduction) {

      // TODO: Implement external logging service (e.g., Sentry, LogRocket)
      // For now, we'll just use console in production too
      this.logToConsole(_logData.level, _logData.message, _logData.data, _logData.source);

    }

  }

  debug (message: string, data?: unknown, source?: string): void {

    this.logToConsole(LogLevel.DEBUG, message, data, source);

  }

  info (message: string, data?: unknown, source?: string): void {

    this.logToConsole(LogLevel.INFO, message, data, source);
    this.logToService({
      'timestamp': new Date().toISOString(),
      'level': LogLevel.INFO,
      message,
      data,
      ...(source && { source })
    });

  }

  warn (message: string, data?: unknown, source?: string): void {

    this.logToConsole(LogLevel.WARN, message, data, source);
    this.logToService({
      'timestamp': new Date().toISOString(),
      'level': LogLevel.WARN,
      message,
      data,
      ...(source && { source })
    });

  }

  error (message: string, error?: Error | unknown, source?: string): void {

    const errorData = error instanceof Error
      ? {'message': error.message, 'stack': error.stack, 'name': error.name}
      : error;

    this.logToConsole(LogLevel.ERROR, message, errorData, source);
    this.logToService({
      'timestamp': new Date().toISOString(),
      'level': LogLevel.ERROR,
      message,
      'data': errorData,
      ...(source && { source })
    });

  }

  // Specialized logging methods
  apiCall (endpoint: string, method: string, status?: number, duration?: number): void {

    this.info(`API ${method} ${endpoint}`, {status, duration}, 'API');

  }

  userAction (action: string, userId?: string, data?: Record<string, unknown>): void {

    this.info(`User action: ${action}`, {userId, ...data}, 'USER_ACTION');

  }

  performance (operation: string, duration: number, data?: Record<string, unknown>): void {

    this.info(`Performance: ${operation}`, {duration, ...data}, 'PERFORMANCE');

  }

  security (event: string, data?: Record<string, unknown>): void {

    this.warn(`Security event: ${event}`, data, 'SECURITY');

  }

  // Development helpers
  dev (message: string, data?: unknown, source?: string): void {

    if (this.isDevelopment) {

      this.debug(message, data, source);

    }

  }

  // Set log level
  setLogLevel (level: LogLevel): void {

    this.logLevel = level;

  }

  // Get current log level
  getLogLevel (): LogLevel {

    return this.logLevel;

  }

}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  'debug': (message: string, data?: unknown, source?: string) => logger.debug(message, data, source),
  'info': (message: string, data?: unknown, source?: string) => logger.info(message, data, source),
  'warn': (message: string, data?: unknown, source?: string) => logger.warn(message, data, source),
  'error': (message: string,
   error?: Error | unknown,
   source?: string) => logger.error(message,
   error,
   source),
  
  'api': (endpoint: string,
   method: string,
   status?: number,
   duration?: number) => logger.apiCall(endpoint,
   method,
   status,
   duration),
  
  'user': (action: string,
   userId?: string,
   data?: Record<string,
   unknown>) => logger.userAction(action,
   userId,
   data),
  
  'perf': (operation: string,
   duration: number,
   data?: Record<string,
   unknown>) => logger.performance(operation,
   duration,
   data),
  
  'security': (event: string, data?: Record<string, unknown>) => logger.security(event, data),
  'dev': (message: string, data?: unknown, source?: string) => logger.dev(message, data, source)
};

/**
 * Lightweight UI logging helper for components
 * Matches usage in pages by providing apiRequest/apiResponse helpers
 */
export function useLogger (componentName: string) {
  return {
    'debug': (message: string, data?: unknown) => logger.debug(message, data, componentName),
    'info': (message: string, data?: unknown) => logger.info(message, data, componentName),
    'warn': (message: string, data?: unknown) => logger.warn(message, data, componentName),
    'error': (
      message: string,
      dataOrError?: Record<string, unknown> | Error | unknown,
      possibleError?: Error
    ) => {
      const errorPayload = possibleError instanceof Error
        ? {'message': possibleError.message, 'stack': possibleError.stack, 'name': possibleError.name}
        : undefined;
      const combined = errorPayload
        ? {'data': dataOrError, 'error': errorPayload}
        : dataOrError;
      logger.error(message, combined, componentName);
    },
    'apiRequest': (method: string, url: string, data?: Record<string, unknown>) => {
      logger.info(`API ${method} ${url}`, data, componentName);
    },
    'apiResponse': (method: string, url: string, status: number, data?: Record<string, unknown>) => {
      if (status >= 400) {
        logger.error(`API ${method} ${url} - ${status}`, data, componentName);
      } else {
        logger.info(`API ${method} ${url} - ${status}`, data, componentName);
      }
    }
  };
}

export default logger;

// Re-export UI Logging Error Boundary for convenient access via '@/lib/logger'
export { LoggingErrorBoundary } from './logger-ui';
