/**
 * Security Configuration for HRMS Elite
 * This file contains all security-related configurations and settings
 */

export interface SecurityConfig {
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };

  // CSRF Configuration
  csrf: {
    cookie: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
    };
  };

  // Session Configuration
  session: {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      httpOnly: boolean;
      sameSite: 'strict' | 'lax' | 'none';
      maxAge: number;
    };
  };

  // Helmet Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: Record<string, string[]>;
    };
    crossOriginEmbedderPolicy: boolean;
    crossOriginResourcePolicy: {
      policy: string;
    };
  };

  // File Upload Security
  fileUpload: {
    maxSize: number; // in bytes
    allowedTypes: string[];
    maxFiles: number;
  };

  // Input Validation
  inputValidation: {
    maxStringLength: number;
    allowedHtmlTags: string[];
    blockedPatterns: RegExp[];
  };
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  'rateLimit': {
    'windowMs': 15 * 60 * 1000, // 15 minutes
    'max': 100, // 100 requests per window
    'skipSuccessfulRequests': false,
    'skipFailedRequests': false
  },

  'csrf': {
    'cookie': {
      'httpOnly': true,
      'secure': process.env.NODE_ENV === 'production',
      'sameSite': 'strict'
    }
  },

  'session': {
    'secret': process.env.SESSION_SECRET || 'development-secret-key',
    'resave': false,
    'saveUninitialized': false,
    'cookie': {
      'secure': process.env.NODE_ENV === 'production',
      'httpOnly': true,
      'sameSite': 'strict',
      'maxAge': 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  'helmet': {
    'contentSecurityPolicy': {
      'directives': {
        'defaultSrc': ['\'self\''],
        'scriptSrc': ['\'self\''], // Will be dynamically updated with nonce
        'styleSrc': ['\'self\''],
        'imgSrc': ['\'self\'', 'data:', 'https:'],
        'connectSrc': ['\'self\''],
        'frameSrc': ['\'none\''],
        'objectSrc': ['\'none\''],
        'baseUri': ['\'self\''],
        ...(process.env.NODE_ENV === 'production' && {'upgradeInsecureRequests': []})
      }
    },
    'crossOriginEmbedderPolicy': false, // Disable for development compatibility
    'crossOriginResourcePolicy': {
      'policy': 'cross-origin'
    }
  },

  'fileUpload': {
    'maxSize': 10 * 1024 * 1024, // 10MB
    'allowedTypes': [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    'maxFiles': 5
  },

  'inputValidation': {
    'maxStringLength': 10000, // 10KB
    'allowedHtmlTags': [], // No HTML allowed by default
    'blockedPatterns': [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ]
  }
};

// Production security configuration (stricter)
export const productionSecurityConfig: SecurityConfig = {
  ...defaultSecurityConfig,
  'rateLimit': {
    ...defaultSecurityConfig.rateLimit,
    'max': 50 // More restrictive in production
  },
  'helmet': {
    ...defaultSecurityConfig.helmet,
    'crossOriginEmbedderPolicy': true, // Enable in production
    'contentSecurityPolicy': {
      'directives': {
        ...defaultSecurityConfig.helmet.contentSecurityPolicy.directives,
        'upgradeInsecureRequests': [] // Force HTTPS in production
      }
    }
  },
  'fileUpload': {
    ...defaultSecurityConfig.fileUpload,
    'maxSize': 5 * 1024 * 1024 // 5MB in production
  }
};

// Development security configuration (more permissive)
export const developmentSecurityConfig: SecurityConfig = {
  ...defaultSecurityConfig,
  'rateLimit': {
    ...defaultSecurityConfig.rateLimit,
    'max': 200 // More permissive in development
  },
  'helmet': {
    ...defaultSecurityConfig.helmet,
    'crossOriginEmbedderPolicy': false // Disable for development
  },
  'fileUpload': {
    ...defaultSecurityConfig.fileUpload,
    'maxSize': 20 * 1024 * 1024 // 20MB in development
  }
};

// Get security configuration based on environment
export function getSecurityConfig (): SecurityConfig {

  const env = process.env.NODE_ENV || 'development';

  switch (env) {

  case 'production':
    return productionSecurityConfig;
  case 'development':
    return developmentSecurityConfig;
  default:
    return defaultSecurityConfig;

  }

}

// Security headers configuration
export const securityHeaders = {
  // Basic security headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',

  // Additional security headers
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',

  // Cache control for sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Rate limiting configurations for different endpoints
export const rateLimitConfigs = {
  // General API rate limiting
  'api': {
    'windowMs': 15 * 60 * 1000, // 15 minutes
    'max': 50 // 50 requests per window
  },

  // Login rate limiting (very restrictive)
  'login': {
    'windowMs': 15 * 60 * 1000, // 15 minutes
    'max': 5 // 5 attempts per window
  },

  // File upload rate limiting
  'upload': {
    'windowMs': 15 * 60 * 1000, // 15 minutes
    'max': 10 // 10 uploads per window
  },

  // Document operations rate limiting
  'documents': {
    'windowMs': 15 * 60 * 1000, // 15 minutes
    'max': 30 // 30 operations per window
  }
};

export default {
  defaultSecurityConfig,
  productionSecurityConfig,
  developmentSecurityConfig,
  getSecurityConfig,
  securityHeaders,
  rateLimitConfigs
};
