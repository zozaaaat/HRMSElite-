// Remove the circular import
// import { logger } from '@utils/logger';

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
  data?: any;
  source?: string;
  userId?: string;
  sessionId?: string;
}

// Add type declarations for import.meta.env
declare global {
  interface ImportMeta {
    env: {
      DEV: boolean;
      PROD: boolean;
    };
  }
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, data?: any, source?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourceInfo = source ? ` [${source}]` : '';
    const dataInfo = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
    
    return `[${timestamp}] ${levelName}${sourceInfo}: ${message}${dataInfo}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private logToConsole(level: LogLevel, message: string, data?: any, source?: string): void {
    if (!this.shouldLog(level)) return;

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

  private logToService(logData: LogData): void {
    // In production, send logs to external service
    if (this.isProduction) {
      // TODO: Implement external logging service (e.g., Sentry, LogRocket)
      // For now, we'll just use console in production too
      this.logToConsole(logData.level, logData.message, logData.data, logData.source);
    }
  }

  debug(message: string, data?: any, source?: string): void {
    this.logToConsole(LogLevel.DEBUG, message, data, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.logToConsole(LogLevel.INFO, message, data, source);
    this.logToService({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      data,
      source
    });
  }

  warn(message: string, data?: any, source?: string): void {
    this.logToConsole(LogLevel.WARN, message, data, source);
    this.logToService({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      data,
      source
    });
  }

  error(message: string, error?: Error | any, source?: string): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
    
    this.logToConsole(LogLevel.ERROR, message, errorData, source);
    this.logToService({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      data: errorData,
      source
    });
  }

  // Specialized logging methods
  apiCall(endpoint: string, method: string, status?: number, duration?: number): void {
    this.info(`API ${method} ${endpoint}`, { status, duration }, 'API');
  }

  userAction(action: string, userId?: string, data?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, { userId, ...data }, 'USER_ACTION');
  }

  performance(operation: string, duration: number, data?: Record<string, unknown>): void {
    this.info(`Performance: ${operation}`, { duration, ...data }, 'PERFORMANCE');
  }

  security(event: string, data?: Record<string, unknown>): void {
    this.warn(`Security event: ${event}`, data, 'SECURITY');
  }

  // Development helpers
  dev(message: string, data?: any, source?: string): void {
    if (this.isDevelopment) {
      this.debug(message, data, source);
    }
  }

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Get current log level
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, data?: any, source?: string) => logger.debug(message, data, source),
  info: (message: string, data?: any, source?: string) => logger.info(message, data, source),
  warn: (message: string, data?: any, source?: string) => logger.warn(message, data, source),
  error: (message: string, error?: Error | any, source?: string) => logger.error(message, error, source),
  api: (endpoint: string, method: string, status?: number, duration?: number) => logger.apiCall(endpoint, method, status, duration),
  user: (action: string, userId?: string, data?: Record<string, unknown>) => logger.userAction(action, userId, data),
  perf: (operation: string, duration: number, data?: Record<string, unknown>) => logger.performance(operation, duration, data),
  security: (event: string, data?: Record<string, unknown>) => logger.security(event, data),
  dev: (message: string, data?: any, source?: string) => logger.dev(message, data, source)
};

export default logger; 