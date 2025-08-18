/**
 * @fileoverview Express application configuration for HRMS Elite
 * @description Sets up middleware, security, and API documentation without starting the server.
 */

import express, { type Request, Response, NextFunction } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { log } from './utils/logger';
import { specs } from './swagger';
import 'dotenv/config';
import {
  ipBlockingMiddleware,
  securityHeaders,
  apiRateLimit,
  generalApiRateLimit,
  documentRateLimit,
  searchRateLimit,
  validateInput,
  requestLogger,
  errorHandler,
  healthCheck
} from './middleware/security';
import { metricsMiddleware } from './middleware/metrics';
import {
  csrfTokenMiddleware,
  getCsrfToken,
  csrfErrorHandler
} from './middleware/csrf';

/**
 * Express application instance
 */
export const app = express();

/**
 * Configure proxy trust settings based on environment
 */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
} else {
  app.set('trust proxy', false); // Don't trust proxy in development
}

/** Apply IP blocking middleware first */
app.use(ipBlockingMiddleware);

/**
 * Apply Helmet security middleware with enhanced configuration
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\''],
      frameSrc: ['\'none\''],
      objectSrc: ['\'none\''],
      ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] })
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

/** Apply cookie parser middleware */
app.use(cookieParser());

/**
 * Apply CSRF protection with enhanced configuration
 */
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

/** Apply CSRF token middleware for frontend integration */
app.use(csrfTokenMiddleware);

/**
 * Apply enhanced rate limiting for all API routes
 */
app.use('/api/', generalApiRateLimit);

/** Specific rate limiting for document and search operations */
app.use('/api/documents', documentRateLimit);
app.use('/api/search', searchRateLimit);

/**
 * Apply enhanced security middleware
 */
app.use(securityHeaders);
app.use(validateInput);
app.use(requestLogger);

/** Apply rate limiting to API routes */
app.use('/api/', apiRateLimit);

/**
 * Parse JSON and URL-encoded request bodies
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

/** Health check endpoint */
app.get('/health', healthCheck);

/** Swagger API Documentation endpoint */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2563eb; font-size: 2.5em; }
    .swagger-ui .scheme-container { background: #f8fafc; border-radius: 8px; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #10b981; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #3b82f6; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #f59e0b; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; }
    .swagger-ui .btn.execute { background: #2563eb; }
    .swagger-ui .btn.execute:hover { background: #1d4ed8; }
    .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
  `,
  customSiteTitle: 'HRMS Elite API Documentation - نظام إدارة الموارد البشرية',
  customfavIcon: '/logo.svg',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    displayRequestDuration: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    displayOperationId: false,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch']
  }
}));

/** CSRF token endpoint for frontend */
app.get('/api/csrf-token', getCsrfToken);

/**
 * Session middleware for authentication
 */
app.use(session({
  secret: process.env.SESSION_SECRET ?? 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

/** Enhanced CSRF error handler */
app.use(csrfErrorHandler);

/** Global error handling middleware */
app.use(errorHandler);

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  const start = Date.now();
  const { path } = req;
  let capturedJsonResponse: Record<string, unknown> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: unknown) {
    capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson.call(res, bodyJson);
  } as typeof res.json;

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = `${logLine.slice(0, 79)}…`;
      }
      log.info(logLine, undefined, 'API');
    }
  });

  next();
});

/** Apply metrics collection middleware */
app.use(metricsMiddleware);

export default app;
