/**
 * Enhanced Observability Middleware for HRMS Elite
 * Provides request tracing, sensitive data redaction, and monitoring integration
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { log } from '../utils/logger';
import { Counter, Gauge, Histogram, register } from 'prom-client';

// Extend Express Request interface for observability
declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
      log: {
        info: (message: string, data?: any) => void;
        warn: (message: string, data?: any) => void;
        error: (message: string, data?: any) => void;
        debug: (message: string, data?: any) => void;
      };
      metrics: {
        increment: (name: string, labels?: Record<string, string>) => void;
        histogram: (name: string, value: number, labels?: Record<string, string>) => void;
        gauge: (name: string, value: number, labels?: Record<string, string>) => void;
      };
    }
  }
}

/**
 * Sensitive data redaction configuration
 */
const SENSITIVE_FIELDS = {
  // Headers
  headers: [
    'authorization',
    'cookie',
    'x-csrf-token',
    'x-xsrf-token',
    'x-api-key',
    'x-auth-token'
  ],
  
  // Request body fields
  body: [
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    '_csrf',
    'secret',
    'apiKey',
    'privateKey'
  ],
  
  // Query parameters
  query: [
    'token',
    'access_token',
    'refresh_token',
    'api_key',
    'secret'
  ],
  
  // Response body fields
  response: [
    'token',
    'accessToken',
    'refreshToken',
    'password',
    '_csrf',
    'secret',
    'privateKey'
  ]
};

/**
 * Redact sensitive data from objects
 */
function redactSensitiveData(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const redacted = { ...obj };
  
  fields.forEach(field => {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  });
  
  return redacted;
}

/**
 * Deep redact sensitive data from nested objects
 */
function deepRedactSensitiveData(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepRedactSensitiveData(item, fields));
  }
  
  const redacted = { ...obj };
  
  Object.keys(redacted).forEach(key => {
    if (fields.includes(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = deepRedactSensitiveData(redacted[key], fields);
    }
  });
  
  return redacted;
}

/**
 * Create request logger with context
 */
function createRequestLogger(req: Request): Request['log'] {
  const requestId = req.id;
  
  return {
    info: (message: string, data?: any) => {
      log.info(message, {
        ...data,
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        userRole: (req as any).user?.role,
        timestamp: new Date().toISOString()
      }, 'REQUEST');
    },
    
    warn: (message: string, data?: any) => {
      log.warn(message, {
        ...data,
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        userRole: (req as any).user?.role,
        timestamp: new Date().toISOString()
      }, 'REQUEST');
    },
    
    error: (message: string, data?: any) => {
      log.error(message, {
        ...data,
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        userRole: (req as any).user?.role,
        timestamp: new Date().toISOString()
      }, 'REQUEST');
    },
    
    debug: (message: string, data?: any) => {
      log.debug(message, {
        ...data,
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        userRole: (req as any).user?.role,
        timestamp: new Date().toISOString()
      }, 'REQUEST');
    }
  };
}

/**
 * Create metrics interface for request
 */
function createRequestMetrics(req: Request): Request['metrics'] {
  const getCounter = (name: string, labelNames: string[]) => {
    return (register.getSingleMetric(name) as Counter<string>) ||
      new Counter({ name, help: `${name} counter`, labelNames });
  };

  const getHistogram = (name: string, labelNames: string[]) => {
    return (register.getSingleMetric(name) as Histogram<string>) ||
      new Histogram({ name, help: `${name} histogram`, labelNames });
  };

  const getGauge = (name: string, labelNames: string[]) => {
    return (register.getSingleMetric(name) as Gauge<string>) ||
      new Gauge({ name, help: `${name} gauge`, labelNames });
  };

  return {
    increment: (name: string, labels: Record<string, string> = {}) => {
      const counter = getCounter(name, Object.keys(labels));
      counter.inc(labels);
    },

    histogram: (name: string, value: number, labels: Record<string, string> = {}) => {
      const histogram = getHistogram(name, Object.keys(labels));
      histogram.observe(labels, value);
    },

    gauge: (name: string, value: number, labels: Record<string, string> = {}) => {
      const gauge = getGauge(name, Object.keys(labels));
      gauge.set(labels, value);
    }
  };
}

/**
 * Enhanced observability middleware
 */
