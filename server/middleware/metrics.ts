/**
 * @fileoverview Prometheus metrics middleware for HRMS Elite
 * @description Collects and exposes metrics for monitoring and alerting
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import {Request, Response, NextFunction} from 'express';
import {log} from '../utils/logger';

// Simple in-memory metrics storage (in production, use prom-client)
interface Metrics {
  http_requests_total: { [key: string]: number };
  http_request_duration_seconds: { [key: string]: number[] };
  http_requests_in_progress: { [key: string]: number };
  active_users: number;
  database_connections: number;
  memory_usage_bytes: number;
  cpu_usage_percent: number;
  custom_metrics: { [key: string]: number };
}

const metrics: Metrics = {
  'http_requests_total': {},
  'http_request_duration_seconds': {},
  'http_requests_in_progress': {},
  'active_users': 0,
  'database_connections': 0,
  'memory_usage_bytes': 0,
  'cpu_usage_percent': 0,
  'custom_metrics': {}
};

/**
 * Generate metric key for HTTP requests
 * @param method - HTTP method
 * @param path - Request path
 * @param status - Response status code
 * @returns Metric key
 */
const getMetricKey = (method: string, path: string, status: number): string => {

  return `${method}_${path}_${status}`;

};

/**
 * Get status code category
 * @param status - HTTP status code
 * @returns Status category
 */
const getStatusCategory = (status: number): string => {

  if (status >= 200 && status < 300) {

    return '2xx';

  }
  if (status >= 300 && status < 400) {

    return '3xx';

  }
  if (status >= 400 && status < 500) {

    return '4xx';

  }
  if (status >= 500) {

    return '5xx';

  }
  return 'other';

};

/**
 * Metrics collection middleware
 * @description Collects HTTP request metrics
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const startTime = Date.now();
  const {method} = req;
  const path = req.route?.path ?? req.path;

  // Track request in progress
  const inProgressKey = `${method}_${path}`;
  metrics.http_requests_in_progress[inProgressKey] =
    (metrics.http_requests_in_progress[inProgressKey] || 0) + 1;

  // Override res.end to capture response metrics
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: Record<string, unknown>) {

    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const status = res.statusCode;
    const statusCategory = getStatusCategory(status);

    // Update request total
    const totalKey = getMetricKey(method, path, status);
    metrics.http_requests_total[totalKey] =
      (metrics.http_requests_total[totalKey] || 0) + 1;

    // Update duration metrics
    const durationKey = `${method}_${path}_${statusCategory}`;
    if (!metrics.http_request_duration_seconds[durationKey]) {

      metrics.http_request_duration_seconds[durationKey] = [];

    }
    metrics.http_request_duration_seconds[durationKey].push(duration);

    // Keep only last 1000 duration measurements
    if (metrics.http_request_duration_seconds[durationKey].length > 1000) {

      metrics.http_request_duration_seconds[durationKey] =
        metrics.http_request_duration_seconds[durationKey].slice(-1000);

    }

    // Decrease in-progress requests
    metrics.http_requests_in_progress[inProgressKey]--;
    if (metrics.http_requests_in_progress[inProgressKey] <= 0) {

      delete metrics.http_requests_in_progress[inProgressKey];

    }

    // Update system metrics
    updateSystemMetrics();

    // Call original end method
    originalEnd.call(this, chunk, encoding);

  };

  next();

};

/**
 * Update system metrics
 * @description Updates system-level metrics
 */
const updateSystemMetrics = () => {

  // Memory usage
  const memUsage = process.memoryUsage();
  metrics.memory_usage_bytes = memUsage.heapUsed;

  // CPU usage (simplified)
  const startUsage = process.cpuUsage();
  setTimeout(() => {

    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = endUsage.user + endUsage.system;
    metrics.cpu_usage_percent = (totalUsage / 1000000) * 100; // Convert to percentage

  }, 100);

};

/**
 * Custom metrics functions
 */
export const metricsUtils = {
  /**
   * Increment custom metric
   * @param name - Metric name
   * @param value - Increment value (default: 1)
   */
  'incrementMetric': (name: string, value = 1) => {

    metrics.custom_metrics[name] = (metrics.custom_metrics[name] || 0) + value;

  },

  /**
   * Set custom metric value
   * @param name - Metric name
   * @param value - Metric value
   */
  'setMetric': (name: string, value: number) => {

    metrics.custom_metrics[name] = value;

  },

  /**
   * Update active users count
   * @param count - Active users count
   */
  'updateActiveUsers': (count: number) => {

    metrics.active_users = count;

  },

  /**
   * Update database connections count
   * @param count - Database connections count
   */
  'updateDatabaseConnections': (count: number) => {

    metrics.database_connections = count;

  }
};

