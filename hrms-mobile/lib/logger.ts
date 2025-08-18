/**
 * Simple logger for HRMS Mobile app
 * Provides basic logging functionality for PWA features
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
  source?: string;
}

class Logger {
  private logLevel: LogLevel;
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown, source?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sourceInfo = source ? ` [${source}]` : '';
    const dataInfo = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';

    return `[${timestamp}] ${levelName}${sourceInfo}: ${message}${dataInfo}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private logToConsole(level: LogLevel, message: string, data?: unknown, source?: string): void {
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

  debug(message: string, data?: unknown, source?: string): void {
    this.logToConsole(LogLevel.DEBUG, message, data, source);
  }

  info(message: string, data?: unknown, source?: string): void {
    this.logToConsole(LogLevel.INFO, message, data, source);
  }

  warn(message: string, data?: unknown, source?: string): void {
    this.logToConsole(LogLevel.WARN, message, data, source);
  }

  error(message: string, error?: Error | unknown, source?: string): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;

    this.logToConsole(LogLevel.ERROR, message, errorData, source);
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

export default logger;
