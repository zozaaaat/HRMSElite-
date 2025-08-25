/**
 * Prometheus Metrics Middleware for HRMS Elite
 * Provides comprehensive metrics collection for monitoring and alerting
 */

import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { env } from '../utils/env';

// Enable default metrics collection
collectDefaultMetrics({ register });

/**
 * HTTP Request Metrics
 */
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint', 'status', 'version']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestSize = new Histogram({
  name: 'http_request_size_bytes',
  help: 'HTTP request size in bytes',
  labelNames: ['method', 'endpoint'],
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000]
});

const httpResponseSize = new Histogram({
  name: 'http_response_size_bytes',
  help: 'HTTP response size in bytes',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000]
});

/**
 * Additional Counters
 */
const httpRequestsErrorsTotal = new Counter({
  name: 'http_requests_errors_total',
  help: 'Total number of HTTP requests that resulted in errors',
  labelNames: ['method', 'route', 'status']
});

const uploadsTotal = new Counter({
  name: 'uploads_total',
  help: 'Total number of uploads',
  labelNames: ['type', 'status']
});

/**
 * Error Metrics
 */
const httpErrorsTotal = new Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'endpoint', 'status', 'error_type']
});

const httpClientErrorsTotal = new Counter({
  name: 'http_client_errors_total',
  help: 'Total number of HTTP client errors (4xx)',
  labelNames: ['method', 'endpoint', 'status']
});

const httpServerErrorsTotal = new Counter({
  name: 'http_server_errors_total',
  help: 'Total number of HTTP server errors (5xx)',
  labelNames: ['method', 'endpoint', 'status']
});

/**
 * Authentication Metrics
 */
const authFailuresTotal = new Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['method', 'endpoint', 'reason']
});

const authSuccessTotal = new Counter({
  name: 'auth_success_total',
  help: 'Total number of successful authentications',
  labelNames: ['method', 'user_role']
});

const activeSessions = new Gauge({
  name: 'active_sessions',
  help: 'Number of active user sessions'
});

const loginFailuresTotal = new Counter({
  name: 'login_failures_total',
  help: 'Total number of failed login attempts',
  labelNames: ['reason']
});

/**
 * Security Metrics
 */
const securityAlertsTotal = new Counter({
  name: 'security_alerts_total',
  help: 'Total number of security alerts',
  labelNames: ['type', 'severity', 'pattern']
});

const suspiciousRequestsTotal = new Counter({
  name: 'suspicious_requests_total',
  help: 'Total number of suspicious requests',
  labelNames: ['type', 'pattern']
});
const avScanFailuresTotal = new Counter({
  name: 'av_scan_failures_total',
  help: 'Total number of antivirus scan failures',
  labelNames: ['provider'],
});


/**
 * Database Metrics
 */
const dbQueriesTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status']
});

const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections'
});

/**
 * File Upload Metrics
 */
const fileUploadsTotal = new Counter({
  name: 'file_uploads_total',
  help: 'Total number of file uploads',
  labelNames: ['type', 'status', 'size_range']
});

const fileUploadSize = new Histogram({
  name: 'file_upload_size_bytes',
  help: 'File upload size in bytes',
  labelNames: ['type'],
  buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600]
});

/**
 * Business Logic Metrics
 */
const employeeOperationsTotal = new Counter({
  name: 'employee_operations_total',
  help: 'Total number of employee operations',
  labelNames: ['operation', 'status', 'user_role']
});

const documentOperationsTotal = new Counter({
  name: 'document_operations_total',
  help: 'Total number of document operations',
  labelNames: ['operation', 'status', 'user_role']
});

const payrollOperationsTotal = new Counter({
  name: 'payroll_operations_total',
  help: 'Total number of payroll operations',
  labelNames: ['operation', 'status', 'user_role']
});

/**
 * System Metrics
 */
const memoryUsage = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

const cpuUsage = new Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage'
});

