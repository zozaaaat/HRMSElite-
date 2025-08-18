/**
 * @fileoverview Main server entry point for HRMS Elite application
 * @description Express.js server with security middleware, rate limiting, CSRF protection,
 * and comprehensive API endpoints for human resource management
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import express, {type Request, Response, NextFunction} from 'express';
import session from 'express-session';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import {registerRoutes} from './routes';
import {setupVite, serveStatic} from './utils/vite';
import {log} from './utils/logger';
import {specs} from './swagger';
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
import {metricsMiddleware} from './middleware/metrics';
import {
  csrfTokenMiddleware,
  getCsrfToken,
  csrfErrorHandler
} from './middleware/csrf';

/**
 * Express application instance
 * @type {express.Application}
 */
export const app = express();

/**
 * Configure proxy trust settings based on environment
 * @description Trust proxy configuration for rate limiting and security
 * - Production: Trust first proxy for proper IP detection
 * - Development: Don't trust proxy to avoid security issues
 */
if (process.env.NODE_ENV === 'production') {

  app.set('trust proxy', 1); // Trust first proxy

} else {

  app.set('trust proxy', false); // Don't trust proxy in development

}

/**
 * Apply IP blocking middleware first
 * @description Blocks requests from suspicious IP addresses
 */
app.use(ipBlockingMiddleware);

/**
 * Apply Helmet security middleware with enhanced configuration
 * @description Configures comprehensive security headers including:
 * - Content Security Policy (CSP)
 * - Cross-Origin policies
 * - XSS protection
 * - Frame options
 */
app.use(helmet({
  'contentSecurityPolicy': {
    'directives': {
      'defaultSrc': ['\'self\''],
      'scriptSrc': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
      'styleSrc': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
      'fontSrc': ['\'self\'', 'https://fonts.gstatic.com'],
      'imgSrc': ['\'self\'', 'data:', 'https:'],
      'connectSrc': ['\'self\''],
      'frameSrc': ['\'none\''],
      'objectSrc': ['\'none\''],
      ...(process.env.NODE_ENV === 'production' && {'upgradeInsecureRequests': []})
    }
  },
  'crossOriginEmbedderPolicy': false, // Disable for development compatibility
  'crossOriginResourcePolicy': {'policy': 'cross-origin'}
}));

/**
 * Apply cookie parser middleware
 * @description Parses cookies from incoming requests
 */
app.use(cookieParser());

/**
 * Apply CSRF protection with enhanced configuration
 * @description Protects against Cross-Site Request Forgery attacks
 * Only enabled when NODE_ENV is not set to 'test'
 * @param {Object} options - CSRF configuration options
 * @param {Object} options.cookie - Cookie settings for CSRF token
 * @param {boolean} options.cookie.httpOnly - Prevents JavaScript access
 * @param {boolean} options.cookie.secure - Requires HTTPS in production
 * @param {string} options.cookie.sameSite - Prevents CSRF attacks
 * @param {number} options.cookie.maxAge - Token expiration time (24 hours)
 */
