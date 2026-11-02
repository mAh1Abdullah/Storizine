import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import {
  libraryItemCreateSchema,
  libraryItemUpdateSchema,
  readingProgressSchema,
  annotationCreateSchema,
} from '../schemas';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const libraryRouter = Router();

// All library routes require authentication
libraryRouter.use(requireAuth);

// GET /api/v1/library
libraryRouter.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;
  const status = req.query.status as string;

  let query = `
    SELECT 
      l.id, l.reading_status, l.user_rating, l.owned_format, l.collection_location,
      l.edition_details, l.purchase_price, l.review_comments, l.quotes_json, l.tags_json,
      l.created_at, l.updated_at,
      b.id as book_id, b.title, b.subtitle, b.author, b.genre, b.cover_url, b.total_pages,
      b.isbn, b.publisher, b.release_date, b.blurb, b.epub_url, b.pdf_url, b.file_type,
      p.cfi, p.percentage, p.current_page
    FROM library_items l
    JOIN books b ON b.id = l.book_id
    LEFT JOIN reading_progress p ON p.user_id = l.user_id AND p.book_id = l.book_id
    WHERE l.user_id = ?
  `;
  const params: any[] = [userId];

  if (status && status !== 'all') {
    query += ' AND l.reading_status = ?';
    params.push(status);
  }

  query += ' ORDER BY l.updated_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  const items = rows.map((r) => ({
    id: r.id,
    bookId: r.book_id,
    readingStatus: r.reading_status,
    userRating: r.user_rating,
    ownedFormat: r.owned_format,
    collectionLocation: r.collection_location,
    editionDetails: r.edition_details,
    purchasePrice: r.purchase_price,
    reviewComments: r.review_comments,
    quotesSaved: r.quotes_json ? JSON.parse(r.quotes_json) : [],
    tags: r.tags_json ? JSON.parse(r.tags_json) : [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    book: {
      id: r.book_id,
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
      epubUrl: r.epub_url,
      pdfUrl: r.pdf_url,
      fileType: r.file_type,
    },
    readingProgress: r.cfi !== null ? {
      cfi: r.cfi,
      percentage: r.percentage,
      currentPage: r.current_page,
    } : null,
  }));

  return res.json({ success: true, items });
});

// POST /api/v1/library
libraryRouter.post('/', (req: Request, res: Response) => {
  const data = libraryItemCreateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  // Verify book exists
  const book = db.prepare('SELECT id FROM books WHERE id = ?').get(data.bookId);
  if (!book) {
    throw new AppError('Book not found', 404, 'NOT_FOUND');
  }

  const itemId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO library_items (
      id, user_id, book_id, reading_status, user_rating, owned_format,
      collection_location, review_comments, quotes_json, tags_json,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, book_id) DO UPDATE SET
      reading_status = excluded.reading_status,
      user_rating = excluded.user_rating,
      owned_format = excluded.owned_format,
      collection_location = excluded.collection_location,
      review_comments = excluded.review_comments,
      quotes_json = excluded.quotes_json,
      tags_json = excluded.tags_json,
      updated_at = excluded.updated_at
  `).run(
    itemId,
    userId,
    data.bookId,
    data.readingStatus,
    data.userRating || 0,
    data.ownedFormat || 'Kindle/Ebook',
    data.collectionLocation || 'Kindle Library',
    data.reviewComments || '',
    JSON.stringify(data.quotes || []),
    JSON.stringify(data.tags || []),
    now,
    now
  );

  return res.status(201).json({
    success: true,
    libraryItem: {
      id: itemId,
      userId,
      bookId: data.bookId,
      readingStatus: data.readingStatus,
      userRating: data.userRating,
      ownedFormat: data.ownedFormat,
      collectionLocation: data.collectionLocation,
      createdAt: now,
      updatedAt: now,
    },
  });
});

// PATCH /api/v1/library/:id
libraryRouter.patch('/:id', (req: Request, res: Response) => {
  const data = libraryItemUpdateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const item = db.prepare('SELECT id, user_id FROM library_items WHERE id = ?').get(req.params.id) as any;
  if (!item) {
    throw new AppError('Library item not found', 404, 'NOT_FOUND');
  }
  if (item.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this library item.', 403, 'FORBIDDEN');
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.readingStatus !== undefined) {
    updates.push('reading_status = ?');
    params.push(data.readingStatus);
  }
  if (data.userRating !== undefined) {
    updates.push('user_rating = ?');
    params.push(data.userRating);
  }
  if (data.ownedFormat !== undefined) {
    updates.push('owned_format = ?');
    params.push(data.ownedFormat);
  }
  if (data.collectionLocation !== undefined) {
    updates.push('collection_location = ?');
    params.push(data.collectionLocation);
  }
  if (data.reviewComments !== undefined) {
    updates.push('review_comments = ?');
    params.push(data.reviewComments);
  }
  if (data.quotes !== undefined) {
    updates.push('quotes_json = ?');
    params.push(JSON.stringify(data.quotes));
  }
  if (data.tags !== undefined) {
    updates.push('tags_json = ?');
    params.push(JSON.stringify(data.tags));
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());

  params.push(req.params.id);

  db.prepare(`UPDATE library_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return res.json({ success: true, message: 'Library item updated successfully' });
});

