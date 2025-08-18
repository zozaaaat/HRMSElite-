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
import { 
  securityHeaders, 
  additionalSecurityHeaders,
  enhancedCsrfProtection,
  requestValidation,
  securityMonitoring,
  rateLimiters,
  corsConfig
} from './middleware/security';
import { isAuthenticated, optionalAuth } from './middleware/auth';
import { log } from './utils/logger';
import { storage } from './models/storage';

// Import routes
import authRoutes from './routes/auth-routes';
import employeeRoutes from './routes/employee-routes';
import documentRoutes from './routes/document-routes';
import aiRoutes from './routes/ai';
import qualityRoutes from './routes/quality-routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'hrms-elite-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'hrms-elite-session'
}));

// CSRF protection
app.use(csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Enhanced CSRF protection
app.use(enhancedCsrfProtection);

// Rate limiting
app.use('/api/', rateLimiters.general);
app.use('/api/auth/login', rateLimiters.login);
app.use('/api/documents', rateLimiters.document);
app.use('/api/search', rateLimiters.search);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    security: {
      helmet: true,
      rateLimit: true,
      csrf: true,
      cors: true,
      session: true
    }
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
    message: 'CSRF token generated successfully',
    timestamp: new Date().toISOString()
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  log.error('Unhandled error:', err, 'SERVER');

  // CSRF errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'خطأ في التحقق من الأمان',
      message: 'يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى',
      code: 'CSRF_TOKEN_INVALID',
      timestamp: new Date().toISOString()
    });
  }

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'تم تجاوز حد الطلبات',
      message: 'يرجى المحاولة مرة أخرى بعد فترة',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'بيانات غير صحيحة',
      message: err.message,
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    error: 'حدث خطأ في الخادم',
    message: isDevelopment ? err.message : 'خطأ داخلي في الخادم',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'الصفحة غير موجودة',
    message: 'المسار المطلوب غير موجود',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
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
