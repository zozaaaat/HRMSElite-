import Tokens from 'csrf';
import { Request, Response, NextFunction } from 'express';

// Initialize token generator
const tokens = new Tokens();

// CSRF protection middleware verifying token for state-changing requests
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const secret = (req.session as any)?.csrfSecret as string | undefined;
  const token =
    req.get('x-csrf-token') ||
    (req.body && (req.body as any)._csrf) ||
    (req.cookies && req.cookies._csrf);

  if (!secret || !token || !tokens.verify(secret, token)) {
    const err: Error & { code?: string } = new Error('Invalid CSRF token');
    err.code = 'EBADCSRFTOKEN';
    return next(err);
  }

  next();
};

// Issue a CSRF token per session and expose it via cookie and locals
export const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    let secret = (req.session as any)?.csrfSecret as string | undefined;
    if (!secret) {
      secret = tokens.secretSync();
      (req.session as any).csrfSecret = secret;
    }

    const token = tokens.create(secret);

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
    next(err as Error);
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
export const csrfErrorHandler = (
  err: Error & { code?: string },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  res.status(403).json({
    error: 'Invalid CSRF token',
    code: 'CSRF_TOKEN_INVALID',
    requestId: req.id
  });
};

