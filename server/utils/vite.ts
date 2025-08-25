import express, { type Express } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer, createLogger } from 'vite';
import { type Server } from 'http';
import viteConfig from '../../vite.config';
import { nanoid } from 'nanoid';
import { log } from './logger';
import { getLocale } from './errorMessages';

const viteLogger = createLogger();

export function logVite (message: string, source = 'express') {

  const formattedTime = new Date().toLocaleTimeString('en-US', {
    'hour': 'numeric',
    'minute': '2-digit',
    'second': '2-digit',
    'hour12': true
  });

  log.info(`${formattedTime} [${source}] ${message}`, undefined, 'VITE');

}

export async function setupVite (app: Express, server: Server) {

  const serverOptions = {
    'hmr': {server},
    'allowedHosts': true as const
  };

  const vite = await createViteServer({
    ...viteConfig,
    'configFile': false,
    'customLogger': {
      ...viteLogger,
      'error': (msg, options) => {

        viteLogger.error(msg, options);
        process.exit(1);

      }
    },
    'server': serverOptions,
    'appType': 'custom'
  });

  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'client',
        'index.html'
      );
      let template = await fs.promises.readFile(clientTemplate, 'utf-8');
      template = template.replace(
        'src="/src/main.tsx"',
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const locale = getLocale(req.headers['accept-language']);
      const dir = locale === 'ar' ? 'rtl' : 'ltr';
      template = template
        .replace('%LANG%', locale)
        .replace('%DIR%', dir);

      const page = await vite.transformIndexHtml(url, template);
      res
        .status(200)
        .set({ 'Content-Type': 'text/html', 'Content-Language': locale })
        .end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

}

export function serveStatic (app: Express) {
  const distPath = path.resolve(import.meta.dirname, '..', '..', 'dist');

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { index: false }));

  app.get('*', (req, res, next) => {
    try {
      const locale = getLocale(req.headers['accept-language']);
      const dir = locale === 'ar' ? 'rtl' : 'ltr';
      const indexPath = path.resolve(distPath, 'index.html');
      let template = fs.readFileSync(indexPath, 'utf-8');
      template = template.replace('%LANG%', locale).replace('%DIR%', dir);
      res
        .status(200)
        .set({ 'Content-Type': 'text/html', 'Content-Language': locale })
        .send(template);
    } catch (e) {
      next(e);
    }
  });
}
