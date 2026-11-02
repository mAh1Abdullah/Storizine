import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

// GET /api/v1/notifications
notificationsRouter.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const rows = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(userId) as any[];

  return res.json({
    success: true,
    notifications: rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      link: r.link,
      isRead: !!r.is_read,
      createdAt: r.created_at,
    })),
  });
});

// PATCH /api/v1/notifications/:id/read
notificationsRouter.patch('/:id/read', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const notif = db.prepare('SELECT id, user_id FROM notifications WHERE id = ?').get(req.params.id) as any;
  if (!notif) {
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }
  if (notif.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: notification does not belong to you.', 403, 'FORBIDDEN');
  }

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);

  return res.json({ success: true, message: 'Notification marked as read' });
});

// POST /api/v1/notifications
notificationsRouter.post('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;
  const { title, message, type, link } = req.body;

  if (!title || !message) {
    throw new AppError('Title and message are required', 400, 'BAD_REQUEST');
  }

  const notifId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    notifId,
    userId,
    type || 'info',
    title,
    message,
    link || null,
    now
  );

  return res.status(201).json({
    success: true,
    notification: {
      id: notifId,
      type: type || 'info',
      title,
      message,
      link,
      isRead: false,
      createdAt: now,
    },
  });
});
