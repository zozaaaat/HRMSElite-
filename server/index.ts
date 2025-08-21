/**
 * @fileoverview Main server entry point for HRMS Elite application
 * @description Express.js server with security middleware, rate limiting, CSRF protection,
 * and comprehensive API endpoints for human resource management
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';

// Import observability middleware
import { observability } from './middleware/observability';
import { prometheusMiddleware, metricsHandler, healthCheckHandler, initializeMetrics, metricsAuth } from './middleware/metrics';
import { initializeLogShipper } from './utils/log-shipper';

import {
  securityHeaders,
  additionalSecurityHeaders,
  requestValidation,
  securityMonitoring,
  enhancedRateLimiters,
  corsConfig
} from './middleware/security';
import { csrfProtection, generateCsrfToken, csrfTokenHandler, csrfErrorHandler } from './middleware/csrf';
import { isAuthenticated, optionalAuth } from './middleware/auth';
import { log } from './utils/logger';
import { storage } from './models/storage';
import { env } from './utils/env';

// Import routes
import authRoutes from './routes/auth-routes';
import { registerEmployeeRoutes } from './routes/employee-routes';
import { registerDocumentRoutes } from './routes/document-routes';
import aiRoutes from './routes/ai';
import qualityRoutes from './routes/quality-routes';

// Import versioned routes
import v1AuthRoutes from './routes/v1/auth-routes';
import { registerEmployeeRoutes as registerV1EmployeeRoutes } from './routes/v1/employee-routes';
import { registerDocumentRoutes as registerV1DocumentRoutes } from './routes/v1/document-routes';

export const app = express();
const PORT = env.PORT;

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
app.use(cors(corsConfig));

// Cookie parsing middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  store: storage as any, // Type assertion for compatibility
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: env.NODE_ENV === 'production' ? '__Host-hrms-elite-session' : 'hrms-elite-session',
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// CSRF protection
app.use(csrfProtection);
app.use(generateCsrfToken);
app.get('/api/csrf-token', csrfTokenHandler);

// Rate limiting
app.use(enhancedRateLimiters.general);

// Request validation middleware
app.use(requestValidation);

// Health check endpoint
app.get('/health', healthCheckHandler);

// Metrics endpoint for Prometheus
app.get('/metrics', metricsAuth, metricsHandler);

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
registerDocumentRoutes(app);
app.use('/api/ai', isAuthenticated, aiRoutes);
app.use('/api/quality', isAuthenticated, qualityRoutes);

// Versioned API routes
app.use('/api/v1/auth', isAuthenticated, v1AuthRoutes);
registerV1EmployeeRoutes(app);
registerV1DocumentRoutes(app);

// Optional auth routes (for public endpoints)
app.use('/api/public', optionalAuth);

// CSRF error handler
app.use(csrfErrorHandler);

// Error handling middleware with observability
app.use(observability.errorTracking);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
      error: 'تم تجاوز حد الطلبات',
      message: 'يرجى المحاولة مرة أخرى بعد فترة',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'بيانات غير صحيحة',
      message: err.message,
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }

  // Default error response
  const isDevelopment = env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    error: 'حدث خطأ في الخادم',
    message: isDevelopment ? err.message : 'خطأ داخلي في الخادم',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.id,
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'المسار غير موجود',
    message: 'الرابط المطلوب غير متاح',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
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
