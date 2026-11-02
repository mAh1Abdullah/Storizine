import crypto from 'crypto';
import { getDatabase } from '../db/database';

export interface AuditParams {
  userId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

/**
 * Records an immutable audit event into SQLite.
 * Ensures passwords, raw manuscript texts, and auth tokens are NEVER logged.
 */
export function logAuditEvent(params: AuditParams): void {
  try {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Sanitize metadata to avoid capturing sensitive secrets
    const safeDetails: Record<string, any> = {};
    if (params.details) {
      for (const [key, val] of Object.entries(params.details)) {
        if (/password|passcode|token|secret|content|body_markdown|draft/i.test(key)) {
          safeDetails[key] = '[REDACTED]';
        } else {
          safeDetails[key] = val;
        }
      }
    }

    const detailsJson = Object.keys(safeDetails).length > 0 ? JSON.stringify(safeDetails) : null;

    db.prepare(`
      INSERT INTO audit_events (id, user_id, action, target_type, target_id, details_json, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId || null,
      params.action,
      params.targetType,
      params.targetId || null,
      detailsJson,
      params.ipAddress || null,
      now
    );
  } catch (err) {
    console.error('[AUDIT_ERROR] Failed to record audit event:', err);
  }
}
