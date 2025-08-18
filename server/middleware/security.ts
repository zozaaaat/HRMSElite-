/**
 * @fileoverview Security middleware for HRMS Elite application
 * @description Comprehensive security middleware including rate limiting, input validation,
 * security headers, and error handling for the HRMS application
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { log } from "../utils/logger";
import { LogData } from "@shared/types/common";

// IP blocking configuration
const BLOCKED_IPS = new Set<string>();
const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /union\s+select/gi,
  /drop\s+table/gi,
  /insert\s+into/gi,
  /delete\s+from/gi,
  /update\s+set/gi,
  /exec\s*\(/gi,
  /eval\s*\(/gi,
  /document\.cookie/gi,
  /window\.location/gi,
  /document\.write/gi,
  /innerHTML/gi,
  /outerHTML/gi,
];

interface UploadedFile {
  name: string;
  size: number;
  mimetype: string;
  data: Buffer;
}

interface RequestWithFiles extends Request {
  files?: UploadedFile[] | Record<string, UploadedFile>;
}

/**
 * IP blocking middleware
 * @description Blocks requests from suspicious IP addresses
 */
export const ipBlockingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientIP = req.ip ?? req.connection.remoteAddress ?? "unknown";

  // Check if IP is blocked
  if (BLOCKED_IPS.has(clientIP)) {
    log.warn("Blocked IP attempt", { ip: clientIP, url: req.url }, "SECURITY");
    return res.status(403).json({
      error: "تم حظر عنوان IP هذا",
      message: "يرجى التواصل مع الإدارة",
    });
  }

  // Check for suspicious patterns in request
  const requestData = JSON.stringify({
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const hasSuspiciousPattern = SUSPICIOUS_PATTERNS.some((pattern) =>
    pattern.test(requestData),
  );

  if (hasSuspiciousPattern) {
    log.warn(
      "Suspicious request pattern detected",
      {
        ip: clientIP,
        url: req.url,
        pattern: requestData.substring(0, 200),
      },
      "SECURITY",
    );

    // Temporarily block IP for suspicious activity
    BLOCKED_IPS.add(clientIP);

    return res.status(403).json({
      error: "تم اكتشاف نشاط مشبوه",
      message: "تم حظر عنوان IP هذا مؤقتاً",
    });
  }

  next();
};

/**
 * Security headers middleware - complementary to helmet
 * @description Adds additional security headers that complement helmet configuration
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * app.use(securityHeaders);
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Additional security headers that complement helmet
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()",
  );

  // Additional headers for better security
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // Cache control for sensitive pages
  if (req.path.startsWith("/api/") || req.path.includes("auth")) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
};

/**
 * Creates a rate limiter with enhanced configuration
 * @description Creates a rate limiting middleware with customizable settings
 * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} max - Maximum number of requests per window (default: 100)
 * @returns {Function} Rate limiting middleware function
 * @example
 * const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
 * app.use('/api/', apiRateLimit);
 */
export const createRateLimit = (
  windowMs: number = 15 * 60 * 1000,
  max = 100,
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "تم تجاوز الحد المسموح من الطلبات",
      retryAfter: windowMs / 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for development or disable trust proxy validation
    skip: process.env.NODE_ENV === "development" ? () => false : undefined,
    validate: {
      trustProxy: false, // Disable trust proxy validation
    },
    handler: (req, res) => {
      const clientIP = req.ip ?? req.connection.remoteAddress ?? "unknown";
      log.warn(
        "Rate limit exceeded",
        {
          ip: clientIP,
          url: req.url,
          method: req.method,
          userAgent: req.get("User-Agent"),
        },
        "SECURITY",
      );

      res.status(429).json({
        error: "تم تجاوز الحد المسموح من الطلبات",
        message: "يرجى المحاولة مرة أخرى لاحقاً",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
    // Add key generator for better rate limiting
    keyGenerator: (req) => {
      return req.ip ?? req.connection.remoteAddress ?? "unknown";
    },
    // Add skip function for certain conditions
    skip: (req) => {
      // Skip rate limiting for health checks
      if (req.path === "/health") {
        return true;
      }
      // Skip in development mode
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      return false;
    },
  });
};

/**
 * API rate limiting - more restrictive for API endpoints
 * @description Rate limiter for general API endpoints (100 requests per 15 minutes)
 * @type {Function}
 */
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

/**
 * Login rate limiting - very restrictive for authentication
 * @description Rate limiter for login attempts (5 attempts per 15 minutes)
 * @type {Function}
 */
export const loginRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes

/**
 * File upload rate limiting
 * @description Rate limiter for file uploads (10 uploads per 15 minutes)
 * @type {Function}
 */
export const uploadRateLimit = createRateLimit(15 * 60 * 1000, 10); // 10 uploads per 15 minutes

/**
 * Document operations rate limiting
 * @description Rate limiter for document operations (20 operations per 15 minutes)
 * @type {Function}
 */
export const documentRateLimit = createRateLimit(15 * 60 * 1000, 20); // 20 document operations per 15 minutes

/**
 * Search operations rate limiting
 * @description Rate limiter for search operations (30 searches per 15 minutes)
 * @type {Function}
 */
export const searchRateLimit = createRateLimit(15 * 60 * 1000, 30); // 30 search operations per 15 minutes

/**
 * General API rate limiting for all routes
 * @description Rate limiter for all API routes (100 requests per 15 minutes)
 * @type {Function}
 */
export const generalApiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

/**
 * Enhanced input validation middleware
 * @description Sanitizes and validates all incoming request data to prevent XSS and injection attacks
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * app.use(validateInput);
 */
export const validateInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  /**
   * Recursively sanitizes objects to remove potentially dangerous content
   * @param {unknown} obj - Object to sanitize
   * @returns {unknown} Sanitized object
   */
  const sanitizeObject = (obj: unknown): unknown => {
    if (typeof obj === "string") {
      let sanitized = obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/data:text\/html/gi, "")
        .replace(/vbscript:/gi, "")
        .replace(/expression\s*\(/gi, "")
        .replace(/union\s+select/gi, "")
        .replace(/drop\s+table/gi, "")
        .replace(/insert\s+into/gi, "")
        .replace(/delete\s+from/gi, "")
        .replace(/update\s+set/gi, "")
        .replace(/exec\s*\(/gi, "")
        .replace(/eval\s*\(/gi, "")
        .replace(/document\.cookie/gi, "")
        .replace(/window\.location/gi, "")
        .replace(/document\.write/gi, "")
        .replace(/innerHTML/gi, "")
        .replace(/outerHTML/gi, "");

      // Limit string length to prevent DoS
      if (sanitized.length > 10000) {
        sanitized = sanitized.substring(0, 10000);
      }

      return sanitized;
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body) as any;
  }
  if (req.query) {
    req.query = sanitizeObject(req.query) as any;
  }
  if (req.params) {
    req.params = sanitizeObject(req.params) as any;
  }

  next();
};

/**
 * Enhanced request logging middleware
 * @description Logs detailed information about API requests including timing and response data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * app.use(requestLogger);
 */
export const requestLogger = (
  _req: Request,
  _res: Response,
  _next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      timestamp: new Date().toISOString(),
      contentLength: res.get("Content-Length") || "unknown",
    };

    // Log to console in development, would log to file/service in production
    if (res.statusCode >= 400) {
      log.warn(
        `${logData.method} ${logData.url}`,
        {
          status: logData.status,
          duration: logData.duration,
          contentLength: logData.contentLength,
          timestamp: logData.timestamp,
        },
        "SECURITY",
      );
    } else {
      log.info(
        `${logData.method} ${logData.url}`,
        {
          status: logData.status,
          duration: logData.duration,
          contentLength: logData.contentLength,
          timestamp: logData.timestamp,
        },
        "SECURITY",
      );
    }
  });

  next();
};