export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing request ID
  const requestId = req.headers['x-request-id'] as string || randomUUID();
  req.id = requestId;
  
  // Set start time for performance tracking
  req.startTime = Date.now();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Request-Start', req.startTime.toString());
  
  // Create request logger and metrics
  req.log = createRequestLogger(req);
  req.metrics = createRequestMetrics(req);
  
  // Redact sensitive data from request
  const redactedHeaders = redactSensitiveData(req.headers, SENSITIVE_FIELDS.headers);
  const redactedQuery = redactSensitiveData(req.query, SENSITIVE_FIELDS.query);
  const redactedBody = deepRedactSensitiveData(req.body, SENSITIVE_FIELDS.body);
  
  // Log request start with redacted data
  req.log.info(`${req.method} ${req.url} - Request started`, {
    headers: redactedHeaders,
    query: redactedQuery,
    body: redactedBody,
    contentLength: req.get('content-length'),
    contentType: req.get('content-type')
  });
  
  // Override res.send to log response and redact sensitive data
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    const responseSize = Buffer.byteLength(data, 'utf8');
    
    // Redact sensitive data from response
    let redactedData = data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        redactedData = JSON.stringify(deepRedactSensitiveData(parsed, SENSITIVE_FIELDS.response));
      } catch {
        // Not JSON, keep as is
        redactedData = data;
      }
    } else if (typeof data === 'object') {
      redactedData = deepRedactSensitiveData(data, SENSITIVE_FIELDS.response);
    }
    
    // Log response with appropriate level
    if (res.statusCode >= 500) {
      req.log.error(`${req.method} ${req.url} - ${res.statusCode}`, {
        responseTime,
        statusCode: res.statusCode,
        responseSize,
        data: redactedData
      });
      
      // Increment error metrics
      req.metrics.increment('http_requests_total', {
        method: req.method,
        status: res.statusCode.toString(),
        endpoint: req.url
      });
      
    } else if (res.statusCode >= 400) {
      req.log.warn(`${req.method} ${req.url} - ${res.statusCode}`, {
        responseTime,
        statusCode: res.statusCode,
        responseSize,
        data: redactedData
      });
      
      // Increment client error metrics
      req.metrics.increment('http_requests_total', {
        method: req.method,
        status: res.statusCode.toString(),
        endpoint: req.url
      });
      
    } else {
      req.log.info(`${req.method} ${req.url} - ${res.statusCode}`, {
        responseTime,
        statusCode: res.statusCode,
        responseSize
      });
      
      // Increment success metrics
      req.metrics.increment('http_requests_total', {
        method: req.method,
        status: res.statusCode.toString(),
        endpoint: req.url
      });
    }
    
    // Record response time histogram
    req.metrics.histogram('http_request_duration_seconds', responseTime / 1000, {
      method: req.method,
      endpoint: req.url
    });
    
    // Add response headers for observability
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Response-Size', responseSize.toString());
    
    return originalSend.call(this, data);
  };
  
  // Override res.json to ensure consistent logging
  const originalJson = res.json;
  res.json = function(data) {
    return res.send(JSON.stringify(data));
  };
  
  next();
};

/**
 * Error tracking middleware
 */
export const errorTrackingMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const responseTime = Date.now() - req.startTime;
  
  // Log error with full context
  req.log.error('Unhandled error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.url,
      headers: redactSensitiveData(req.headers, SENSITIVE_FIELDS.headers),
      query: redactSensitiveData(req.query, SENSITIVE_FIELDS.query),
      body: deepRedactSensitiveData(req.body, SENSITIVE_FIELDS.body)
    },
    response: {
      time: responseTime,
      statusCode: res.statusCode
    },
    user: {
      id: (req as any).user?.id,
      role: (req as any).user?.role
    }
  });
  
  // Increment error metrics
  req.metrics.increment('http_errors_total', {
    method: req.method,
    endpoint: req.url,
    errorType: err.name || 'Unknown'
  });
  
  next(err);
};

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests
    if (duration > 1000) { // 1 second threshold
      req.log.warn('Slow request detected', {
        duration,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode
      });
    }
    
    // Record performance metrics
    req.metrics.histogram('http_request_duration_ms', duration, {
      method: req.method,
      endpoint: req.url
    });
  });
  
  next();
};

/**
 * Security monitoring middleware
 */
export const securityMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Monitor for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\s*\(/i, // Code injection
    /document\.cookie/i // Cookie theft attempts
  ];
  
  const requestString = JSON.stringify({
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  
  suspiciousPatterns.forEach((pattern, index) => {
    if (pattern.test(requestString)) {
      req.log.warn('Suspicious request pattern detected', {
        pattern: pattern.toString(),
        patternIndex: index,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      // Increment security alert metrics
      req.metrics.increment('security_alerts_total', {
        type: 'suspicious_pattern',
        pattern: pattern.toString()
      });
    }
  });
  
  // Monitor authentication failures
  if (res.statusCode === 401 || res.statusCode === 403) {
    req.log.warn('Authentication/Authorization failure', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode
    });
    
    // Increment auth failure metrics
    req.metrics.increment('auth_failures_total', {
      method: req.method,
      endpoint: req.url,
      statusCode: res.statusCode.toString()
    });
  }
  
  next();
};

/**
 * Export all middleware for easy import
 */
export const observability = {
  middleware: observabilityMiddleware,
  errorTracking: errorTrackingMiddleware,
  performance: performanceMiddleware,
  security: securityMonitoringMiddleware
};

export default observability;
