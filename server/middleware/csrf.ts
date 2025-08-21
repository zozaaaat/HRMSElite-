import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// Stateful CSRF protection using session-backed tokens
export const csrfProtection = csurf({
  cookie: false,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Issue a CSRF token per session and expose it via cookie and locals
export const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.csrfToken();

    // Persist token with the user's session
    // This allows cryptographic validation on each request
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (req.session as any).csrfToken = token;

    res.cookie('_csrf', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
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