const diskUsage = new Gauge({
  name: 'disk_usage_bytes',
  help: 'Disk usage in bytes',
  labelNames: ['path']
});

/**
 * Web Vitals Metrics
 */
const webVitalsLCP = new Gauge({
  name: 'web_vitals_lcp',
  help: 'Largest Contentful Paint (ms)'
});

const webVitalsCLS = new Gauge({
  name: 'web_vitals_cls',
  help: 'Cumulative Layout Shift'
});

const webVitalsFID = new Gauge({
  name: 'web_vitals_fid',
  help: 'First Input Delay (ms)'
});

/**
 * Metrics utilities
 */
export const metricsUtils = {
  // HTTP Metrics
  incrementHttpRequest: (method: string, endpoint: string, status: number, version: string = 'v1') => {
    httpRequestsTotal.inc({ method, endpoint, status: status.toString(), version });
  },

  incrementHttpRequestError: (method: string, route: string, status: number) => {
    httpRequestsErrorsTotal.inc({ method, route, status: status.toString() });
  },

  recordHttpDuration: (route: string, status: number, duration: number) => {
    httpRequestDuration.observe({ route, status: status.toString() }, duration);
  },

  recordHttpRequestSize: (method: string, endpoint: string, size: number) => {
    httpRequestSize.observe({ method, endpoint }, size);
  },

  recordHttpResponseSize: (method: string, endpoint: string, status: number, size: number) => {
    httpResponseSize.observe({ method, endpoint, status: status.toString() }, size);
  },

  // Error Metrics
  incrementHttpError: (method: string, endpoint: string, status: number, errorType: string) => {
    httpErrorsTotal.inc({ method, endpoint, status: status.toString(), error_type: errorType });
  },

  incrementClientError: (method: string, endpoint: string, status: number) => {
    httpClientErrorsTotal.inc({ method, endpoint, status: status.toString() });
  },

  incrementServerError: (method: string, endpoint: string, status: number) => {
    httpServerErrorsTotal.inc({ method, endpoint, status: status.toString() });
  },

  // Authentication Metrics
  incrementAuthFailure: (method: string, endpoint: string, reason: string) => {
    authFailuresTotal.inc({ method, endpoint, reason });
  },

  incrementAuthSuccess: (method: string, userRole: string) => {
    authSuccessTotal.inc({ method, user_role: userRole });
  },

  incrementLoginFailure: (reason: string) => {
    loginFailuresTotal.inc({ reason });
  },

  setActiveSessions: (count: number) => {
    activeSessions.set(count);
  },

  // Security Metrics
  incrementSecurityAlert: (type: string, severity: string, pattern: string) => {
    securityAlertsTotal.inc({ type, severity, pattern });
  },

  incrementSuspiciousRequest: (type: string, pattern: string) => {
    suspiciousRequestsTotal.inc({ type, pattern });
  },

  incrementAvScanFailure: (provider: string) => {
    avScanFailuresTotal.inc({ provider });
  },

  // Database Metrics
  incrementDbQuery: (operation: string, table: string, status: string) => {
    dbQueriesTotal.inc({ operation, table, status });
  },

  recordDbDuration: (operation: string, table: string, duration: number) => {
    dbQueryDuration.observe({ operation, table }, duration);
  },

  setDbConnections: (count: number) => {
    dbConnectionsActive.set(count);
  },

  // File Upload Metrics
  incrementFileUpload: (type: string, status: string, sizeRange: string) => {
    fileUploadsTotal.inc({ type, status, size_range: sizeRange });
    uploadsTotal.inc({ type, status });
  },

  recordFileUploadSize: (type: string, size: number) => {
    fileUploadSize.observe({ type }, size);
  },

  // Business Logic Metrics
  incrementEmployeeOperation: (operation: string, status: string, userRole: string) => {
    employeeOperationsTotal.inc({ operation, status, user_role: userRole });
  },

  incrementDocumentOperation: (operation: string, status: string, userRole: string) => {
    documentOperationsTotal.inc({ operation, status, user_role: userRole });
  },

  incrementPayrollOperation: (operation: string, status: string, userRole: string) => {
    payrollOperationsTotal.inc({ operation, status, user_role: userRole });
  },

  // System Metrics
  setMemoryUsage: (type: string, bytes: number) => {
    memoryUsage.set({ type }, bytes);
  },

  setCpuUsage: (percent: number) => {
    cpuUsage.set(percent);
  },

  setDiskUsage: (path: string, bytes: number) => {
    diskUsage.set({ path }, bytes);
  },

  // Web Vitals
  recordWebVital: (metric: string, value: number) => {
    const gauges: Record<string, Gauge> = {
      LCP: webVitalsLCP,
      CLS: webVitalsCLS,
      FID: webVitalsFID
    };
    const gauge = gauges[metric];
    if (gauge) {
      gauge.set(value);
    }
  }
};

