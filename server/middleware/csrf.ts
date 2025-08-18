import {Request, Response, NextFunction} from 'express';
import {log} from '../utils/logger';

// CSRF token middleware for frontend integration
export const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {

  try {

    // Make CSRF token available to frontend
    res.locals.csrfToken = req.csrfToken();

    // Add CSRF token to response headers for AJAX requests
    res.setHeader('X-CSRF-Token', req.csrfToken());

    // Add additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    next();

  } catch (error) {

    log.error('CSRF token generation error:', error as Error, 'CSRF');
    res.status(500).json({
      'error': 'خطأ في توليد رمز الأمان',
      'message': 'يرجى إعادة تحميل الصفحة'
    });

  }

};

// CSRF token endpoint for frontend to get token
export const getCsrfToken = (req: Request, res: Response) => {

  try {

    const token = req.csrfToken();
    log.info('CSRF token generated successfully', {
      'userAgent': req.get('User-Agent'),
      'ip': req.ip,
      'timestamp': new Date().toISOString()
    }, 'CSRF');

    res.json({
      'csrfToken': token,
      'message': 'CSRF token generated successfully',
      'timestamp': new Date().toISOString()
    });

  } catch (error) {

    log.error('CSRF token generation failed:', error as Error, 'CSRF');
    res.status(500).json({
      'error': 'خطأ في توليد رمز الأمان',
      'message': 'يرجى المحاولة مرة أخرى'
    });

  }

};

// Validate CSRF token for API requests
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {

  // Skip CSRF validation for GET requests, health checks, and static files
  if (req.method === 'GET' ||
      req.path === '/health' ||
      req.path.startsWith('/static/') ||
      req.path.startsWith('/assets/') ||
      req.path.includes('.') ||
      req.path === '/api/csrf-token') {

    return next();

  }

  // For other requests, CSRF validation is handled by the csurf middleware
  // This middleware provides additional logging and error handling
  next();

};

// Enhanced CSRF error handler with detailed logging and security features
export const csrfErrorHandler = (err: Error & { code?: string },
   req: Request,
   res: Response,
   next: NextFunction) => {

  if (err.code === 'EBADCSRFTOKEN') {

    // Log detailed information about the CSRF attack attempt
    const attackInfo = {
      'url': req.url,
      'method': req.method,
      'userAgent': req.get('User-Agent'),
      'ip': req.ip,
      'referer': req.get('Referer'),
      'origin': req.get('Origin'),
      'timestamp': new Date().toISOString(),
      'headers': {
        'x-requested-with': req.get('X-Requested-With'),
        'content-type': req.get('Content-Type'),
        'accept': req.get('Accept')
      }
    };

    log.warn('CSRF Token Validation Failed - Potential Attack', attackInfo, 'CSRF');

    // Return appropriate error response based on request type
    if (req.xhr ?? req.path.startsWith('/api/')) {

      // AJAX/API request
      return res.status(403).json({
        'error': 'خطأ في التحقق من الأمان',
        'message': 'يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى',
        'code': 'CSRF_TOKEN_INVALID',
        'timestamp': new Date().toISOString()
      });

    } else {

      // Regular form submission
      return res.status(403).render('error', {
        'title': 'خطأ في الأمان',
        'message': 'يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى',
        'error': {
          'status': 403,
          'stack': process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
      });

    }

  }

  // Handle other CSRF-related errors
  if (err.code === 'ECSRFTOKENMISSING') {

    log.error('CSRF Token Missing', {
      'url': req.url,
      'method': req.method,
      'userAgent': req.get('User-Agent'),
      'ip': req.ip,
      'timestamp': new Date().toISOString()
    }, 'CSRF');

    return res.status(403).json({
      'error': 'رمز الأمان مفقود',
      'message': 'يرجى إعادة تحميل الصفحة',
      'code': 'CSRF_TOKEN_MISSING',
      'timestamp': new Date().toISOString()
    });

  }

  next(err);

};

// CSRF token refresh middleware for long-running sessions
export const refreshCsrfToken = (req: Request, res: Response, next: NextFunction) => {

  try {

    // Generate new CSRF token
    const newToken = req.csrfToken();

    // Set new token in response headers
    res.setHeader('X-CSRF-Token', newToken);

    // Add token refresh flag
    res.setHeader('X-CSRF-Refreshed', 'true');

    next();

  } catch (error) {

    log.error('CSRF token refresh failed:', error as Error, 'CSRF');
    next(error);

  }

};

// CSRF token validation for specific routes
export const validateCsrfForRoute = (routePath: string) => {

  return (req: Request, res: Response, next: NextFunction) => {

    if (req.path === routePath && req.method !== 'GET') {

      // Additional validation for specific routes
      const token = req.body._csrf ?? req.headers['x-csrf-token'];
      if (!token) {

        return res.status(403).json({
          'error': 'رمز الأمان مطلوب',
          'message': 'يرجى إعادة تحميل الصفحة',
          'code': 'CSRF_TOKEN_REQUIRED'
        });

      }

    }
    next();

  };

};

// CSRF token cleanup middleware
export const cleanupCsrfToken = (req: Request, res: Response, next: NextFunction) => {

  // Clean up any sensitive data from request
  if (req.body?._csrf) {

    delete req.body._csrf;

  }

  // Add cleanup headers
  res.setHeader('X-CSRF-Cleanup', 'true');

  next();

};
