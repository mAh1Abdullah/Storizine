import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import { magazineItemCreateSchema, submissionCreateSchema } from '../schemas';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const magazineRouter = Router();
export const submissionsRouter = Router();
export const editorialRouter = Router();

// ==========================================
// 1. PUBLIC MAGAZINE (Literary Desk)
// ==========================================

// GET /api/v1/magazine
magazineRouter.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const category = req.query.category as string | undefined;

  let query = "SELECT * FROM magazine_items WHERE status = 'published'";
  const params: any[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY published_at DESC, created_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  return res.json({
    success: true,
    items: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      authorName: r.author_name,
      category: r.category,
      excerpt: r.excerpt,
      coverImage: r.cover_image,
      publishedAt: r.published_at,
    })),
  });
});

// GET /api/v1/magazine/:slug
magazineRouter.get('/:slug', (req: Request, res: Response) => {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT * FROM magazine_items WHERE slug = ? AND status = 'published'
  `).get(req.params.slug) as any;

  if (!row) {
    throw new AppError('Magazine article not found', 404, 'NOT_FOUND');
  }

  return res.json({
    success: true,
    item: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      authorName: row.author_name,
      category: row.category,
      excerpt: row.excerpt,
      bodyMarkdown: row.body_markdown,
      coverImage: row.cover_image,
      publishedAt: row.published_at,
      createdAt: row.created_at,
    },
  });
});

// POST /api/v1/magazine (Editor/Author only)
magazineRouter.post('/', requireAuth, requireRole(['author', 'editor', 'admin']), (req: Request, res: Response) => {
  const data = magazineItemCreateSchema.parse(req.body);
  const db = getDatabase();
  const itemId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO magazine_items (id, slug, title, subtitle, author_name, category, excerpt, body_markdown, cover_image, status, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    itemId,
    data.slug,
    data.title,
    data.subtitle || null,
    data.authorName,
    data.category,
    data.excerpt,
    data.bodyMarkdown,
    data.coverImage || null,
    data.status,
    data.status === 'published' ? now : null,
    now,
    now
  );

  return res.status(201).json({
    success: true,
    item: {
      id: itemId,
      ...data,
      publishedAt: data.status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    },
  });
});

// ==========================================
// 2. CONTRIBUTOR SUBMISSIONS
// ==========================================

submissionsRouter.use(requireAuth);

// POST /api/v1/submissions
submissionsRouter.post('/', (req: Request, res: Response) => {
  const data = submissionCreateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;
  const subId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO submissions (id, user_id, title, genre, word_count, synopsis, manuscript_url, notes, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)
  `).run(
    subId,
    userId,
    data.title,
    data.genre,
    data.wordCount,
    data.synopsis,
    data.manuscriptUrl || null,
    data.notes || null,
    now,
    now
  );

  return res.status(201).json({
    success: true,
    submission: {
      id: subId,
      userId,
      ...data,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    },
  });
});

// GET /api/v1/submissions/my
submissionsRouter.get('/my', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const rows = db.prepare(`
    SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId) as any[];

  return res.json({
    success: true,
    submissions: rows.map((r) => ({
      id: r.id,
      title: r.title,
      genre: r.genre,
      wordCount: r.word_count,
      synopsis: r.synopsis,
      status: r.status,
      editorNotes: r.editor_notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  });
});

// ==========================================
// 3. EDITORIAL REVIEW WORKFLOW
// ==========================================

editorialRouter.use(requireAuth);
editorialRouter.use(requireRole(['author', 'editor', 'admin']));

// GET /api/v1/editorial/submissions
editorialRouter.get('/submissions', (req: Request, res: Response) => {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT s.*, u.email as submitter_email, u.display_name as submitter_name
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.created_at ASC
  `).all() as any[];

  return res.json({
    success: true,
    submissions: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      submitterEmail: r.submitter_email,
      submitterName: r.submitter_name,
      title: r.title,
      genre: r.genre,
      wordCount: r.word_count,
      synopsis: r.synopsis,
      manuscriptUrl: r.manuscript_url,
      notes: r.notes,
      status: r.status,
      editorNotes: r.editor_notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  });
});

// PATCH /api/v1/editorial/submissions/:id
editorialRouter.patch('/submissions/:id', (req: Request, res: Response) => {
  const { status, editorNotes } = req.body;
  const db = getDatabase();

  const sub = db.prepare('SELECT id FROM submissions WHERE id = ?').get(req.params.id);
  if (!sub) {
    throw new AppError('Submission not found', 404, 'NOT_FOUND');
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);
  }
  if (editorNotes !== undefined) {
    updates.push('editor_notes = ?');
    params.push(editorNotes);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());

  params.push(req.params.id);

  db.prepare(`UPDATE submissions SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return res.json({ success: true, message: 'Submission status updated successfully' });
});