/**
 * Enhanced error handling middleware
 * @description Handles various types of errors and provides appropriate responses
 * @param {unknown} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * app.use(errorHandler);
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  _res: Response,
  _next: NextFunction,
) => {
  log.error("Error:", err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  // Handle different types of errors
  if (err && typeof err === "object" && "code" in err) {
    const errorCode = (err as any).code;

    // Handle specific error types
    switch (errorCode) {
      case "EBADCSRFTOKEN":
        return res.status(403).json({
          error: "خطأ في التحقق من الأمان",
          message: "يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى",
        });
      case "LIMIT_FILE_SIZE":
        return res.status(413).json({
          error: "حجم الملف كبير جداً",
          message: "يرجى اختيار ملف أصغر",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          error: "نوع ملف غير متوقع",
          message: "يرجى اختيار نوع ملف صحيح",
        });
    }
  }

  res.status((err as any).status ?? 500).json({
    error: "حدث خطأ في الخادم",
    message: isDevelopment ? (err as any).message : "خطأ داخلي في الخادم",
    ...(isDevelopment && { stack: (err as any).stack }),
  });
};

/**
 * Enhanced health check endpoint
 * @description Returns comprehensive health status and system information
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Object} Health status object with system information
 * @example
 * GET /health
 * Response: {
 *   status: "OK",
 *   timestamp: "2025-01-28T10:30:00.000Z",
 *   uptime: 12345.67,
 *   memory: { rss: 123456, heapTotal: 98765, ... },
 *   version: "1.0.0",
 *   environment: "development",
 *   security: { helmet: true, rateLimit: true, ... }
 * }
 */
