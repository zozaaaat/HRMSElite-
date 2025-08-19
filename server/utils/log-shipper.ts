/**
 * Log Shipping Utility for HRMS Elite
 * Sends logs to ELK stack or Loki for centralized logging and monitoring
 */

import winston from 'winston';
import LokiTransport from 'winston-loki';
import { log } from './logger';

interface LogShipperConfig {
  enabled: boolean;
  type: 'loki' | 'elasticsearch';
  host: string;
  port: number;
  protocol: 'http' | 'https';
  auth?: {
    username: string;
    password: string;
  };
  labels?: Record<string, string>;
  batchSize?: number;
  batchTimeout?: number;
}

class LogShipper {
  private config: LogShipperConfig;
  private logger: winston.Logger | null = null;
  private isInitialized = false;

  constructor(config: LogShipperConfig) {
    this.config = {
      enabled: false,
      type: 'loki',
      host: 'localhost',
      port: 3100,
      protocol: 'http',
      labels: {
        application: 'hrms-elite',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      },
      batchSize: 100,
      batchTimeout: 5000,
      ...config
    };
  }

  /**
   * Initialize the log shipper
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      log.info('Log shipping is disabled', { config: this.config }, 'LOG_SHIPPER');
      return;
    }

    try {
      if (this.config.type === 'loki') {
        await this.initializeLoki();
      } else if (this.config.type === 'elasticsearch') {
        await this.initializeElasticsearch();
      }

      this.isInitialized = true;
      log.info('Log shipper initialized successfully', {
        type: this.config.type,
        host: this.config.host,
        port: this.config.port
      }, 'LOG_SHIPPER');

    } catch (error) {
      log.error('Failed to initialize log shipper', { error }, 'LOG_SHIPPER');
      throw error;
    }
  }

  /**
   * Initialize Loki transport
   */
  private async initializeLoki(): Promise<void> {
    const lokiUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        application: 'hrms-elite',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        ...this.config.labels
      },
      transports: [
        new LokiTransport({
          host: lokiUrl,
          json: true,
          labels: this.config.labels,
          batching: true,
          interval: this.config.batchTimeout,
          replaceTimestamp: true,
          onConnectionError: (error) => {
            log.error('Loki connection error', { error }, 'LOG_SHIPPER');
          }
        })
      ]
    });
  }

  /**
   * Initialize Elasticsearch transport
   */
  private async initializeElasticsearch(): Promise<void> {
    // TODO: Implement Elasticsearch transport
    // This would require additional dependencies like @elastic/elasticsearch
    log.warn('Elasticsearch transport not yet implemented', {}, 'LOG_SHIPPER');
  }

  /**
   * Ship a log entry
   */
  async shipLog(level: string, message: string, meta?: any): Promise<void> {
    if (!this.config.enabled || !this.isInitialized || !this.logger) {
      return;
    }

    try {
      const logEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
        labels: {
          ...this.config.labels,
          ...meta?.labels
        }
      };

      this.logger.log(level, message, logEntry);

    } catch (error) {
      log.error('Failed to ship log entry', { error, level, message }, 'LOG_SHIPPER');
    }
  }

  /**
   * Ship multiple log entries in batch
   */
  async shipLogs(logs: Array<{ level: string; message: string; meta?: any }>): Promise<void> {
    if (!this.config.enabled || !this.isInitialized || !this.logger) {
      return;
    }

    try {
      const promises = logs.map(log => this.shipLog(log.level, log.message, log.meta));
      await Promise.all(promises);

    } catch (error) {
      log.error('Failed to ship log batch', { error, count: logs.length }, 'LOG_SHIPPER');
    }
  }

  /**
   * Ship logs from file
   */
  async shipLogFile(filePath: string): Promise<void> {
    if (!this.config.enabled || !this.isInitialized) {
      return;
    }

    try {
      const fs = await import('fs');
      const readline = await import('readline');

      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      const logs: Array<{ level: string; message: string; meta?: any }> = [];

      for await (const line of rl) {
        try {
          const parsed = JSON.parse(line);
          logs.push({
            level: parsed.level || 'info',
            message: parsed.message || line,
            meta: parsed
          });

          // Ship in batches
          if (logs.length >= (this.config.batchSize || 100)) {
            await this.shipLogs(logs);
            logs.length = 0; // Clear array
          }

        } catch (parseError) {
          // If line is not JSON, treat as info level
          logs.push({
            level: 'info',
            message: line,
            meta: { raw: true }
          });
        }
      }

      // Ship remaining logs
      if (logs.length > 0) {
        await this.shipLogs(logs);
      }

      log.info('Log file shipped successfully', { filePath }, 'LOG_SHIPPER');

    } catch (error) {
      log.error('Failed to ship log file', { error, filePath }, 'LOG_SHIPPER');
      throw error;
    }
  }

  /**
   * Get shipper status
   */
  getStatus(): { enabled: boolean; initialized: boolean; type: string; host: string; port: number } {
    return {
      enabled: this.config.enabled,
      initialized: this.isInitialized,
      type: this.config.type,
      host: this.config.host,
      port: this.config.port
    };
  }

  /**
   * Close the log shipper
   */
  async close(): Promise<void> {
    if (this.logger) {
      await new Promise<void>((resolve) => {
        this.logger!.on('finish', () => resolve());
        this.logger!.end();
      });
    }
    
    this.isInitialized = false;
    log.info('Log shipper closed', {}, 'LOG_SHIPPER');
  }
}

/**
 * Create log shipper instance from environment variables
 */
export function createLogShipper(): LogShipper {
  const config: LogShipperConfig = {
    enabled: process.env.LOG_SHIPPING_ENABLED === 'true',
    type: (process.env.LOG_SHIPPING_TYPE as 'loki' | 'elasticsearch') || 'loki',
    host: process.env.LOG_SHIPPING_HOST || 'localhost',
    port: parseInt(process.env.LOG_SHIPPING_PORT || '3100'),
    protocol: (process.env.LOG_SHIPPING_PROTOCOL as 'http' | 'https') || 'http',
    auth: process.env.LOG_SHIPPING_USERNAME && process.env.LOG_SHIPPING_PASSWORD ? {
      username: process.env.LOG_SHIPPING_USERNAME,
      password: process.env.LOG_SHIPPING_PASSWORD
    } : undefined,
    labels: {
      application: 'hrms-elite',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      instance: process.env.HOSTNAME || 'unknown'
    },
    batchSize: parseInt(process.env.LOG_SHIPPING_BATCH_SIZE || '100'),
    batchTimeout: parseInt(process.env.LOG_SHIPPING_BATCH_TIMEOUT || '5000')
  };

  return new LogShipper(config);
}

/**
 * Global log shipper instance
 */
let globalLogShipper: LogShipper | null = null;

/**
 * Initialize global log shipper
 */
export async function initializeLogShipper(): Promise<LogShipper> {
  if (!globalLogShipper) {
    globalLogShipper = createLogShipper();
    await globalLogShipper.initialize();
  }
  return globalLogShipper;
}

/**
 * Get global log shipper instance
 */
export function getLogShipper(): LogShipper | null {
  return globalLogShipper;
}

/**
 * Ship a log entry using global shipper
 */
export async function shipLog(level: string, message: string, meta?: any): Promise<void> {
  const shipper = getLogShipper();
  if (shipper) {
    await shipper.shipLog(level, message, meta);
  }
}

/**
 * Close global log shipper
 */
export async function closeLogShipper(): Promise<void> {
  if (globalLogShipper) {
    await globalLogShipper.close();
    globalLogShipper = null;
  }
}

export default LogShipper;
