import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const opportunitiesRouter = Router();
export const publishingTrackerRouter = Router();

// ==========================================
// 1. PUBLIC OPPORTUNITIES CATALOG
// ==========================================

// GET /api/v1/opportunities
opportunitiesRouter.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const { type, search } = req.query;

  let query = 'SELECT * FROM publishing_opportunities';
  const params: any[] = [];
  const conditions: string[] = [];

  if (type && type !== 'All') {
    conditions.push('type = ?');
    params.push(type);
  }
  if (search) {
    conditions.push('(title LIKE ? OR organizer LIKE ? OR genres_json LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY deadline ASC';

  const rows = db.prepare(query).all(...params) as any[];

  return res.json({
    success: true,
    opportunities: rows.map((r) => ({
      id: r.id,
      title: r.title,
      organizer: r.organizer,
      type: r.type,
      deadline: r.deadline,
      compensation: r.compensation,
      entryFee: r.entry_fee,
      genres: JSON.parse(r.genres_json || '[]'),
      languages: JSON.parse(r.languages_json || '[]'),
      officialUrl: r.official_url,
      verifiedDate: r.verified_date,
      status: r.status,
      description: r.description,
    })),
  });
});

// GET /api/v1/opportunities/:id
opportunitiesRouter.get('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM publishing_opportunities WHERE id = ?').get(req.params.id) as any;

  if (!row) {
    throw new AppError('Opportunity not found', 404, 'NOT_FOUND');
  }

  return res.json({
    success: true,
    opportunity: {
      id: row.id,
      title: row.title,
      organizer: row.organizer,
      type: row.type,
      deadline: row.deadline,
      compensation: row.compensation,
      entryFee: row.entry_fee,
      genres: JSON.parse(row.genres_json || '[]'),
      languages: JSON.parse(row.languages_json || '[]'),
      officialUrl: row.official_url,
      verifiedDate: row.verified_date,
      status: row.status,
      description: row.description,
    },
  });
});

// ==========================================
// 2. USER SUBMISSION TRACKER
// ==========================================

publishingTrackerRouter.use(requireAuth);

// GET /api/v1/publishing-tracker
publishingTrackerRouter.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const rows = db.prepare(`
    SELECT * FROM submission_tracks WHERE user_id = ? ORDER BY date_sent DESC
  `).all(userId) as any[];

  return res.json({
    success: true,
    tracks: rows.map((r) => ({
      id: r.id,
      opportunityTitle: r.opportunity_title,
      recipient: r.recipient,
      projectTitle: r.project_title,
      dateSent: r.date_sent,
      status: r.status,
      followUpDate: r.follow_up_date,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  });
});

// POST /api/v1/publishing-tracker
publishingTrackerRouter.post('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;
  const { opportunityTitle, recipient, projectTitle, dateSent, status, followUpDate, notes } = req.body;

  if (!opportunityTitle || !recipient || !projectTitle) {
    throw new AppError('Opportunity title, recipient, and project title are required', 400, 'BAD_REQUEST');
  }

  const trackId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO submission_tracks (id, user_id, opportunity_title, recipient, project_title, date_sent, status, follow_up_date, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    trackId,
    userId,
    opportunityTitle,
    recipient,
    projectTitle,
    dateSent || now.split('T')[0],
    status || 'Preparing',
    followUpDate || null,
    notes || null,
    now,
    now
  );

  return res.status(201).json({
    success: true,
    track: {
      id: trackId,
      opportunityTitle,
      recipient,
      projectTitle,
      dateSent: dateSent || now.split('T')[0],
      status: status || 'Preparing',
      followUpDate,
      notes,
      createdAt: now,
      updatedAt: now,
    },
  });
});

// PATCH /api/v1/publishing-tracker/:id
publishingTrackerRouter.patch('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const track = db.prepare('SELECT id, user_id FROM submission_tracks WHERE id = ?').get(req.params.id) as any;
  if (!track) {
    throw new AppError('Submission track not found', 404, 'NOT_FOUND');
  }
  if (track.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this submission track.', 403, 'FORBIDDEN');
  }

  const { status, followUpDate, notes } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);
  }
  if (followUpDate !== undefined) {
    updates.push('follow_up_date = ?');
    params.push(followUpDate);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(req.params.id);

  db.prepare(`UPDATE submission_tracks SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return res.json({ success: true, message: 'Track updated successfully' });
});

// DELETE /api/v1/publishing-tracker/:id
publishingTrackerRouter.delete('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const track = db.prepare('SELECT id, user_id FROM submission_tracks WHERE id = ?').get(req.params.id) as any;
  if (!track) {
    throw new AppError('Submission track not found', 404, 'NOT_FOUND');
  }
  if (track.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this submission track.', 403, 'FORBIDDEN');
  }

  db.prepare('DELETE FROM submission_tracks WHERE id = ?').run(req.params.id);
  return res.json({ success: true, id: req.params.id });
});
