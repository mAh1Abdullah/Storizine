import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './src/server/app';
import { config } from './src/server/config';

async function start() {
  const app = createApp();
  const PORT = config.PORT;

  // Vite Middleware Setup
  if (config.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use((req, res, next) => {
      // Don't intercept API routes
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      next();
    });
    // Static assets
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Storizine & BookForest] Server running on http://0.0.0.0:${PORT} [${config.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forcefully exiting after timeout.');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
