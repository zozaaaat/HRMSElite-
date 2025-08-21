import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// CSurf middleware configured to use the existing session.
// Tokens are bound to the session cookie and generated on every request.
export const csrfProtection = csurf({
  cookie: false,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Generate a fresh token for each request and expose it via cookie and locals
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.csrfToken();
    res.cookie('_csrf', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.setHeader('X-CSRF-Token', token);
    res.locals.csrfToken = token;
    next();
  } catch (err) {
    next(err);
  }
};

// Endpoint handler for clients to retrieve the current token
export const csrfTokenHandler = (_req: Request, res: Response) => {
  res.json({
    csrfToken: res.locals.csrfToken,
    message: 'CSRF token generated successfully',
    timestamp: new Date().toISOString()
  });
};

// Error handler for CSRF validation failures
export const csrfErrorHandler = (err: Error & { code?: string }, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  res.status(403).json({
    error: 'Invalid CSRF token',
    code: 'CSRF_TOKEN_INVALID',
    requestId: req.id
  });
};