if (process.env.NODE_ENV !== 'test') {
  app.use(csrf({
    'cookie': {
      'httpOnly': true,
      'secure': process.env.NODE_ENV === 'production',
      'sameSite': 'strict',
      'maxAge': 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  /**
   * Apply CSRF token middleware for frontend integration
   * @description Makes CSRF tokens available to frontend applications
   */
  app.use(csrfTokenMiddleware);

  /**
   * CSRF token endpoint for frontend
   * @description Provides CSRF tokens to frontend applications
   * @route GET /api/csrf-token
   * @returns {Object} CSRF token object
   */
  app.get('/api/csrf-token', getCsrfToken);
}

/**
 * Apply enhanced rate limiting for all API routes
 * @description Prevents abuse by limiting request frequency
 */
app.use('/api/', generalApiRateLimit);

/**
 * Apply specific rate limiting for different endpoint types
 * @description Custom rate limits for document and search operations
 */
app.use('/api/documents', documentRateLimit);
app.use('/api/search', searchRateLimit);

/**
 * Apply enhanced security middleware
 * @description Additional security headers, input validation, and request logging
 */
app.use(securityHeaders);
app.use(validateInput);
app.use(requestLogger);

/**
 * Apply rate limiting to API routes
 * @description General API rate limiting
 */
app.use('/api/', apiRateLimit);

/**
 * Parse JSON and URL-encoded request bodies
 * @description Configures request body parsing with size limits
 * @param {Object} options - Body parser options
 * @param {string} options.limit - Maximum request body size (10MB)
 * @param {boolean} options.extended - Extended URL encoding support
 */
app.use(express.json({'limit': '10mb'}));
app.use(express.urlencoded({'extended': false}));

/**
 * Health check endpoint
 * @description Returns server health status and system information
 * @route GET /health
 * @returns {Object} Health status object
 * @example
 * GET /health
 * Response: {
 *   status: "healthy",
 *   uptime: 12345.67,
 *   timestamp: "2025-01-28T10:30:00.000Z"
 * }
 */
app.get('/health', healthCheck);

/**
 * Swagger API Documentation endpoint
 * @description Serves interactive API documentation
 * @route GET /api-docs
 * @param {Object} options - Swagger UI configuration
 * @param {string} options.customCss - Custom CSS for documentation
 * @param {string} options.customSiteTitle - Documentation title
 * @param {Object} options.swaggerOptions - Swagger configuration options
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  'customCss': `
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
  'customSiteTitle': 'HRMS Elite API Documentation - نظام إدارة الموارد البشرية',
  'customfavIcon': '/logo.svg',
  'swaggerOptions': {
    'docExpansion': 'list',
    'filter': true,
    'showRequestHeaders': true,
    'showCommonExtensions': true,
    'tryItOutEnabled': true,
    'displayRequestDuration': true,
    'defaultModelsExpandDepth': 2,
    'defaultModelExpandDepth': 2,
    'displayOperationId': false,
    'supportedSubmitMethods': ['get', 'post', 'put', 'delete', 'patch']
  }
}));

/**
 * Session middleware for authentication
 * @description Configures session management for user authentication
 * @param {Object} options - Session configuration
 * @param {string} options.secret - Session secret key
 * @param {boolean} options.resave - Whether to resave sessions
 * @param {boolean} options.saveUninitialized - Whether to save uninitialized sessions
 * @param {Object} options.cookie - Session cookie settings
 */
app.use(session({
  'secret': process.env.SESSION_SECRET ?? "development-secret-key",
  'resave': false,
  'saveUninitialized': false,
  'cookie': {
    'secure': process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
    'httpOnly': true,
    'sameSite': 'strict',
    'maxAge': 24 * 60 * 60 * 1000 // 24 hours
  }
}));

/**
 * Enhanced CSRF error handler
 * @description Handles CSRF token validation errors
 */
app.use(csrfErrorHandler);

/**
 * Global error handling middleware
 * @description Handles uncaught errors and provides appropriate responses
 */
app.use(errorHandler);

/**
 * Request logging middleware
 * @description Logs API requests with timing and response information
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
app.use((req, res, next) => {

  const start = Date.now();
  const {path} = req;
  let capturedJsonResponse: Record<string, unknown> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: unknown) {

    capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson.call(res, bodyJson);

  };

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

/**
 * Apply metrics collection middleware
 * @description Collects metrics for monitoring and alerting
 */
app.use(metricsMiddleware);

/**
 * Main application initialization function
 * @description Sets up the server, registers routes, and starts listening
 * @async
 * @returns {Promise<void>}
 */
(async () => {

  /**
   * Register all application routes
   * @description Sets up all API endpoints and route handlers
   * @returns {Server} HTTP server instance
   */
  const server = await registerRoutes(app);

  /**
   * Global error handling middleware
   * @description Handles uncaught errors and provides appropriate responses
   * @param {unknown} err - Error object
   * @param {Request} _req - Express request object (unused)
   * @param {Response} res - Express response object
   * @param {NextFunction} _next - Express next function (unused)
   */
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {

    const error = err as { status?: number; statusCode?: number; message?: string };
    const status = error.status ?? error.statusCode ?? 500;
    const message = error.message ?? "Internal Server Error";

    res.status(status).json({message});
    throw err;

  });

  /**
   * Development server setup with Vite
   * @description Configures Vite development server in development mode
   * Serves static files in production mode
   */
  if (app.get('env') === 'development') {

    await setupVite(app, server);

  } else {

    serveStatic(app);

  }

  /**
   * Start the server
   * @description Binds the server to the specified port and host
   * @param {number} port - Server port (from environment or default 3000)
   * @param {string} host - Server host (127.0.0.1 for security)
   */
  const port = parseInt(process.env.PORT ?? process.env.REPL_PORT ?? "3000", 10);
  server.listen({
    port,
    'host': '127.0.0.1'
  }, () => {

    log.info(`serving on port ${port}`, undefined, 'SERVER');

  });

})();
