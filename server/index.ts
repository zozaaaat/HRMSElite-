/**
 * @fileoverview Main server entry point for HRMS Elite application
 * @description Express.js server with security middleware, rate limiting, CSRF protection,
 * and comprehensive API endpoints for human resource management
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import { createSessionMiddleware } from './utils/session';

// Import observability middleware
import { observability } from './middleware/observability';
import { prometheusMiddleware, metricsHandler, healthCheckHandler, initializeMetrics, metricsAuth, metricsUtils } from './middleware/metrics';
import { initializeLogShipper } from './utils/log-shipper';

import {
  securityHeaders,
  additionalSecurityHeaders,
  requestValidation,
  securityMonitoring,
  enhancedRateLimiters,
  createRateLimiter
} from './middleware/security';
import { strictCors } from './middleware/cors';
import { csrfProtection, csrfTokenMiddleware, csrfTokenHandler, csrfErrorHandler } from './middleware/csrf';
import { isAuthenticated, optionalAuth } from './middleware/auth';
import { log } from './utils/logger';
import { env } from './utils/env';
import { getLocale, t } from './utils/errorMessages';

// Import routes
import authRoutes from './routes/auth-routes';
import { registerEmployeeRoutes } from './routes/employee-routes';
import aiRoutes from './routes/ai';
import qualityRoutes from './routes/quality-routes';
import { cacheControlGuard } from './middleware/cacheControl';

// Import versioned routes
import v1AuthRoutes from './routes/v1/auth-routes';
import { registerEmployeeRoutes as registerV1EmployeeRoutes } from './routes/v1/employee-routes';
import { registerDocumentRoutes } from './routes/v1/document-routes';

export const app = express();
const PORT = env.PORT;
const vitalsRateLimiter = createRateLimiter('general');

if (
  env.NODE_ENV === 'production' &&
  (!process.env.DB_ENCRYPTION_KEY || process.env.DB_ENCRYPTION_KEY.length < 32)
) {
  throw new Error('DB_ENCRYPTION_KEY is required and must be at least 32 characters');
}

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Initialize observability systems
async function initializeObservability() {
  try {
    // Initialize Prometheus metrics
    initializeMetrics();
    
    // Initialize log shipper
    await initializeLogShipper();
    
    log.info('Observability systems initialized successfully', {}, 'SERVER');
  } catch (error) {
    log.error('Failed to initialize observability systems', { error }, 'SERVER');
  }
}

// Apply observability middleware first (before other middleware)
app.use(observability.middleware);
app.use(observability.performance);
app.use(observability.security);
app.use(prometheusMiddleware);

// Security middleware (order matters!)
app.use(securityHeaders);
app.use(additionalSecurityHeaders);
app.use(securityMonitoring);

// CORS configuration
app.use(strictCors);

// Cookie parsing middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with Redis store
app.use(createSessionMiddleware());

// CSRF protection
app.use(csrfProtection);
app.use(csrfTokenMiddleware);
app.get('/api/csrf-token', csrfTokenHandler);

// Rate limiting
app.use(enhancedRateLimiters.general);

// Request validation middleware
app.use(requestValidation);
// Prevent caching of sensitive responses
app.use(cacheControlGuard);

// Health check endpoint
app.get('/health', healthCheckHandler);

// Metrics endpoint for Prometheus
app.get('/metrics', metricsAuth, metricsHandler);
app.post('/metrics/vitals', metricsAuth, vitalsRateLimiter, (req, res) => {
  const { name, value } = req.body;
  if (typeof name !== 'string' || typeof value !== 'number') {
    return res.status(400).json({ error: 'Invalid metric' });
  }
  metricsUtils.recordWebVital(name, value);
  res.status(204).end();
});

// API documentation
app.get('/api-docs', (req, res) => {
  res.json({
    name: 'HRMS Elite API',
    version: '1.0.0',
    description: 'Human Resource Management System Elite API',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      documents: '/api/documents',
      ai: '/api/ai',
      quality: '/api/quality',
      v1: {
        auth: '/api/v1/auth',
        employees: '/api/v1/employees',
        documents: '/api/v1/documents'
      }
    },
    health: '/health',
    metrics: '/metrics'
  });
});

// API routes with authentication
app.use('/api/auth', isAuthenticated, authRoutes);
registerEmployeeRoutes(app);
app.use('/api/ai', isAuthenticated, aiRoutes);
app.use('/api/quality', isAuthenticated, qualityRoutes);

// Versioned API routes
app.use('/api/v1/auth', isAuthenticated, v1AuthRoutes);
registerV1EmployeeRoutes(app);
registerDocumentRoutes(app);

// Optional auth routes (for public endpoints)
app.use('/api/public', optionalAuth);

// CSRF error handler
app.use(csrfErrorHandler);

// Error handling middleware with observability
app.use(observability.errorTracking);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Determine locale from request
  const locale = getLocale(req.headers['accept-language']);

  // Log error with request context
  req.log?.error('Unhandled error:', {
    error: err,
    requestId: req.id,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    userRole: req.user?.role
  });

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      code: 'RATE_LIMIT_EXCEEDED',
      message: t(locale, 'RATE_LIMIT_EXCEEDED'),
      locale,
      requestId: req.id,
      details: t(locale, 'RATE_LIMIT_TRY_LATER')
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: t(locale, 'VALIDATION_ERROR'),
      locale,
      requestId: req.id,
      details: err.message
    });
  }

  // Default error response
  const isDevelopment = env.NODE_ENV === 'development';
  const code = err.code || 'INTERNAL_ERROR';
  res.status(err.status || 500).json({
    code,
    message: t(locale, code),
    locale,
    requestId: req.id,
    ...(isDevelopment && { details: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  const locale = getLocale(req.headers['accept-language']);
  res.status(404).json({
    code: 'NOT_FOUND',
    message: t(locale, 'NOT_FOUND'),
    locale,
    requestId: req.id
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, shutting down gracefully', {}, 'SERVER');
  
  // Close log shipper
  const { closeLogShipper } = await import('./utils/log-shipper');
  await closeLogShipper();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  log.info('SIGINT received, shutting down gracefully', {}, 'SERVER');
  
  // Close log shipper
  const { closeLogShipper } = await import('./utils/log-shipper');
  await closeLogShipper();
  
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Initialize observability systems
    await initializeObservability();
    
    // Start the server
    app.listen(PORT, () => {
      log.info(`🚀 HRMS Elite server started on port ${PORT}`, {
        port: PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }, 'SERVER');
    });
    
  } catch (error) {
    log.error('Failed to start server', { error }, 'SERVER');
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