/**
 * Prometheus metrics middleware
 */
export const prometheusMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  const requestSize = parseInt(req.get('content-length') || '0');

  // Record request size
  if (requestSize > 0) {
    metricsUtils.recordHttpRequestSize(req.method, req.url, requestSize);
  }

  // Override res.send to record metrics
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000000; // Convert to seconds
    const responseSize = Buffer.byteLength(data, 'utf8');
    const route = req.route?.path || req.path;

    // Record metrics
    metricsUtils.incrementHttpRequest(req.method, req.url, res.statusCode);
    metricsUtils.recordHttpDuration(route, res.statusCode, duration);
    metricsUtils.recordHttpResponseSize(req.method, req.url, res.statusCode, responseSize);

    // Record errors
    if (res.statusCode >= 400 && res.statusCode < 500) {
      metricsUtils.incrementClientError(req.method, req.url, res.statusCode);
    } else if (res.statusCode >= 500) {
      metricsUtils.incrementServerError(req.method, req.url, res.statusCode);
    }

    if (res.statusCode >= 400) {
      metricsUtils.incrementHttpRequestError(req.method, route, res.statusCode);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Metrics endpoint authentication
 */
export const metricsAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = env.METRICS_TOKEN;
  if (!token) {
    return res.status(403).json({ error: 'Metrics disabled' });
  }
  if (req.get('x-metrics-token') !== token) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

/**
 * Metrics endpoint handler
 */
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
};

/**
 * Health check endpoint with metrics
 */
export const healthCheckHandler = async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  // Update system metrics
  const memUsage = process.memoryUsage();
  metricsUtils.setMemoryUsage('rss', memUsage.rss);
  metricsUtils.setMemoryUsage('heapUsed', memUsage.heapUsed);
  metricsUtils.setMemoryUsage('heapTotal', memUsage.heapTotal);
  metricsUtils.setMemoryUsage('external', memUsage.external);

  res.json(health);
};

/**
 * Initialize metrics collection
 */
export const initializeMetrics = () => {
  // Update system metrics periodically
  setInterval(() => {
    const memUsage = process.memoryUsage();
    metricsUtils.setMemoryUsage('rss', memUsage.rss);
    metricsUtils.setMemoryUsage('heapUsed', memUsage.heapUsed);
    metricsUtils.setMemoryUsage('heapTotal', memUsage.heapTotal);
    metricsUtils.setMemoryUsage('external', memUsage.external);
  }, 30000); // Every 30 seconds

  // Update CPU usage (simplified)
  setInterval(() => {
    const startUsage = process.cpuUsage();
    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage);
      const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
      metricsUtils.setCpuUsage(cpuPercent);
    }, 100);
  }, 5000); // Every 5 seconds
};

export default {
  middleware: prometheusMiddleware,
  handler: metricsHandler,
  health: healthCheckHandler,
  utils: metricsUtils,
  initialize: initializeMetrics,
  auth: metricsAuth
};
