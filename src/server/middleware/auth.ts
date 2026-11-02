import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import { AppError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'author' | 'editor' | 'admin';
  locale: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionToken?: string;
    }
  }
}

export function createSession(userId: string, expiresInDays = 30): string {
  const db = getDatabase();
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, userId, tokenHash, expiresAt, createdAt);

  return rawToken;
}

export function deleteSession(rawToken: string): void {
  const db = getDatabase();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    // Check for cookie session_token
    const match = req.headers.cookie.match(/(?:^|;\s*)session_token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    return next();
  }

  try {
    const db = getDatabase();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date().toISOString();

    const row = db.prepare(`
      SELECT s.id as session_id, s.expires_at, u.id, u.email, u.display_name, u.role, u.locale
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?
    `).get(tokenHash, now) as any;

    if (row) {
      req.user = {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        locale: row.locale,
      };
      req.sessionToken = token;
    }
  } catch (err) {
    console.warn('Session verification failed:', err);
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required to access this resource.', 401, 'UNAUTHORIZED'));
  }
  next();
}

export function requireRole(...roles: (string | string[])[]) {
  const allowedRoles = roles.flat();
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions.', 403, 'FORBIDDEN'));
    }
    next();
  };
}
