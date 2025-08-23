import { Request, Response, NextFunction } from 'express';

// Middleware to prevent caching of sensitive responses
export function cacheControlGuard(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  const isAuthPath = path.startsWith('/auth') || path.startsWith('/session') || path.startsWith('/api/auth') || path.startsWith('/api/session');
  const hasCredentials = Boolean(req.headers.authorization || req.headers.cookie);

  if (isAuthPath || hasCredentials) {
    res.setHeader('Cache-Control', 'no-store, private');
  }

  next();
}