export const healthCheck = (_req: Request, res: Response) => {
  const healthData = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version ?? "1.0.0",
    environment: process.env.NODE_ENV ?? "development",
    security: {
      helmet: true,
      rateLimit: true,
      csrf: true,
      inputValidation: true,
      ipBlocking: true,
    },
  };

  res.json(healthData);
};

/**
 * Security middleware for file uploads
 * @description Validates file uploads for security and size constraints
 * @param {RequestWithFiles} req - Express request object with files
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * app.use('/upload', fileUploadSecurity);
 */
export const fileUploadSecurity = (
  req: RequestWithFiles,
  res: Response,
  next: NextFunction,
) => {
  // Check file types and sizes
  if (req.files) {
    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files);

    for (const file of files) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(413).json({
          error: "حجم الملف كبير جداً",
          message: "الحد الأقصى لحجم الملف هو 10 ميجابايت",
        });
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: "نوع ملف غير مسموح",
          message: "يرجى اختيار ملف من الأنواع المسموحة",
        });
      }

      // Check file name for suspicious patterns
      const suspiciousPatterns = [
        /\.(php|asp|aspx|jsp|jspx|cgi|pl|py|rb|sh|bat|cmd|exe|dll|so|dylib)$/i,
        /\.\.\//,
        /\/\//,
        /[<>:"|?*]/,
      ];

      if (suspiciousPatterns.some((pattern) => pattern.test(file.name))) {
        log.warn(
          "Suspicious file upload attempt",
          {
            fileName: file.name,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          } as LogData,
          "SECURITY",
        );

        return res.status(400).json({
          error: "اسم ملف غير مسموح",
          message: "يرجى اختيار اسم ملف صحيح",
        });
      }
    }
  }

  next();
};

/**
 * Default export of all security middleware functions
 * @description Exports all security middleware functions for easy importing
 * @type {Object}
 */
export default {
  ipBlockingMiddleware,
  securityHeaders,
  createRateLimit,
  apiRateLimit,
  loginRateLimit,
  uploadRateLimit,
  documentRateLimit,
  searchRateLimit,
  generalApiRateLimit,
  validateInput,
  requestLogger,
  errorHandler,
  healthCheck,
  fileUploadSecurity,
};
