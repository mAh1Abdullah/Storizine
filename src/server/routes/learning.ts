import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export const learningRouter = Router();

// GET /api/v1/learning/lessons
learningRouter.get('/lessons', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.id;

  let query = 'SELECT l.* FROM learning_lessons l ORDER BY l.id ASC';
  const rows = db.prepare(query).all() as any[];

  // If user is authenticated, attach their completion status
  let userProgress: Record<string, { completed: boolean; responseText: string }> = {};
  if (userId) {
    const progRows = db.prepare('SELECT lesson_id, completed, response_text FROM learning_progress WHERE user_id = ?').all(userId) as any[];
    for (const r of progRows) {
      userProgress[r.lesson_id] = { completed: !!r.completed, responseText: r.response_text || '' };
    }
  }

  const lessons = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    level: r.level,
    estimatedMinutes: r.estimated_minutes,
    author: r.author,
    summary: r.summary,
    content: r.content,
    exercisesCount: r.exercises_count,
    completed: userProgress[r.id]?.completed || false,
    userResponse: userProgress[r.id]?.responseText || '',
  }));

  return res.json({ success: true, lessons });
});

// GET /api/v1/learning/lessons/:id
learningRouter.get('/lessons/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.id;

  const lesson = db.prepare('SELECT * FROM learning_lessons WHERE id = ?').get(req.params.id) as any;
  if (!lesson) {
    throw new AppError('Lesson not found', 404, 'NOT_FOUND');
  }

  let progress: any = null;
  if (userId) {
    progress = db.prepare('SELECT completed, response_text FROM learning_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lesson.id);
  }

  return res.json({
    success: true,
    lesson: {
      id: lesson.id,
      title: lesson.title,
      category: lesson.category,
      level: lesson.level,
      estimatedMinutes: lesson.estimated_minutes,
      author: lesson.author,
      summary: lesson.summary,
      content: lesson.content,
      exercisesCount: lesson.exercises_count,
      completed: !!progress?.completed,
      userResponse: progress?.response_text || '',
    },
  });
});

// POST /api/v1/learning/lessons/:id/progress
learningRouter.post('/lessons/:id/progress', requireAuth, (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;
  const { completed, responseText } = req.body;
  const now = new Date().toISOString();
  const progId = crypto.randomUUID();

  db.prepare(`
    INSERT INTO learning_progress (id, user_id, lesson_id, completed, response_text, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      completed = excluded.completed,
      response_text = excluded.response_text,
      updated_at = excluded.updated_at
  `).run(
    progId,
    userId,
    req.params.id,
    completed ? 1 : 0,
    responseText || '',
    now
  );

  return res.json({
    success: true,
    progress: {
      lessonId: req.params.id,
      completed: !!completed,
      responseText: responseText || '',
      updatedAt: now,
    },
  });
});

// POST /api/v1/learning/clinic (Story Clinic craft diagnostic)
learningRouter.post('/clinic', async (req: Request, res: Response) => {
  const { excerpt, mode } = req.body;
  if (!excerpt || typeof excerpt !== 'string') {
    throw new AppError('Excerpt is required for craft analysis', 400, 'BAD_REQUEST');
  }

  const clinicMode = mode || 'clarity';

  if (config.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
      const prompt = `You are a distinguished literary editor and craft mentor at Storizine.
Analyze this short narrative excerpt strictly focusing on craft mode: "${clinicMode}" (options: clarity, sensory, pacing).
Return a JSON object with:
- strengths: array of 2 short strings highlighting what works.
- observations: array of 2 short strings noting specific technical issues.
- recommendations: array of 2 concrete revision suggestions.

Excerpt:
"""
${excerpt.slice(0, 1000)}
"""`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.strengths && parsed.recommendations) {
        return res.json({ success: true, mode: clinicMode, feedback: parsed });
      }
    } catch (err) {
      console.warn('Gemini clinic call failed, returning rule-based feedback', err);
    }
  }

  // Fallback rule-based diagnostic
  let feedback = {
    strengths: ['Clear narrative objective present', 'Immediate subject focus'],
    observations: [
      'Visual descriptions lack tactile and auditory texture',
      'Sentence cadence is uniform, dampening dramatic urgency',
    ],
    recommendations: [
      'Vary clause lengths: balance brief action beats with reflective sensory details.',
      'Ground emotional reactions in physical resistance or somatic response.',
    ],
  };

  return res.json({ success: true, mode: clinicMode, feedback });
});
