import express, { Express, Request, Response } from 'express';
import { requestIdMiddleware } from './middleware/requestId';
import { loggerMiddleware } from './middleware/logger';
import { securityHeadersMiddleware } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { getDatabase } from './db/database';
import { config } from './config';

import { authRouter } from './routes/auth';
import { booksRouter } from './routes/books';
import { libraryRouter } from './routes/library';
import { writingRouter, documentsRouter, storyBibleRouter } from './routes/writing';
import { journalRouter } from './routes/journal';
import { magazineRouter, submissionsRouter, editorialRouter } from './routes/magazine';
import { learningRouter } from './routes/learning';
import { opportunitiesRouter, publishingTrackerRouter } from './routes/opportunities';
import { searchRouter } from './routes/search';
import { notificationsRouter } from './routes/notifications';
import { filesRouter, handleFileUpload, handleFileDownload } from './routes/files';
import { adminRouter } from './routes/admin';
import {
  aiRouter,
  handleExplainTerm,
  handleExplain,
  handleReviewAssistant,
  handleRecommendBooks,
} from './routes/ai';

export function createApp(): Express {
  const app = express();

  // Core Middleware
  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);
  app.use(authenticate);

  // ==========================================
  // Health & Readiness Endpoints (Step 1)
  // ==========================================
  app.get('/health/live', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', (req: Request, res: Response) => {
    try {
      const db = getDatabase();
      const test = db.prepare('SELECT 1 as live').get() as { live: number };
      if (!test || test.live !== 1) {
        return res.status(503).json({ status: 'error', reason: 'Database unready' });
      }

      return res.json({
        status: 'ready',
        database: 'connected',
        geminiConfigured: !!config.GEMINI_API_KEY,
        nodeEnv: config.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(503).json({
        status: 'error',
        reason: 'Readiness check failed',
        message: err?.message,
      });
    }
  });

  // Legacy health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      geminiConfigured: !!config.GEMINI_API_KEY,
      app: "STORIZINE Platform",
      pwaReady: true,
      backendVersion: 'v1.0.0',
    });
  });

  // ==========================================
  // API v1 Routes
  // ==========================================
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/books', booksRouter);
  app.use('/api/v1/library', libraryRouter);
  app.use('/api/v1/writing', writingRouter);
  app.use('/api/v1/documents', documentsRouter);
  app.use('/api/v1/story-bible', storyBibleRouter);
  app.use('/api/v1/journal', journalRouter);
  app.use('/api/v1/magazine', magazineRouter);
  app.use('/api/v1/submissions', submissionsRouter);
  app.use('/api/v1/editorial', editorialRouter);
  app.use('/api/v1/learning', learningRouter);
  app.use('/api/v1/opportunities', opportunitiesRouter);
  app.use('/api/v1/publishing-tracker', publishingTrackerRouter);
  app.use('/api/v1/search', searchRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/files', filesRouter);
  app.use('/api/v1/ai', aiRouter);
  app.use('/api/v1/admin', adminRouter);

  // ==========================================
  // Legacy /api/* Compatibility Routes
  // ==========================================
  // Legacy Books API
  app.get('/api/books', (req: Request, res: Response) => {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all() as any[];
    // Strictly exclude books #31 to #60
    const books = rows
      .filter((b) => {
        if (!b) return false;
        if (typeof b.number === 'number' && b.number >= 31 && b.number <= 60) return false;
        if (typeof b.id === 'string' && /^(book|sz|pub-sz|bf)-(3[1-9]|[45][0-9]|60)$/i.test(b.id)) return false;
        return true;
      })
      .map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        author: r.author,
        genre: r.genre,
        coverUrl: r.cover_url,
        totalPages: r.total_pages,
        isbn: r.isbn,
        publisher: r.publisher,
        releaseDate: r.release_date,
        blurb: r.blurb,
        excerpt: r.excerpt,
        epubUrl: r.epub_url,
        pdfUrl: r.pdf_url,
        fileType: r.file_type,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

    return res.json({ success: true, books });
  });

  app.post('/api/books', (req: Request, res: Response) => {
    const db = getDatabase();
    const b = req.body;
    const bookId = b.id || `custom-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO books (id, title, author, genre, cover_url, total_pages, blurb, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'legacy_post', ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        author = excluded.author,
        genre = excluded.genre,
        cover_url = excluded.cover_url,
        total_pages = excluded.total_pages,
        blurb = excluded.blurb,
        updated_at = excluded.updated_at
    `).run(
      bookId,
      b.title || 'Untitled',
      b.author || 'Unknown',
      b.genre || '',
      b.coverUrl || b.coverImage || '',
      b.totalPages || 0,
      b.blurb || b.reviewComments || '',
      now,
      now
    );

    return res.json({ success: true, book: { ...b, id: bookId } });
  });

  app.delete('/api/books/:id', (req: Request, res: Response) => {
    const db = getDatabase();
    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    return res.json({ success: true, id: req.params.id });
  });

  // Legacy Annotations API
  app.get('/api/annotations', (req: Request, res: Response) => {
    const db = getDatabase();
    const { bookId } = req.query;
    let query = 'SELECT * FROM annotations';
    const params: any[] = [];
    if (bookId) {
      query += ' WHERE book_id = ?';
      params.push(bookId);
    }
    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params) as any[];
    return res.json({ success: true, annotations: rows });
  });

  app.post('/api/annotations', (req: Request, res: Response) => {
    const db = getDatabase();
    const { id, book_id, user_id, cfi_range, color, note, highlighted_text } = req.body;
    const annId = id || `ann-${Date.now()}`;
    const effectiveUserId = user_id || (req.user ? req.user.id : 'author-mah-abdullah');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO annotations (id, user_id, book_id, cfi_range, color, note, highlighted_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        cfi_range = excluded.cfi_range,
        color = excluded.color,
        note = excluded.note,
        highlighted_text = excluded.highlighted_text,
        updated_at = excluded.updated_at
    `).run(
      annId,
      effectiveUserId,
      book_id,
      cfi_range,
      color || 'yellow',
      note || '',
      highlighted_text || '',
      now,
      now
    );

    return res.json({
      success: true,
      annotation: {
        id: annId,
        user_id: effectiveUserId,
        book_id,
        cfi_range,
        color: color || 'yellow',
        note: note || '',
        highlighted_text: highlighted_text || '',
        created_at: now,
      },
    });
  });

  app.delete('/api/annotations/:id', (req: Request, res: Response) => {
    const db = getDatabase();
    db.prepare('DELETE FROM annotations WHERE id = ?').run(req.params.id);
    return res.json({ success: true, id: req.params.id });
  });

  // Legacy Reading Progress API
  app.get('/api/reading-progress/:bookId', (req: Request, res: Response) => {
    const db = getDatabase();
    const userId = req.user ? req.user.id : 'author-mah-abdullah';
    const row = db.prepare(`
      SELECT cfi, percentage, current_page, updated_at
      FROM reading_progress
      WHERE user_id = ? AND book_id = ?
    `).get(userId, req.params.bookId) as any;

    return res.json({
      success: true,
      progress: row ? {
        bookId: req.params.bookId,
        cfi: row.cfi,
        percentage: row.percentage,
        updated_at: row.updated_at,
      } : null,
    });
  });

  app.post('/api/reading-progress', (req: Request, res: Response) => {
    const db = getDatabase();
    const { bookId, cfi, percentage } = req.body;
    const userId = req.user ? req.user.id : 'author-mah-abdullah';
    const progressId = `prog-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reading_progress (id, user_id, book_id, cfi, percentage, current_page, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
      ON CONFLICT(user_id, book_id) DO UPDATE SET
        cfi = excluded.cfi,
        percentage = excluded.percentage,
        updated_at = excluded.updated_at
    `).run(progressId, userId, bookId, cfi || '', percentage || 0, now);

    return res.json({
      success: true,
      progress: {
        bookId,
        cfi: cfi || '',
        percentage: percentage || 0,
        updated_at: now,
      },
    });
  });

  // Legacy Upload & Download
  app.post('/api/upload', handleFileUpload);
  app.get('/api/files/:filename', handleFileDownload);

  // Legacy AI Routes
  app.post('/api/ai/explain-term', handleExplainTerm);
  app.post('/api/ai/explain', handleExplain);
  app.post('/api/ai/review-assistant', handleReviewAssistant);
  app.post('/api/ai/recommend-books', handleRecommendBooks);

  // Centralized Error Handler (Step 1 & 5)
  app.use(errorHandler);

  return app;
}
