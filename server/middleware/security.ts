/**
 * @fileoverview Security middleware for HRMS Elite application
 * @description Comprehensive security middleware including rate limiting, input validation,
 * security headers, and error handling for the HRMS application
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import crypto from 'crypto';
import { log } from '../utils/logger';

// Security configuration
const SECURITY_CONFIG = {
  // CSRF Configuration
  csrf: {
    enabled: process.env.CSRF_ENABLED !== 'false',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Rate Limiting Configuration
  rateLimit: {
    // General API rate limiting
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
      userMax: parseInt(process.env.RATE_LIMIT_USER_MAX_REQUESTS || '200'), // limit each user to 200 requests per windowMs
      message: {
        error: 'تم تجاوز حد الطلبات',
        message: 'يرجى المحاولة مرة أخرى بعد فترة',
        retryAfter: '15 دقيقة'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },

    // Login rate limiting (stricter)
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 login attempts per windowMs
      userMax: 10, // limit each user to 10 login attempts per windowMs
      message: {
        error: 'تم تجاوز حد محاولات تسجيل الدخول',
        message: 'يرجى المحاولة مرة أخرى بعد 15 دقيقة',
        retryAfter: '15 دقيقة'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      skipFailedRequests: false
    },

    // Document upload rate limiting
    document: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 10, // limit each IP to 10 document uploads per windowMs
      userMax: 20, // limit each user to 20 document uploads per windowMs
      message: {
        error: 'تم تجاوز حد رفع الملفات',
        message: 'يرجى المحاولة مرة أخرى بعد 5 دقائق',
        retryAfter: '5 دقائق'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },

    // Search rate limiting
    search: {
      windowMs: 60 * 1000, // 1 minute
      max: 30, // limit each IP to 30 search requests per windowMs
      userMax: 60, // limit each user to 60 search requests per windowMs
      message: {
        error: 'تم تجاوز حد عمليات البحث',
        message: 'يرجى المحاولة مرة أخرى بعد دقيقة',
        retryAfter: '1 دقيقة'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    }
  },

  // Security Headers Configuration
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"], // Will be dynamically updated with nonce
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  }
};

/**
 * Enhanced CSRF Protection Middleware
 */
