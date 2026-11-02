import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import { bookCreateSchema } from '../schemas';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const booksRouter = Router();

// GET /api/v1/books
booksRouter.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const q = (req.query.q as string || '').trim().toLowerCase();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '50', 10)));
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM books';
  const params: any[] = [];

  if (q) {
    query += ' WHERE lower(title) LIKE ? OR lower(author) LIKE ? OR lower(genre) LIKE ?';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params) as any[];

  const countQuery = q
    ? 'SELECT count(*) as total FROM books WHERE lower(title) LIKE ? OR lower(author) LIKE ? OR lower(genre) LIKE ?'
    : 'SELECT count(*) as total FROM books';
  const total = (db.prepare(countQuery).get(...(q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [])) as any).total;

  const books = rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    author: r.author,
    genre: r.genre,
    coverUrl: r.cover_url,
    alternateCovers: r.alternate_covers_json ? JSON.parse(r.alternate_covers_json) : undefined,
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

  return res.json({
    success: true,
    books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/v1/books/:id
booksRouter.get('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const r = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id) as any;
  if (!r) {
    throw new AppError('Book not found', 404, 'NOT_FOUND');
  }

  return res.json({
    success: true,
    book: {
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      author: r.author,
      genre: r.genre,
      coverUrl: r.cover_url,
      alternateCovers: r.alternate_covers_json ? JSON.parse(r.alternate_covers_json) : undefined,
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
    },
  });
});

// POST /api/v1/books
booksRouter.post('/', requireAuth, (req: Request, res: Response) => {
  const data = bookCreateSchema.parse(req.body);
  const db = getDatabase();
  const bookId = data.id || crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO books (
      id, title, subtitle, author, genre, cover_url, alternate_covers_json,
      total_pages, isbn, publisher, release_date, blurb, excerpt,
      epub_url, pdf_url, file_type, source, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      subtitle = excluded.subtitle,
      author = excluded.author,
      genre = excluded.genre,
      cover_url = excluded.cover_url,
      alternate_covers_json = excluded.alternate_covers_json,
      total_pages = excluded.total_pages,
      isbn = excluded.isbn,
      publisher = excluded.publisher,
      release_date = excluded.release_date,
      blurb = excluded.blurb,
      excerpt = excluded.excerpt,
      epub_url = excluded.epub_url,
      pdf_url = excluded.pdf_url,
      file_type = excluded.file_type,
      updated_at = excluded.updated_at
  `).run(
    bookId,
    data.title,
    data.subtitle || null,
    data.author,
    data.genre || null,
    data.coverUrl || null,
    data.alternateCovers ? JSON.stringify(data.alternateCovers) : null,
    data.totalPages || 0,
    data.isbn || null,
    data.publisher || null,
    data.releaseDate || null,
    data.blurb || null,
    data.excerpt || null,
    data.epubUrl || null,
    data.pdfUrl || null,
    data.fileType || null,
    'user_entry',
    now,
    now
  );

  return res.status(201).json({
    success: true,
    book: {
      ...data,
      id: bookId,
      createdAt: now,
      updatedAt: now,
    },
  });
});

// DELETE /api/v1/books/:id
booksRouter.delete('/:id', requireAuth, requireRole('author', 'editor', 'admin'), (req: Request, res: Response) => {
  const db = getDatabase();
  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  return res.json({ success: true, id: req.params.id });
});
