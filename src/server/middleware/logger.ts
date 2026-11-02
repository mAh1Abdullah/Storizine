import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.id || '-';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    // Skip verbose logging of static assets in dev
    if (req.path.startsWith('/@') || req.path.startsWith('/node_modules') || req.path.includes('.vite')) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status: statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    if (isError) {
      console.warn(`[HTTP ${statusCode}] ${req.method} ${req.originalUrl} (${duration}ms) reqId=${requestId}`);
    } else if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      console.log(`[HTTP ${statusCode}] ${req.method} ${req.originalUrl} (${duration}ms) reqId=${requestId}`);
    }
  });

  next();
}
