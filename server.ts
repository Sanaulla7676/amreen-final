import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
import { SITE_PAGES } from './src/static-routes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: "Amreen's Academy",
      framework: 'React 19 + TypeScript + Vite 8 + Express + Firebase',
      firebaseProjectId: firebaseConfig.projectId,
      firestoreConfigured: Boolean(firebaseConfig.firestoreDatabaseId),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /admin.html',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    const publicRoutes = SITE_PAGES.filter((p) => p !== 'admin.html').map((page) =>
      page === 'index.html' ? '/' : `/${page.replace(/\.html$/, '')}`
    );
    const urls = publicRoutes.map((route) => `  <url><loc>${baseUrl}${route}</loc></url>`).join('\n');
    res
      .type('application/xml')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  });

  const distDir = path.join(__dirname, 'dist');
  if (isProduction && fs.existsSync(path.join(distDir, 'index.html'))) {
    app.use(express.static(distDir, { index: false }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Amreen's Academy React + Express server running at http://${HOST}:${PORT}`);
  });
}

void startServer();
