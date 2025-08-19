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
import csurf from 'csurf';
// Pino imports (will be available after npm install)
// import pino from 'pino';
// import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

// Extend Express Request interface to include request ID and logger
declare global {
  namespace Express {
    interface Request {
      id?: string;
      log?: {
        info: (message: string, data?: any) => void;
        warn: (message: string, data?: any) => void;
        error: (message: string, data?: any) => void;
      };
      _startTime?: number;
    }
  }
}
import { 
  securityHeaders, 
  additionalSecurityHeaders,
  enhancedCsrfProtection,
  requestValidation,
  securityMonitoring,
  enhancedRateLimiters,
  corsConfig
} from './middleware/security';
import { isAuthenticated, optionalAuth } from './middleware/auth';
import { log } from './utils/logger';
import { storage } from './models/storage';
import { env } from './utils/env';

// Import routes
import authRoutes from './routes/auth-routes';
import employeeRoutes from './routes/employee-routes';
import documentRoutes from './routes/document-routes';
import aiRoutes from './routes/ai';
import qualityRoutes from './routes/quality-routes';

const app = express();
const PORT = env.PORT;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Enhanced logging middleware with request ID and sensitive data redaction
const enhancedLoggingMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Generate request ID
  const requestId = req.headers['x-request-id'] as string || randomUUID();
  (req as any).id = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Create request logger with context
  const requestLogger = {
    info: (message: string, data?: any) => {
      log.info(message, {
        ...data,
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        userRole: (req as any).user?.role
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
        userRole: (req as any).user?.role
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
        userRole: (req as any).user?.role
      }, 'REQUEST');
    }
  };
  
  // Attach logger to request
  (req as any).log = requestLogger;
  
  // Log request start
  requestLogger.info(`${req.method} ${req.url} - Request started`);
  
  // Override res.send to log response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - (req as any)._startTime || 0;
    
    // Log response
    if (res.statusCode >= 400) {
      requestLogger.warn(`${req.method} ${req.url} - ${res.statusCode}`, {
        responseTime,
        statusCode: res.statusCode
      });
    } else {
      requestLogger.info(`${req.method} ${req.url} - ${res.statusCode}`, {
        responseTime,
        statusCode: res.statusCode
      });
    }
    
    return originalSend.call(this, data);
  };
  
  // Set start time
  (req as any)._startTime = Date.now();
  
  next();
};

// Apply enhanced logging middleware first (before other middleware)
app.use(enhancedLoggingMiddleware);

// Security middleware (order matters!)
app.use(securityHeaders);
app.use(additionalSecurityHeaders);
app.use(securityMonitoring);

// CORS configuration
app.use(cors(corsConfig));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request validation
app.use(requestValidation);

// Session configuration with secure cookie settings
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // Always secure for __Host- prefix
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: undefined // Let browser set domain for __Host- prefix
  },
  name: '__Host-hrms-elite-session'
}));

// CSRF protection with secure cookie settings
app.use(csurf({
  cookie: {
    httpOnly: true,
    secure: true, // Always secure for __Host- prefix
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: undefined // Let browser set domain for __Host- prefix
  }
}));

// Enhanced CSRF protection
app.use(enhancedCsrfProtection);

// Enhanced rate limiting with per-IP and per-user limits
app.use('/api/', enhancedRateLimiters.general);
app.use('/api/auth/login', enhancedRateLimiters.login);
app.use('/api/documents', enhancedRateLimiters.document);
app.use('/api/search', enhancedRateLimiters.search);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
    security: {
      helmet: true,
      rateLimit: true,
      csrf: true,
      cors: true,
      session: true
    },
    requestId: req.id
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
    message: 'CSRF token generated successfully',
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// API routes with authentication
app.use('/api/auth', authRoutes);
app.use('/api/employees', isAuthenticated, employeeRoutes);
app.use('/api/documents', isAuthenticated, documentRoutes);
app.use('/api/ai', isAuthenticated, aiRoutes);
app.use('/api/quality', isAuthenticated, qualityRoutes);

// Optional auth routes (for public endpoints)
app.use('/api/public', optionalAuth);

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

  // CSRF errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'خطأ في التحقق من الأمان',
      message: 'يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى',
      code: 'CSRF_TOKEN_INVALID',
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }

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
    error: 'الصفحة غير موجودة',
    message: 'المسار المطلوب غير موجود',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully', {}, 'SERVER');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully', {}, 'SERVER');
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', reason as Error, 'SERVER');
  log.error('Promise:', promise, 'SERVER');
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error, 'SERVER');
  process.exit(1);
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize storage
    await storage.initialize();
    log.info('Database initialized successfully', {}, 'SERVER');

    // Start server
    app.listen(PORT, () => {
      log.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }, 'SERVER');
    });
  } catch (error) {
    log.error('Failed to start server:', error as Error, 'SERVER');
    process.exit(1);
  }
}

startServer();

export default app;
