import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import { journalEntryCreateSchema, journalEntryUpdateSchema } from '../schemas';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const journalRouter = Router();

// Journal is private by default and requires authentication
journalRouter.use(requireAuth);

// GET /api/v1/journal
journalRouter.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const entries = db.prepare(`
    SELECT j.*, b.title as book_title, p.title as project_title
    FROM journal_entries j
    LEFT JOIN books b ON b.id = j.linked_book_id
    LEFT JOIN writing_projects p ON p.id = j.linked_project_id
    WHERE j.user_id = ?
    ORDER BY j.created_at DESC
  `).all(userId) as any[];

  return res.json({
    success: true,
    entries: entries.map((e) => ({
      id: e.id,
      title: e.title,
      content: e.content,
      linkedBookId: e.linked_book_id,
      linkedBookTitle: e.book_title,
      linkedProjectId: e.linked_project_id,
      linkedProjectTitle: e.project_title,
      mood: e.mood,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    })),
  });
});

// POST /api/v1/journal
journalRouter.post('/', (req: Request, res: Response) => {
  const data = journalEntryCreateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;
  const entryId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO journal_entries (id, user_id, title, content, linked_book_id, linked_project_id, mood, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entryId,
    userId,
    data.title,
    data.content,
    data.linkedBookId || null,
    data.linkedProjectId || null,
    data.mood || null,
    now,
    now
  );

  return res.status(201).json({
    success: true,
    entry: {
      id: entryId,
      userId,
      ...data,
      createdAt: now,
      updatedAt: now,
    },
  });
});

// GET /api/v1/journal/:id
journalRouter.get('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const entry = db.prepare(`
    SELECT j.*, b.title as book_title, p.title as project_title
    FROM journal_entries j
    LEFT JOIN books b ON b.id = j.linked_book_id
    LEFT JOIN writing_projects p ON p.id = j.linked_project_id
    WHERE j.id = ?
  `).get(req.params.id) as any;

  if (!entry) {
    throw new AppError('Journal entry not found', 404, 'NOT_FOUND');
  }
  if (entry.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this journal reflection.', 403, 'FORBIDDEN');
  }

  return res.json({
    success: true,
    entry: {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      linkedBookId: entry.linked_book_id,
      linkedBookTitle: entry.book_title,
      linkedProjectId: entry.linked_project_id,
      linkedProjectTitle: entry.project_title,
      mood: entry.mood,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    },
  });
});

// PATCH /api/v1/journal/:id
journalRouter.patch('/:id', (req: Request, res: Response) => {
  const data = journalEntryUpdateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const entry = db.prepare('SELECT id, user_id FROM journal_entries WHERE id = ?').get(req.params.id) as any;
  if (!entry) {
    throw new AppError('Journal entry not found', 404, 'NOT_FOUND');
  }
  if (entry.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this journal reflection.', 403, 'FORBIDDEN');
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.content !== undefined) {
    updates.push('content = ?');
    params.push(data.content);
  }
  if (data.linkedBookId !== undefined) {
    updates.push('linked_book_id = ?');
    params.push(data.linkedBookId);
  }
  if (data.linkedProjectId !== undefined) {
    updates.push('linked_project_id = ?');
    params.push(data.linkedProjectId);
  }
  if (data.mood !== undefined) {
    updates.push('mood = ?');
    params.push(data.mood);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());

  params.push(req.params.id);

  db.prepare(`UPDATE journal_entries SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return res.json({ success: true, message: 'Journal entry updated successfully' });
});

// DELETE /api/v1/journal/:id
journalRouter.delete('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const entry = db.prepare('SELECT id, user_id FROM journal_entries WHERE id = ?').get(req.params.id) as any;
  if (!entry) {
    throw new AppError('Journal entry not found', 404, 'NOT_FOUND');
  }
  if (entry.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this journal reflection.', 403, 'FORBIDDEN');
  }

  db.prepare('DELETE FROM journal_entries WHERE id = ?').run(req.params.id);
  return res.json({ success: true, id: req.params.id });
});
