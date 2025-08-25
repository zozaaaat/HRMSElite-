import type { Request, Response, NextFunction } from 'express';

/**
 * Redirect legacy /api/* requests to versioned /api/v1/* paths and
 * attach deprecation headers referencing the new endpoint.
 */
export function apiVersioningRedirect(req: Request, res: Response, next: NextFunction) {
  const originalUrl = req.url;
  if (originalUrl.startsWith('/api/') && !originalUrl.startsWith('/api/v1/')) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Link', `</api/v1${originalUrl.slice(4)}>; rel="successor-version"`);
    req.url = `/api/v1${originalUrl.slice(4)}`;
  }
  next();
}
