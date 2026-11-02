import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';

export const searchRouter = Router();

// GET /api/v1/search?q=...
searchRouter.get('/', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim();
  if (!q) {
    return res.json({
      success: true,
      query: '',
      results: {
        books: [],
        magazine: [],
        lessons: [],
        writingProjects: [],
        journal: [],
      },
    });
  }

  const db = getDatabase();
  const pattern = `%${q}%`;
  const userId = req.user?.id;

  // 1. Books (excluding 31-60)
  const booksRows = db.prepare(`
    SELECT id, title, author, genre, cover_url, blurb
    FROM books
    WHERE (title LIKE ? OR author LIKE ? OR genre LIKE ? OR blurb LIKE ?)
    LIMIT 20
  `).all(pattern, pattern, pattern, pattern) as any[];

  const books = booksRows.filter((b) => {
    if (typeof b.number === 'number' && b.number >= 31 && b.number <= 60) return false;
    if (typeof b.id === 'string' && /^(book|sz|pub-sz|bf)-(3[1-9]|[45][0-9]|60)$/i.test(b.id)) return false;
    return true;
  });

  // 2. Published Magazine Items
  const magazine = db.prepare(`
    SELECT id, slug, title, author_name, category, excerpt
    FROM magazine_items
    WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR body_markdown LIKE ? OR author_name LIKE ?)
    LIMIT 20
  `).all(pattern, pattern, pattern, pattern) as any[];

  // 3. Learning Lessons
  const lessons = db.prepare(`
    SELECT id, title, category, level, estimated_minutes, summary
    FROM learning_lessons
    WHERE title LIKE ? OR summary LIKE ? OR content LIKE ?
    LIMIT 20
  `).all(pattern, pattern, pattern) as any[];

  // 4. Authenticated User's Private Writing Projects
  let writingProjects: any[] = [];
  let journal: any[] = [];

  if (userId) {
    writingProjects = db.prepare(`
      SELECT id, title, format, genre, premise, status, word_count
      FROM writing_projects
      WHERE user_id = ? AND (title LIKE ? OR premise LIKE ?)
      LIMIT 20
    `).all(userId, pattern, pattern) as any[];

    journal = db.prepare(`
      SELECT id, title, content, mood, created_at
      FROM journal_entries
      WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
      LIMIT 20
    `).all(userId, pattern, pattern) as any[];
  }

  return res.json({
    success: true,
    query: q,
    results: {
      books,
      magazine,
      lessons,
      writingProjects,
      journal,
    },
  });
});
