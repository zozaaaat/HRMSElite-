/**
 * @fileoverview Server startup entry point for HRMS Elite application
 * @description Imports the configured Express app and starts the HTTP server.
 */

import type { Request, Response, NextFunction } from 'express';
import { app } from './app';
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './utils/vite';
import { log } from './utils/logger';
import 'dotenv/config';

(async () => {
  const server = await registerRoutes(app);

  // Global error handler for unhandled errors
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const error = err as { status?: number; statusCode?: number; message?: string };
    const status = error.status ?? error.statusCode ?? 500;
    const message = error.message ?? 'Internal Server Error';
    res.status(status).json({ message });
    throw err;
  });

  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT ?? process.env.REPL_PORT ?? '3000', 10);
  server.listen({ port, host: '127.0.0.1' }, () => {
    log.info(`serving on port ${port}`, undefined, 'SERVER');
  });
})();
