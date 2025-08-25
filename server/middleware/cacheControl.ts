import { Request, Response, NextFunction } from 'express';

const STATIC_ASSET = /\.(?:css|js|mjs|html|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|map)$/i;

// Middleware to prevent caching of sensitive responses
export function cacheControlGuard(req: Request, res: Response, next: NextFunction) {
  if (!STATIC_ASSET.test(req.path)) {
    res.setHeader('Cache-Control', 'no-store, private');
  }
  next();
}
