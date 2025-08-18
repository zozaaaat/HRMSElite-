import {app, server} from './app';
import {setupVite, serveStatic} from './utils/vite';
import {log} from './utils/logger';

(async () => {
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT ?? process.env.REPL_PORT ?? '3000', 10);
  server.listen({
    port,
    host: '127.0.0.1'
  }, () => {
    log.info(`serving on port ${port}`, undefined, 'SERVER');
  });
})();