// DELETE /api/v1/library/:id
libraryRouter.delete('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const item = db.prepare('SELECT id, user_id FROM library_items WHERE id = ?').get(req.params.id) as any;
  if (!item) {
    throw new AppError('Library item not found', 404, 'NOT_FOUND');
  }
  if (item.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this library item.', 403, 'FORBIDDEN');
  }

  db.prepare('DELETE FROM library_items WHERE id = ?').run(req.params.id);
  return res.json({ success: true, id: req.params.id });
});

// GET /api/v1/library/progress/:bookId
libraryRouter.get('/progress/:bookId', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const row = db.prepare(`
    SELECT cfi, percentage, current_page, total_seconds_read, updated_at
    FROM reading_progress
    WHERE user_id = ? AND book_id = ?
  `).get(userId, req.params.bookId) as any;

  return res.json({
    success: true,
    progress: row ? {
      bookId: req.params.bookId,
      cfi: row.cfi,
      percentage: row.percentage,
      currentPage: row.current_page,
      totalSecondsRead: row.total_seconds_read,
      updatedAt: row.updated_at,
    } : null,
  });
});

// PUT /api/v1/library/progress
libraryRouter.put('/progress', (req: Request, res: Response) => {
  const data = readingProgressSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;
  const progressId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reading_progress (id, user_id, book_id, cfi, percentage, current_page, total_seconds_read, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, book_id) DO UPDATE SET
      cfi = excluded.cfi,
      percentage = excluded.percentage,
      current_page = excluded.current_page,
      total_seconds_read = reading_progress.total_seconds_read + excluded.total_seconds_read,
      updated_at = excluded.updated_at
  `).run(
    progressId,
    userId,
    data.bookId,
    data.cfi,
    data.percentage,
    data.currentPage || 0,
    data.totalSecondsRead || 0,
    now
  );

  return res.json({
    success: true,
    progress: {
      bookId: data.bookId,
      cfi: data.cfi,
      percentage: data.percentage,
      currentPage: data.currentPage,
      updatedAt: now,
    },
  });
});

// GET /api/v1/library/annotations
libraryRouter.get('/annotations', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;
  const bookId = req.query.bookId as string;

  let query = 'SELECT * FROM annotations WHERE user_id = ?';
  const params: any[] = [userId];

  if (bookId) {
    query += ' AND book_id = ?';
    params.push(bookId);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  return res.json({
    success: true,
    annotations: rows.map((r) => ({
      id: r.id,
      book_id: r.book_id,
      user_id: r.user_id,
      cfi_range: r.cfi_range,
      color: r.color,
      note: r.note,
      highlighted_text: r.highlighted_text,
      created_at: r.created_at,
      updated_at: r.updated_at,
    })),
  });
});

// POST /api/v1/library/annotations
libraryRouter.post('/annotations', (req: Request, res: Response) => {
  const data = annotationCreateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;
  const id = data.id || crypto.randomUUID();
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
    id,
    userId,
    data.book_id,
    data.cfi_range,
    data.color,
    data.note || '',
    data.highlighted_text || '',
    now,
    now
  );

  return res.status(201).json({
    success: true,
    annotation: {
      id,
      user_id: userId,
      book_id: data.book_id,
      cfi_range: data.cfi_range,
      color: data.color,
      note: data.note,
      highlighted_text: data.highlighted_text,
      created_at: now,
      updated_at: now,
    },
  });
});

// DELETE /api/v1/library/annotations/:id
libraryRouter.delete('/annotations/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const ann = db.prepare('SELECT id, user_id FROM annotations WHERE id = ?').get(req.params.id) as any;
  if (!ann) {
    throw new AppError('Annotation not found', 404, 'NOT_FOUND');
  }
  if (ann.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this annotation.', 403, 'FORBIDDEN');
  }

  db.prepare('DELETE FROM annotations WHERE id = ?').run(req.params.id);
  return res.json({ success: true, id: req.params.id });
});
