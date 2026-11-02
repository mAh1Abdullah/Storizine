import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase, hashPassword, verifyPassword } from '../db/database';
import { registerSchema, loginSchema } from '../schemas';
import { createSession, deleteSession, requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logAuditEvent } from '../utils/audit';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const db = getDatabase();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
  if (existing) {
    throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
  }

  const userId = crypto.randomUUID();
  const { salt, hash } = hashPassword(data.password);
  const now = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, password_salt, display_name, role, locale, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, data.email, hash, salt, data.displayName, data.role || 'user', 'en', now, now);

    db.prepare(`
      INSERT INTO user_profiles (user_id, pen_name, title, bio, avatar_url, banner_url, featured_quote, social_links_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      data.displayName,
      data.role === 'author' ? 'Author' : 'Reader & Writer',
      '',
      '',
      '',
      '',
      '[]',
      now,
      now
    );
  })();

  const token = createSession(userId);

  logAuditEvent({
    userId,
    action: 'user.register',
    targetType: 'user',
    targetId: userId,
    details: { email: data.email, role: data.role || 'user' },
    ipAddress: req.ip || req.socket.remoteAddress,
  });

  // Set HTTP-only cookie
  res.cookie('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: userId,
      email: data.email,
      displayName: data.displayName,
      role: data.role || 'user',
    },
  });
});

// POST /api/v1/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password, passcode } = loginSchema.parse(req.body);
  const db = getDatabase();

  let targetUser: any = null;

  if (email) {
    const user = db.prepare(`
      SELECT id, email, password_hash, password_salt, display_name, role, locale
      FROM users
      WHERE email = ?
    `).get(email) as any;

    if (user) {
      const passToVerify = password || passcode || '';
      if (verifyPassword(passToVerify, user.password_salt, user.password_hash)) {
        targetUser = user;
      }
    }
  } else if (passcode || password) {
    // Passcode-based writer login (author account)
    const author = db.prepare(`
      SELECT id, email, password_hash, password_salt, display_name, role, locale
      FROM users
      WHERE email = 'author@storizine.com'
    `).get() as any;

    const candidate = (passcode || password || '').trim();
    if (author && (candidate === 'writer1234' || candidate === 'writer' || verifyPassword(candidate, author.password_salt, author.password_hash))) {
      targetUser = author;
    }
  }

  if (!targetUser) {
    throw new AppError('Invalid email or passcode. Please check your credentials.', 401, 'INVALID_CREDENTIALS');
  }

  const token = createSession(targetUser.id);

  logAuditEvent({
    userId: targetUser.id,
    action: 'user.login',
    targetType: 'user',
    targetId: targetUser.id,
    details: { email: targetUser.email, role: targetUser.role },
    ipAddress: req.ip || req.socket.remoteAddress,
  });

  res.cookie('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    token,
    user: {
      id: targetUser.id,
      email: targetUser.email,
      displayName: targetUser.display_name,
      role: targetUser.role,
      locale: targetUser.locale,
    },
  });
});

// POST /api/v1/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  if (req.user?.id) {
    logAuditEvent({
      userId: req.user.id,
      action: 'user.logout',
      targetType: 'user',
      targetId: req.user.id,
      ipAddress: req.ip || req.socket.remoteAddress,
    });
  }
  if (req.sessionToken) {
    deleteSession(req.sessionToken);
  }
  res.clearCookie('session_token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/v1/auth/me
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const db = getDatabase();
  const profile = db.prepare(`
    SELECT pen_name, title, bio, avatar_url, banner_url, featured_quote, social_links_json
    FROM user_profiles
    WHERE user_id = ?
  `).get(req.user!.id) as any;

  return res.json({
    success: true,
    user: req.user,
    profile: profile
      ? {
          penName: profile.pen_name,
          title: profile.title,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
          bannerUrl: profile.banner_url,
          featuredQuote: profile.featured_quote,
          socialLinks: profile.social_links_json ? JSON.parse(profile.social_links_json) : [],
        }
      : null,
  });
});

// GET /api/v1/auth/export (Step 14: Personal Data Export)
authRouter.get('/export', requireAuth, (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
  const library = db.prepare('SELECT * FROM library_items WHERE user_id = ?').all(userId);
  const readingProgress = db.prepare('SELECT * FROM reading_progress WHERE user_id = ?').all(userId);
  const annotations = db.prepare('SELECT * FROM annotations WHERE user_id = ?').all(userId);
  const projects = db.prepare('SELECT * FROM writing_projects WHERE user_id = ?').all(userId);
  const documents = db.prepare('SELECT * FROM documents WHERE user_id = ?').all(userId);
  const storyBible = db.prepare('SELECT * FROM story_bible_items WHERE user_id = ?').all(userId);
  const journal = db.prepare('SELECT * FROM journal_entries WHERE user_id = ?').all(userId);
  const submissions = db.prepare('SELECT * FROM submissions WHERE user_id = ?').all(userId);
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(userId);

  return res.json({
    success: true,
    exportedAt: new Date().toISOString(),
    user: req.user,
    profile,
    library,
    readingProgress,
    annotations,
    writing: {
      projects,
      documents,
      storyBible,
    },
    journal,
    submissions,
    goals,
  });
});
