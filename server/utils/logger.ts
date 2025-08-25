/**
 * Server-side logging utility for HRMS Elite
 * Provides structured logging with different levels and environments
 */

import type {
  LogData, LogLevel
} from '../../shared/types/common';
import { maskPII } from './pii';

// Create enum-like structure for log levels
const LogLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
} as const;

type LogLevelValue = typeof LogLevels[keyof typeof LogLevels];

// Map string log levels to numeric values
const logLevelMap: Record<LogLevel, LogLevelValue> = {
  debug: LogLevels.DEBUG,
  info: LogLevels.INFO,
  warn: LogLevels.WARN,
  error: LogLevels.ERROR,
  fatal: LogLevels.FATAL
};

// Map numeric values back to string names
const logLevelNames: Record<LogLevelValue, string> = {
  [LogLevels.DEBUG]: 'DEBUG',
  [LogLevels.INFO]: 'INFO',
  [LogLevels.WARN]: 'WARN',
  [LogLevels.ERROR]: 'ERROR',
  [LogLevels.FATAL]: 'FATAL'
};

export type { LogLevel } from '../../shared/types/common';

export interface ServerLogData extends LogData {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: LogData | undefined;
  source?: string | undefined;
  userId?: string | undefined;
  requestId?: string | undefined;
  correlationId?: string | undefined;
  ip?: string | undefined;
}