export const enhancedCsrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (!SECURITY_CONFIG.csrf.enabled) {
    return next();
  }

  try {
    // Skip CSRF for GET requests, health checks, and static files
    if (req.method === 'GET' ||
        req.path === '/health' ||
        req.path.startsWith('/static/') ||
        req.path.startsWith('/assets/') ||
        req.path.includes('.') ||
        req.path === '/api/csrf-token') {
      return next();
    }

    // Enhanced CSRF token validation
    const token = req.body._csrf || req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
    
    if (!token) {
      log.warn('CSRF token missing', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }, 'SECURITY');

      return res.status(403).json({
        error: 'رمز الأمان مفقود',
        message: 'يرجى إعادة تحميل الصفحة',
        code: 'CSRF_TOKEN_MISSING',
        timestamp: new Date().toISOString()
      });
    }

    // Additional validation for sensitive operations
    if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
      // Double-check token for sensitive routes
      if (typeof token !== 'string' || token.length < 32) {
        log.warn('Invalid CSRF token format', {
          url: req.url,
          method: req.method,
          ip: req.ip,
          tokenLength: typeof token === 'string' ? token.length : 0,
          timestamp: new Date().toISOString()
        }, 'SECURITY');

        return res.status(403).json({
          error: 'رمز الأمان غير صالح',
          message: 'يرجى إعادة تحميل الصفحة',
          code: 'CSRF_TOKEN_INVALID',
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  } catch (error) {
    log.error('CSRF protection error:', error as Error, 'SECURITY');
    return res.status(500).json({
      error: 'خطأ في حماية الأمان',
      message: 'يرجى المحاولة مرة أخرى',
      code: 'CSRF_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Enhanced Rate Limiting Middleware Factory with Per-IP and Per-User Limits
 */
export const createEnhancedRateLimiter = (type: keyof typeof SECURITY_CONFIG.rateLimit) => {
  const config = SECURITY_CONFIG.rateLimit[type];
  
  // Create IP-based rate limiter
  const ipLimiter = rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    keyGenerator: (req: Request) => {
      return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
    },
    handler: (req: Request, res: Response) => {
      log.warn(`IP rate limit exceeded for ${type}`, {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      }, 'SECURITY');

      res.status(429).json({
        error: config.message.error,
        message: config.message.message,
        retryAfter: config.message.retryAfter,
        code: `RATE_LIMIT_IP_${type.toUpperCase()}`,
        limitType: 'IP',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Create user-based rate limiter (only for authenticated users)
  const userLimiter = rateLimit({
    windowMs: config.windowMs,
    max: config.userMax,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    keyGenerator: (req: Request) => {
      return req.user?.id ? `user:${req.user.id}` : 'anonymous';
    },
    skip: (req: Request) => {
      // Skip user-based rate limiting for unauthenticated requests
      return !req.user?.id;
    },
    handler: (req: Request, res: Response) => {
      log.warn(`User rate limit exceeded for ${type}`, {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      }, 'SECURITY');

      res.status(429).json({
        error: config.message.error,
        message: config.message.message,
        retryAfter: config.message.retryAfter,
        code: `RATE_LIMIT_USER_${type.toUpperCase()}`,
        limitType: 'USER',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Return middleware that applies both limiters
  return (req: Request, res: Response, next: NextFunction) => {
    // Apply IP-based rate limiting first
    ipLimiter(req, res, (err) => {
      if (err) return next(err);
      
      // Then apply user-based rate limiting
      userLimiter(req, res, next);
    });
  };
};

/**
 * Legacy Rate Limiting Middleware Factory (for backward compatibility)
 */
export const createRateLimiter = (type: keyof typeof SECURITY_CONFIG.rateLimit) => {
  const config = SECURITY_CONFIG.rateLimit[type];
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    handler: (req: Request, res: Response) => {
      log.warn(`Rate limit exceeded for ${type}`, {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      }, 'SECURITY');

      res.status(429).json({
        error: config.message.error,
        message: config.message.message,
        retryAfter: config.message.retryAfter,
        code: `RATE_LIMIT_${type.toUpperCase()}`,
        timestamp: new Date().toISOString()
      });
    },
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
    }
  });
};

/**
 * Generate CSP nonce for scripts
 */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Security Headers Middleware with Dynamic CSP
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique nonce for this request
  const nonce = generateNonce();
  
  // Store nonce in request and response locals for use in templates
  (req as any).cspNonce = nonce;
  res.locals.cspNonce = nonce;
  
  // Dynamic CSP configuration with nonce - strict policy without unsafe directives
  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      `'nonce-${nonce}'`
    ],
    styleSrc: [
      "'self'"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:"
    ],
    connectSrc: [
      "'self'"
    ],
    frameSrc: [
      "'none'"
    ],
    objectSrc: [
      "'none'"
    ],
    baseUri: [
      "'self'"
    ]
  };

  // Apply helmet with dynamic CSP
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    },
    hsts: SECURITY_CONFIG.headers.hsts,
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false, // Disable for development
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' }
  })(req, res, next);
};

/**
 * Additional Security Headers
 */
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Permissions-Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Clear-Site-Data (for logout)
  if (req.path === '/api/auth/logout') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  next();
};

/**
 * Request Validation Middleware
 */
export const requestValidation = (req: Request, res: Response, next: NextFunction) => {
  // Validate Content-Type for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.path.startsWith('/api/')) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'نوع المحتوى غير صالح',
        message: 'يجب أن يكون المحتوى من نوع JSON',
        code: 'INVALID_CONTENT_TYPE',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Validate request size
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'حجم الطلب كبير جداً',
      message: 'الحد الأقصى لحجم الطلب هو 10 ميجابايت',
      code: 'REQUEST_TOO_LARGE',
      timestamp: new Date().toISOString()
    });
  }

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any): void {
     for (const key in obj) {
     if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        // Basic XSS prevention
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

/**
 * IP Whitelist Middleware
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (!allowedIPs.includes(clientIP) && !allowedIPs.includes('*')) {
      log.warn('Access denied from IP', {
        ip: clientIP,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      }, 'SECURITY');

      return res.status(403).json({
        error: 'غير مصرح بالوصول',
        message: 'عنوان IP غير مسموح به',
        code: 'IP_NOT_ALLOWED',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Security Monitoring Middleware
 */
export const securityMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Monitor response
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log suspicious activities
    if (responseTime > 5000) { // 5 seconds
      log.warn('Slow response detected', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        responseTime,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }, 'SECURITY');
    }

    if (res.statusCode >= 400) {
      log.warn('Error response', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }, 'SECURITY');
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Parse and validate CORS origins from environment
 */
function parseCorsOrigins(): string[] {
  // Use CORS_ORIGINS first, fallback to ALLOWED_ORIGINS for legacy support
  const corsOrigins = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS;

  if (!corsOrigins) {
    log.warn('CORS_ORIGINS not set, using default localhost origin', {}, 'SECURITY');
    return ['http://localhost:3000'];
  }

  const origins = corsOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

  if (origins.length === 0) {
    log.warn('No valid CORS origins found, using default localhost origin', {}, 'SECURITY');
    return ['http://localhost:3000'];
  }

  // Validate origins format
  const validOrigins = origins.filter(origin => {
    try {
      const url = new URL(origin);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      log.warn('Invalid CORS origin format', { origin }, 'SECURITY');
      return false;
    }
  });

  if (validOrigins.length === 0) {
    log.warn('No valid CORS origins after validation, using default localhost origin', {}, 'SECURITY');
    return ['http://localhost:3000'];
  }

  log.info('CORS origins configured', { origins: validOrigins }, 'SECURITY');
  return validOrigins;
}

// Parse origins once at startup
const allowedCorsOrigins = parseCorsOrigins();

/**
 * CORS configuration with strict origin validation and detailed logging
 */
export const corsConfig = (req: Request, callback: (err: Error | null, options?: any) => void) => {
  const origin = req.header('Origin');

  // Allow requests with no origin (mobile apps, Postman)
  if (!origin || allowedCorsOrigins.includes(origin)) {
    return callback(null, {
      origin: origin || true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
      exposedHeaders: ['X-CSRF-Token', 'X-Request-ID', 'X-Response-Time']
    });
  }

  // Log unauthorized origin attempts with request ID
  log.warn(
    'CORS origin rejected',
    {
      origin,
      allowedOrigins: allowedCorsOrigins,
      requestId: req.id,
      timestamp: new Date().toISOString()
    },
    'SECURITY'
  );

  const error: Error & { status?: number } = new Error('CORS origin not allowed');
  error.status = 403;
  return callback(error);
};

/**
 * Export rate limiters
 */
export const rateLimiters = {
  general: createRateLimiter('general'),
  login: createRateLimiter('login'),
  document: createRateLimiter('document'),
  search: createRateLimiter('search')
};

/**
 * Export enhanced rate limiters with per-IP and per-user limits
 */
export const enhancedRateLimiters = {
  general: createEnhancedRateLimiter('general'),
  login: createEnhancedRateLimiter('login'),
  document: createEnhancedRateLimiter('document'),
  search: createEnhancedRateLimiter('search')
};

/**
 * CSP Nonce Utility Functions
 */
export const cspUtils = {
  /**
   * Get CSP nonce from request
   */
  getNonce: (req: Request): string => {
    return (req as any).cspNonce || '';
  },

  /**
   * Generate script tag with nonce
   */
  scriptTag: (req: Request, content: string): string => {
    const nonce = cspUtils.getNonce(req);
    return `<script nonce="${nonce}">${content}</script>`;
  },

  /**
   * Generate style tag with nonce
   */
  styleTag: (req: Request, content: string): string => {
    const nonce = cspUtils.getNonce(req);
    return `<style nonce="${nonce}">${content}</style>`;
  },

  /**
   * Validate nonce format
   */
  validateNonce: (nonce: string): boolean => {
    return /^[A-Za-z0-9+/]{22}==$/.test(nonce);
  }
};

/**
 * Export security configuration
 */
export const securityConfig = SECURITY_CONFIG;