/**
 * Generate Prometheus metrics format
 * @returns Prometheus-formatted metrics string
 */
const generatePrometheusMetrics = (): string => {

  let output = '';

  // HTTP requests total
  output += '# HELP http_requests_total Total number of HTTP requests\n';
  output += '# TYPE http_requests_total counter\n';
  for (const [key, value] of Object.entries(metrics.http_requests_total)) {

    const [method, path, status] = key.split('_');
    output += `http_requests_total{
  method="${
  method
}",path="${
  path
}",status="${
  status
}"
} ${
  value
}\n`;

  }

  // HTTP request duration
  output += '# HELP http_request_duration_seconds HTTP request duration in seconds\n';
  output += '# TYPE http_request_duration_seconds histogram\n';
  for (const [key, durations] of Object.entries(metrics.http_request_duration_seconds)) {

    const [method, path, status] = key.split('_');
    const sum = durations.reduce((a, b) => a + b, 0);
    const count = durations.length;
    const avg = count > 0 ? sum / count : 0;

    output += `http_request_duration_seconds_sum{
  method="${
  method
}",path="${
  path
}",status="${
  status
}"
} ${
  sum
}\n`;
    output += `http_request_duration_seconds_count{
  method="${
  method
}",path="${
  path
}",status="${
  status
}"
} ${
  count
}\n`;
    output += `http_request_duration_seconds_avg{
  method="${
  method
}",path="${
  path
}",status="${
  status
}"
} ${
  avg
}\n`;

  }

  // HTTP requests in progress
  output += '# HELP http_requests_in_progress Current number of HTTP requests being processed\n';
  output += '# TYPE http_requests_in_progress gauge\n';
  for (const [key, value] of Object.entries(metrics.http_requests_in_progress)) {

    const [method, path] = key.split('_');
    output += `http_requests_in_progress{method="${method}",path="${path}"} ${value}\n`;

  }

  // System metrics
  output += '# HELP process_memory_usage_bytes Memory usage in bytes\n';
  output += '# TYPE process_memory_usage_bytes gauge\n';
  output += `process_memory_usage_bytes ${metrics.memory_usage_bytes}\n`;

  output += '# HELP process_cpu_usage_percent CPU usage percentage\n';
  output += '# TYPE process_cpu_usage_percent gauge\n';
  output += `process_cpu_usage_percent ${metrics.cpu_usage_percent}\n`;

  // Custom metrics
  output += '# HELP active_users Current number of active users\n';
  output += '# TYPE active_users gauge\n';
  output += `active_users ${metrics.active_users}\n`;

  output += '# HELP database_connections Current number of database connections\n';
  output += '# TYPE database_connections gauge\n';
  output += `database_connections ${metrics.database_connections}\n`;

  // Custom business metrics
  for (const [name, value] of Object.entries(metrics.custom_metrics)) {

    output += `# HELP ${name} Custom metric: ${name}\n`;
    output += `# TYPE ${name} counter\n`;
    output += `${name} ${value}\n`;

  }

  return output;

};

/**
 * Metrics endpoint handler
 * @description Exposes metrics in Prometheus format
 * @param req - Express request object
 * @param res - Express response object
 */
export const metricsEndpoint = (req: Request, res: Response) => {

  try {

    const metricsData = generatePrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metricsData);

    log.info('Metrics endpoint accessed', {
      'ip': req.ip,
      'userAgent': req.get('User-Agent'),
      'timestamp': new Date().toISOString()
    });

  } catch (error) {

    log.error('Error generating metrics', {
  'error': error instanceof Error ? error.message : 'Unknown error'
});
    res.status(500).send('# Error generating metrics\n');

  }

};

/**
 * Health check with metrics
 * @description Enhanced health check that includes metrics information
 * @param req - Express request object
 * @param res - Express response object
 */
export const healthCheckWithMetrics = (req: Request, res: Response) => {

  const healthData = {
    'status': 'OK',
    'timestamp': new Date().toISOString(),
    'uptime': process.uptime(),
    'memory': process.memoryUsage(),
    'version': process.env.npm_package_version ?? "1.0.0",
    'environment': process.env.NODE_ENV ?? "development",
    'metrics': {
      'activeUsers': metrics.active_users,
      'databaseConnections': metrics.database_connections,
      'memoryUsageBytes': metrics.memory_usage_bytes,
      'cpuUsagePercent': metrics.cpu_usage_percent,
      'totalRequests': Object.values(metrics.http_requests_total).reduce((a, b) => a + b, 0)
    },
    'security': {
      'helmet': true,
      'rateLimit': true,
      'csrf': true,
      'inputValidation': true
    }
  };

  res.json(healthData);

};

export default {
  metricsMiddleware,
  metricsEndpoint,
  healthCheckWithMetrics,
  metricsUtils
};