class ServerLogger {
  private logLevel: LogLevelValue;
  private readonly isDevelopment: boolean;
  private readonly isProduction: boolean;
  private readonly externalUrl?: string;
  private readonly shipperType: 'loki' | 'elk';

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isDevelopment ? LogLevels.DEBUG : LogLevels.INFO;
    this.externalUrl = process.env.LOG_SHIPPER_URL;
    this.shipperType = (process.env.LOG_SHIPPER_TYPE as 'loki' | 'elk') || 'loki';
  }

  private formatMessage(level: LogLevelValue,
    message: string,
    data?: LogData,
    source?: string): string {

    const timestamp = new Date().toISOString();
    const levelName = logLevelNames[level];
    const sourceInfo = source ? ` [${source}]` : '';
    const masked = data ? maskPII(data) : undefined;
    const dataInfo = masked ? ` | Data: ${JSON.stringify(masked, null, 2)}` : '';

    return `[${timestamp}] ${levelName}${sourceInfo}: ${message}${dataInfo}`;

  }

  private shouldLog(level: LogLevelValue): boolean {

    return level >= this.logLevel;

  }

  private logToConsole(level: LogLevelValue, message: string, data?: LogData, source?: string): void {

    if (!this.shouldLog(level)) {

      return;

    }

    const formattedMessage = this.formatMessage(level, message, data, source);

    switch (level) {

    case LogLevels.DEBUG:
      console.debug(formattedMessage);
      break;
    case LogLevels.INFO:
      console.info(formattedMessage);
      break;
    case LogLevels.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevels.ERROR:
    case LogLevels.FATAL:
      // Use console.error for error and fatal levels
      console.error(formattedMessage);
      break;

    }

  }

  private attachCorrelation(data?: LogData): { data?: LogData; correlationId?: string } {
    if (!data) return { data };
    const requestId = (data as any).correlationId || (data as any).requestId;
    if (requestId && !(data as any).correlationId) {
      return { data: { ...data, correlationId: requestId }, correlationId: requestId };
    }
    return { data, correlationId: requestId };
  }

  private async logToService(logData: ServerLogData): Promise<void> {
    if (!this.isProduction || !this.externalUrl) {
      return;
    }
    try {
      if (this.shipperType === 'loki') {
        const payload = {
          streams: [
            {
              stream: { level: logData.level, app: 'hrms-elite' },
              values: [[`${Date.now()}000000`, JSON.stringify(logData)]]
            }
          ]
        };
        await fetch(this.externalUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(this.externalUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
      }
    } catch (err) {
      this.logToConsole(LogLevels.ERROR, 'Failed to ship log', { error: (err as Error).message }, 'LOGGER');
    }
  }

  debug(message: string, data?: LogData, source?: string): void {

    const { data: enriched } = this.attachCorrelation(data);
    this.logToConsole(LogLevels.DEBUG, message, enriched, source);

  }

  info(message: string, data?: LogData, source?: string): void {

    const { data: enriched, correlationId } = this.attachCorrelation(data);
    this.logToConsole(LogLevels.INFO, message, enriched, source);
    void this.logToService({
      'timestamp': new Date().toISOString(),
      'level': 'info',
      message,
      ...(enriched && { data: enriched }),
      ...(source && { source }),
      ...(correlationId && { correlationId })
    });

  }

  warn(message: string, data?: LogData, source?: string): void {

    const { data: enriched, correlationId } = this.attachCorrelation(data);
    this.logToConsole(LogLevels.WARN, message, enriched, source);
    void this.logToService({
      'timestamp': new Date().toISOString(),
      'level': 'warn',
      message,
      ...(enriched && { data: enriched }),
      ...(source && { source }),
      ...(correlationId && { correlationId })
    });

  }

  error(message: string, error?: Error | LogData, source?: string): void {

    const errorData: LogData = error instanceof Error
      ? { 'message': error.message, 'stack': error.stack, 'name': error.name }
      : error ?? {};
    const { data: enriched, correlationId } = this.attachCorrelation(errorData);

    this.logToConsole(LogLevels.ERROR, message, enriched, source);
    void this.logToService({
      'timestamp': new Date().toISOString(),
      'level': 'error',
      message,
      'data': enriched,
      ...(source && { source }),
      ...(correlationId && { correlationId })
    });

  }

  // Specialized logging methods
  apiCall(endpoint: string,
    method: string,
    status?: number,
    duration?: number,
    ip?: string): void {

    this.info(`API ${method} ${endpoint}`, { status, duration, ip }, 'API');

  }

  database(operation: string, table?: string, duration?: number, data?: LogData): void {

    this.info(`Database ${operation}`, { table, duration, ...data }, 'DATABASE');

  }

  auth(event: string, userId?: string, data?: LogData): void {

    this.info(`Auth event: ${event}`, { userId, ...data }, 'AUTH');

  }

  security(event: string, ip?: string, data?: LogData): void {

    this.warn(`Security event: ${event}`, { ip, ...data }, 'SECURITY');

  }

  middleware(name: string, duration?: number, data?: LogData): void {

    this.debug(`Middleware ${name}`, { duration, ...data }, 'MIDDLEWARE');

  }

  // Development helpers
  dev(message: string, data?: LogData, source?: string): void {

    if (this.isDevelopment) {

      this.debug(message, data, source);

    }

  }

  // Set log level
  setLogLevel(level: LogLevel): void {

    this.logLevel = logLevelMap[level];

  }

  // Get current log level
  getLogLevel(): LogLevel {

    // Find the string key for the current numeric level
    for (const [key, value] of Object.entries(logLevelMap)) {
      if (value === this.logLevel) {
        return key as LogLevel;
      }
    }
    return 'info'; // fallback
  }

}

// Create singleton instance
const serverLogger = new ServerLogger();

// Optional external log shipper (e.g., Loki/ELK)
const sinkUrl = process.env.LOG_SHIPPER_URL;
if (sinkUrl) {
  serverLogger.info('External log sink enabled', {
    externalUrl: sinkUrl,
    type: process.env.LOG_SHIPPER_TYPE || 'loki'
  });
}

// Export convenience functions
export const log = {
  debug: (message: string, data?: LogData, source?: string) => serverLogger.debug(message, data, source),
  info: (message: string, data?: LogData, source?: string) => serverLogger.info(message, data, source),
  warn: (message: string, data?: LogData, source?: string) => serverLogger.warn(message, data, source),
  error: (message: string, error?: Error | LogData, source?: string) => serverLogger.error(message, error, source),
  api: (endpoint: string, method: string, status?: number, duration?: number, ip?: string) =>
    serverLogger.apiCall(endpoint, method, status, duration, ip),
  db: (operation: string, table?: string, duration?: number, data?: LogData) =>
    serverLogger.database(operation, table, duration, data),
  auth: (event: string, userId?: string, data?: LogData) => serverLogger.auth(event, userId, data),
  security: (event: string, ip?: string, data?: LogData) => serverLogger.security(event, ip, data),
  middleware: (name: string, duration?: number, data?: LogData) =>
    serverLogger.middleware(name, duration, data),
  dev: (message: string, data?: LogData, source?: string) => serverLogger.dev(message, data, source)
};

export default serverLogger;
