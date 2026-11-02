import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logAuditEvent } from '../utils/audit';

export const adminRouter = Router();

// Admin and Authors only
adminRouter.use(requireAuth);
adminRouter.use(requireRole('author', 'admin'));

// GET /api/v1/admin/audit - Retrieve system audit trail
adminRouter.get('/audit', (req: Request, res: Response) => {
  const db = getDatabase();
  const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 50, 1), 200);
  const actionFilter = req.query.action as string | undefined;
  const targetTypeFilter = req.query.targetType as string | undefined;
  const userIdFilter = req.query.userId as string | undefined;

  let query = 'SELECT * FROM audit_events WHERE 1=1';
  const params: any[] = [];

  if (actionFilter) {
    query += ' AND action = ?';
    params.push(actionFilter);
  }
  if (targetTypeFilter) {
    query += ' AND target_type = ?';
    params.push(targetTypeFilter);
  }
  if (userIdFilter) {
    query += ' AND user_id = ?';
    params.push(userIdFilter);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params) as any[];

  const auditEvents = rows.map((r) => {
    let details = null;
    if (r.details_json) {
      try {
        details = JSON.parse(r.details_json);
      } catch {
        details = r.details_json;
      }
    }
    return {
      id: r.id,
      userId: r.user_id,
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      details,
      ipAddress: r.ip_address,
      createdAt: r.created_at,
    };
  });

  return res.json({
    success: true,
    count: auditEvents.length,
    events: auditEvents,
  });
});

// POST /api/v1/admin/audit - Manually append an administrative action or moderation record
adminRouter.post('/audit', (req: Request, res: Response) => {
  const { action, targetType, targetId, details } = req.body;
  if (!action || !targetType) {
    throw new AppError('Action and targetType are required.', 400, 'BAD_REQUEST');
  }

  logAuditEvent({
    userId: req.user!.id,
    action,
    targetType,
    targetId,
    details,
    ipAddress: req.ip || req.socket.remoteAddress,
  });

  return res.status(201).json({
    success: true,
    message: 'Audit event logged successfully',
  });
});

// GET /api/v1/admin/stats - High-level platform health & operational metrics
adminRouter.get('/stats', (req: Request, res: Response) => {
  const db = getDatabase();

  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
  
  // Total books excluding 31-60
  const allBooks = db.prepare('SELECT id FROM books').all() as any[];
  const validBooksCount = allBooks.filter((b) => {
    if (typeof b.id === 'string' && /^(book|sz|pub-sz|bf)-(3[1-9]|[45][0-9]|60)$/i.test(b.id)) return false;
    return true;
  }).length;

  const totalProjects = (db.prepare('SELECT COUNT(*) as c FROM writing_projects').get() as any)?.c || 0;
  const totalDocuments = (db.prepare('SELECT COUNT(*) as c FROM documents').get() as any)?.c || 0;
  const totalJournalEntries = (db.prepare('SELECT COUNT(*) as c FROM journal_entries').get() as any)?.c || 0;
  
  const magazineTotal = (db.prepare('SELECT COUNT(*) as c FROM magazine_items').get() as any)?.c || 0;
  const magazinePublished = (db.prepare("SELECT COUNT(*) as c FROM magazine_items WHERE status = 'published'").get() as any)?.c || 0;
  
  const submissionsTotal = (db.prepare('SELECT COUNT(*) as c FROM submissions').get() as any)?.c || 0;
  const submissionsPending = (db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status IN ('submitted', 'under_review')").get() as any)?.c || 0;

  const lessonsCount = (db.prepare('SELECT COUNT(*) as c FROM learning_lessons').get() as any)?.c || 0;
  const opportunitiesCount = (db.prepare('SELECT COUNT(*) as c FROM publishing_opportunities').get() as any)?.c || 0;
  const auditLogsCount = (db.prepare('SELECT COUNT(*) as c FROM audit_events').get() as any)?.c || 0;

  const mem = process.memoryUsage();

  return res.json({
    success: true,
    metrics: {
      users: totalUsers,
      books: validBooksCount,
      writingProjects: totalProjects,
      documents: totalDocuments,
      journalEntries: totalJournalEntries,
      magazine: {
        total: magazineTotal,
        published: magazinePublished,
      },
      submissions: {
        total: submissionsTotal,
        pendingReview: submissionsPending,
      },
      learningLessons: lessonsCount,
      publishingOpportunities: opportunitiesCount,
      auditEventsRecorded: auditLogsCount,
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      timestamp: new Date().toISOString(),
    },
  });
});
